import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";

export default function SignInScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", { email, password });
            console.log("Login response:", response.data);
            // Backend trả về cấu trúc { token, user, message }
            if (response.data.token) {
                await login(response.data.token, response.data.user);
            } else {
                throw new Error("Token không hợp lệ");
            }
            router.replace("/home/home");
        } catch (err: any) {
            console.error("Login error:", err.response?.data);
            Alert.alert(
                "Lỗi đăng nhập",
                err.response?.data?.error || "Đã có lỗi xảy ra"
            );
        } finally {
            setIsLoading(false);
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
                                width: 300,
                                height: 300,
                                marginTop: 50,
                                marginBottom: 50,
                                objectFit: "cover",
                            }}
                        />
                    </View>

                    <TextInput
                        placeholder="Địa chỉ email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={[styles.btninput, styles.button]}
                    />
                    <TextInput
                        placeholder="Mật khẩu"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={[styles.btninput, styles.button]}
                    />

                    <TouchableOpacity
                        onPress={() => router.push("/auth/forgot-password")}
                        style={{ alignItems: "flex-end", marginRight: 12 }}
                    >
                        <Text style={{ color: Colors().PRIMARY }}>
                            Quên mật khẩu?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={isLoading}
                        style={[
                            styles.loginButton,
                            isLoading && styles.loginButtonDisabled,
                        ]}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                        <Text>Bạn chưa có tài khoản?</Text>
                        <Pressable onPress={() => router.push("/auth/sign-up")}>
                            <Text style={styles.signupText}>Đăng ký ngay</Text>
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
    loginButton: {
        backgroundColor: Colors().PRIMARY,
        padding: 20,
        borderRadius: 10,
        margin: 12,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: Colors().WHITE,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 20,
    },
    signupContainer: {
        flexDirection: "row",
        gap: 5,
        marginTop: 20,
        justifyContent: "center",
    },
    signupText: {
        color: Colors().PRIMARY,
        fontWeight: "bold",
    },
});
