import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useKYC } from "@/hooks/useKYC";
import {
    CameraView,
    useCameraPermissions,
    useMicrophonePermissions,
} from "expo-camera";

export default function LivenessVerifyScreen() {
    const router = useRouter();
    const { handleVerifyLiveness, isLoading } = useKYC();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const cameraRef = useRef<any>(null);
    let timer: NodeJS.Timeout | null = null;

    useEffect(() => {
        // Kiểm tra và yêu cầu quyền camera và microphone
        if (!cameraPermission?.granted) {
            requestCameraPermission();
        }
        if (!micPermission?.granted) {
            requestMicPermission();
        }
    }, [cameraPermission, micPermission]);

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
        if (!cameraRef.current) {
            Alert.alert("Lỗi", "Không thể truy cập camera");
            return;
        }

        if (!cameraPermission?.granted || !micPermission?.granted) {
            Alert.alert(
                "Lỗi",
                "Cần cấp quyền camera và microphone để thực hiện xác minh khuôn mặt"
            );
            return;
        }

        // Nếu đang ghi hoặc đang xử lý, không cho phép bắt đầu lại
        if (isRecording || isProcessing) {
            console.log("Camera đang bận, không thể bắt đầu ghi mới");
            return;
        }

        try {
            // Đặt trạng thái đang xử lý
            setIsProcessing(true);

            // Kiểm tra xem camera đã sẵn sàng chưa
            if (!cameraRef.current.isAvailableAsync) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Đảm bảo dừng bất kỳ phiên ghi nào đang diễn ra
            if (isRecording) {
                await stopRecording();
                // Chờ 1 giây sau khi dừng ghi trước khi bắt đầu lại
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Hiển thị hướng dẫn trước khi bắt đầu
            Alert.alert(
                "Hướng dẫn",
                "Giữ khuôn mặt trong khung hình và nháy mắt tự nhiên. Quá trình sẽ diễn ra trong 5 giây.",
                [{ text: "Bắt đầu", onPress: () => startRecording() }]
            );
        } catch (error: any) {
            console.error("Liveness check error:", error);
            Alert.alert(
                "Lỗi",
                error.message || "Có lỗi xảy ra. Vui lòng thử lại."
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const startRecording = async () => {
        // Nếu đang ghi hoặc đang xử lý, không cho phép bắt đầu lại
        if (isRecording || isProcessing) {
            console.log("Camera đang bận, không thể bắt đầu ghi mới");
            return;
        }

        try {
            setIsProcessing(true);

            // Đảm bảo dừng bất kỳ phiên ghi nào đang diễn ra
            if (isRecording) {
                await stopRecording();
                // Chờ 1 giây sau khi dừng ghi trước khi bắt đầu lại
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Đặt trạng thái ghi và đếm ngược
            setIsRecording(true);
            setCountdown(5);

            // Chờ 1 giây trước khi bắt đầu ghi để camera khởi động hoàn toàn
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log("Bắt đầu ghi video...");
            // Sử dụng try-catch nội bộ để xử lý lỗi ghi video
            let video;
            try {
                // Đảm bảo không có phiên ghi nào đang diễn ra
                if (cameraRef.current && cameraRef.current._cameraHandle) {
                    video = await cameraRef.current.recordAsync({
                        maxDuration: 5,
                    });
                } else {
                    throw new Error("Camera không sẵn sàng");
                }
            } catch (recordError) {
                console.error("Lỗi khi ghi video:", recordError);
                // Thử lại với các tùy chọn đơn giản hơn sau khi chờ thêm
                await new Promise((resolve) => setTimeout(resolve, 1000));
                video = await cameraRef.current.recordAsync();
            }
            console.log("Ghi video hoàn tất:", video);

            if (!video || !video.uri) {
                throw new Error("Không thể tạo video");
            }

            const formData = new FormData();
            // Định dạng file cho FormData trong React Native/Expo
            formData.append("video", {
                uri: video.uri,
                name: "liveness.mp4",
                type: "video/mp4",
            } as any); // Cast to any để tránh lỗi kiểu dữ liệu FormData

            const success = await handleVerifyLiveness(formData);
            if (success) {
                router.back();
            }
        } catch (error: any) {
            console.error("Liveness check error:", error);
            Alert.alert(
                "Lỗi ghi video",
                error.message || "Không thể ghi video. Vui lòng thử lại sau."
            );
        } finally {
            setIsRecording(false);
            setCountdown(0);
            setIsProcessing(false);
        }
    };

    const stopRecording = async () => {
        if (cameraRef.current) {
            try {
                console.log("Dừng ghi video...");
                // Thêm thời gian chờ trước khi dừng ghi
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Kiểm tra xem có đang ghi không trước khi dừng
                if (isRecording) {
                    await cameraRef.current.stopRecording();
                    console.log("Dừng ghi video hoàn tất");
                } else {
                    console.log("Không có phiên ghi nào đang diễn ra");
                }
            } catch (error) {
                console.error("Lỗi khi dừng ghi video:", error);
                // Không hiển thị thông báo lỗi cho người dùng để tránh gây nhầm lẫn
            } finally {
                // Đảm bảo đặt trạng thái ghi về false
                setIsRecording(false);
            }
        }
    };

    // Thêm hàm dọn dẹp khi component bị hủy
    useEffect(() => {
        return () => {
            // Dừng bất kỳ phiên ghi nào đang diễn ra khi rời khỏi màn hình
            if (isRecording && cameraRef.current) {
                try {
                    cameraRef.current.stopRecording();
                } catch (error) {
                    console.error(
                        "Lỗi khi dừng ghi video khi rời khỏi màn hình:",
                        error
                    );
                }
            }
        };
    }, [isRecording]);

    if (!cameraPermission || !micPermission) {
        return (
            <View style={styles.container}>
                <Text style={styles.guideText}>
                    Đang kiểm tra quyền camera và microphone...
                </Text>
            </View>
        );
    }

    if (!cameraPermission.granted || !micPermission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.guideText}>
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

            <CameraView style={styles.camera} facing="front" ref={cameraRef}>
                <View style={styles.overlay}>
                    {countdown > 0 && (
                        <View style={styles.countdown}>
                            <Text style={styles.countdownText}>
                                {countdown}
                            </Text>
                        </View>
                    )}
                    {!isRecording && !isLoading && !isProcessing && (
                        <View style={styles.guide}>
                            <Text style={styles.guideText}>
                                Đặt khuôn mặt vào khung hình và nhấn "Bắt đầu"
                            </Text>
                            <Text style={styles.guideText}>
                                Giữ yên và nháy mắt tự nhiên
                            </Text>
                        </View>
                    )}
                    {isProcessing && !isRecording && (
                        <View style={styles.guide}>
                            <Text style={styles.guideText}>
                                Đang chuẩn bị camera...
                            </Text>
                        </View>
                    )}
                    {isRecording && countdown === 0 && (
                        <View style={styles.guide}>
                            <Text style={styles.guideText}>
                                Đang ghi video...
                            </Text>
                        </View>
                    )}
                    {isLoading && (
                        <View style={styles.guide}>
                            <Text style={styles.guideText}>
                                Đang xử lý video...
                            </Text>
                        </View>
                    )}
                </View>
            </CameraView>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        (isRecording || isLoading || isProcessing) &&
                            styles.buttonDisabled,
                    ]}
                    disabled={isRecording || isLoading || isProcessing}
                    onPress={startLivenessCheck}
                >
                    <Text style={styles.buttonText}>
                        {isLoading
                            ? "Đang xử lý..."
                            : isRecording
                            ? "Đang ghi..."
                            : isProcessing
                            ? "Đang chuẩn bị..."
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
