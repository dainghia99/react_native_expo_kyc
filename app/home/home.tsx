import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import Colors from "@/constants/Colors";

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/sign-in");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  const handleVerifyKYC = () => {
    router.push("/verify");
  };

  return (
    <View style={styles.container}>
      {/* Header with user info and logout */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push("/profile")}
        >
          <Image
            source={require("@/assets/images/logo/Logo_DAI_NAM.png")}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{user?.email}</Text>
            <Text style={styles.userStatus}>
              Trạng thái:{" "}
              {user?.kyc_status === "verified"
                ? "Đã xác minh"
                : "Chưa xác minh"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {user?.kyc_status !== "verified" ? (
          <View style={styles.verificationSection}>
            <Text style={styles.verificationTitle}>
              Xác minh tài khoản của bạn
            </Text>
            <Text style={styles.verificationDescription}>
              Để sử dụng đầy đủ tính năng, vui lòng xác minh danh tính của bạn
              thông qua quá trình KYC
            </Text>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyKYC}
            >
              <Text style={styles.verifyButtonText}>Xác minh ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.verifiedSection}>
            <Text style={styles.verificationTitle}>
              Tài khoản đã được xác minh
            </Text>
            <Text style={styles.verificationDescription}>
              Cảm ơn bạn đã xác minh danh tính. Bạn có thể sử dụng đầy đủ tính
              năng của ứng dụng.
            </Text>
          </View>
        )}

        {/* Có thể thêm các section khác ở đây */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors().WHITE,
  },
  header: {
    backgroundColor: Colors().PRIMARY,
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    color: Colors().WHITE,
    fontSize: 18,
    fontWeight: "bold",
  },
  userStatus: {
    color: Colors().WHITE,
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: Colors().WHITE,
    padding: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: Colors().PRIMARY,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  verificationSection: {
    backgroundColor: Colors().WHITE,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verifiedSection: {
    backgroundColor: Colors().WHITE,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors().PRIMARY,
    marginBottom: 10,
  },
  verificationDescription: {
    fontSize: 16,
    color: Colors().GRAY,
    marginBottom: 20,
    lineHeight: 24,
  },
  verifyButton: {
    backgroundColor: Colors().PRIMARY,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyButtonText: {
    color: Colors().WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
});
