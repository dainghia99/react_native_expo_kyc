import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";
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
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { email, password });
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      router.replace("/home/home");
    } catch (err: any) {
      setError(err.response?.data?.error || "Đăng nhập thất bại");
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
            style={[styles.btninput, styles.button]}
          />
          <TextInput
            placeholder="Password"
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

          <TouchableOpacity onPress={handleLogin}>
            <Text
              style={{
                backgroundColor: "orange",
                color: "#FFFFFF",
                textAlign: "center",
                padding: 20,
                fontWeight: "bold",
                borderRadius: 10,
                margin: 12,
                fontSize: 20,
              }}
            >
              Đăng nhập
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
});
