import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const router = useRouter();

  return (
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
            backgroundColor: "#FF0000",
            color: "#FFFFFF",
            textAlign: "center",
            padding: 10,
            borderRadius: 10,
            margin: 12,
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
  );
}

const styles = StyleSheet.create({
  btninput: {
    height: 60,
    margin: 12,
    borderWidth: 1,
    borderRadius: 10,
  },

  button: {
    alignItems: "center",
    padding: 10,
  },
});
