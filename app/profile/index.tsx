import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";

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
          <Text style={styles.statusText}>{mockUserProfile.status}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{mockUserProfile.email}</Text>
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
});
