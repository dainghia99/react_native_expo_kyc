import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";

export default function LivenessRedirectScreen() {
    const router = useRouter();

    useEffect(() => {
        // Chuyển hướng đến phiên bản chính thức
        router.replace("/verify/liveness-official");
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors().PRIMARY} />
            <Text style={styles.text}>Đang chuyển hướng...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors().WHITE,
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        color: Colors().BLACK,
    },
});
