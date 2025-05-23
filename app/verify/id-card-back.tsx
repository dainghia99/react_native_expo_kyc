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
import * as ImagePicker from "expo-image-picker";

export default function IDCardBackScreen() {
    const router = useRouter();
    const { handleUploadIDCard, isLoading } = useKYC();
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
            // Tăng chất lượng ảnh lên tối đa (1.0) để cải thiện OCR
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1.0, // Tăng chất lượng lên tối đa
                exif: false,
            });
            setCapturedImage(photo.uri);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
            console.error("Camera error:", error);

            // Thử lại với cấu hình đơn giản hơn
            try {
                const simplePhoto = await cameraRef.current.takePictureAsync({
                    quality: 0.9, // Vẫn giữ chất lượng cao
                });
                setCapturedImage(simplePhoto.uri);
            } catch (retryError) {
                console.error("Retry camera error:", retryError);
                Alert.alert(
                    "Lỗi camera",
                    "Không thể chụp ảnh. Vui lòng sử dụng tính năng chọn từ thư viện."
                );
            }
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1.0, // Tăng chất lượng lên tối đa
            });

            if (!result.canceled) {
                setCapturedImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
            console.error(error);
        }
    };

    const checkImageOrientation = async (uri: string): Promise<boolean> => {
        return new Promise((resolve) => {
            Image.getSize(
                uri,
                (width, height) => {
                    // Kiểm tra xem ảnh có ở định dạng dọc không (portrait)
                    const isPortrait = height > width;
                    if (!isPortrait) {
                        Alert.alert(
                            "Định dạng ảnh không đúng",
                            "Vui lòng chụp ảnh CCCD ở định dạng dọc (portrait). Hãy xoay điện thoại để chụp ảnh theo chiều dọc.",
                            [{ text: "OK" }]
                        );
                    }
                    resolve(isPortrait);
                },
                (error) => {
                    console.error("Không thể kiểm tra kích thước ảnh:", error);
                    // Nếu không thể kiểm tra, vẫn cho phép tải lên
                    resolve(true);
                }
            );
        });
    };

    const uploadImage = async () => {
        if (!capturedImage) return;

        try {
            // Kiểm tra định dạng ảnh trước khi tải lên
            const isPortrait = await checkImageOrientation(capturedImage);
            if (!isPortrait) {
                return; // Không tiếp tục nếu ảnh không ở định dạng dọc
            }

            const formData = new FormData();
            formData.append("image", {
                uri: capturedImage,
                name: "id_card_back.jpg",
                type: "image/jpeg",
            } as any);

            const result = await handleUploadIDCard(formData, false);
            if (result) {
                // Lưu URI của ảnh mặt sau vào AsyncStorage
                await AsyncStorage.setItem("id_card_back_uri", capturedImage);

                // Cập nhật thông tin CCCD nếu có thông tin mới
                if (result) {
                    // Lấy thông tin CCCD hiện tại
                    const currentInfoStr = await AsyncStorage.getItem(
                        "id_card_info"
                    );
                    if (currentInfoStr) {
                        const currentInfo = JSON.parse(currentInfoStr);
                        // Kết hợp thông tin mặt trước và mặt sau
                        const updatedInfo = { ...currentInfo, ...result };
                        await AsyncStorage.setItem(
                            "id_card_info",
                            JSON.stringify(updatedInfo)
                        );
                    }
                }

                // Chuyển đến màn hình xác nhận thông tin CCCD
                router.push("/verify/id-card-confirm");
            }
        } catch (error: any) {
            Alert.alert(
                "Lỗi",
                error.message || "Không thể tải lên ảnh. Vui lòng thử lại."
            );
            console.error("Upload error:", error);
        }
    };

    const retakePicture = () => {
        setCapturedImage(null);
    };

    if (!permission?.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>
                    Cần quyền truy cập camera để tiếp tục
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>Cấp quyền</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chụp mặt sau CCCD</Text>
            </View>

            {capturedImage ? (
                <View style={styles.previewContainer}>
                    <Image
                        source={{ uri: capturedImage }}
                        style={styles.previewImage}
                    />
                    <View style={styles.previewControls}>
                        {isLoading ? (
                            <ActivityIndicator
                                size="large"
                                color={Colors().PRIMARY}
                            />
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.previewButton}
                                    onPress={uploadImage}
                                >
                                    <Text style={styles.previewButtonText}>
                                        Sử dụng ảnh này
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.previewButton,
                                        {
                                            backgroundColor:
                                                Colors().LIGHT_GRAY ||
                                                "#BDBDBD",
                                        },
                                    ]}
                                    onPress={retakePicture}
                                >
                                    <Text style={styles.previewButtonText}>
                                        Chụp lại
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            ) : (
                <>
                    <CameraView
                        ratio="4:3"
                        style={styles.camera}
                        facing="back"
                        ref={cameraRef}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.cardFrame}>
                                <View style={styles.cornerTL} />
                                <View style={styles.cornerTR} />
                                <View style={styles.cornerBL} />
                                <View style={styles.cornerBR} />
                            </View>
                            <View style={styles.guide}>
                                <Text style={styles.guideText}>
                                    Đặt mặt sau CCCD vào khung hình
                                </Text>
                                <Text style={styles.guideTextHighlight}>
                                    GIỮ ĐIỆN THOẠI THEO CHIỀU DỌC (PORTRAIT)
                                </Text>
                                <Text style={styles.guideText}>
                                    Đảm bảo ảnh rõ nét và đủ ánh sáng
                                </Text>
                                <Text style={styles.guideText}>
                                    Giữ điện thoại ổn định để tránh ảnh bị mờ
                                </Text>
                                <Text style={styles.guideText}>
                                    Tránh chụp trong điều kiện ánh sáng yếu hoặc
                                    lóa
                                </Text>
                                <Text style={styles.guideTextHighlight}>
                                    Đảm bảo thông tin ngày cấp và ngày hết hạn
                                    rõ ràng
                                </Text>
                            </View>
                        </View>
                    </CameraView>

                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={takePicture}
                        >
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.galleryButton}
                            onPress={pickImage}
                        >
                            <Text style={styles.galleryButtonText}>
                                Chọn từ thư viện
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    cardFrame: {
        width: "80%",
        height: "50%",
        borderWidth: 2,
        borderColor: "transparent",
        position: "relative",
    },
    cornerTL: {
        position: "absolute",
        top: -2,
        left: -2,
        width: 30,
        height: 30,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: Colors().WHITE,
        borderTopLeftRadius: 10,
    },
    cornerTR: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 30,
        height: 30,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: Colors().WHITE,
        borderTopRightRadius: 10,
    },
    cornerBL: {
        position: "absolute",
        bottom: -2,
        left: -2,
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: Colors().WHITE,
        borderBottomLeftRadius: 10,
    },
    cornerBR: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: Colors().WHITE,
        borderBottomRightRadius: 10,
    },
    guide: {
        padding: 15,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 10,
        marginTop: 20,
        width: "80%",
    },
    guideText: {
        color: Colors().WHITE,
        textAlign: "center",
        fontSize: 14,
        marginBottom: 5,
    },
    guideTextHighlight: {
        color: "#FFD700", // Màu vàng để nhấn mạnh
        textAlign: "center",
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
        marginTop: 5,
    },
    controls: {
        padding: 20,
        backgroundColor: Colors().WHITE,
        alignItems: "center",
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors().WHITE,
        borderWidth: 5,
        borderColor: Colors().PRIMARY,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    captureButtonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors().PRIMARY,
    },
    galleryButton: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors().PRIMARY,
    },
    galleryButtonText: {
        color: Colors().PRIMARY,
        fontSize: 14,
        fontWeight: "bold",
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
        resizeMode: "contain",
        borderRadius: 10,
    },
    previewControls: {
        width: "100%",
        marginTop: 20,
    },
    previewButton: {
        backgroundColor: Colors().PRIMARY,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    previewButtonText: {
        color: Colors().WHITE,
        fontSize: 16,
        fontWeight: "bold",
    },
    permissionText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        padding: 20,
    },
    permissionButton: {
        backgroundColor: Colors().PRIMARY,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 20,
    },
    permissionButtonText: {
        color: Colors().WHITE,
        fontSize: 16,
        fontWeight: "bold",
    },
});
