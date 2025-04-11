import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { verifyLiveness, uploadIDCard } from "@/services/kyc";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";

export default function VerifyScreen() {
  const router = useRouter();
  const { user, checkKYCStatus } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const [frontImage, setFrontImage] = useState<any>(null);
  const [backImage, setBackImage] = useState<any>(null);
  const [isCapturingID, setIsCapturingID] = useState(false);
  const cameraRef = useRef<any>(null);

  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync();

        const formData = new FormData();
        formData.append("video", {
          uri: video.uri,
          type: "video/mp4",
          name: "liveness.mp4",
        } as any);

        const result = await verifyLiveness(formData);

        if (result.message === "Liveness verification successful") {
          Alert.alert("Thành công", "Xác thực liveness thành công!");
          await checkKYCStatus();
          router.back();
        } else {
          Alert.alert(
            "Thất bại",
            "Xác thực liveness thất bại. Vui lòng thử lại."
          );
        }
      } catch (error) {
        Alert.alert("Lỗi", "Có lỗi xảy ra trong quá trình xác thực.");
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const captureIDCard = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        const imageData = {
          uri: photo.uri,
          type: "image/jpeg",
          name: `${isCapturingID ? "front" : "back"}.jpg`,
        };

        if (isCapturingID) {
          setFrontImage(imageData);
          Alert.alert("Thành công", "Đã chụp ảnh mặt trước CCCD");
        } else {
          setBackImage(imageData);
          Alert.alert("Thành công", "Đã chụp ảnh mặt sau CCCD");
        }

        setIsCapturingID(!isCapturingID);
      } catch (error) {
        Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
      }
    }
  };

  const selectIDCard = async (side: "front" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageData = {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: `${side}.jpg`,
      };

      if (side === "front") {
        setFrontImage(imageData);
        Alert.alert("Thành công", "Đã chọn ảnh mặt trước CCCD");
      } else {
        setBackImage(imageData);
        Alert.alert("Thành công", "Đã chọn ảnh mặt sau CCCD");
      }
    }
  };

  const uploadImages = async () => {
    if (!frontImage || !backImage) {
      Alert.alert("Lỗi", "Vui lòng chọn đủ ảnh mặt trước và mặt sau CCCD");
      return;
    }

    try {
      const frontFormData = new FormData();
      frontFormData.append("image", frontImage as any);

      const backFormData = new FormData();
      backFormData.append("image", backImage as any);

      await uploadIDCard(frontFormData, backFormData);
      Alert.alert("Thành công", "Đã tải lên ảnh CCCD");
      await checkKYCStatus();
    } catch (error) {
      console.error("Error uploading ID card:", error);
      Alert.alert("Lỗi", "Không thể tải lên ảnh. Vui lòng thử lại.");
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Đang yêu cầu quyền truy cập camera...</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Không có quyền truy cập camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cho phép truy cập camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
          >
            <Text style={styles.text}>Đổi camera</Text>
          </TouchableOpacity>

          {!isRecording ? (
            <TouchableOpacity style={styles.button} onPress={startRecording}>
              <Text style={styles.text}>Bắt đầu ghi</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={stopRecording}>
              <Text style={styles.text}>Dừng ghi</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.captureButton}
            onPress={captureIDCard}
          >
            <Text style={styles.text}>Chụp CCCD</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => selectIDCard("front")}
        >
          <Text style={styles.buttonText}>Chọn CCCD mặt trước</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => selectIDCard("back")}
        >
          <Text style={styles.buttonText}>Chọn CCCD mặt sau</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 10 }]}
          onPress={uploadImages}
        >
          <Text style={styles.buttonText}>Tải lên ảnh CCCD</Text>
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
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  button: {
    backgroundColor: Colors().PRIMARY,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: Colors().SECONDARY,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  controls: {
    padding: 20,
    backgroundColor: Colors().WHITE,
  },
  buttonText: {
    color: Colors().WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
});
