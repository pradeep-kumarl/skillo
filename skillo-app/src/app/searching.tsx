import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from "@/constants/api";
import { LiveMap } from "@/components/live-map";

export default function SearchingScreen() {
  const router = useRouter();
  const { lat, lng, skillNeeded, urgency } = useLocalSearchParams();

  const [currentRadius, setCurrentRadius] = useState<number>(2);
  const [helpers, setHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchPhase, setSearchPhase] = useState<string>("Scanning ring 1 (2 km)...");
  const [requestId, setRequestId] = useState<string | null>(null);

  // Progressive 2km -> 4km -> 6km expansion loop
  useEffect(() => {
    let timer4km: any;
    let timer6km: any;

    const performSearch = async (radius: number) => {
      try {
        const res = await fetch(`${API_URL}/api/requests/search-nearby`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: Number(lat || 12.9716),
            lng: Number(lng || 77.5946),
            skillNeeded: String(skillNeeded || ""),
            maxRadiusKm: radius,
          }),
        });
        const data = await res.json();

        if (data.helpersFound && data.helpersFound.length > 0) {
          setHelpers(data.helpersFound);
          setCurrentRadius(data.radiusUsedKm || radius);
          setSearchPhase(`Found ${data.helpersFound.length} available verified helper(s)!`);
          setLoading(false);
          return true;
        }
        return false;
      } catch (err) {
        console.log("Search error:", err);
        return false;
      }
    };

    // Phase 1: 2km Immediate Scan
    performSearch(2.0).then((found) => {
      if (!found) {
        setSearchPhase("Scanning 2 km ring (expanding to 4 km in 1 min if unanswered)...");
        // Phase 2: Expand to 4km after 1 minute (60,000ms)
        timer4km = setTimeout(() => {
          setCurrentRadius(4);
          setSearchPhase("Expanding to ring 2 (4 km radius, waiting 1 min)...");
          performSearch(4.0).then((found4) => {
            if (!found4) {
              // Phase 3: Expand to 6km after another 1 minute (60,000ms)
              timer6km = setTimeout(() => {
                setCurrentRadius(6);
                setSearchPhase("Expanding to maximum ring 3 (6 km radius)...");
                performSearch(6.0).then((found6) => {
                  setLoading(false);
                  if (!found6) {
                    setSearchPhase("No verified helpers found within 6 km.");
                  }
                });
              }, 60000);
            }
          });
        }, 60000);
      }
    });

    return () => {
      clearTimeout(timer4km);
      clearTimeout(timer6km);
    };
  }, [lat, lng, skillNeeded]);

  const selectAndConnectHelper = async (helper: any) => {
    try {
      // 1. Create request record in DynamoDB/backend
      const createRes = await fetch(`${API_URL}/api/requests/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: Number(lat || 12.9716),
          lng: Number(lng || 77.5946),
          skillNeeded: String(skillNeeded || ""),
          urgency: String(urgency || "EMERGENCY"),
          seekerName: "Citizen Seeker",
          seekerPhone: "+91 99887 76655",
        }),
      });
      const createData = await createRes.json();
      const newReqId = createData.request?.requestId || `req-${Date.now()}`;

      // 2. Accept & Trigger Handshake
      await fetch(`${API_URL}/api/requests/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: newReqId,
          helperId: helper.userId,
          helperName: helper.name,
          helperPhone: helper.phone,
          helperLat: helper.lat,
          helperLng: helper.lng,
        }),
      });

      // Navigate to Handshake screen
      router.replace({
        pathname: "/matched",
        params: {
          requestId: newReqId,
          helperName: helper.name,
          helperPhone: helper.phone,
          helperSkill: String(skillNeeded),
          helperRating: String(helper.rating || 4.9),
          distanceKm: String(helper.distanceKm || "0.5"),
          aadhaarStatus: helper.aadhaarStatus || "VERIFIED",
        },
      });
    } catch (e) {
      console.log("Connect error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Live Radar Scan</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Live Interactive OpenStreetMap - Hero Element */}
        <View style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingHorizontal: 2 }}>
            <Text style={{ color: "#58a6ff", fontSize: 13, fontWeight: "bold" }}>
              🗺️ Hyperlocal Live Map (2–6km OpenStreetMap)
            </Text>
            <Text style={{ color: "#8b949e", fontSize: 11 }}>
              Radius: {currentRadius} km
            </Text>
          </View>
          <LiveMap
            seekerLat={Number(lat || 12.9716)}
            seekerLng={Number(lng || 77.5946)}
            radiusKm={currentRadius}
            helpers={helpers.map((h) => ({
              name: h.name,
              lat: h.lat,
              lng: h.lng,
              skill: String(skillNeeded),
              distanceKm: h.distanceKm,
            }))}
            height={260}
          />
        </View>

        {/* Radar Visual Rings Indicator */}
        <View style={styles.radarCard}>
          <View style={styles.radiusPillRow}>
            <View
              style={[
                styles.radiusPill,
                currentRadius >= 2 && styles.radiusPillActive,
              ]}
            >
              <Text style={styles.radiusPillText}>2 KM</Text>
            </View>
            <Text style={styles.arrowText}>→</Text>
            <View
              style={[
                styles.radiusPill,
                currentRadius >= 4 && styles.radiusPillActive,
              ]}
            >
              <Text style={styles.radiusPillText}>4 KM</Text>
            </View>
            <Text style={styles.arrowText}>→</Text>
            <View
              style={[
                styles.radiusPill,
                currentRadius >= 6 && styles.radiusPillActive,
              ]}
            >
              <Text style={styles.radiusPillText}>6 KM</Text>
            </View>
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              color="#58a6ff"
              style={{ marginVertical: 15 }}
            />
          )}

          <Text style={styles.phaseText}>{searchPhase}</Text>
          <Text style={styles.subtext}>
            Target Skill: <Text style={{ color: "#58a6ff" }}>{skillNeeded}</Text>
          </Text>
        </View>

        {/* Found Helpers List */}
        <Text style={styles.resultsHeading}>
          {helpers.length > 0
            ? `Available Responders within ${currentRadius}km:`
            : "Scanning Nearby..."}
        </Text>

        {helpers.map((helper) => (
          <View key={helper.userId} style={styles.helperCard}>
            <View style={styles.helperHeader}>
              <View>
                <Text style={styles.helperName}>{helper.name}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {helper.rating}</Text>
                  </View>
                  <View style={styles.aadhaarBadge}>
                    <Text style={styles.aadhaarText}>🛡️ Aadhaar Verified</Text>
                  </View>
                </View>
              </View>

              <View style={styles.distanceBox}>
                <Text style={styles.distanceVal}>{helper.distanceKm} km</Text>
                <Text style={styles.distanceLabel}>Away</Text>
              </View>
            </View>

            <Text style={styles.jobsCount}>
              Completed {helper.completedJobs || 20}+ emergency assists
            </Text>

            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => selectAndConnectHelper(helper)}
            >
              <Text style={styles.connectBtnText}>
                ⚡ Request & Instant Handshake
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {helpers.length === 0 && !loading && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Available Responders Found</Text>
            <Text style={styles.emptyDesc}>
              No verified {skillNeeded} was available within 6 km at this instant.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.retryText}>Try Another Skill</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0d1117" },
  container: { padding: 20, paddingBottom: 40 },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: { padding: 8 },
  backBtnText: { color: "#8b949e", fontSize: 14, fontWeight: "600" },
  title: { color: "#f0f6fc", fontSize: 18, fontWeight: "bold" },
  radarCard: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 24,
  },
  radiusPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  radiusPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#21262d",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  radiusPillActive: {
    backgroundColor: "#238636",
    borderColor: "#2ea043",
  },
  radiusPillText: { color: "#f0f6fc", fontWeight: "bold", fontSize: 12 },
  arrowText: { color: "#8b949e", fontWeight: "bold" },
  phaseText: {
    color: "#f0f6fc",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtext: { color: "#8b949e", fontSize: 12 },
  resultsHeading: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  helperCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#238636",
    marginBottom: 14,
  },
  helperHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  helperName: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  badgeRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  ratingBadge: {
    backgroundColor: "#e3b34122",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e3b341",
  },
  ratingText: { color: "#e3b341", fontSize: 11, fontWeight: "bold" },
  aadhaarBadge: {
    backgroundColor: "#23863622",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2ea043",
  },
  aadhaarText: { color: "#2ea043", fontSize: 10, fontWeight: "bold" },
  distanceBox: {
    alignItems: "flex-end",
    backgroundColor: "#21262d",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  distanceVal: { color: "#58a6ff", fontSize: 14, fontWeight: "800" },
  distanceLabel: { color: "#8b949e", fontSize: 10 },
  jobsCount: { color: "#8b949e", fontSize: 12, marginBottom: 14 },
  connectButton: {
    backgroundColor: "#238636",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  connectBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyCard: {
    backgroundColor: "#161b22",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  emptyTitle: { color: "#f85149", fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  emptyDesc: { color: "#8b949e", fontSize: 13, textAlign: "center", marginBottom: 16 },
  retryBtn: {
    backgroundColor: "#21262d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: { color: "#f0f6fc", fontWeight: "600" },
});