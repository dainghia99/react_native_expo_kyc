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
    TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Hàm định dạng ngày tháng từ chuỗi ngày tháng sang định dạng DD/MM/YYYY
const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
        // Xử lý nhiều định dạng ngày tháng khác nhau
        let date;

        // Kiểm tra nếu là định dạng GMT
        if (dateString.includes("GMT")) {
            date = new Date(dateString);
        }
        // Kiểm tra nếu là định dạng DD/MM/YYYY
        else if (dateString.includes("/")) {
            const parts = dateString.split("/");
            // Nếu đã đúng định dạng DD/MM/YYYY thì trả về luôn
            if (parts.length === 3) {
                // Kiểm tra xem đã đúng định dạng chưa
                if (
                    parts[0].length === 2 &&
                    parts[1].length === 2 &&
                    parts[2].length === 4
                ) {
                    return dateString;
                }
                date = new Date(parts[2], parts[1] - 1, parts[0]);
            }
        }
        // Các định dạng khác
        else {
            date = new Date(dateString);
        }

        // Kiểm tra nếu date không hợp lệ
        if (isNaN(date.getTime())) {
            return dateString; // Trả về chuỗi gốc nếu không thể parse
        }

        // Định dạng thành DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString; // Trả về chuỗi gốc nếu có lỗi
    }
};

