import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const isRootPath = segments.length === 0;

    if (!user && !inAuthGroup && !isRootPath) {
      // Redirect to sign-in if not logged in and not on root or auth pages
      router.replace("/auth/sign-in");
    } else if (user && inAuthGroup) {
      // Redirect to home if logged in and trying to access auth pages
      router.replace("/home/home");
    }
  }, [user, segments, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
