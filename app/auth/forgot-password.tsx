import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";

export default function ForgotPasswordScreen() {
    const router = useRouter();

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
                                marginBottom: 30,
                                objectFit: "cover",
                            }}
                        />
                        <Text style={styles.title}>Quên mật khẩu</Text>
                        <Text style={styles.subtitle}>
                            Vui lòng nhập email để lấy lại mật khẩu
                        </Text>
                    </View>

                    <TextInput
                        placeholder="Địa chỉ email"
                        style={[styles.btninput, styles.button]}
                    />

                    <TouchableOpacity
                        onPress={() => {
                            // Xử lý gửi email reset password
                        }}
                    >
                        <Text style={styles.submitButton}>Gửi yêu cầu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>
                            Quay lại đăng nhập
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: Colors().PRIMARY,
    },
    subtitle: {
        fontSize: 16,
        color: Colors().GRAY,
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 20,
    },
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
    submitButton: {
        backgroundColor: Colors().PRIMARY,
        color: Colors().WHITE,
        textAlign: "center",
        padding: 20,
        fontWeight: "bold",
        borderRadius: 10,
        margin: 12,
        fontSize: 20,
    },
    backButton: {
        marginTop: 20,
        alignItems: "center",
    },
    backButtonText: {
        color: Colors().PRIMARY,
        fontSize: 16,
    },
});