export default function IDCardConfirmScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [idCardInfo, setIdCardInfo] = useState<any>(null);
    const [editableIdCardInfo, setEditableIdCardInfo] = useState<any>(null);
    const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
    const [backImageUri, setBackImageUri] = useState<string | null>(null);

    useEffect(() => {
        checkActiveVerification();
    }, []);

    // Kiểm tra xem người dùng có đang trong quá trình xác minh hay không
    const checkActiveVerification = async () => {
        try {
            const isActiveVerification = await AsyncStorage.getItem(
                "active_verification"
            );

            if (isActiveVerification === "true") {
                // Nếu đang trong quá trình xác minh, tải thông tin CCCD
                loadIdCardInfo();
            } else {
                // Nếu không, quay lại màn hình xác minh chính
                Alert.alert(
                    "Thông báo",
                    "Vui lòng bắt đầu quá trình xác minh từ màn hình chính.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.replace("/verify"),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error("Error checking active verification:", error);
            router.replace("/verify");
        }
    };

    const loadIdCardInfo = async () => {
        setLoading(true);
        try {
            // Lấy thông tin CCCD từ AsyncStorage
            const idInfoStr = await AsyncStorage.getItem("id_card_info");
            const frontUri = await AsyncStorage.getItem("id_card_front_uri");
            const backUri = await AsyncStorage.getItem("id_card_back_uri");

            if (idInfoStr) {
                const idInfo = JSON.parse(idInfoStr);

                // Định dạng lại các trường ngày tháng
                if (idInfo.date_of_birth) {
                    idInfo.date_of_birth = formatDate(idInfo.date_of_birth);
                }
                if (idInfo.expiry_date) {
                    idInfo.expiry_date = formatDate(idInfo.expiry_date);
                }
                if (idInfo.issue_date) {
                    idInfo.issue_date = formatDate(idInfo.issue_date);
                }

                setIdCardInfo(idInfo);
                // Khởi tạo thông tin có thể chỉnh sửa với dữ liệu ban đầu
                setEditableIdCardInfo({ ...idInfo });
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

    // Hàm xử lý khi người dùng thay đổi thông tin trong input
    const handleInputChange = (field: string, value: string) => {
        setEditableIdCardInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleConfirm = async () => {
        try {
            // Lưu thông tin đã chỉnh sửa vào AsyncStorage
            await AsyncStorage.setItem(
                "id_card_info",
                JSON.stringify(editableIdCardInfo)
            );

            // Đặt cờ xác nhận ID card
            await AsyncStorage.setItem("id_card_verified", "true");

            // Hiển thị thông báo xác nhận
            Alert.alert(
                "Thành công",
                "Đã xác nhận thông tin CCCD thành công. Bạn có thể tiếp tục xác minh khuôn mặt.",
                [
                    {
                        text: "Tiếp tục",
                        onPress: () =>
                            router.push("/verify/face-verification-redirect"),
                    },
                ]
            );
        } catch (error) {
            console.error("Error saving edited ID card info:", error);
            Alert.alert(
                "Lỗi",
                "Không thể lưu thông tin CCCD đã chỉnh sửa. Vui lòng thử lại."
            );
        }
    };

    // Hàm xử lý khi người dùng muốn hủy quá trình xác minh
    const handleCancel = async () => {
        try {
            // Xóa cờ xác minh đang hoạt động
            await AsyncStorage.removeItem("active_verification");
            // Xóa cờ xác nhận ID card
            await AsyncStorage.removeItem("id_card_verified");
            // Quay lại màn hình xác minh chính
            router.replace("/verify");
        } catch (error) {
            console.error("Error canceling verification:", error);
            router.replace("/verify");
        }
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
                <TouchableOpacity onPress={handleCancel}>
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

                    <View style={styles.notificationContainer}>
                        <Text style={styles.notificationText}>
                            Bạn hãy kiểm tra lại thông tin xem có khớp với thông
                            tin trong căn cước của bạn không? Nếu không vui lòng
                            sửa lại. Bạn hãy đảm bảo trung thực thông tin cá
                            nhân của bạn đúng với thông tin trong căn cước của
                            bạn, vì thông tin này không được sửa lại. Nếu bạn
                            khai sai sự thật hoặc có hành vi gian dối thì bạn sẽ
                            phải tự chịu trách nhiệm trước pháp luật.
                        </Text>
                    </View>

                    {editableIdCardInfo && (
                        <View style={styles.infoContent}>
                            <EditableInfoRow
                                label="Số CCCD"
                                value={editableIdCardInfo.id_number || ""}
                                onChangeText={(text) =>
                                    handleInputChange("id_number", text)
                                }
                            />
                            <EditableInfoRow
                                label="Họ và tên"
                                value={editableIdCardInfo.full_name || ""}
                                onChangeText={(text) =>
                                    handleInputChange("full_name", text)
                                }
                            />
                            <EditableInfoRow
                                label="Ngày sinh"
                                value={editableIdCardInfo.date_of_birth || ""}
                                onChangeText={(text) =>
                                    handleInputChange("date_of_birth", text)
                                }
                            />
                            <EditableInfoRow
                                label="Giới tính"
                                value={editableIdCardInfo.gender || ""}
                                onChangeText={(text) =>
                                    handleInputChange("gender", text)
                                }
                            />
                            <EditableInfoRow
                                label="Quốc tịch"
                                value={editableIdCardInfo.nationality || ""}
                                onChangeText={(text) =>
                                    handleInputChange("nationality", text)
                                }
                            />
                            <EditableInfoRow
                                label="Ngày cấp"
                                value={editableIdCardInfo.issue_date || ""}
                                onChangeText={(text) =>
                                    handleInputChange("issue_date", text)
                                }
                            />
                            <EditableInfoRow
                                label="Ngày hết hạn"
                                value={editableIdCardInfo.expiry_date || ""}
                                onChangeText={(text) =>
                                    handleInputChange("expiry_date", text)
                                }
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
                        <Text style={styles.editButtonText}>Chụp lại CCCD</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// Component hiển thị một dòng thông tin có thể chỉnh sửa
const EditableInfoRow = ({
    label,
    value,
    onChangeText,
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
}) => {
    // Xác định placeholder dựa trên loại trường
    let placeholder = `Nhập ${label.toLowerCase()}`;

    // Nếu là trường ngày tháng, hiển thị gợi ý định dạng
    if (label.includes("Ngày")) {
        placeholder = "DD/MM/YYYY";
    }

    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}:</Text>
            <TextInput
                style={styles.infoInput}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
            />
        </View>
    );
};

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
    infoInput: {
        flex: 2,
        fontSize: 14,
        color: Colors().BLACK,
        padding: 5,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 5,
        backgroundColor: "#f9f9f9",
    },
    notificationContainer: {
        backgroundColor: "#FFF9C4",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: "#FBC02D",
    },
    notificationText: {
        fontSize: 13,
        lineHeight: 20,
        color: "#5D4037",
    },
});
