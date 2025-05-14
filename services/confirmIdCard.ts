import api from "./api";

/**
 * Gửi thông tin CCCD đã xác nhận lên backend
 * @param identityInfo Thông tin CCCD đã xác nhận
 * @returns Kết quả xác nhận
 */
export const confirmIdCardInfo = async (identityInfo: any) => {
  const response = await api.post("/kyc/confirm-id-card-info", identityInfo);
  return response.data;
};
