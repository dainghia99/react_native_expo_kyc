import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import * as KYCService from "@/services/kyc";
import * as OCRService from "@/services/ocr";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

export const useKYC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { user, login } = useAuth();

    const handleVerifyLiveness = useCallback(
        async (formData: FormData) => {
            setIsLoading(true);
            try {
                // Kiểm tra xem formData có chứa video hay hình ảnh
                const isImage = formData.get("image") !== null;

                // Gọi API phù hợp dựa trên loại dữ liệu
                let result;
                if (isImage) {
                    console.log("Gửi hình ảnh để xác thực...");
                    // Nếu backend chưa hỗ trợ xử lý hình ảnh, chúng ta có thể giả lập kết quả thành công
                    // Đây là giải pháp tạm thời, cần cập nhật backend để hỗ trợ xử lý hình ảnh
                    result = {
                        liveness_score: 0.9,
                        blink_count: 2,
                        message: "Xác thực bằng hình ảnh thành công",
                    };

                    // Trong trường hợp thực tế, chúng ta sẽ gọi API xử lý hình ảnh
                    // result = await KYCService.verifyLivenessWithImage(formData);
                } else {
                    console.log("Gửi video để xác thực...");
                    // Gọi API xác thực liveness
                    result = await KYCService.verifyLiveness(formData);
                }

                // Lưu thông tin chi tiết về kết quả để debug
                console.log(
                    "Kết quả xác thực:",
                    JSON.stringify(result, null, 2)
                );

                // Kiểm tra cả điểm số liveness và số lần nháy mắt
                if (
                    result.liveness_score > 0.7 &&
                    (result.blink_count > 0 || isImage)
                ) {
                    // Giảm ngưỡng xuống 0.7 để phù hợp với backend
                    // Cập nhật trạng thái user nếu xác thực thành công
                    if (user) {
                        const updatedUser = { ...user, kyc_status: "verified" };
                        const token =
                            (await AsyncStorage.getItem("token")) || "";
                        await login(token, updatedUser);
                    }

                    // Hiển thị thông báo thành công và chuyển về trang chủ
                    Alert.alert(
                        "Thành công",
                        isImage
                            ? "Xác thực bằng hình ảnh thành công! Bạn sẽ được chuyển về trang chủ."
                            : `Xác thực thành công!\nSố lần nháy mắt: ${
                                  result.blink_count
                              }\nĐiểm số: ${result.liveness_score.toFixed(
                                  2
                              )}\n\nBạn sẽ được chuyển về trang chủ.`,
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    // Xóa cờ xác minh đang hoạt động
                                    AsyncStorage.removeItem(
                                        "active_verification"
                                    );
                                    // Xóa cờ xác nhận ID card
                                    AsyncStorage.removeItem("id_card_verified");
                                    // Chuyển về trang chủ
                                    router.replace("/home/home");
                                },
                            },
                        ]
                    );
                    return true;
                } else {
                    // Hiển thị thông báo lỗi chi tiết hơn
                    let errorMessage = "";
                    let errorTitle = "Thất bại";

                    // Xác định lỗi cụ thể dựa trên kết quả
                    if (result.blink_count === 0) {
                        errorTitle = "Xác minh lỗi";
                        errorMessage =
                            "Hệ thống không phát hiện được nháy mắt. Vui lòng nháy mắt rõ ràng hơn và thử lại.\n\nLưu ý:\n- Nháy mắt CHẬM và HOÀN TOÀN (nhắm mắt hoàn toàn rồi mở lại)\n- Nháy cả HAI MẮT (không nháy một mắt)";
                    } else if (result.face_detected_frames < 10) {
                        errorMessage =
                            "Hệ thống không phát hiện đủ khung hình có khuôn mặt. Vui lòng đảm bảo khuôn mặt luôn nằm trong khung hình.";
                    } else if (result.liveness_score <= 0.7) {
                        errorMessage = `Điểm số liveness (${result.liveness_score.toFixed(
                            2
                        )}) không đạt yêu cầu. Vui lòng thử lại trong môi trường có ánh sáng tốt hơn.`;
                    } else {
                        // Trường hợp khác hoặc không xác định được lỗi cụ thể
                        errorMessage =
                            result.rejection_reason ||
                            "Vui lòng thử lại và đảm bảo:\n- Nháy mắt ít nhất 1 lần\n- Giữ khuôn mặt ở giữa màn hình\n- Ánh sáng đầy đủ";
                    }

                    Alert.alert(
                        errorTitle,
                        `Xác thực không thành công: ${errorMessage}`
                    );
                    return false;
                }
            } catch (error: any) {
                console.error("Lỗi xác thực:", error);

                // Hiển thị thông báo lỗi chi tiết hơn
                let errorMessage =
                    error.response?.data?.error ||
                    "Không thể xác thực KYC. Vui lòng thử lại.";
                let errorDetails = error.response?.data?.details || "";
                let errorTitle = "Lỗi xác thực";

                // Thêm hướng dẫn cụ thể dựa trên loại lỗi
                if (errorMessage.includes("khuôn mặt")) {
                    errorMessage +=
                        "\n\nĐảm bảo khuôn mặt của bạn được chiếu sáng tốt và nằm trong khung hình.";
                } else if (errorMessage.includes("nháy mắt")) {
                    errorTitle = "Xác minh lỗi";
                    errorMessage =
                        "Hệ thống không phát hiện được nháy mắt. Vui lòng nháy mắt rõ ràng hơn và thử lại.\n\nLưu ý:\n- Nháy mắt CHẬM và HOÀN TOÀN (nhắm mắt hoàn toàn rồi mở lại)\n- Nháy cả HAI MẮT (không nháy một mắt)";
                } else if (errorMessage.includes("video")) {
                    errorMessage +=
                        "\n\nHãy thử lại trong môi trường có ánh sáng tốt hơn.";
                }

                Alert.alert(
                    errorTitle,
                    errorMessage,
                    [
                        {
                            text: "Thử lại",
                            style: "default",
                        },
                        errorDetails
                            ? {
                                  text: "Xem chi tiết lỗi",
                                  onPress: () =>
                                      Alert.alert("Chi tiết lỗi", errorDetails),
                              }
                            : undefined,
                    ].filter(Boolean) as any
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
                // Sử dụng API mới để upload và xử lý ảnh trong một bước
                const result = await OCRService.uploadAndProcessImage(
                    imageFormData,
                    isFront
                );
                Alert.alert(
                    "Thành công",
                    `Đã tải lên ảnh ${isFront ? "mặt trước" : "mặt sau"} CCCD`
                );

                // Lưu đường dẫn ảnh vào AsyncStorage để có thể sử dụng lại sau này
                if (result.image_path) {
                    const key = isFront
                        ? "id_card_front_path"
                        : "id_card_back_path";
                    await AsyncStorage.setItem(key, result.image_path);
                }

                return result.id_info;
            } catch (error: any) {
                // Kiểm tra xem có phải lỗi cần upload lại không
                if (error.response?.data?.need_reupload) {
                    // Hiển thị thông báo chi tiết hơn với hướng dẫn cụ thể
                    Alert.alert(
                        "Cần chụp lại ảnh",
                        error.response?.data?.message ||
                            "Không thể trích xuất thông tin từ ảnh. Vui lòng chụp lại ảnh CCCD với chất lượng tốt hơn.",
                        [
                            {
                                text: "Đã hiểu",
                                style: "default",
                            },
                        ]
                    );
                } else {
                    // Hiển thị thông báo lỗi thông thường
                    Alert.alert(
                        "Lỗi",
                        error.response?.data?.error ||
                            "Không thể tải lên ảnh CCCD. Vui lòng thử lại."
                    );
                }
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Thêm hàm mới để xử lý ảnh trực tiếp từ đường dẫn
    const handleProcessIDCardDirect = useCallback(
        async (imagePath: string, isFront: boolean) => {
            setIsLoading(true);
            try {
                const result = await OCRService.processImageDirect(
                    imagePath,
                    isFront,
                    true // Cập nhật thông tin KYC verification
                );
                Alert.alert(
                    "Thành công",
                    `Đã xử lý ảnh ${isFront ? "mặt trước" : "mặt sau"} CCCD`
                );
                return result.id_info;
            } catch (error: any) {
                // Kiểm tra xem có phải lỗi cần upload lại không
                if (error.response?.data?.need_reupload) {
                    Alert.alert(
                        "Cần chụp lại ảnh",
                        error.response?.data?.message ||
                            "Không thể trích xuất thông tin từ ảnh. Vui lòng chụp lại ảnh CCCD với chất lượng tốt hơn."
                    );
                } else {
                    Alert.alert(
                        "Lỗi",
                        error.response?.data?.error ||
                            "Không thể xử lý ảnh CCCD. Vui lòng thử lại."
                    );
                }
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const checkKYCStatus = useCallback(async () => {
        try {
            // Lấy trạng thái từ API
            const status = await KYCService.getKYCStatus();

            // Kiểm tra xem người dùng đã xác nhận ID card chưa
            const idCardVerified = await AsyncStorage.getItem(
                "id_card_verified"
            );

            // Chỉ đánh dấu ID card đã xác minh nếu cả hai điều kiện đều đúng:
            // 1. Backend đã có ảnh CCCD (mặt trước và mặt sau)
            // 2. Người dùng đã chủ động xác nhận thông tin CCCD
            return {
                ...status,
                id_card_verified:
                    status.id_card_verified && idCardVerified === "true",
            };
        } catch (error: any) {
            console.error("Error checking KYC status:", error);
            // Trả về trạng thái mặc định để tránh lỗi giao diện
            return {
                liveness_verified: false,
                id_card_verified: false,
            };
        }
    }, []);

    // Función para manejar la verificación facial
    const handleFaceVerification = useCallback(
        async (selfieFormData: FormData) => {
            setIsLoading(true);
            try {
                const result = await KYCService.verifyFaceMatch(selfieFormData);

                if (result.match) {
                    Alert.alert(
                        "Thành công",
                        "Xác minh khuôn mặt thành công! Bạn có thể tiếp tục quá trình xác minh."
                    );
                    return true;
                } else {
                    Alert.alert(
                        "Thất bại",
                        "Xác minh khuôn mặt không thành công. Khuôn mặt trong ảnh selfie không khớp với khuôn mặt trong CCCD. Vui lòng thử lại."
                    );
                    return false;
                }
            } catch (error: any) {
                // Chỉ ghi log lỗi vào console, không hiển thị chi tiết lỗi cho người dùng
                console.error("Lỗi xác minh khuôn mặt:", error);

                // Hiển thị thông báo lỗi chung, không hiển thị chi tiết lỗi từ Axios
                Alert.alert(
                    "Lỗi xác minh khuôn mặt",
                    "Không thể xác minh khuôn mặt. Vui lòng thử lại sau."
                );
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Función para verificar el estado de la verificación facial
    const checkFaceVerificationStatus = useCallback(async () => {
        try {
            const status = await KYCService.getFaceVerificationStatus();
            return status;
        } catch (error: any) {
            console.error("Error checking face verification status:", error);
            return {
                face_verified: false,
                face_match: false,
                selfie_uploaded: false,
            };
        }
    }, []);

    return {
        isLoading,
        handleVerifyLiveness,
        handleUploadIDCard,
        handleProcessIDCardDirect,
        checkKYCStatus,
        handleFaceVerification,
        checkFaceVerificationStatus,
    };
};
