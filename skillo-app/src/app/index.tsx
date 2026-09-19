import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { SKILL_CATEGORIES } from "@/constants/api";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState(SKILL_CATEGORIES[0].name);
  const [urgency, setUrgency] = useState<"EMERGENCY" | "TASK">("EMERGENCY");
  const [loading, setLoading] = useState(false);

  const startSearch = async () => {
    setLoading(true);
    let coords = { latitude: 12.9716, longitude: 77.5946 }; // Default: Bangalore Center

    try {
      if (Platform.OS !== "web") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (loc?.coords) {
            coords = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
          }
        }
      }
    } catch (e) {
      console.log("Using fallback coordinates for demo:", e);
    }

    setLoading(false);
    router.push({
      pathname: "/searching",
      params: {
        lat: coords.latitude,
        lng: coords.longitude,
        skillNeeded: selectedSkill,
        urgency: urgency,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* AWS Hackathon Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.logo}>⚡ SKILLO</Text>
            <View style={styles.awsBadge}>
              <Text style={styles.awsText}>☁️ AWS Serverless</Text>
            </View>
          </View>
          <Text style={styles.tagline}>
            Hyperlocal On-the-Go Emergency & Skill Dispatch
          </Text>
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

        {/* Radius Policy Banner */}
        <View style={styles.policyCard}>
          <Text style={styles.policyTitle}>📡 Automatic Multi-Radius Scan</Text>
          <Text style={styles.policyDesc}>
            Skillo searches active verified helpers within{" "}
            <Text style={{ fontWeight: "700" }}>2 km</Text>. If none accept within 20s,
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
  awsBadge: {
    backgroundColor: "#ff9900",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  awsText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "800",
  },
  tagline: {
    color: "#8b949e",
    fontSize: 13,
    marginTop: 6,
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
});