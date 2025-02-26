import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function SignInScreen() {
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
      <TouchableOpacity
        onPress={() => {
          // Xu ly dang nhap
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
          Đăng nhập
        </Text>
      </TouchableOpacity>
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
