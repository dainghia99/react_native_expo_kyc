import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useKYC } from "@/hooks/useKYC";

export default function FaceVerificationScreen() {
    const router = useRouter();
    const { handleFaceVerification, isLoading } = useKYC();
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const takePicture = async () => {
        if (!cameraRef.current) return;

        try {
            // Tăng chất lượng ảnh lên tối đa (1.0) để cải thiện nhận diện khuôn mặt
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1.0,
                exif: false,
            });
            setCapturedImage(photo.uri);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
            console.error("Camera error:", error);

            // Thử lại với cấu hình đơn giản hơn
            try {
                const simplePhoto = await cameraRef.current.takePictureAsync({
                    quality: 0.9,
                });
                setCapturedImage(simplePhoto.uri);
            } catch (retryError) {
                console.error("Retry camera error:", retryError);
                Alert.alert(
                    "Lỗi camera",
                    "Không thể chụp ảnh. Vui lòng thử lại sau."
                );
            }
        }
    };

    const retakePicture = () => {
        setCapturedImage(null);
    };

    const uploadImage = async () => {
        if (!capturedImage) return;

        try {
            const formData = new FormData();
            formData.append("image", {
                uri: capturedImage,
                name: "selfie.jpg",
                type: "image/jpeg",
            } as any);

            const success = await handleFaceVerification(formData);
            if (success) {
                // Lưu URI của ảnh selfie vào AsyncStorage
                await AsyncStorage.setItem("selfie_uri", capturedImage);

                // Chuyển đến màn hình xác minh liveness
                router.push("/verify/liveness");
            }
        } catch (error) {
            // Chỉ ghi log lỗi vào console, không hiển thị chi tiết lỗi cho người dùng
            console.error("Error uploading selfie:", error);

            // Hiển thị thông báo lỗi chung
            Alert.alert(
                "Lỗi",
                "Không thể tải lên ảnh selfie. Vui lòng thử lại sau."
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Xác minh khuôn mặt</Text>
            <Text style={styles.subtitle}>
                Chụp ảnh chân dung để xác minh khuôn mặt của bạn
            </Text>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors().PRIMARY} />
                    <Text style={styles.loadingText}>Đang xử lý...</Text>
                </View>
            ) : capturedImage ? (
                <View style={styles.previewContainer}>
                    <Image
                        source={{ uri: capturedImage }}
                        style={styles.previewImage}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={retakePicture}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Chụp lại
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={uploadImage}
                        >
                            <Text style={styles.buttonText}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <CameraView
                        style={styles.camera}
                        facing="front"
                        ref={cameraRef}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.faceFrame}>
                                <View style={styles.cornerTL} />
                                <View style={styles.cornerTR} />
                                <View style={styles.cornerBL} />
                                <View style={styles.cornerBR} />
                            </View>
                            <View style={styles.guide}>
                                <Text style={styles.guideText}>
                                    Đặt khuôn mặt vào khung hình
                                </Text>
                                <Text style={styles.guideTextHighlight}>
                                    ĐẢM BẢO KHUÔN MẶT NHÌN THẲNG VÀO CAMERA
                                </Text>
                                <Text style={styles.guideText}>
                                    Đảm bảo ảnh rõ nét và đủ ánh sáng
                                </Text>
                                <Text style={styles.guideText}>
                                    Không đeo kính, mũ hoặc khẩu trang
                                </Text>
                            </View>
                        </View>
                    </CameraView>
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={takePicture}
                    >
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 40,
        color: Colors().PRIMARY,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 20,
        color: "#666",
    },
    camera: {
        flex: 1,
        width: "100%",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    faceFrame: {
        width: 250,
        height: 300,
        borderRadius: 150,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.8)",
        position: "relative",
    },
    cornerTL: {
        position: "absolute",
        top: -5,
        left: -5,
        width: 30,
        height: 30,
        borderTopWidth: 5,
        borderLeftWidth: 5,
        borderColor: Colors().PRIMARY,
        borderTopLeftRadius: 15,
    },
    cornerTR: {
        position: "absolute",
        top: -5,
        right: -5,
        width: 30,
        height: 30,
        borderTopWidth: 5,
        borderRightWidth: 5,
        borderColor: Colors().PRIMARY,
        borderTopRightRadius: 15,
    },
    cornerBL: {
        position: "absolute",
        bottom: -5,
        left: -5,
        width: 30,
        height: 30,
        borderBottomWidth: 5,
        borderLeftWidth: 5,
        borderColor: Colors().PRIMARY,
        borderBottomLeftRadius: 15,
    },
    cornerBR: {
        position: "absolute",
        bottom: -5,
        right: -5,
        width: 30,
        height: 30,
        borderBottomWidth: 5,
        borderRightWidth: 5,
        borderColor: Colors().PRIMARY,
        borderBottomRightRadius: 15,
    },
    guide: {
        position: "absolute",
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 15,
        borderRadius: 10,
    },
    guideText: {
        color: "#fff",
        textAlign: "center",
        marginBottom: 5,
        fontSize: 14,
    },
    guideTextHighlight: {
        color: Colors().PRIMARY,
        textAlign: "center",
        marginBottom: 10,
        fontSize: 16,
        fontWeight: "bold",
    },
    captureButton: {
        position: "absolute",
        bottom: 30,
        alignSelf: "center",
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(255,255,255,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: Colors().PRIMARY,
    },
    previewContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    previewImage: {
        width: "100%",
        height: "70%",
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    button: {
        backgroundColor: Colors().PRIMARY,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: "center",
    },
    secondaryButton: {
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    secondaryButtonText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors().PRIMARY,
    },
});
