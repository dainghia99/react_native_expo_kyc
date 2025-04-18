import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    AppState,
} from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useKYC } from "@/hooks/useKYC";
import { Camera, CameraType, VideoQuality } from "expo-camera";

export default function LivenessVerifySimpleScreen() {
    const router = useRouter();
    const { handleVerifyLiveness, isLoading } = useKYC();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const cameraRef = useRef<Camera | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            const { status: micStatus } =
                await Camera.requestMicrophonePermissionsAsync();
            setHasPermission(status === "granted" && micStatus === "granted");
        })();

        // Cleanup function
        return () => {
            if (isRecording && cameraRef.current) {
                try {
                    console.log("Dừng ghi video khi rời khỏi màn hình");
                    cameraRef.current.stopRecording();
                } catch (error) {
                    console.error(
                        "Error stopping recording on unmount:",
                        error
                    );
                }
            }
        };
    }, [isRecording]);

    // Thêm useEffect để xử lý khi ứng dụng bị ẩn hoặc mất focus
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState.match(/inactive|background/) && isRecording) {
                console.log("App chuyển sang chế độ nền, dừng ghi video");
                stopRecording();
            }
        };

        // Đăng ký sự kiện thay đổi trạng thái ứng dụng
        const subscription = AppState.addEventListener(
            "change",
            handleAppStateChange
        );

        return () => {
            // Hủy đăng ký khi component bị hủy
            subscription.remove();
        };
    }, [isRecording]);

    const startRecording = async () => {
        if (!cameraRef.current) {
            Alert.alert("Lỗi", "Không thể truy cập camera");
            return;
        }

        if (isRecording) {
            Alert.alert("Thông báo", "Đang ghi video, vui lòng đợi");
            return;
        }

        try {
            // Hiển thị hướng dẫn trước khi bắt đầu
            Alert.alert(
                "Hướng dẫn",
                "Giữ khuôn mặt trong khung hình và nháy mắt tự nhiên. Quá trình sẽ diễn ra trong 5 giây.",
                [{ text: "Bắt đầu", onPress: () => startRecordingProcess() }]
            );
        } catch (error: any) {
            console.error("Lỗi khi chuẩn bị ghi video:", error);
            Alert.alert(
                "Lỗi",
                error.message || "Có lỗi xảy ra. Vui lòng thử lại."
            );
        }
    };

    const startRecordingProcess = async () => {
        try {
            setIsRecording(true);

            // Chờ 3 giây trước khi bắt đầu ghi để camera khởi động hoàn toàn
            console.log("Chuẩn bị camera...");
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Kiểm tra lại camera trước khi ghi
            if (!cameraRef.current) {
                throw new Error("Camera không sẵn sàng");
            }

            console.log("Bắt đầu ghi video...");

            // Sử dụng try-catch nội bộ để xử lý lỗi ghi video
            let video;
            try {
                video = await cameraRef.current.recordAsync({
                    maxDuration: 5,
                    quality: VideoQuality["480p"], // Sử dụng chất lượng thấp hơn
                    mute: false, // Đảm bảo ghi âm thanh
                });
            } catch (recordError) {
                console.error(
                    "Lỗi khi ghi video, thử lại với cấu hình đơn giản hơn:",
                    recordError
                );
                // Chờ thêm 1 giây và thử lại với cấu hình đơn giản hơn
                await new Promise((resolve) => setTimeout(resolve, 1000));
                video = await cameraRef.current.recordAsync();
            }

            console.log("Ghi video hoàn tất:", video);
            setIsRecording(false);

            if (!video || !video.uri) {
                throw new Error("Không thể tạo video");
            }

            const formData = new FormData();
            formData.append("video", {
                uri: video.uri,
                name: "liveness.mp4",
                type: "video/mp4",
            } as any);

            const success = await handleVerifyLiveness(formData);
            if (success) {
                router.back();
            }
        } catch (error: any) {
            console.error("Lỗi ghi video:", error);
            setIsRecording(false);
            Alert.alert(
                "Lỗi ghi video",
                error.message || "Không thể ghi video. Vui lòng thử lại sau."
            );
        }
    };

    // Thêm hàm dừng ghi video để sử dụng khi cần
    const stopRecording = async () => {
        if (cameraRef.current && isRecording) {
            try {
                console.log("Dừng ghi video...");
                await cameraRef.current.stopRecording();
                console.log("Dừng ghi video hoàn tất");
                setIsRecording(false);
            } catch (error) {
                console.error("Lỗi khi dừng ghi video:", error);
            }
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Đang yêu cầu quyền camera...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>
                    Không có quyền truy cập camera và microphone
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.back()}
                >
                    <Text style={styles.buttonText}>Quay lại</Text>
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
                style={styles.camera}
                type={CameraType.front}
                ref={cameraRef}
                ratio="16:9"
                // Loại bỏ videoStabilizationMode vì có thể không được hỗ trợ
                onCameraReady={() => console.log("Camera sẵn sàng")}
                onMountError={(error) => {
                    console.error("Lỗi khi khởi tạo camera:", error);
                    Alert.alert(
                        "Lỗi camera",
                        "Không thể khởi tạo camera. Vui lòng thử lại sau."
                    );
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.guide}>
                        <Text style={styles.guideText}>
                            {isRecording
                                ? "Đang ghi video... Vui lòng giữ yên và nháy mắt tự nhiên"
                                : isLoading
                                ? "Đang xử lý video..."
                                : "Đặt khuôn mặt vào khung hình và nhấn 'Bắt đầu'"}
                        </Text>
                    </View>
                </View>
            </Camera>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        (isRecording || isLoading) && styles.buttonDisabled,
                    ]}
                    disabled={isRecording || isLoading}
                    onPress={startRecording}
                >
                    <Text style={styles.buttonText}>
                        {isLoading
                            ? "Đang xử lý..."
                            : isRecording
                            ? "Đang ghi..."
                            : "Bắt đầu kiểm tra"}
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
    text: {
        color: Colors().BLACK,
        textAlign: "center",
        fontSize: 16,
        marginBottom: 10,
        padding: 20,
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
