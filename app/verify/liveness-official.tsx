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
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    const { handleVerifyLiveness, isLoading, checkFaceVerificationStatus } =
        useKYC();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [recordingTimer, setRecordingTimer] = useState(0);
    const [attemptCount, setAttemptCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const cameraRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Kiểm tra xem người dùng đã hoàn thành xác minh khuôn mặt chưa
        checkFaceVerification();

        // Kiểm tra và yêu cầu quyền camera và microphone
        if (!cameraPermission?.granted) {
            requestCameraPermission();
        }
        if (!micPermission?.granted) {
            requestMicPermission();
        }
    }, []);

    // Kiểm tra xem người dùng đã hoàn thành xác minh khuôn mặt chưa
    const checkFaceVerification = async () => {
        try {
            const faceStatus = await checkFaceVerificationStatus();
            setLoading(false);

            if (!faceStatus.face_match) {
                // Nếu chưa xác minh khuôn mặt, chuyển hướng về trang xác minh khuôn mặt
                Alert.alert(
                    "Thông báo",
                    "Bạn cần hoàn thành xác minh khuôn mặt trước khi tiếp tục xác minh liveness.",
                    [
                        {
                            text: "OK",
                            onPress: () =>
                                router.replace("/verify/face-verification"),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error("Error checking face verification status:", error);
            setLoading(false);

            // Nếu có lỗi, cũng chuyển hướng về trang xác minh khuôn mặt
            Alert.alert(
                "Lỗi",
                "Không thể kiểm tra trạng thái xác minh khuôn mặt. Vui lòng thử lại.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/verify"),
                    },
                ]
            );
        }
    };

    useEffect(() => {
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
                "Hướng dẫn xác minh khuôn mặt",
                "1. Giữ khuôn mặt ở giữa khung hình\n2. Đảm bảo ánh sáng đầy đủ\n3. NHÁY MẮT RÕ RÀNG ít nhất 1 lần\n4. Quá trình sẽ diễn ra trong 5 giây\n\nLƯU Ý QUAN TRỌNG:\n- Nháy mắt THẬT RÕ RÀNG và TỰ NHIÊN\n- Nháy mắt CHẬM và HOÀN TOÀN (nhắm mắt hoàn toàn rồi mở lại)\n- Nháy cả HAI MẮT (không nháy một mắt)",
                [
                    {
                        text: "Xem ví dụ",
                        onPress: () => {
                            // Hiển thị hướng dẫn chi tiết hơn
                            Alert.alert(
                                "Cách nháy mắt đúng",
                                "1. Nhìn thẳng vào camera\n2. Nhắm hoàn toàn cả hai mắt trong khoảng 0.5-1 giây\n3. Mở mắt lại bình thường\n4. Lặp lại 1-2 lần nữa\n\nTránh:\n- Nháy mắt quá nhanh\n- Chỉ nháy một mắt\n- Nhắm mắt không hoàn toàn",
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
                        },
                    },
                    {
                        text: "Bắt đầu ngay",
                        style: "default",
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
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Sử dụng try-catch nội bộ để xử lý lỗi ghi video
            let video;
            try {
                // Sử dụng cấu hình với các tùy chọn cụ thể cho expo-camera 15.0.14
                video = await cameraRef.current.recordAsync({
                    maxDuration: 5,
                    quality: "480p",
                    mute: false,
                    mirror: false,
                });

                // Nếu không có lỗi, đợi thêm 1 giây để đảm bảo video được lưu đầy đủ
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (recordError) {
                console.error("Lỗi khi ghi video:", recordError);

                // Thử lại với cấu hình đơn giản hơn
                try {
                    console.log("Thử lại với cấu hình đơn giản hơn...");
                    // Đảm bảo camera vẫn sẵn sàng
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    // Thử lại với cấu hình tối giản
                    video = await cameraRef.current.recordAsync({
                        maxDuration: 3,
                        quality: "low",
                    });

                    console.log("Ghi video thành công với cấu hình đơn giản");
                } catch (retryError) {
                    console.error("Lỗi khi thử lại ghi video:", retryError);

                    // Nếu vẫn lỗi, thử dùng hình ảnh thay thế
                    if (
                        recordError.message &&
                        (recordError.message.includes(
                            "stopped before any data"
                        ) ||
                            retryError.message.includes(
                                "stopped before any data"
                            ))
                    ) {
                        // Thử một cách tiếp cận khác: tạo một hình ảnh thay vì video
                        try {
                            const photo =
                                await cameraRef.current.takePictureAsync({
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
                            const success = await handleVerifyLiveness(
                                formData
                            );
                            if (success) {
                                // Xóa cờ xác minh đang hoạt động khi hoàn thành
                                await AsyncStorage.removeItem(
                                    "active_verification"
                                );
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
                            "Không thể ghi video: " +
                                (retryError.message || recordError.message)
                        );
                    }
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

            // Tăng số lần thử
            setAttemptCount((prev) => prev + 1);

            // Gọi API xác thực liveness
            const success = await handleVerifyLiveness(formData);
            if (success) {
                // Xóa cờ xác minh đang hoạt động khi hoàn thành
                await AsyncStorage.removeItem("active_verification");
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
                // Đặt trạng thái về false ngay cả khi có lỗi
                setIsRecording(false);
            }
        }
    };

    // Thêm hàm để xử lý khi camera sẵn sàng
    const handleCameraReady = () => {
        console.log("Camera sẵn sàng và đã được khởi tạo đầy đủ");
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors().PRIMARY} />
                <Text style={styles.text}>
                    Đang kiểm tra trạng thái xác minh khuôn mặt...
                </Text>
            </View>
        );
    }

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
                mode="video"
                video={{
                    quality: "480p",
                    maxDuration: 5,
                    mute: false,
                }}
                onCameraReady={handleCameraReady}
                onMountError={(error) => {
                    console.error("Lỗi khi khởi tạo camera:", error);
                    Alert.alert(
                        "Lỗi camera",
                        "Không thể khởi tạo camera. Vui lòng thử lại sau."
                    );
                }}
            >
                <View style={styles.overlay}>
                    {/* Khung khuôn mặt */}
                    <View style={styles.faceFrame}>
                        {/* Viền trên */}
                        <View style={[styles.frameBorder, styles.topBorder]} />
                        {/* Viền phải */}
                        <View
                            style={[styles.frameBorder, styles.rightBorder]}
                        />
                        {/* Viền dưới */}
                        <View
                            style={[styles.frameBorder, styles.bottomBorder]}
                        />
                        {/* Viền trái */}
                        <View style={[styles.frameBorder, styles.leftBorder]} />

                        {/* Góc trên bên trái */}
                        <View
                            style={[styles.frameCorner, styles.topLeftCorner]}
                        >
                            <View
                                style={[
                                    styles.cornerHorizontal,
                                    { top: 0, left: 0 },
                                ]}
                            />
                            <View
                                style={[
                                    styles.cornerVertical,
                                    { top: 0, left: 0 },
                                ]}
                            />
                        </View>

                        {/* Góc trên bên phải */}
                        <View
                            style={[styles.frameCorner, styles.topRightCorner]}
                        >
                            <View
                                style={[
                                    styles.cornerHorizontal,
                                    { top: 0, right: 0 },
                                ]}
                            />
                            <View
                                style={[
                                    styles.cornerVertical,
                                    { top: 0, right: 0 },
                                ]}
                            />
                        </View>

                        {/* Góc dưới bên trái */}
                        <View
                            style={[
                                styles.frameCorner,
                                styles.bottomLeftCorner,
                            ]}
                        >
                            <View
                                style={[
                                    styles.cornerHorizontal,
                                    { bottom: 0, left: 0 },
                                ]}
                            />
                            <View
                                style={[
                                    styles.cornerVertical,
                                    { bottom: 0, left: 0 },
                                ]}
                            />
                        </View>

                        {/* Góc dưới bên phải */}
                        <View
                            style={[
                                styles.frameCorner,
                                styles.bottomRightCorner,
                            ]}
                        >
                            <View
                                style={[
                                    styles.cornerHorizontal,
                                    { bottom: 0, right: 0 },
                                ]}
                            />
                            <View
                                style={[
                                    styles.cornerVertical,
                                    { bottom: 0, right: 0 },
                                ]}
                            />
                        </View>
                    </View>

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
                                ? `Đang ghi video... Còn lại ${recordingTimer}s.`
                                : isLoading
                                ? "Đang xử lý video..."
                                : "Đặt khuôn mặt vào khung hình và nhấn 'Bắt đầu'"}
                        </Text>
                        {isRecording && (
                            <Text
                                style={[
                                    styles.guideText,
                                    styles.blinkInstruction,
                                ]}
                            >
                                NHÁY MẮT CHẬM VÀ RÕ RÀNG!
                            </Text>
                        )}
                        {isRecording && (
                            <Text
                                style={[
                                    styles.guideText,
                                    styles.blinkInstruction,
                                ]}
                            >
                                NHẮM HOÀN TOÀN CẢ HAI MẮT
                            </Text>
                        )}
                        {!isRecording && !isLoading && countdown === 0 && (
                            <>
                                <Text style={styles.guideText}>
                                    Đặt khuôn mặt vào trong khung hình ở trên
                                </Text>
                                <Text style={styles.guideText}>
                                    Đảm bảo ánh sáng đầy đủ và khuôn mặt rõ ràng
                                </Text>
                                <Text style={styles.guideTextHighlight}>
                                    Khi bắt đầu, hãy nháy mắt CHẬM và RÕ RÀNG
                                </Text>
                            </>
                        )}
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

    blinkInstruction: {
        color: "#FFD700", // Màu vàng để nổi bật
        fontWeight: "bold",
        fontSize: 20,
        marginTop: 10,
        marginBottom: 5,
        textAlign: "center",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        overflow: "hidden",
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
    // Styles cho khung khuôn mặt
    faceFrame: {
        width: 280,
        height: 350,
        position: "relative",
        marginBottom: 20,
        borderRadius: 150,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)",
        overflow: "hidden",
        // Thêm đổ bóng để nổi bật hơn
        shadowColor: "#fff",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        // Thêm viền phát sáng
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
    },
    frameBorder: {
        position: "absolute",
        borderColor: "rgba(255, 255, 255, 0.7)",
    },
    topBorder: {
        top: 0,
        left: 70,
        right: 70,
        height: 2,
        borderTopWidth: 2,
    },
    rightBorder: {
        top: 70,
        right: 0,
        bottom: 70,
        width: 2,
        borderRightWidth: 2,
    },
    bottomBorder: {
        bottom: 0,
        left: 70,
        right: 70,
        height: 2,
        borderBottomWidth: 2,
    },
    leftBorder: {
        top: 70,
        left: 0,
        bottom: 70,
        width: 2,
        borderLeftWidth: 2,
    },
    frameCorner: {
        position: "absolute",
        width: 30,
        height: 30,
    },
    topLeftCorner: {
        top: 0,
        left: 0,
    },
    topRightCorner: {
        top: 0,
        right: 0,
    },
    bottomLeftCorner: {
        bottom: 0,
        left: 0,
    },
    bottomRightCorner: {
        bottom: 0,
        right: 0,
    },
    cornerHorizontal: {
        position: "absolute",
        width: 25,
        height: 4,
        backgroundColor: Colors().WHITE,
    },
    cornerVertical: {
        position: "absolute",
        width: 4,
        height: 25,
        backgroundColor: Colors().WHITE,
    },
    guide: {
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 10,
        marginBottom: 20,
        width: "90%",
        maxWidth: 350,
    },
    guideText: {
        color: Colors().WHITE,
        textAlign: "center",
        fontSize: 16,
        marginBottom: 10,
    },
    guideTextHighlight: {
        color: "#FFD700", // Màu vàng để nổi bật
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
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
