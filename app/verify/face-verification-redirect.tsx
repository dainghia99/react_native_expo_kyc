import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";

export default function FaceVerificationRedirectScreen() {
    const router = useRouter();

    useEffect(() => {
        // Redirigir a la pantalla de verificación facial después de un breve retraso
        const timer = setTimeout(() => {
            router.replace("/verify/face-verification");
        }, 1500);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors().PRIMARY} />
            <Text style={styles.text}>Đang chuẩn bị xác minh khuôn mặt...</Text>
            <Text style={styles.subText}>
                Vui lòng đảm bảo bạn đang ở nơi có đủ ánh sáng và không đeo kính, mũ hoặc khẩu trang.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
        textAlign: "center",
        color: Colors().PRIMARY,
    },
    subText: {
        fontSize: 14,
        marginTop: 10,
        textAlign: "center",
        color: "#666",
        lineHeight: 20,
    },
});
