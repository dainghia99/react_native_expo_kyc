import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useKYC } from "@/hooks/useKYC";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

export default function KYCMainScreen() {
  const router = useRouter();
  const { checkKYCStatus, isLoading: isKYCLoading } = useKYC();
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    setLoading(true);
    try {
      const status = await checkKYCStatus();
      console.log("KYC Status:", status);
      setKycStatus(status);
    } catch (error) {
      console.error("Error loading KYC status:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin KYC. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleLivenessVerification = () => {
    router.push("/verify/liveness");
  };

  const handleIDCardVerification = () => {
    router.push("/verify/id-card-front");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors().PRIMARY} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  const isLivenessVerified = kycStatus?.liveness_verified;
  const isIDCardVerified = kycStatus?.id_card_verified;
  const isFullyVerified = user?.kyc_status === "verified";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác minh danh tính</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Trạng thái xác minh</Text>
          <Text style={styles.statusText}>
            {isFullyVerified
              ? "Đã xác minh đầy đủ"
              : "Chưa hoàn thành xác minh"}
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <View
            style={[
              styles.stepCard,
              isLivenessVerified && styles.completedStepCard,
            ]}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepTitle}>Xác minh khuôn mặt</Text>
              {isLivenessVerified && (
                <Text style={styles.completedBadge}>Đã hoàn thành</Text>
              )}
            </View>
            <Text style={styles.stepDescription}>
              Quay video khuôn mặt để xác minh bạn là người thật
            </Text>
            <TouchableOpacity
              style={[
                styles.stepButton,
                isLivenessVerified && styles.disabledButton,
              ]}
              onPress={handleLivenessVerification}
              disabled={isLivenessVerified || isKYCLoading}
            >
              <Text style={styles.stepButtonText}>
                {isLivenessVerified ? "Đã xác minh" : "Xác minh ngay"}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.stepCard,
              isIDCardVerified && styles.completedStepCard,
            ]}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepTitle}>Xác minh CCCD</Text>
              {isIDCardVerified && (
                <Text style={styles.completedBadge}>Đã hoàn thành</Text>
              )}
            </View>
            <Text style={styles.stepDescription}>
              Chụp ảnh mặt trước và mặt sau CCCD của bạn
            </Text>
            <TouchableOpacity
              style={[
                styles.stepButton,
                isIDCardVerified && styles.disabledButton,
              ]}
              onPress={handleIDCardVerification}
              disabled={isIDCardVerified || isKYCLoading}
            >
              <Text style={styles.stepButtonText}>
                {isIDCardVerified ? "Đã xác minh" : "Xác minh ngay"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isFullyVerified && (
          <View style={styles.successMessage}>
            <Text style={styles.successTitle}>
              Chúc mừng! Bạn đã hoàn thành xác minh danh tính
            </Text>
            <Text style={styles.successDescription}>
              Bạn có thể sử dụng đầy đủ tính năng của ứng dụng
            </Text>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.push("/home/home")}
            >
              <Text style={styles.homeButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors().WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors().PRIMARY,
  },
  header: {
    backgroundColor: Colors().PRIMARY,
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    color: Colors().WHITE,
    fontSize: 16,
    marginRight: 10,
  },
  headerTitle: {
    color: Colors().WHITE,
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: Colors().WHITE,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    color: Colors().GRAY || "#757575",
    marginBottom: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors().PRIMARY,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: Colors().WHITE,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completedStepCard: {
    borderLeftWidth: 5,
    borderLeftColor: Colors().SUCCESS || "#4CAF50",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepNumber: {
    backgroundColor: Colors().PRIMARY,
    color: Colors().WHITE,
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    marginRight: 10,
    fontWeight: "bold",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  completedBadge: {
    backgroundColor: Colors().SUCCESS || "#4CAF50",
    color: Colors().WHITE,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors().GRAY || "#757575",
    marginBottom: 15,
    lineHeight: 20,
  },
  stepButton: {
    backgroundColor: Colors().PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: Colors().LIGHT_GRAY || "#BDBDBD",
  },
  stepButtonText: {
    color: Colors().WHITE,
    fontWeight: "bold",
  },
  successMessage: {
    backgroundColor: Colors().SUCCESS_LIGHT || "#E8F5E9",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors().SUCCESS || "#4CAF50",
    textAlign: "center",
    marginBottom: 10,
  },
  successDescription: {
    fontSize: 14,
    color: Colors().GRAY || "#757575",
    textAlign: "center",
    marginBottom: 15,
  },
  homeButton: {
    backgroundColor: Colors().SUCCESS || "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  homeButtonText: {
    color: Colors().WHITE,
    fontWeight: "bold",
  },
});
