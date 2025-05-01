import api from "./api";

/**
 * Xử lý ảnh OCR trực tiếp từ đường dẫn file trong thư mục uploads
 * @param imagePath Đường dẫn tương đối đến file ảnh trong thư mục uploads
 * @param isFront True nếu là mặt trước CCCD, False nếu là mặt sau
 * @param updateVerification True nếu muốn cập nhật thông tin KYC verification
 * @returns Thông tin trích xuất từ ảnh
 */
export const processImageDirect = async (
  imagePath: string,
  isFront: boolean,
  updateVerification: boolean = true
) => {
  const response = await api.post("/ocr/process", {
    image_path: imagePath,
    is_front: isFront,
    update_verification: updateVerification,
  });
  return response.data;
};

/**
 * Upload và xử lý ảnh OCR trong một bước
 * @param imageFormData FormData chứa ảnh cần upload và xử lý
 * @param isFront True nếu là mặt trước CCCD, False nếu là mặt sau
 * @returns Thông tin trích xuất từ ảnh và đường dẫn đến file đã lưu
 */
export const uploadAndProcessImage = async (
  imageFormData: FormData,
  isFront: boolean
) => {
  const response = await api.post(
    `/ocr/upload-and-process?front=${isFront}`,
    imageFormData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
