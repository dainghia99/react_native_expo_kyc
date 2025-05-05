import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Thay đổi IP này thành IP của máy chủ backend của bạn
// Khi sử dụng Expo App, cần sử dụng địa chỉ IP của máy tính trong cùng mạng
// Ví dụ: "http://192.168.1.7:5000" (thay bằng IP thực tế của máy tính bạn)
const API_URL = "http://192.168.1.6:5000"; // Sử dụng IP của máy tính bạn

const api = axios.create({
    baseURL: API_URL,
    timeout: 1800000, // Tăng thời gian timeout để tránh lỗi mạng
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error getting token:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Ghi log lỗi vào console thay vì hiển thị trên giao diện
        console.error("Axios error:", error);

        // Ghi log thêm thông tin chi tiết về lỗi nếu có
        if (error.response) {
            // Lỗi từ phản hồi của server
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
            console.error("Error response headers:", error.response.headers);

            // Xử lý lỗi 401 (Unauthorized)
            if (error.response.status === 401) {
                // Token expired or invalid
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("user");
                // You might want to trigger a navigation to login screen here
            }
        } else if (error.request) {
            // Yêu cầu đã được gửi nhưng không nhận được phản hồi
            console.error("Error request:", error.request);
        } else {
            // Lỗi khi thiết lập yêu cầu
            console.error("Error message:", error.message);
        }

        // Vẫn trả về lỗi để các hàm gọi API có thể xử lý
        return Promise.reject(error);
    }
);

export default api;
