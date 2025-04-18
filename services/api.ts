import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Thay đổi IP này thành IP của máy chủ backend của bạn
// Sử dụng localhost cho máy ảo hoặc IP của máy tính cho thiết bị thật
const API_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      // You might want to trigger a navigation to login screen here
    }
    return Promise.reject(error);
  }
);

export default api;
