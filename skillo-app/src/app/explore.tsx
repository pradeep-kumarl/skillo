import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { API_URL } from "@/constants/api";
import { INITIAL_USER, UserProfile } from "@/constants/user";
import { AadhaarAuthModal } from "@/components/aadhaar-auth-modal";

export default function HelperAndVerificationScreen() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  // Helper Profile State
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [selectedRoleSkill, setSelectedRoleSkill] = useState<string>("Mechanic (Roadside Assistance)");
  const [helperRating, setHelperRating] = useState<number>(4.9);
  const [completedJobs, setCompletedJobs] = useState<number>(24);

  // Pending Requests State (Helper Radar)
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchPendingRequests = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/requests/pending`);
      const data = await res.json();
      setPendingRequests(data.requests || []);
    } catch (e) {
      console.log("Fetch pending error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛠️ Helper & Verification Center</Text>
          <Text style={styles.headerSubtitle}>
            Roaming responder status, Aadhaar KYC, and subscription
          </Text>
        </View>

        {/* Roaming Helper Profile Card */}
        {/* Roaming Helper Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.helperName}>{currentUser.name}</Text>
              <Text style={styles.helperSkill}>{selectedRoleSkill}</Text>
              <Text style={styles.aadhaarSubtext}>
                Aadhaar: XXXXXXXX{currentUser.aadhaarNumber.slice(-4)}
              </Text>
            </View>
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>Duty Mode</Text>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: "#30363d", true: "#238636" }}
                thumbColor="#f0f6fc"
              />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>⭐ {helperRating}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{completedJobs}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>6 KM</Text>
              <Text style={styles.statLabel}>Max Radar</Text>
            </View>
          </View>

          {/* Subscription Model Badge */}
          <View style={styles.subBanner}>
            <View>
              <Text style={styles.subTitle}>🏆 Pro Helper Subscription</Text>
              <Text style={styles.subPrice}>Active: ₹49/month minimal platform fee</Text>
            </View>
            <View style={styles.subActiveBadge}>
              <Text style={styles.subActiveText}>ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* Aadhaar e-KYC Verification Section */}
        <View style={styles.card}>
          <View style={styles.aadhaarHeader}>
            <Text style={styles.aadhaarTitle}>🆔 Responder Aadhaar e-KYC</Text>
            {currentUser.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>🛡️ UIDAI Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.aadhaarDesc}>
            {currentUser.isVerified
              ? `Your identity (${currentUser.name}) is UIDAI-verified. Distress calls from citizens will be dispatched to you on the road.`
              : "Verify your identity with Government UIDAI sandbox OTP to receive emergency dispatch notifications."}
          </Text>

          <TouchableOpacity
            style={styles.aadhaarBtn}
            onPress={() => setAuthModalVisible(true)}
          >
            <Text style={styles.aadhaarBtnText}>
              {currentUser.isVerified
                ? "🛡️ Re-Verify or Switch Account"
                : "Verify Aadhaar e-KYC Login"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Incoming Radar Requests */}
        <View style={styles.radarSection}>
          <View style={styles.radarHeaderRow}>
            <Text style={styles.sectionTitle}>📡 Incoming Skill Alerts (Nearby):</Text>
            <TouchableOpacity onPress={fetchPendingRequests}>
              <Text style={styles.refreshText}>{refreshing ? "..." : "🔄 Refresh"}</Text>
            </TouchableOpacity>
          </View>

          {pendingRequests.length === 0 ? (
            <View style={styles.noRequestsCard}>
              <Text style={styles.noRequestsText}>
                {isAvailable
                  ? "Radar listening for distress calls within 2–6 km..."
                  : "You are currently OFFLINE. Toggle duty mode above to receive alerts."}
              </Text>
            </View>
          ) : (
            pendingRequests.map((req) => (
              <View key={req.requestId} style={styles.incomingReqCard}>
                <View style={styles.reqTop}>
                  <Text style={styles.reqSkill}>🚨 {req.skillNeeded}</Text>
                  <Text style={styles.reqUrgency}>{req.urgency}</Text>
                </View>
                <Text style={styles.reqSeeker}>{req.seekerName} needs immediate help</Text>
                <Text style={styles.reqDist}>Within 2km radius circle</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <AadhaarAuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        user={currentUser}
        onSuccess={(updated) => setCurrentUser(updated)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0d1117" },
  container: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 20 },
  headerTitle: { color: "#f0f6fc", fontSize: 20, fontWeight: "900" },
  headerSubtitle: { color: "#8b949e", fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  helperName: { color: "#f0f6fc", fontSize: 18, fontWeight: "bold" },
  helperSkill: { color: "#58a6ff", fontSize: 13, marginTop: 2 },
  aadhaarSubtext: { color: "#3fb950", fontSize: 11, fontWeight: "600", marginTop: 2 },
  statusBox: { alignItems: "flex-end" },
  statusLabel: { color: "#8b949e", fontSize: 11, marginBottom: 2 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#21262d",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  statItem: { alignItems: "center" },
  statVal: { color: "#f0f6fc", fontSize: 15, fontWeight: "bold" },
  statLabel: { color: "#8b949e", fontSize: 11, marginTop: 2 },
  subBanner: {
    backgroundColor: "#23863615",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#238636",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subTitle: { color: "#3fb950", fontSize: 13, fontWeight: "bold" },
  subPrice: { color: "#8b949e", fontSize: 11, marginTop: 2 },
  subActiveBadge: {
    backgroundColor: "#238636",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  subActiveText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  aadhaarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  aadhaarTitle: { color: "#f0f6fc", fontSize: 16, fontWeight: "bold" },
  verifiedBadge: {
    backgroundColor: "#23863622",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2ea043",
  },
  verifiedBadgeText: { color: "#2ea043", fontSize: 11, fontWeight: "bold" },
  aadhaarDesc: { color: "#8b949e", fontSize: 12, lineHeight: 18, marginBottom: 12 },
  aadhaarForm: { gap: 10 },
  input: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 12,
    color: "#f0f6fc",
    fontSize: 14,
  },
  aadhaarBtn: {
    backgroundColor: "#1f6feb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  aadhaarBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  radarSection: { marginTop: 10 },
  radarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: "#f0f6fc", fontSize: 15, fontWeight: "700" },
  refreshText: { color: "#58a6ff", fontSize: 12, fontWeight: "600" },
  noRequestsCard: {
    backgroundColor: "#161b22",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363d",
    alignItems: "center",
  },
  noRequestsText: { color: "#8b949e", fontSize: 12, textAlign: "center" },
  incomingReqCard: {
    backgroundColor: "#161b22",
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#e63946",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  reqTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  reqSkill: { color: "#f0f6fc", fontWeight: "bold", fontSize: 14 },
  reqUrgency: { color: "#e63946", fontSize: 11, fontWeight: "bold" },
  reqSeeker: { color: "#8b949e", fontSize: 12 },
  reqDist: { color: "#58a6ff", fontSize: 11, marginTop: 4 },
});
