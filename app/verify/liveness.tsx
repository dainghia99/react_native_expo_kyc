import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Camera, useCameraPermissions } from "expo-camera"; // Import useCameraPermissions directly
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useKYC } from "@/hooks/useKYC";

export default function LivenessVerifyScreen() {
  const router = useRouter();
  const { handleVerifyLiveness, isLoading } = useKYC();
  const [permission, requestPermission] = useCameraPermissions(); // Use the imported hook directly
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const cameraRef = useRef<Camera | null>(null); // Add type to useRef
  let timer: NodeJS.Timeout | null = null; // Explicitly type timer

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    // Remove local timer declaration, use the one defined above
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isRecording && countdown === 0) {
      stopRecording();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isRecording]);

  const startLivenessCheck = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setCountdown(5);

      const video = await cameraRef.current.recordAsync({
        maxDuration: 5,
        quality: Platform.OS === "ios" ? "720p" : "720p",
      });

      const formData = new FormData();
      // Correctly format file for FormData append in React Native/Expo
      formData.append("video", {
        uri: video.uri,
        name: "liveness.mp4",
        type: "video/mp4",
      } as any); // Cast to any as a workaround for FormData typing

      const success = await handleVerifyLiveness(formData);
      if (success) {
        router.back();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể ghi video. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setIsRecording(false);
      setCountdown(0);
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        await cameraRef.current.stopRecording();
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
      setIsRecording(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.guideText}>
          Cần quyền truy cập camera để tiếp tục
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonHeader}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác minh khuôn mặt</Text>
      </View>
      
      <Camera
        ratio="16:9"
        style={styles.camera}
        type={"front"} // Use string literal 'front'
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          {countdown > 0 && (
            <View style={styles.countdown}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}
          {!isRecording && !isLoading && (
            <View style={styles.guide}>
              <Text style={styles.guideText}>
                Đặt khuôn mặt vào khung hình và nhấn "Bắt đầu"
              </Text>
              <Text style={styles.guideText}>Giữ yên và nháy mắt tự nhiên</Text>
            </View>
          )}
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            (isRecording || isLoading) && styles.buttonDisabled,
          ]}
          disabled={isRecording || isLoading}
          onPress={startLivenessCheck}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Đang xử lý..." : "Bắt đầu kiểm tra"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors().WHITE,
  },
  header: {
    backgroundColor: Colors().PRIMARY,
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonHeader: {
    color: Colors().WHITE,
    fontSize: 16,
    marginRight: 10,
  },
  headerTitle: {
    color: Colors().WHITE,
    fontSize: 20,
    fontWeight: "bold",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  guide: {
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    marginBottom: 20,
  },
  guideText: {
    color: Colors().WHITE,
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
  },
  countdown: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    color: Colors().WHITE,
    fontSize: 24,
    fontWeight: "bold",
  },
  controls: {
    padding: 20,
    backgroundColor: Colors().WHITE,
  },
  button: {
    backgroundColor: Colors().PRIMARY,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors().WHITE,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  backButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors().PRIMARY,
  },
  backButtonText: {
    color: Colors().PRIMARY,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
