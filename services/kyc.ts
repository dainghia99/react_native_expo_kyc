import api from "./api";

export const verifyLiveness = async (videoFormData: FormData) => {
  const response = await api.post("/kyc/verify/liveness", videoFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadIDCard = async (
  imageFormData: FormData,
  isFront: boolean
) => {
  const response = await api.post(
    `/kyc/verify/id-card?front=${isFront}`,
    imageFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getKYCStatus = async () => {
  const response = await api.get("/kyc/status");
  return response.data;
};
