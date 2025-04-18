import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function IDCardConfirmScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [idCardInfo, setIdCardInfo] = useState<any>(null);
    const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
    const [backImageUri, setBackImageUri] = useState<string | null>(null);

    useEffect(() => {
        loadIdCardInfo();
    }, []);

    const loadIdCardInfo = async () => {
        setLoading(true);
        try {
            // Lấy thông tin CCCD từ AsyncStorage
            const idInfoStr = await AsyncStorage.getItem("id_card_info");
            const frontUri = await AsyncStorage.getItem("id_card_front_uri");
            const backUri = await AsyncStorage.getItem("id_card_back_uri");

            if (idInfoStr) {
                const idInfo = JSON.parse(idInfoStr);
                setIdCardInfo(idInfo);
            } else {
                // Nếu không có thông tin, quay lại màn hình chụp CCCD
                Alert.alert(
                    "Thông báo",
                    "Không tìm thấy thông tin CCCD. Vui lòng thực hiện lại quá trình xác minh.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.push("/verify/id-card-front"),
                        },
                    ]
                );
            }

            if (frontUri) setFrontImageUri(frontUri);
            if (backUri) setBackImageUri(backUri);
        } catch (error) {
            console.error("Error loading ID card info:", error);
            Alert.alert(
                "Lỗi",
                "Không thể tải thông tin CCCD. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        // Chuyển đến màn hình xác minh khuôn mặt
        router.push("/verify/liveness-redirect");
    };

    const handleEdit = () => {
        // Quay lại màn hình chụp CCCD mặt trước để thực hiện lại
        router.push("/verify/id-card-front");
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors().PRIMARY} />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xác nhận thông tin CCCD</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.imagesContainer}>
                    {frontImageUri && (
                        <View style={styles.imageCard}>
                            <Text style={styles.imageTitle}>Mặt trước</Text>
                            <Image
                                source={{ uri: frontImageUri }}
                                style={styles.idCardImage}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    {backImageUri && (
                        <View style={styles.imageCard}>
                            <Text style={styles.imageTitle}>Mặt sau</Text>
                            <Image
                                source={{ uri: backImageUri }}
                                style={styles.idCardImage}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Thông tin CCCD</Text>

                    {idCardInfo && (
                        <View style={styles.infoContent}>
                            <InfoRow
                                label="Số CCCD"
                                value={idCardInfo.id_number || "Không có"}
                            />
                            <InfoRow
                                label="Họ và tên"
                                value={idCardInfo.full_name || "Không có"}
                            />
                            <InfoRow
                                label="Ngày sinh"
                                value={idCardInfo.date_of_birth || "Không có"}
                            />
                            <InfoRow
                                label="Giới tính"
                                value={idCardInfo.gender || "Không có"}
                            />
                            <InfoRow
                                label="Quốc tịch"
                                value={idCardInfo.nationality || "Không có"}
                            />
                            <InfoRow
                                label="Quê quán"
                                value={idCardInfo.place_of_origin || "Không có"}
                            />
                            <InfoRow
                                label="Nơi thường trú"
                                value={idCardInfo.place_of_residence || "Không có"}
                            />
                            <InfoRow
                                label="Ngày hết hạn"
                                value={idCardInfo.expiry_date || "Không có"}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmButtonText}>
                            Xác nhận thông tin
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEdit}
                    >
                        <Text style={styles.editButtonText}>
                            Chụp lại CCCD
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// Component hiển thị một dòng thông tin
const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

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
    imagesContainer: {
        flexDirection: "column",
        marginBottom: 20,
    },
    imageCard: {
        backgroundColor: Colors().WHITE,
        borderRadius: 10,
        padding: 15,
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
    imageTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: Colors().BLACK,
    },
    idCardImage: {
        width: "100%",
        height: 200,
        borderRadius: 5,
    },
    infoCard: {
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
    infoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: Colors().BLACK,
    },
    infoContent: {
        marginTop: 10,
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    infoLabel: {
        flex: 1,
        fontSize: 14,
        color: Colors().GRAY,
    },
    infoValue: {
        flex: 2,
        fontSize: 14,
        fontWeight: "500",
        color: Colors().BLACK,
    },
    actionsContainer: {
        marginTop: 10,
        marginBottom: 30,
    },
    confirmButton: {
        backgroundColor: Colors().PRIMARY,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
    },
    confirmButtonText: {
        color: Colors().WHITE,
        fontSize: 16,
        fontWeight: "bold",
    },
    editButton: {
        backgroundColor: Colors().WHITE,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors().PRIMARY,
    },
    editButtonText: {
        color: Colors().PRIMARY,
        fontSize: 16,
        fontWeight: "bold",
    },
});
