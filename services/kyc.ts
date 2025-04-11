import api from "./api";
import { KYCVerificationResponse, KYCStatusResponse } from "@/types";

export const verifyLiveness = async (
  formData: FormData
): Promise<KYCVerificationResponse> => {
  try {
    const response = await api.post("/kyc/verify-liveness", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in verifyLiveness:", error);
    throw error;
  }
};

export const uploadIDCard = async (
  frontImage: FormData,
  backImage: FormData
): Promise<any> => {
  try {
    const formData = new FormData();

    // Lấy file từ frontImage và backImage
    const frontFile = frontImage.get("image") as File;
    const backFile = backImage.get("image") as File;

    if (!frontFile || !backFile) {
      throw new Error("Missing image files");
    }

    formData.append("front_image", frontFile);
    formData.append("back_image", backFile);

    const response = await api.post("/kyc/upload-id-card", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in uploadIDCard:", error);
    throw error;
  }
};

export const getKYCStatus = async (): Promise<KYCStatusResponse> => {
  try {
    const response = await api.get("/kyc/status");
    return response.data;
  } catch (error) {
    console.error("Error in getKYCStatus:", error);
    throw error;
  }
};
