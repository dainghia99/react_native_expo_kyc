import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import * as KYCService from "@/services/kyc";
import { useAuth } from "@/context/AuthContext";

export const useKYC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();

  const handleVerifyLiveness = useCallback(
    async (videoFormData: FormData) => {
      setIsLoading(true);
      try {
        const result = await KYCService.verifyLiveness(videoFormData);
        if (result.liveness_score > 0.8) {
          // Cập nhật trạng thái user nếu xác thực thành công
          if (user) {
            const updatedUser = { ...user, kyc_status: "verified" };
            await login(
              (await AsyncStorage.getItem("token")) || "",
              updatedUser
            );
          }
          Alert.alert(
            "Thành công",
            `Xác thực thành công!\nSố lần nháy mắt: ${result.blink_count}`
          );
          return true;
        } else {
          Alert.alert(
            "Thất bại",
            `Xác thực không thành công: ${
              result.rejection_reason ||
              "Vui lòng thử lại và đảm bảo:\n- Nháy mắt ít nhất 2 lần\n- Giữ khuôn mặt ở giữa màn hình\n- Ánh sáng đầy đủ"
            }`
          );
          return false;
        }
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.response?.data?.error ||
            "Không thể xác thực KYC. Vui lòng thử lại."
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, login]
  );

  const handleUploadIDCard = useCallback(
    async (imageFormData: FormData, isFront: boolean) => {
      setIsLoading(true);
      try {
        const result = await KYCService.uploadIDCard(imageFormData, isFront);
        Alert.alert(
          "Thành công",
          `Đã tải lên ảnh ${isFront ? "mặt trước" : "mặt sau"} CCCD`
        );
        return result.id_info;
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error.response?.data?.error ||
            "Không thể tải lên ảnh CCCD. Vui lòng thử lại."
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkKYCStatus = useCallback(async () => {
    try {
      const status = await KYCService.getKYCStatus();
      return status;
    } catch (error: any) {
      console.error("Error checking KYC status:", error);
      return null;
    }
  }, []);

  return {
    isLoading,
    handleVerifyLiveness,
    handleUploadIDCard,
    checkKYCStatus,
  };
};
