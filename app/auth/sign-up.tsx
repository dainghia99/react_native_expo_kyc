import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import api from "@/services/api";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", { email, password });
      Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/auth/sign-in");
    } catch (err: any) {
      setError(err.response?.data?.error || "Đăng ký thất bại");
      Alert.alert("Lỗi", err.response?.data?.error || "Đăng ký thất bại");
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
        <View style={styles.container}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            placeholder="Địa chỉ email"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, styles.button]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, styles.button]}
          />
          <TextInput
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={[styles.input, styles.button]}
          />

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            style={[styles.signUpButton, loading && styles.disabledButton]}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text>Đã có tài khoản?</Text>
            <Pressable
              onPress={() => {
                router.push("/auth/sign-in");
              }}
            >
              <Text style={styles.loginText}>Đăng nhập ngay</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 60,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  button: {
    padding: 10,
  },
  signUpButton: {
    backgroundColor: Colors().PRIMARY,
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  signUpButtonText: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 5,
  },
  loginText: {
    color: Colors().PRIMARY,
    fontWeight: "bold",
  },
});
