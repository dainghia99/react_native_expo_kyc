import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { useAuth } from "../context/AuthContext";

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.replace("/home/home");
    } catch (err: any) {
      setError(err.response?.data?.error || "Đăng nhập thất bại");
      Alert.alert("Lỗi", err.response?.data?.error || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            placeholder="Địa chỉ email"
            value={email}
            onChangeText={setEmail}
            style={[styles.btninput, styles.button]}
            keyboardType="email-address"
            autoCapitalize="none"
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
            <Text style={{ color: Colors().PRIMARY }}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginButton, loading && styles.disabledButton]}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
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
            <Text>Bạn chưa có tài khoản?</Text>
            <Pressable
              onPress={() => {
                router.push("/auth/sign-up");
              }}
            >
              <Text
                style={{
                  color: "#FF0000",
                  fontWeight: "bold",
                }}
              >
                Đăng ký ngay
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
  loginButton: {
    backgroundColor: Colors().PRIMARY,
    padding: 20,
    borderRadius: 10,
    margin: 12,
  },
  loginButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
