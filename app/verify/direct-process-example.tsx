import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useKYC } from "@/hooks/useKYC";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DirectProcessExample() {
    const router = useRouter();
    const { handleProcessIDCardDirect, isLoading } = useKYC();
    const [frontImagePath, setFrontImagePath] = useState<string | null>(null);
    const [backImagePath, setBackImagePath] = useState<string | null>(null);
    const [frontInfo, setFrontInfo] = useState<any>(null);
    const [backInfo, setBackInfo] = useState<any>(null);

    useEffect(() => {
        // Tải đường dẫn ảnh từ AsyncStorage khi component được mount
        loadImagePaths();
    }, []);

    const loadImagePaths = async () => {
        try {
            const frontPath = await AsyncStorage.getItem("id_card_front_path");
            const backPath = await AsyncStorage.getItem("id_card_back_path");
            
            setFrontImagePath(frontPath);
            setBackImagePath(backPath);
        } catch (error) {
            console.error("Error loading image paths:", error);
        }
    };

    const processFrontImage = async () => {
        if (!frontImagePath) {
            Alert.alert("Lỗi", "Chưa có ảnh mặt trước CCCD. Vui lòng chụp ảnh trước.");
            return;
        }

        try {
            const info = await handleProcessIDCardDirect(frontImagePath, true);
            if (info) {
                setFrontInfo(info);
            }
        } catch (error) {
            console.error("Error processing front image:", error);
        }
    };

    const processBackImage = async () => {
        if (!backImagePath) {
            Alert.alert("Lỗi", "Chưa có ảnh mặt sau CCCD. Vui lòng chụp ảnh trước.");
            return;
        }

        try {
            const info = await handleProcessIDCardDirect(backImagePath, false);
            if (info) {
                setBackInfo(info);
            }
        } catch (error) {
            console.error("Error processing back image:", error);
        }
    };

    const renderInfoItem = (label: string, value: any) => {
        if (!value) return null;
        
        // Xử lý hiển thị ngày tháng
        let displayValue = value;
        if (value instanceof Date) {
            displayValue = value.toLocaleDateString('vi-VN');
        } else if (typeof value === 'string' && value.includes('T')) {
            // Có thể là chuỗi ISO date
            try {
                displayValue = new Date(value).toLocaleDateString('vi-VN');
            } catch (e) {
                // Nếu không phải date thì giữ nguyên
            }
        }
        
        return (
            <View style={styles.infoItem} key={label}>
                <Text style={styles.infoLabel}>{label}:</Text>
                <Text style={styles.infoValue}>{displayValue}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xử lý ảnh trực tiếp</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ảnh mặt trước CCCD</Text>
                    <Text style={styles.imagePath}>{frontImagePath || "Chưa có ảnh"}</Text>
                    
                    <TouchableOpacity 
                        style={[styles.button, !frontImagePath && styles.disabledButton]} 
                        onPress={processFrontImage}
                        disabled={!frontImagePath || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors().WHITE} />
                        ) : (
                            <Text style={styles.buttonText}>Xử lý ảnh mặt trước</Text>
                        )}
                    </TouchableOpacity>

                    {frontInfo && (
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>Thông tin trích xuất:</Text>
                            {renderInfoItem("Số CCCD", frontInfo.id_number)}
                            {renderInfoItem("Họ và tên", frontInfo.full_name)}
                            {renderInfoItem("Ngày sinh", frontInfo.date_of_birth)}
                            {renderInfoItem("Giới tính", frontInfo.gender)}
                            {renderInfoItem("Quốc tịch", frontInfo.nationality)}
                            {renderInfoItem("Quê quán", frontInfo.hometown)}
                            {renderInfoItem("Nơi thường trú", frontInfo.residence)}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ảnh mặt sau CCCD</Text>
                    <Text style={styles.imagePath}>{backImagePath || "Chưa có ảnh"}</Text>
                    
                    <TouchableOpacity 
                        style={[styles.button, !backImagePath && styles.disabledButton]} 
                        onPress={processBackImage}
                        disabled={!backImagePath || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors().WHITE} />
                        ) : (
                            <Text style={styles.buttonText}>Xử lý ảnh mặt sau</Text>
                        )}
                    </TouchableOpacity>

                    {backInfo && (
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>Thông tin trích xuất:</Text>
                            {renderInfoItem("Đặc điểm nhận dạng", backInfo.identifying_features)}
                            {renderInfoItem("Ngày cấp", backInfo.issue_date)}
                            {renderInfoItem("Ngày hết hạn", backInfo.expiry_date)}
                        </View>
                    )}
                </View>

                <TouchableOpacity 
                    style={styles.captureButton} 
                    onPress={() => router.push("/verify/id-card-front")}
                >
                    <Text style={styles.buttonText}>Chụp ảnh CCCD mới</Text>
                </TouchableOpacity>
            </ScrollView>
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
    section: {
        marginBottom: 30,
        padding: 15,
        backgroundColor: Colors().LIGHT_GRAY,
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: Colors().PRIMARY,
    },
    imagePath: {
        fontSize: 12,
        color: Colors().GRAY,
        marginBottom: 15,
        fontStyle: "italic",
    },
    button: {
        backgroundColor: Colors().PRIMARY,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 15,
    },
    disabledButton: {
        backgroundColor: Colors().GRAY,
    },
    buttonText: {
        color: Colors().WHITE,
        fontSize: 16,
        fontWeight: "bold",
    },
    infoContainer: {
        backgroundColor: Colors().WHITE,
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: Colors().PRIMARY,
    },
    infoItem: {
        flexDirection: "row",
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors().LIGHT_GRAY,
        paddingBottom: 8,
    },
    infoLabel: {
        fontWeight: "bold",
        width: 120,
    },
    infoValue: {
        flex: 1,
    },
    captureButton: {
        backgroundColor: Colors().SECONDARY,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 30,
    },
});
