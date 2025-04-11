import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="auth/sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/sign-up"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="verify"
          options={{
            title: "Xác thực KYC",
            headerBackTitle: "Quay lại",
          }}
        />
        <Stack.Screen
          name="home/home"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: "Thông tin cá nhân",
            headerBackTitle: "Quay lại",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
