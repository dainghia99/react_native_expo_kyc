import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [idCardInfo, setIdCardInfo] = useState<any>(null);

    useEffect(() => {
        loadIdCardInfo();
    }, []);

    const loadIdCardInfo = async () => {
        setLoading(true);
        try {
            // Lấy thông tin CCCD từ AsyncStorage
            const idInfoStr = await AsyncStorage.getItem("id_card_info");
            if (idInfoStr) {
                const idInfo = JSON.parse(idInfoStr);
                setIdCardInfo(idInfo);
            }
        } catch (error) {
            console.error("Error loading ID card info:", error);
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.profileSection}>
                    <Image
                        source={require("@/assets/images/logo/Logo_DAI_NAM.png")}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>
                        {idCardInfo?.full_name || user?.email}
                    </Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                            {user?.kyc_status === "verified"
                                ? "Đã xác thực"
                                : "Chưa xác thực"}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>
                            Thông tin cơ bản
                        </Text>
                        <View style={styles.infoItem}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{user?.email}</Text>
                        </View>
                        {idCardInfo && (
                            <>
                                <View style={styles.infoItem}>
                                    <Text style={styles.label}>Số CCCD</Text>
                                    <Text style={styles.value}>
                                        {idCardInfo.id_number || "Chưa có"}
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.label}>Họ và tên</Text>
                                    <Text style={styles.value}>
                                        {idCardInfo.full_name || "Chưa có"}
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.label}>Ngày sinh</Text>
                                    <Text style={styles.value}>
                                        {idCardInfo.date_of_birth || "Chưa có"}
                                    </Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.label}>Giới tính</Text>
                                    <Text style={styles.value}>
                                        {idCardInfo.gender || "Chưa có"}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>

                    {idCardInfo && (
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>
                                Thông tin chi tiết
                            </Text>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Quốc tịch</Text>
                                <Text style={styles.value}>
                                    {idCardInfo.nationality || "Chưa có"}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Quê quán</Text>
                                <Text style={styles.value}>
                                    {idCardInfo.place_of_origin || "Chưa có"}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Nơi thường trú</Text>
                                <Text style={styles.value}>
                                    {idCardInfo.place_of_residence || "Chưa có"}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.label}>Ngày hết hạn</Text>
                                <Text style={styles.value}>
                                    {idCardInfo.expiry_date || "Chưa có"}
                                </Text>
                            </View>
                        </View>
                    )}

                    {!idCardInfo && (
                        <View style={styles.noInfoContainer}>
                            <Text style={styles.noInfoText}>
                                Chưa có thông tin CCCD
                            </Text>
                            <TouchableOpacity
                                style={styles.verifyButton}
                                onPress={() => router.push("/verify")}
                            >
                                <Text style={styles.verifyButtonText}>
                                    Xác minh ngay
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
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
        backgroundColor: Colors().WHITE,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors().PRIMARY,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: Colors().PRIMARY,
        padding: 20,
        paddingTop: 50,
    },
    backButton: {
        color: Colors().WHITE,
        fontSize: 16,
        marginBottom: 10,
    },
    headerTitle: {
        color: Colors().WHITE,
        fontSize: 24,
        fontWeight: "bold",
    },
    profileSection: {
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors().BACKGROUND,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors().PRIMARY,
        marginBottom: 10,
        textAlign: "center",
    },
    statusBadge: {
        backgroundColor: Colors().PRIMARY,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
    },
    statusText: {
        color: Colors().WHITE,
        fontWeight: "bold",
    },
    infoContainer: {
        padding: 20,
    },
    infoSection: {
        backgroundColor: Colors().WHITE,
        borderRadius: 10,
        padding: 15,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: Colors().PRIMARY,
    },
    infoItem: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    label: {
        color: Colors().GRAY,
        marginBottom: 5,
        fontSize: 14,
    },
    value: {
        fontSize: 16,
        color: Colors().BLACK,
        fontWeight: "500",
    },
    noInfoContainer: {
        backgroundColor: Colors().WHITE,
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    noInfoText: {
        fontSize: 16,
        color: Colors().GRAY,
        marginBottom: 15,
    },
    verifyButton: {
        backgroundColor: Colors().PRIMARY,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    verifyButtonText: {
        color: Colors().WHITE,
        fontWeight: "bold",
        fontSize: 16,
    },
});
