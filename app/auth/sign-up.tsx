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
import React from "react";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
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
                marginBottom: 50,
              }}
            />
          </View>

          <TextInput
            placeholder="Địa chỉ email"
            style={[styles.btninput, styles.button]}
          />
          <TextInput
            placeholder="Password"
            style={[styles.btninput, styles.button]}
          />
          <TextInput
            placeholder="Nhập lại password"
            style={[styles.btninput, styles.button]}
          />

          <TouchableOpacity
            onPress={() => {
              // Xu ly dang ky tai khoan
            }}
          >
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
              Đăng ký
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
});
