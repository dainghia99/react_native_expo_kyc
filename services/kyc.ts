import api from "./api";

export interface KYCVerificationResponse {
  message: string;
  blink_count: number;
  liveness_score: number;
}

export const verifyLiveness = async (
  videoFile: FormData
): Promise<KYCVerificationResponse> => {
  const response = await api.post("/kyc/verify-liveness", videoFile, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadIDCard = async (
  frontImage: FormData,
  backImage: FormData
) => {
  const response = await api.post(
    "/kyc/upload-id-card",
    {
      front: frontImage,
      back: backImage,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
