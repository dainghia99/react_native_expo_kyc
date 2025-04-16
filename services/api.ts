import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://192.168.1.7:5000",
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
