import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useKYC } from "@/hooks/useKYC";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

export default function KYCMainScreen() {
    const router = useRouter();
    const {
        checkKYCStatus,
        checkFaceVerificationStatus,
        isLoading: isKYCLoading,
    } = useKYC();
    const { user } = useAuth();
    const [kycStatus, setKycStatus] = useState<any>(null);
    const [faceStatus, setFaceStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadKYCStatus();

        // Xóa các cờ xác minh khi vào màn hình chính
        AsyncStorage.removeItem("active_verification");

        // Kiểm tra xem người dùng có đang quay lại từ quá trình xác minh không
        const checkVerificationStatus = async () => {
            const isVerifying = await AsyncStorage.getItem(
                "active_verification"
            );
            if (!isVerifying) {
                // Nếu không đang trong quá trình xác minh, xóa cờ xác nhận ID card
                // để đảm bảo người dùng phải chủ động xác nhận lại
                await AsyncStorage.removeItem("id_card_verified");
            }
        };

        checkVerificationStatus();

        return () => {
            // Đảm bảo cờ được xóa khi rời khỏi màn hình
            AsyncStorage.removeItem("active_verification");
        };
    }, []);

    const loadKYCStatus = async () => {
        setLoading(true);
        try {
            // Tải trạng thái KYC
            const status = await checkKYCStatus();
            console.log("KYC Status:", status);

            // Đảm bảo các giá trị boolean được chuyển đổi sang kiểu boolean JavaScript gốc
            const processedStatus = {
                ...status,
                liveness_verified: Boolean(status.liveness_verified),
                id_card_verified: Boolean(status.id_card_verified),
            };
            setKycStatus(processedStatus);

            // Tải trạng thái xác minh khuôn mặt
            const faceVerificationStatus = await checkFaceVerificationStatus();
            console.log("Face Verification Status:", faceVerificationStatus);

            // Đảm bảo các giá trị boolean được chuyển đổi sang kiểu boolean JavaScript gốc
            const processedFaceStatus = {
                ...faceVerificationStatus,
                face_verified: Boolean(faceVerificationStatus.face_verified),
                face_match: Boolean(faceVerificationStatus.face_match),
                selfie_uploaded: Boolean(
                    faceVerificationStatus.selfie_uploaded
                ),
            };
            setFaceStatus(processedFaceStatus);
        } catch (error) {
            // Chỉ ghi log lỗi vào console, không hiển thị thông báo lỗi trên giao diện
            console.error("Error loading KYC status:", error);

            // Đặt trạng thái mặc định để tránh lỗi giao diện
            setKycStatus({
                liveness_verified: false,
                id_card_verified: false,
            });
            setFaceStatus({
                face_verified: false,
                face_match: false,
                selfie_uploaded: false,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLivenessVerification = async () => {
        // Đặt cờ xác minh đang hoạt động khi bắt đầu quá trình xác minh
        await AsyncStorage.setItem("active_verification", "true");
        router.push("/verify/liveness-redirect");
    };

    const handleIDCardVerification = async () => {
        // Đặt cờ xác minh đang hoạt động khi bắt đầu quá trình xác minh
        await AsyncStorage.setItem("active_verification", "true");
        router.push("/verify/id-card-front");
    };

    const handleFaceVerification = async () => {
        // Đặt cờ xác minh đang hoạt động khi bắt đầu quá trình xác minh
        await AsyncStorage.setItem("active_verification", "true");
        router.push("/verify/face-verification");
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors().PRIMARY} />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
        );
    }

    const isLivenessVerified = kycStatus?.liveness_verified;
    const isIDCardVerified = kycStatus?.id_card_verified;
    const isFaceVerified = faceStatus?.face_match;
    const isFullyVerified = user?.kyc_status === "verified";

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xác minh danh tính</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statusCard}>
                    <Text style={styles.statusTitle}>Trạng thái xác minh</Text>
                    <Text style={styles.statusText}>
                        {isFullyVerified
                            ? "Đã xác minh đầy đủ"
                            : "Chưa hoàn thành xác minh"}
                    </Text>
                </View>

                <View style={styles.stepsContainer}>
                    <View
                        style={[
                            styles.stepCard,
                            isIDCardVerified && styles.completedStepCard,
                        ]}
                    >
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepNumber}>1</Text>
                            <Text style={styles.stepTitle}>Xác minh CCCD</Text>
                            {isIDCardVerified && (
                                <Text style={styles.completedBadge}>
                                    Đã hoàn thành
                                </Text>
                            )}
                        </View>
                        <Text style={styles.stepDescription}>
                            Chụp ảnh mặt trước và mặt sau CCCD của bạn
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.stepButton,
                                isIDCardVerified && styles.disabledButton,
                            ]}
                            onPress={handleIDCardVerification}
                            disabled={isIDCardVerified || isKYCLoading}
                        >
                            <Text style={styles.stepButtonText}>
                                {isIDCardVerified
                                    ? "Đã xác minh"
                                    : "Xác minh ngay"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View
                        style={[
                            styles.stepCard,
                            isFaceVerified && styles.completedStepCard,
                            !isIDCardVerified && styles.disabledStepCard,
                        ]}
                    >
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepNumber}>2</Text>
                            <Text style={styles.stepTitle}>
                                Xác minh khuôn mặt
                            </Text>
                            {isFaceVerified && (
                                <Text style={styles.completedBadge}>
                                    Đã hoàn thành
                                </Text>
                            )}
                        </View>
                        <Text style={styles.stepDescription}>
                            Chụp ảnh chân dung để xác minh khuôn mặt của bạn
                            khớp với CCCD
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.stepButton,
                                (isFaceVerified || !isIDCardVerified) &&
                                    styles.disabledButton,
                            ]}
                            onPress={handleFaceVerification}
                            disabled={
                                isFaceVerified ||
                                !isIDCardVerified ||
                                isKYCLoading
                            }
                        >
                            <Text style={styles.stepButtonText}>
                                {isFaceVerified
                                    ? "Đã xác minh"
                                    : !isIDCardVerified
                                    ? "Hoàn thành bước 1 trước"
                                    : "Xác minh ngay"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View
                        style={[
                            styles.stepCard,
                            isLivenessVerified && styles.completedStepCard,
                            (!isIDCardVerified || !isFaceVerified) &&
                                styles.disabledStepCard,
                        ]}
                    >
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepNumber}>3</Text>
                            <Text style={styles.stepTitle}>
                                Xác minh liveness
                            </Text>
                            {isLivenessVerified && (
                                <Text style={styles.completedBadge}>
                                    Đã hoàn thành
                                </Text>
                            )}
                        </View>
                        <Text style={styles.stepDescription}>
                            Quay video khuôn mặt để xác minh bạn là người thật
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.stepButton,
                                (isLivenessVerified ||
                                    !isIDCardVerified ||
                                    !isFaceVerified) &&
                                    styles.disabledButton,
                            ]}
                            onPress={handleLivenessVerification}
                            disabled={
                                isLivenessVerified ||
                                !isIDCardVerified ||
                                !isFaceVerified ||
                                isKYCLoading
                            }
                        >
                            <Text style={styles.stepButtonText}>
                                {isLivenessVerified
                                    ? "Đã xác minh"
                                    : !isIDCardVerified
                                    ? "Hoàn thành bước 1 trước"
                                    : !isFaceVerified
                                    ? "Hoàn thành bước 2 trước"
                                    : "Xác minh ngay"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isFullyVerified && (
                    <View style={styles.successMessage}>
                        <Text style={styles.successTitle}>
                            Chúc mừng! Bạn đã hoàn thành xác minh danh tính
                        </Text>
                        <Text style={styles.successDescription}>
                            Bạn có thể sử dụng đầy đủ tính năng của ứng dụng
                        </Text>
                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => router.replace("/home/home")}
                        >
                            <Text style={styles.homeButtonText}>
                                Về trang chủ
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors().WHITE,
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
    header: {
        backgroundColor: Colors().PRIMARY,
        padding: 20,
        paddingTop: 50,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        color: Colors().WHITE,
        fontSize: 16,
        marginRight: 10,
    },
    headerTitle: {
        color: Colors().WHITE,
        fontSize: 20,
        fontWeight: "bold",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    statusCard: {
        backgroundColor: Colors().WHITE,
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    statusTitle: {
        fontSize: 16,
        color: Colors().GRAY || "#757575",
        marginBottom: 5,
    },
    statusText: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors().PRIMARY,
    },
    stepsContainer: {
        marginBottom: 20,
    },
    stepCard: {
        backgroundColor: Colors().WHITE,
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    completedStepCard: {
        borderLeftWidth: 5,
        borderLeftColor: Colors().SUCCESS || "#4CAF50",
    },
    disabledStepCard: {
        opacity: 0.7,
        borderLeftWidth: 5,
        borderLeftColor: Colors().GRAY || "#757575",
    },
    stepHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    stepNumber: {
        backgroundColor: Colors().PRIMARY,
        color: Colors().WHITE,
        width: 24,
        height: 24,
        borderRadius: 12,
        textAlign: "center",
        lineHeight: 24,
        marginRight: 10,
        fontWeight: "bold",
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
    },
    completedBadge: {
        backgroundColor: Colors().SUCCESS || "#4CAF50",
        color: Colors().WHITE,
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    stepDescription: {
        fontSize: 14,
        color: Colors().GRAY || "#757575",
        marginBottom: 15,
        lineHeight: 20,
    },
    stepButton: {
        backgroundColor: Colors().PRIMARY,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: Colors().LIGHT_GRAY || "#BDBDBD",
    },
    stepButtonText: {
        color: Colors().WHITE,
        fontWeight: "bold",
    },
    successMessage: {
        backgroundColor: Colors().SUCCESS_LIGHT || "#E8F5E9",
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        alignItems: "center",
    },
    successTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors().SUCCESS || "#4CAF50",
        textAlign: "center",
        marginBottom: 10,
    },
    successDescription: {
        fontSize: 14,
        color: Colors().GRAY || "#757575",
        textAlign: "center",
        marginBottom: 15,
    },
    homeButton: {
        backgroundColor: Colors().SUCCESS || "#4CAF50",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    homeButtonText: {
        color: Colors().WHITE,
        fontWeight: "bold",
    },
});
