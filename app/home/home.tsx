import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Colors from "@/constants/Colors";

// Mock data for testing
const mockUser = {
  name: "Nguyen Van A",
  email: "nguyenvana@example.com",
};

const mockKYCAccounts = [
  {
    id: 1,
    name: "Tran Van B",
    email: "tranvanb@example.com",
    status: "Verified",
    date: "2024-02-20",
  },
  {
    id: 2,
    name: "Le Thi C",
    email: "lethic@example.com",
    status: "Verified",
    date: "2024-02-19",
  },
  // Add more mock data as needed
];

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    // Add logout logic here
    router.replace("/auth/sign-in");
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
            <Text style={styles.userName}>{mockUser.name}</Text>
            <Text style={styles.userEmail}>{mockUser.email}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* KYC Accounts List */}
      <View style={styles.content}>
        <Text style={styles.title}>Danh sách tài khoản đã KYC</Text>
        <ScrollView style={styles.accountsList}>
          {mockKYCAccounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountEmail}>{account.email}</Text>
                <Text style={styles.accountDate}>
                  Ngày xác thực: {account.date}
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{account.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
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
  userEmail: {
    color: Colors().WHITE,
    fontSize: 14,
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors().PRIMARY,
  },
  accountsList: {
    flex: 1,
  },
  accountCard: {
    backgroundColor: Colors().WHITE,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors().PRIMARY,
  },
  accountEmail: {
    color: Colors().GRAY,
    marginTop: 5,
  },
  accountDate: {
    color: Colors().GRAY,
    fontSize: 12,
    marginTop: 5,
  },
  statusContainer: {
    backgroundColor: Colors().PRIMARY,
    padding: 8,
    borderRadius: 15,
  },
  statusText: {
    color: Colors().WHITE,
    fontSize: 12,
    fontWeight: "bold",
  },
});
