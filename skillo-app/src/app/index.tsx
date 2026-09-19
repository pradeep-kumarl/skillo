import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { SKILL_CATEGORIES } from "@/constants/api";
import { INITIAL_USER, UserProfile } from "@/constants/user";
import { AadhaarAuthModal } from "@/components/aadhaar-auth-modal";
import { AuthScreen } from "@/components/auth-screen";
import { SosModal } from "@/components/sos-modal";
import SearchingScreen from "./searching";
import MatchedScreen from "./matched";

export default function HomeScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(SKILL_CATEGORIES[0].name);
  const [customSkillWriteup, setCustomSkillWriteup] = useState("");
  const [urgency, setUrgency] = useState<"EMERGENCY" | "TASK">("EMERGENCY");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<"SELECT" | "SEARCHING" | "MATCHED">("SELECT");
  const [searchParamsData, setSearchParamsData] = useState<{
    lat: number;
    lng: number;
    skillNeeded: string;
    urgency: string;
  }>({
    lat: 12.9716,
    lng: 77.5946,
    skillNeeded: "Mechanic",
    urgency: "EMERGENCY",
  });
  const [matchedParamsData, setMatchedParamsData] = useState<any>(null);

  const startSearch = async () => {
    setLoading(true);
    let coords = { latitude: 12.9716, longitude: 77.5946 }; // Default: Bangalore Center

    try {
      if (Platform.OS !== "web") {
        const locPromise = (async () => {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
              const loc = await Location.getLastKnownPositionAsync();
              if (loc?.coords) return loc.coords;
              const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low,
              });
              if (current?.coords) return current.coords;
            }
          } catch {}
          return null;
        })();

        // Fast 500ms timeout so it NEVER blocks or hangs navigation!
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 500));
        const detected: any = await Promise.race([locPromise, timeoutPromise]);
        if (detected) {
          coords = { latitude: detected.latitude, longitude: detected.longitude };
        }
      }
    } catch (e) {
      console.log("Using fallback coordinates for demo:", e);
    } finally {
      setLoading(false);
    }

    const finalSkill =
      selectedSkill.toLowerCase().includes("other") && customSkillWriteup.trim()
        ? `Custom: ${customSkillWriteup.trim()}`
        : selectedSkill;

    const data = {
      lat: coords.latitude,
      lng: coords.longitude,
      skillNeeded: finalSkill,
      urgency: urgency,
    };

    setSearchParamsData(data);
    setActiveStep("SEARCHING");

    // Also attempt router.push if running with a stack navigator
    try {
      router.push({
        pathname: "/searching",
        params: data,
      });
    } catch {}
  };

  if (!currentUser.isLoggedIn) {
    return (
      <AuthScreen
        onAuthSuccess={(user) => setCurrentUser({ ...user, isLoggedIn: true })}
      />
    );
  }

  if (activeStep === "SEARCHING") {
    return (
      <SearchingScreen
        lat={searchParamsData.lat}
        lng={searchParamsData.lng}
        skillNeeded={searchParamsData.skillNeeded}
        urgency={searchParamsData.urgency}
        onBack={() => setActiveStep("SELECT")}
        onMatched={(matchData) => {
          setMatchedParamsData(matchData);
          setActiveStep("MATCHED");
        }}
      />
    );
  }

  if (activeStep === "MATCHED" && matchedParamsData) {
    return (
      <MatchedScreen
        requestId={matchedParamsData.requestId}
        helperName={matchedParamsData.helperName}
        helperPhone={matchedParamsData.helperPhone}
        helperSkill={matchedParamsData.helperSkill}
        helperRating={matchedParamsData.helperRating}
        distanceKm={matchedParamsData.distanceKm}
        aadhaarStatus={matchedParamsData.aadhaarStatus}
        onClose={() => setActiveStep("SELECT")}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* AWS Hackathon Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.logo}>⚡ SKILLO</Text>
            <TouchableOpacity
              style={styles.sosHeaderBtn}
              onPress={() => setSosModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.sosHeaderText}>🚨 SOS</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.tagline}>
            Hyperlocal On-the-Go Emergency & Skill Dispatch
          </Text>
        </View>

        {/* Aadhaar Verified Citizen Card */}
        <View style={styles.aadhaarBar}>
          <View style={styles.aadhaarInfo}>
            <View style={styles.aadhaarBadgeRow}>
              <Text style={styles.shieldIcon}>🛡️</Text>
              <Text style={styles.aadhaarStatusText}>
                {currentUser.isVerified
                  ? "Aadhaar Verified Citizen"
                  : "Aadhaar Login Required"}
              </Text>
            </View>
            <Text style={styles.citizenDetails}>
              {currentUser.name} • XXXXXXXX{currentUser.aadhaarNumber.slice(-4)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <TouchableOpacity
              style={styles.aadhaarActionBtn}
              onPress={() => setAuthModalVisible(true)}
            >
              <Text style={styles.aadhaarActionBtnText}>
                {currentUser.isVerified ? "e-KYC ✓" : "Verify Login"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={() => setCurrentUser({ ...currentUser, isLoggedIn: false })}
            >
              <Text style={styles.signOutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Urgency Mode Selector */}
        <View style={styles.urgencyContainer}>
          <TouchableOpacity
            style={[
              styles.urgencyTab,
              urgency === "EMERGENCY" && styles.urgencyTabActiveRed,
            ]}
            onPress={() => setUrgency("EMERGENCY")}
          >
            <Text
              style={[
                styles.urgencyText,
                urgency === "EMERGENCY" && styles.urgencyTextActive,
              ]}
            >
              🚨 Critical Emergency
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.urgencyTab,
              urgency === "TASK" && styles.urgencyTabActiveBlue,
            ]}
            onPress={() => setUrgency("TASK")}
          >
            <Text
              style={[
                styles.urgencyText,
                urgency === "TASK" && styles.urgencyTextActive,
              ]}
            >
              ⏱️ 1-Hour Quick Help
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skill Selection Heading */}
        <Text style={styles.sectionTitle}>Select Skill Required Nearby:</Text>

        {/* Skill Categories Grid */}
        <View style={styles.skillsGrid}>
          {SKILL_CATEGORIES.map((skill) => {
            const isSelected = selectedSkill === skill.name;
            return (
              <TouchableOpacity
                key={skill.id}
                style={[
                  styles.skillCard,
                  isSelected && {
                    borderColor: skill.color,
                    backgroundColor: `${skill.color}15`,
                  },
                ]}
                onPress={() => setSelectedSkill(skill.name)}
              >
                <View style={styles.skillTopRow}>
                  <Text style={styles.skillIcon}>{skill.icon}</Text>
                  <View
                    style={[styles.skillTagBadge, { backgroundColor: skill.color }]}
                  >
                    <Text style={styles.skillTagText}>{skill.tag}</Text>
                  </View>
                </View>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillDesc}>{skill.description}</Text>
                {isSelected && (
                  <Text style={[styles.selectedIndicator, { color: skill.color }]}>
                    ✓ Selected
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Skill Write-Up Space when "Other" is selected */}
        {selectedSkill.toLowerCase().includes("other") && (
          <View style={styles.customWriteUpCard}>
            <Text style={styles.customWriteUpTitle}>
              ✍️ Describe Specific Task / Requirement (Write-up):
            </Text>
            <TextInput
              style={styles.customWriteUpInput}
              placeholder="e.g., Broken sofa frame repair, inverter battery connection, tailoring fix..."
              placeholderTextColor="#8b949e"
              value={customSkillWriteup}
              onChangeText={setCustomSkillWriteup}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.customWriteUpHint}>
              This description will be broadcast to nearby roaming responders.
            </Text>
          </View>
        )}

        {/* Radius Policy Banner */}
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>📡 Automatic Multi-Radius Scan</Text>
          <Text style={styles.policyDesc}>
            Skillo searches active verified helpers within{" "}
            <Text style={{ fontWeight: "700" }}>2 km</Text>. If none accept within 1 minute,
            it automatically expands to{" "}
            <Text style={{ fontWeight: "700" }}>4 km</Text>, then{" "}
            <Text style={{ fontWeight: "700" }}>6 km</Text>.
          </Text>
        </View>

        {/* Broadcast SOS / Request Button */}
        <TouchableOpacity
          style={[styles.broadcastButton, loading && { opacity: 0.7 }]}
          onPress={startSearch}
          disabled={loading}
        >
          <Text style={styles.broadcastButtonText}>
            {loading
              ? "Detecting Coordinates..."
              : `🚨 Broadcast for ${selectedSkill.split(" ")[0]} Now`}
          </Text>
          <Text style={styles.broadcastSubtext}>
            Scans 2km → 4km → 6km radius for travelling helpers
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <AadhaarAuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        user={currentUser}
        onSuccess={(updated) => setCurrentUser(updated)}
      />

      <SosModal
        visible={sosModalVisible}
        onClose={() => setSosModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
    paddingBottom: 15,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 26,
    fontWeight: "900",
    color: "#58a6ff",
    letterSpacing: 1.5,
  },
  sosHeaderBtn: {
    backgroundColor: "#e63946",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#e63946",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  sosHeaderText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  tagline: {
    color: "#8b949e",
    fontSize: 13,
    marginTop: 6,
  },
  aadhaarBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#238636",
    marginBottom: 20,
  },
  aadhaarInfo: {
    flex: 1,
  },
  aadhaarBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  shieldIcon: {
    fontSize: 14,
  },
  aadhaarStatusText: {
    color: "#3fb950",
    fontWeight: "bold",
    fontSize: 13,
  },
  citizenDetails: {
    color: "#8b949e",
    fontSize: 11,
  },
  aadhaarActionBtn: {
    backgroundColor: "#23863622",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2ea043",
  },
  aadhaarActionBtnText: {
    color: "#3fb950",
    fontWeight: "bold",
    fontSize: 12,
  },
  signOutBtn: {
    backgroundColor: "#21262d",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  signOutText: {
    color: "#8b949e",
    fontWeight: "600",
    fontSize: 11,
  },
  urgencyContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  urgencyTab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#161b22",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  urgencyTabActiveRed: {
    borderColor: "#e63946",
    backgroundColor: "#e6394622",
  },
  urgencyTabActiveBlue: {
    borderColor: "#2a9d8f",
    backgroundColor: "#2a9d8f22",
  },
  urgencyText: {
    color: "#8b949e",
    fontWeight: "600",
    fontSize: 13,
  },
  urgencyTextActive: {
    color: "#f0f6fc",
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  skillsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  skillCard: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#30363d",
  },
  skillTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  skillIcon: {
    fontSize: 24,
  },
  skillTagBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  skillTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  skillName: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  skillDesc: {
    color: "#8b949e",
    fontSize: 12,
    lineHeight: 16,
  },
  selectedIndicator: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 6,
  },
  policyCard: {
    backgroundColor: "#161b22",
    borderLeftWidth: 4,
    borderLeftColor: "#58a6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  policyTitle: {
    color: "#58a6ff",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 4,
  },
  policyDesc: {
    color: "#8b949e",
    fontSize: 12,
    lineHeight: 18,
  },
  broadcastButton: {
    backgroundColor: "#e63946",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#e63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  broadcastButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  broadcastSubtext: {
    color: "#ffccd5",
    fontSize: 11,
    marginTop: 4,
  },
  customWriteUpCard: {
    backgroundColor: "#161b22",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#a371f7",
    padding: 14,
    marginBottom: 20,
  },
  customWriteUpTitle: {
    color: "#d2a8ff",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
  },
  customWriteUpInput: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 10,
    color: "#f0f6fc",
    fontSize: 13,
    minHeight: 65,
  },
  customWriteUpHint: {
    color: "#8b949e",
    fontSize: 11,
    marginTop: 4,
  },
});