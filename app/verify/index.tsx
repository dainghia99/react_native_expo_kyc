import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Camera } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { verifyLiveness, uploadIDCard } from "@/services/kyc";

export default function VerifyScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const startLivenessCheck = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    const video = await cameraRef.current.recordAsync({
      maxDuration: 5,
      quality: "720p",
    });
    setIsRecording(false);

    try {
      const formData = new FormData();
      formData.append("video", {
        uri: video.uri,
        type: "video/mp4",
        name: "liveness.mp4",
      });

      const result = await verifyLiveness(formData);
      Alert.alert("Kết quả", `Điểm số: ${result.liveness_score}`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xác thực. Vui lòng thử lại.");
    }
  };

  const selectIDCard = async (side: "front" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append("image", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: `${side}.jpg`,
      });

      try {
        await uploadIDCard(formData, side === "front");
        Alert.alert(
          "Thành công",
          `Đã tải lên ảnh ${side === "front" ? "mặt trước" : "mặt sau"}`
        );
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải lên ảnh. Vui lòng thử lại.");
      }
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Text style={styles.buttonText}>Đổi camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isRecording && styles.recording]}
          onPress={startLivenessCheck}
          disabled={isRecording}
        >
          <Text style={styles.buttonText}>
            {isRecording ? "Đang ghi..." : "Bắt đầu xác thực"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => selectIDCard("front")}
        >
          <Text style={styles.buttonText}>Tải CCCD mặt trước</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => selectIDCard("back")}
        >
          <Text style={styles.buttonText}>Tải CCCD mặt sau</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  controls: {
    padding: 20,
    backgroundColor: Colors().WHITE,
  },
  button: {
    backgroundColor: Colors().PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: Colors().WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  recording: {
    backgroundColor: "red",
  },
});
