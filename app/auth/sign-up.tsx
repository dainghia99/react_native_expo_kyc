import {
    View,
    Text,
    Image,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import api from "@/services/api";

export default function SignUpScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    const handleSignUp = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu nhập lại không khớp");
            return;
        }

        try {
            const response = await api.post("/auth/register", {
                email: formData.email,
                password: formData.password,
            });
            console.log("Register response:", response.data);

            // Hiển thị thông báo thành công và chuyển hướng đến trang đăng nhập
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            router.push("/auth/sign-in");
        } catch (err: any) {
            console.error("Register error:", err.response?.data);
            setError(err.response?.data?.error || "Đăng ký thất bại");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View>
                    <View
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={require("@/assets/images/logo/Logo_DAI_NAM.png")}
                            style={{
                                width: 250,
                                height: 250,
                                marginTop: 50,
                                marginBottom: 50,
                            }}
                        />
                    </View>

                    <TextInput
                        placeholder="Địa chỉ email"
                        value={formData.email}
                        onChangeText={(text) =>
                            setFormData({ ...formData, email: text })
                        }
                        style={[styles.btninput, styles.button]}
                    />
                    <TextInput
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChangeText={(text) =>
                            setFormData({ ...formData, password: text })
                        }
                        secureTextEntry
                        style={[styles.btninput, styles.button]}
                    />
                    <TextInput
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChangeText={(text) =>
                            setFormData({ ...formData, confirmPassword: text })
                        }
                        secureTextEntry
                        style={[styles.btninput, styles.button]}
                    />

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={styles.submitButton}>Đăng ký</Text>
                    </TouchableOpacity>
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 5,
                            marginTop: 20,
                            justifyContent: "center",
                        }}
                    >
                        <Text>Bạn đã có tài khoản?</Text>
                        <Pressable
                            onPress={() => {
                                router.push("/auth/sign-in");
                            }}
                        >
                            <Text
                                style={{
                                    color: "#FF0000",
                                    fontWeight: "bold",
                                }}
                            >
                                Đăng nhập ngay
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    btninput: {
        height: 60,
        margin: 12,
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    button: {
        padding: 10,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: "orange",
        color: "#FFFFFF",
        textAlign: "center",
        padding: 20,
        fontWeight: "bold",
        borderRadius: 10,
        margin: 12,
        fontSize: 20,
    },
});
