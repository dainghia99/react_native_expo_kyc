import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors().PRIMARY,
      }}
    >
      <Image
        source={require("@/assets/images/logo/dai-nam-11.jpg")}
        style={{
          width: "100%",
          height: 300,
        }}
      />

      <View
        style={{
          padding: 25,
          backgroundColor: Colors().WHITE,
          borderTopRightRadius: 35,
          borderTopLeftRadius: 35,
          height: "100%",
        }}
      >
        <Text
          style={{
            fontSize: 40,
            fontWeight: "bold",
            color: Colors().PRIMARY,
            textAlign: "center",
          }}
        >
          Chào Mừng Đến Với Xác Thực KYC
        </Text>

        <Text
          style={{
            fontSize: 25,
            color: Colors().PRIMARY,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Vui lòng đăng nhập để tiến hành KYC!
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/auth/sign-in")}
          style={[styles.button, { marginTop: 50 }]}
        >
          <Text style={styles.buttonText}>Bắt Đầu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/auth/sign-up")}
          style={[
            styles.button,
            {
              backgroundColor: Colors().WHITE,
              borderWidth: 1,
              borderColor: Colors().PRIMARY,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: Colors().PRIMARY }]}>
            Bạn Chưa Có Tài Khoản?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors().PRIMARY,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },

  buttonText: {
    color: Colors().WHITE,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
});
