import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

const mockUserProfile = {
  name: "Nguyen Van A",
  email: "nguyenvana@example.com",
  phone: "0123456789",
  address: "123 Đường ABC, Quận XYZ, TP.HCM",
  dateJoined: "20/02/2024",
  status: "Đã xác thực",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, checkKYCStatus } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/sign-in");
    } catch (error) {
      Alert.alert("Lỗi", "Đăng xuất thất bại");
    }
  };

  const handleKYCVerification = () => {
    router.push("/verify");
  };

  const getKYCStatusText = () => {
    switch (user?.kyc_status) {
      case "verified":
        return "Đã xác thực";
      case "pending":
        return "Đang chờ xác thực";
      default:
        return "Chưa xác thực";
    }
  };

  const getKYCStatusColor = () => {
    switch (user?.kyc_status) {
      case "verified":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      default:
        return "#F44336";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={require("@/assets/images/logo/Logo_DAI_NAM.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>{mockUserProfile.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getKYCStatusText()}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Số điện thoại</Text>
          <Text style={styles.value}>{mockUserProfile.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Địa chỉ</Text>
          <Text style={styles.value}>{mockUserProfile.address}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Ngày tham gia</Text>
          <Text style={styles.value}>{mockUserProfile.dateJoined}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Trạng thái KYC</Text>
          <View style={styles.kycStatusContainer}>
            <View
              style={[
                styles.kycStatusDot,
                { backgroundColor: getKYCStatusColor() },
              ]}
            />
            <Text style={styles.kycStatusText}>{getKYCStatusText()}</Text>
          </View>
        </View>

        {user?.kyc_status !== "verified" && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleKYCVerification}
          >
            <Text style={styles.verifyButtonText}>Xác thực KYC</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
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
  },
  backButton: {
    color: Colors().WHITE,
    fontSize: 16,
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors().WHITE,
    fontSize: 24,
    fontWeight: "bold",
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors().BACKGROUND,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors().PRIMARY,
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: Colors().PRIMARY,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: Colors().WHITE,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 20,
  },
  infoItem: {
    marginBottom: 20,
  },
  label: {
    color: Colors().GRAY,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#000",
  },
  kycStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  kycStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  kycStatusText: {
    fontSize: 18,
    fontWeight: "500",
  },
  verifyButton: {
    backgroundColor: Colors().PRIMARY,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
