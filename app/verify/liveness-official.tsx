import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useKYC } from "@/hooks/useKYC";
import {
    CameraView,
    useCameraPermissions,
    useMicrophonePermissions,
} from "expo-camera";

export default function LivenessVerifyOfficialScreen() {
    const router = useRouter();
    const { handleVerifyLiveness, isLoading } = useKYC();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [recordingTimer, setRecordingTimer] = useState(0);
    const cameraRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Kiểm tra và yêu cầu quyền camera và microphone
        if (!cameraPermission?.granted) {
            requestCameraPermission();
        }
        if (!micPermission?.granted) {
            requestMicPermission();
        }

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
            // Xóa bộ đếm thời gian
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRecording]);

    // Xử lý đếm ngược trước khi bắt đầu ghi
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
                if (countdown === 1) {
                    // Bắt đầu ghi khi đếm ngược kết thúc
                    startRecordingProcess();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Xử lý đếm thời gian ghi video
    useEffect(() => {
        if (isRecording) {
            // Đặt thời gian ghi tối đa là 5 giây
            setRecordingTimer(5);
            timerRef.current = setInterval(() => {
                setRecordingTimer((prev) => {
                    if (prev <= 1) {
                        // Dừng ghi video khi hết thời gian
                        if (isRecording && cameraRef.current) {
                            stopRecording();
                        }
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            // Xóa bộ đếm thời gian khi không ghi
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRecording]);

    // Ngăn chặn nút back khi đang ghi
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                if (isRecording) {
                    Alert.alert(
                        "Xác nhận",
                        "Đang ghi video, bạn có muốn dừng và thoát?",
                        [
                            { text: "Tiếp tục ghi", style: "cancel" },
                            {
                                text: "Dừng và thoát",
                                onPress: () => {
                                    stopRecording();
                                    router.back();
                                },
                            },
                        ]
                    );
                    return true; // Ngăn chặn hành động mặc định
                }
                return false; // Cho phép hành động mặc định
            }
        );

        return () => backHandler.remove();
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
                [
                    {
                        text: "Bắt đầu",
                        onPress: () => {
                            // Bắt đầu đếm ngược 3 giây trước khi ghi
                            setCountdown(3);
                        },
                    },
                ]
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
            // Đảm bảo camera đã sẵn sàng trước khi ghi
            if (!cameraRef.current) {
                throw new Error("Camera không sẵn sàng");
            }

            setIsRecording(true);
            console.log("Bắt đầu ghi video...");

            // Thêm thời gian chờ dài hơn để đảm bảo camera đã hoàn toàn sẵn sàng
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Sử dụng try-catch nội bộ để xử lý lỗi ghi video
            let video;
            try {
                // Sử dụng cấu hình đơn giản nhất có thể
                video = await cameraRef.current.recordAsync();

                // Nếu không có lỗi, đợi thêm 1 giây để đảm bảo video được lưu đầy đủ
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (recordError) {
                console.error("Lỗi khi ghi video:", recordError);

                // Nếu lỗi liên quan đến "Recording was stopped before any data could be produced"
                if (
                    recordError.message &&
                    recordError.message.includes("stopped before any data")
                ) {
                    // Thử một cách tiếp cận khác: tạo một hình ảnh thay vì video
                    try {
                        const photo = await cameraRef.current.takePictureAsync({
                            quality: 0.5,
                            base64: true,
                        });

                        // Sử dụng hình ảnh thay vì video
                        const formData = new FormData();
                        formData.append("image", {
                            uri: photo.uri,
                            name: "liveness.jpg",
                            type: "image/jpeg",
                        } as any);

                        // Gửi thông báo cho người dùng
                        Alert.alert(
                            "Thông báo",
                            "Không thể ghi video, sử dụng hình ảnh thay thế. Vui lòng nháy mắt trong lúc chụp ảnh.",
                            [{ text: "OK" }]
                        );

                        // Gửi hình ảnh để xác thực
                        const success = await handleVerifyLiveness(formData);
                        if (success) {
                            router.back();
                        }
                        return; // Thoát khỏi hàm nếu đã xử lý thành công bằng hình ảnh
                    } catch (photoError) {
                        console.error("Lỗi khi chụp ảnh:", photoError);
                        throw new Error(
                            "Không thể ghi video hoặc chụp ảnh. Vui lòng thử lại sau."
                        );
                    }
                } else {
                    throw new Error(
                        "Không thể ghi video: " + recordError.message
                    );
                }
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

    if (!cameraPermission || !micPermission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors().PRIMARY} />
                <Text style={styles.text}>Đang yêu cầu quyền camera...</Text>
            </View>
        );
    }

    if (!cameraPermission.granted || !micPermission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>
                    Cần quyền truy cập camera và microphone để tiếp tục
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (!cameraPermission.granted)
                            requestCameraPermission();
                        if (!micPermission.granted) requestMicPermission();
                    }}
                >
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

            <CameraView
                style={styles.camera}
                facing="front"
                ref={cameraRef}
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
                    {countdown > 0 && (
                        <View style={styles.countdown}>
                            <Text style={styles.countdownText}>
                                {countdown}
                            </Text>
                        </View>
                    )}
                    <View style={styles.guide}>
                        <Text style={styles.guideText}>
                            {countdown > 0
                                ? "Chuẩn bị... " + countdown
                                : isRecording
                                ? `Đang ghi video... Còn lại ${recordingTimer}s. Vui lòng giữ yên và nháy mắt tự nhiên`
                                : isLoading
                                ? "Đang xử lý video..."
                                : "Đặt khuôn mặt vào khung hình và nhấn 'Bắt đầu'"}
                        </Text>
                    </View>
                </View>
            </CameraView>

            <View style={styles.controls}>
                {isRecording ? (
                    <TouchableOpacity
                        style={[styles.button, styles.stopButton]}
                        onPress={stopRecording}
                    >
                        <Text style={styles.buttonText}>
                            Dừng ghi ({recordingTimer}s)
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            (countdown > 0 || isLoading) &&
                                styles.buttonDisabled,
                        ]}
                        disabled={countdown > 0 || isLoading}
                        onPress={startRecording}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading
                                ? "Đang xử lý..."
                                : countdown > 0
                                ? `Chuẩn bị... ${countdown}`
                                : "Bắt đầu kiểm tra"}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[
                        styles.backButton,
                        (isRecording || countdown > 0) && styles.buttonDisabled,
                    ]}
                    disabled={isRecording || countdown > 0}
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
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    countdownText: {
        color: Colors().WHITE,
        fontSize: 40,
        fontWeight: "bold",
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
    stopButton: {
        backgroundColor: Colors().RED || "#FF3B30",
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
