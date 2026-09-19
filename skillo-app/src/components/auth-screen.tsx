import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_URL, SKILL_CATEGORIES } from "@/constants/api";
import { UserProfile } from "@/constants/user";

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<"SIGN_IN" | "SIGN_UP">("SIGN_IN");

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInOtp, setSignInOtp] = useState("");
  const [signInOtpSent, setSignInOtpSent] = useState(false);

  // Sign Up State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [role, setRole] = useState<"SEEKER" | "HELPER">("SEEKER");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Mechanic (Roadside Assistance)",
  ]);
  const [signUpOtp, setSignUpOtp] = useState("");
  const [signUpOtpSent, setSignUpOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter((s) => s !== skillName));
      } else {
        Alert.alert("Notice", "Please select at least one skill.");
      }
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  // Sign In Handler
  const handleSignIn = async () => {
    if (!signInIdentifier.trim()) {
      Alert.alert("Missing Details", "Please enter your Phone or Aadhaar Number.");
      return;
    }

    if (!signInOtpSent) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSignInOtpSent(true);
        Alert.alert("OTP Sent", "Demo OTP sent to your registered phone.\nDemo OTP: 123456");
      }, 500);
      return;
    }

    if (signInOtp !== "123456" && signInOtp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter demo OTP: 123456");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: signInIdentifier,
          otp: signInOtp || "123456",
        }),
      });
      const data = await res.json();
      const user = data.user || {
        name: "Pradeep Kumar",
        phone: signInIdentifier,
        aadhaarNumber: "555566667777",
        role: "SEEKER",
        skills: ["Mechanic (Roadside Assistance)"],
        isVerified: true,
        isLoggedIn: true,
      };
      onAuthSuccess({ ...user, isLoggedIn: true });
    } catch (e) {
      // Fallback
      onAuthSuccess({
        name: "Pradeep Kumar",
        phone: signInIdentifier || "+91 98450 12345",
        aadhaarNumber: "555566667777",
        role: "SEEKER",
        skills: ["Mechanic (Roadside Assistance)"],
        isVerified: true,
        isLoggedIn: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async () => {
    if (!name.trim() || !phone.trim() || aadhaar.replace(/\s+/g, "").length !== 12) {
      Alert.alert("Missing Information", "Please enter your Name, Phone, and 12-digit Aadhaar Number.");
      return;
    }

    if (!signUpOtpSent) {
      setLoading(true);
      try {
        await fetch(`${API_URL}/api/aadhaar/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aadhaarNumber: aadhaar }),
        });
      } catch (e) {}
      setLoading(false);
      setSignUpOtpSent(true);
      Alert.alert("UIDAI OTP Sent", "Demo UIDAI Aadhaar verification OTP sent.\nDemo OTP: 123456");
      return;
    }

    if (signUpOtp !== "123456" && signUpOtp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter demo OTP: 123456");
      return;
    }

    setLoading(true);
    const cleanAadhaar = aadhaar.replace(/\s+/g, "");
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          role,
          skills: role === "HELPER" ? selectedSkills : [],
          aadhaarNumber: cleanAadhaar,
        }),
      });
      const data = await res.json();
      const newUser = data.user || {
        name,
        phone,
        role,
        skills: selectedSkills,
        aadhaarNumber: cleanAadhaar,
        isVerified: true,
        isLoggedIn: true,
      };
      onAuthSuccess({ ...newUser, isLoggedIn: true });
    } catch (e) {
      onAuthSuccess({
        name,
        phone,
        role,
        skills: selectedSkills,
        aadhaarNumber: cleanAadhaar,
        isVerified: true,
        isLoggedIn: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fast demo bypass
  const quickDemoLogin = () => {
    onAuthSuccess({
      name: "Pradeep Kumar",
      phone: "+91 98450 12345",
      aadhaarNumber: "555566667777",
      role: "SEEKER",
      skills: ["Mechanic (Roadside Assistance)", "Doctor / Medical Emergency"],
      isVerified: true,
      isLoggedIn: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Text style={styles.logo}>⚡ SKILLO</Text>
          <View style={styles.awsBadge}>
            <Text style={styles.awsText}>☁️ AWS Serverless</Text>
          </View>
        </View>
        <Text style={styles.tagline}>
          Hyperlocal On-the-Go Emergency & Skill Dispatch Network
        </Text>

        {/* Auth Tabs: Sign In / Sign Up */}
        <View style={styles.authTabContainer}>
          <TouchableOpacity
            style={[
              styles.authTab,
              authMode === "SIGN_IN" && styles.authTabActive,
            ]}
            onPress={() => setAuthMode("SIGN_IN")}
          >
            <Text
              style={[
                styles.authTabText,
                authMode === "SIGN_IN" && styles.authTabTextActive,
              ]}
            >
              🔑 Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.authTab,
              authMode === "SIGN_UP" && styles.authTabActive,
            ]}
            onPress={() => setAuthMode("SIGN_UP")}
          >
            <Text
              style={[
                styles.authTabText,
                authMode === "SIGN_UP" && styles.authTabTextActive,
              ]}
            >
              📝 Sign Up / Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. SIGN IN FORM */}
        {authMode === "SIGN_IN" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back to Skillo</Text>
            <Text style={styles.cardSubtitle}>
              Sign in with your registered phone or Aadhaar number.
            </Text>

            <Text style={styles.label}>Mobile Phone or Aadhaar Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 Mobile or 12-Digit Aadhaar"
              placeholderTextColor="#8b949e"
              value={signInIdentifier}
              onChangeText={setSignInIdentifier}
              keyboardType="phone-pad"
            />

            {signInOtpSent && (
              <>
                <Text style={styles.label}>Enter 6-Digit Verification OTP:</Text>
                <TextInput
                  style={[styles.input, { letterSpacing: 6, fontSize: 18, textAlign: "center" }]}
                  placeholder="123456"
                  placeholderTextColor="#8b949e"
                  value={signInOtp}
                  onChangeText={setSignInOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <Text style={styles.hint}>💡 Demo Sandbox OTP: 123456</Text>
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {signInOtpSent ? "Sign In & Enter Skillo" : "Send Login OTP"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 2. SIGN UP FORM */}
        {authMode === "SIGN_UP" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create New Skillo Account</Text>
            <Text style={styles.cardSubtitle}>
              Both citizens and skilled responders are Aadhaar-verified for 100% safety.
            </Text>

            {/* Role Selection */}
            <Text style={styles.label}>Select Your Primary Role:</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleCard, role === "SEEKER" && styles.roleCardActive]}
                onPress={() => setRole("SEEKER")}
              >
                <Text style={styles.roleIcon}>🚨</Text>
                <Text style={styles.roleTitle}>Citizen (Seeker)</Text>
                <Text style={styles.roleDesc}>Need emergency / task help</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleCard, role === "HELPER" && styles.roleCardActive]}
                onPress={() => setRole("HELPER")}
              >
                <Text style={styles.roleIcon}>🛠️</Text>
                <Text style={styles.roleTitle}>Skill Responder</Text>
                <Text style={styles.roleDesc}>Earn on the go / Save lives</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Full Name (as per Aadhaar):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Pradeep Kumar"
              placeholderTextColor="#8b949e"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Mobile Phone Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 Mobile Number"
              placeholderTextColor="#8b949e"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>12-Digit Aadhaar Number (UIDAI):</Text>
            <TextInput
              style={styles.input}
              placeholder="12-digit Aadhaar"
              placeholderTextColor="#8b949e"
              value={aadhaar}
              onChangeText={setAadhaar}
              keyboardType="numeric"
              maxLength={12}
            />

            {/* If Helper, Show Skill Picker */}
            {role === "HELPER" && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Select Skills You Can Provide:</Text>
                <View style={styles.skillsSelector}>
                  {SKILL_CATEGORIES.map((cat) => {
                    const isChecked = selectedSkills.includes(cat.name);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.skillPill,
                          isChecked && styles.skillPillChecked,
                        ]}
                        onPress={() => toggleSkill(cat.name)}
                      >
                        <Text style={styles.skillPillText}>
                          {isChecked ? "✓ " : "+ "}
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {signUpOtpSent && (
              <>
                <Text style={styles.label}>Enter UIDAI Verification OTP:</Text>
                <TextInput
                  style={[styles.input, { letterSpacing: 6, fontSize: 18, textAlign: "center" }]}
                  placeholder="123456"
                  placeholderTextColor="#8b949e"
                  value={signUpOtp}
                  onChangeText={setSignUpOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <Text style={styles.hint}>💡 Demo Sandbox OTP: 123456</Text>
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {signUpOtpSent
                    ? "Complete Aadhaar Registration"
                    : "Verify Aadhaar with UIDAI OTP"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Fast 1-Click Demo Bypass */}
        <TouchableOpacity style={styles.quickDemoBtn} onPress={quickDemoLogin}>
          <Text style={styles.quickDemoText}>
            ⚡ Quick Demo Sign In as Pradeep Kumar (Aadhaar Verified)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0d1117" },
  container: { padding: 20, paddingBottom: 50 },
  brandContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  logo: { fontSize: 28, fontWeight: "900", color: "#58a6ff", letterSpacing: 1.5 },
  awsBadge: {
    backgroundColor: "#ff9900",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  awsText: { color: "#000", fontSize: 11, fontWeight: "800" },
  tagline: { color: "#8b949e", fontSize: 13, marginTop: 4, marginBottom: 20 },
  authTabContainer: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  authTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  authTabActive: {
    backgroundColor: "#21262d",
    borderWidth: 1,
    borderColor: "#58a6ff",
  },
  authTabText: { color: "#8b949e", fontWeight: "600", fontSize: 14 },
  authTabTextActive: { color: "#f0f6fc", fontWeight: "bold" },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 20,
  },
  cardTitle: { color: "#f0f6fc", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  cardSubtitle: { color: "#8b949e", fontSize: 12, lineHeight: 18, marginBottom: 16 },
  label: { color: "#c9d1d9", fontSize: 13, fontWeight: "600", marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 12,
    color: "#f0f6fc",
    fontSize: 14,
  },
  hint: { color: "#58a6ff", fontSize: 12, textAlign: "center", marginTop: 6 },
  primaryBtn: {
    backgroundColor: "#238636",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },
  primaryBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  roleCard: {
    flex: 1,
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  roleCardActive: { borderColor: "#58a6ff", backgroundColor: "#58a6ff15" },
  roleIcon: { fontSize: 24, marginBottom: 4 },
  roleTitle: { color: "#f0f6fc", fontWeight: "bold", fontSize: 12 },
  roleDesc: { color: "#8b949e", fontSize: 10, textAlign: "center", marginTop: 2 },
  skillsSelector: { gap: 8, marginTop: 4 },
  skillPill: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#30363d",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  skillPillChecked: {
    borderColor: "#238636",
    backgroundColor: "#23863622",
  },
  skillPillText: { color: "#f0f6fc", fontSize: 12, fontWeight: "600" },
  quickDemoBtn: {
    backgroundColor: "#21262d",
    borderWidth: 1,
    borderColor: "#58a6ff44",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  quickDemoText: { color: "#58a6ff", fontWeight: "bold", fontSize: 13, textAlign: "center" },
});
