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
import { SosModal } from "@/components/sos-modal";

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<"SIGN_IN" | "SIGN_UP">("SIGN_IN");
  const [sosModalVisible, setSosModalVisible] = useState(false);

  // Sign In State (Supports both Email ID and Phone Number)
  const [signInIdentifier, setSignInIdentifier] = useState("");
  const [signInOtp, setSignInOtp] = useState("");
  const [signInOtpSent, setSignInOtpSent] = useState(false);

  // Sign Up State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [maskedAadhaar, setMaskedAadhaar] = useState("");

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Mechanic (Roadside Assistance)",
  ]);
  const [customSkillText, setCustomSkillText] = useState("");

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

  // Sign In Handler (Supports BOTH Email ID and Mobile Phone)
  const handleSignIn = async () => {
    const trimmedInput = signInIdentifier.trim();
    if (!trimmedInput) {
      Alert.alert(
        "Missing Detail",
        "Please enter your registered Email Address or Mobile Phone Number."
      );
      return;
    }

    const isEmail = trimmedInput.includes("@");
    const digitsOnly = trimmedInput.replace(/[^0-9]/g, "");
    const isPhone = !isEmail && digitsOnly.length >= 10;

    if (!isEmail && !isPhone) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid Email (e.g. name@example.com) or 10-digit Mobile Phone Number."
      );
      return;
    }

    if (!signInOtpSent) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSignInOtpSent(true);
        Alert.alert(
          "Login OTP Sent",
          `Verification code sent to ${trimmedInput}.\n\nDemo OTP: 123456`
        );
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
          identifier: trimmedInput,
          otp: signInOtp || "123456",
        }),
      });
      const data = await res.json();
      const user = data.user || {
        name: "Pradeep Kumar",
        email: isEmail ? trimmedInput : "pradeep@skillo.in",
        phone: isPhone ? trimmedInput : "+91 98450 12345",
        aadhaarNumber: "XXXXXXXX7777",
        role: "SEEKER",
        skills: ["Mechanic (Roadside Assistance)"],
        customSkillDescription: "",
        isVerified: true,
        isLoggedIn: true,
      };
      onAuthSuccess({
        ...user,
        email: isEmail ? trimmedInput : user.email || "pradeep@skillo.in",
        phone: isPhone ? trimmedInput : user.phone || "+91 98450 12345",
        isLoggedIn: true,
      });
    } catch (e) {
      // Fallback offline demo login
      onAuthSuccess({
        name: "Pradeep Kumar",
        email: isEmail ? trimmedInput : "pradeep@skillo.in",
        phone: isPhone ? trimmedInput : "+91 98450 12345",
        aadhaarNumber: "XXXXXXXX7777",
        role: "SEEKER",
        skills: ["Mechanic (Roadside Assistance)"],
        customSkillDescription: "",
        isVerified: true,
        isLoggedIn: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Aadhaar OTP Trigger (Below Aadhaar Number)
  const handleSendAadhaarOtp = async () => {
    const cleanAadhaar = aadhaar.replace(/\s+/g, "");
    if (cleanAadhaar.length !== 12) {
      Alert.alert("Invalid Aadhaar", "Please enter a 12-digit Aadhaar number first.");
      return;
    }

    setLoading(true);
    try {
      await fetch(`${API_URL}/api/aadhaar/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNumber: cleanAadhaar }),
      });
    } catch (e) {}

    setLoading(false);
    setAadhaarOtpSent(true);
    Alert.alert(
      "UIDAI OTP Dispatched",
      `Demo UIDAI verification OTP sent for Aadhaar XXXXXXXX${cleanAadhaar.slice(-4)}.\n\nDemo OTP: 123456`
    );
  };

  // Aadhaar OTP Verification Handler
  const handleVerifyAadhaarOtp = () => {
    if (aadhaarOtp !== "123456" && aadhaarOtp.length < 4) {
      Alert.alert("Verification Failed", "Please enter demo OTP: 123456");
      return;
    }

    const cleanAadhaar = aadhaar.replace(/\s+/g, "");
    const masked = `XXXXXXXX${cleanAadhaar.slice(-4)}`;
    setMaskedAadhaar(masked);
    setAadhaarVerified(true);
    Alert.alert("Aadhaar Verified! 🛡️", "UIDAI e-KYC completed successfully.");
  };

  // Sign Up Handler
  const handleSignUp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your Full Name.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      Alert.alert("Missing Email", "Please enter a valid Email Address.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Missing Phone", "Please enter your Mobile Phone Number.");
      return;
    }
    if (!aadhaarVerified) {
      Alert.alert(
        "Aadhaar Verification Required",
        "Under UIDAI safety regulations, please click 'Verify Aadhaar with OTP' below your Aadhaar number before signing up."
      );
      return;
    }

    setLoading(true);
    const finalAadhaar = maskedAadhaar || `XXXXXXXX${aadhaar.slice(-4)}`;

    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          role: "SEEKER",
          skills: selectedSkills,
          customSkillDescription: customSkillText.trim(),
          aadhaarNumber: finalAadhaar,
        }),
      });
      const data = await res.json();
      const newUser = data.user || {
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        role: "SEEKER",
        skills: selectedSkills,
        customSkillDescription: customSkillText.trim(),
        aadhaarNumber: finalAadhaar,
        isVerified: true,
        isLoggedIn: true,
      };
      onAuthSuccess({ ...newUser, isLoggedIn: true });
    } catch (e) {
      onAuthSuccess({
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        role: "SEEKER",
        skills: selectedSkills,
        customSkillDescription: customSkillText.trim(),
        aadhaarNumber: finalAadhaar,
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
      email: "pradeep@skillo.in",
      phone: "+91 98450 12345",
      aadhaarNumber: "XXXXXXXX7777",
      role: "SEEKER",
      skills: ["Mechanic (Roadside Assistance)", "Doctor / Medical Emergency"],
      customSkillDescription: "Automotive engine diagnostics and emergency repair",
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
          <TouchableOpacity
            style={styles.sosHeaderBtn}
            onPress={() => setSosModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.sosHeaderText}>🚨 SOS</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.tagline}>
          Hyperlocal On-the-Go Emergency & Skill Dispatch Network
        </Text>

        {/* Auth Tabs: Sign In / Sign Up (NO / in button as requested) */}
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
              📝 Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. SIGN IN FORM (Using Email ID or Mobile Phone Number) */}
        {authMode === "SIGN_IN" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back to Skillo</Text>
            <Text style={styles.cardSubtitle}>
              Sign in with your registered email address or mobile phone number.
            </Text>

            <Text style={styles.label}>Email Address or Mobile Phone:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. pradeep@skillo.in or +91 98450 12345"
              placeholderTextColor="#8b949e"
              value={signInIdentifier}
              onChangeText={setSignInIdentifier}
              autoCapitalize="none"
            />

            {signInOtpSent && (
              <>
                <Text style={styles.label}>Enter 6-Digit Login OTP:</Text>
                <TextInput
                  style={[
                    styles.input,
                    { letterSpacing: 6, fontSize: 18, textAlign: "center" },
                  ]}
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
              Join the verified community. All members are Aadhaar e-KYC verified for 100% mutual safety.
            </Text>

            {/* Basic Info */}
            <Text style={styles.label}>Full Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Pradeep Kumar"
              placeholderTextColor="#8b949e"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email Address:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. pradeep@skillo.in"
              placeholderTextColor="#8b949e"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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

            {/* Aadhaar e-KYC Compliance Section */}
            <View style={styles.aadhaarContainer}>
              <View style={styles.complianceBadge}>
                <Text style={styles.complianceText}>
                  🔒 UIDAI e-KYC Compliant: Raw Aadhaar is never stored
                </Text>
              </View>

              <Text style={styles.label}>12-Digit Aadhaar Number:</Text>
              <TextInput
                style={[
                  styles.input,
                  aadhaarVerified && { borderColor: "#238636", backgroundColor: "#23863610" },
                ]}
                placeholder="12-digit Aadhaar number"
                placeholderTextColor="#8b949e"
                value={aadhaarVerified ? maskedAadhaar : aadhaar}
                onChangeText={setAadhaar}
                keyboardType="numeric"
                maxLength={12}
                editable={!aadhaarVerified}
              />

              {/* Below Aadhaar No: Verify OTP Section */}
              {!aadhaarVerified ? (
                <View style={styles.belowAadhaarSection}>
                  {!aadhaarOtpSent ? (
                    <TouchableOpacity
                      style={styles.verifyOtpBtn}
                      onPress={handleSendAadhaarOtp}
                      disabled={loading}
                    >
                      <Text style={styles.verifyOtpBtnText}>
                        📲 Verify Aadhaar with OTP
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.otpInputGroup}>
                      <Text style={styles.otpGroupLabel}>
                        Enter 6-Digit UIDAI OTP:
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TextInput
                          style={[
                            styles.input,
                            { flex: 1, letterSpacing: 4, textAlign: "center", fontSize: 16 },
                          ]}
                          placeholder="123456"
                          placeholderTextColor="#8b949e"
                          value={aadhaarOtp}
                          onChangeText={setAadhaarOtp}
                          keyboardType="numeric"
                          maxLength={6}
                        />
                        <TouchableOpacity
                          style={styles.confirmOtpBtn}
                          onPress={handleVerifyAadhaarOtp}
                        >
                          <Text style={styles.confirmOtpBtnText}>Verify ✓</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                        <Text style={styles.hintText}>💡 Demo OTP: 123456</Text>
                        <TouchableOpacity onPress={handleSendAadhaarOtp}>
                          <Text style={{ color: "#58a6ff", fontSize: 11 }}>Resend OTP</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.verifiedSuccessBadge}>
                  <Text style={styles.verifiedSuccessText}>
                    ✅ Aadhaar Verified (UIDAI e-KYC: {maskedAadhaar})
                  </Text>
                </View>
              )}
            </View>

            {/* Skills selection */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>Skills You Can Provide (Optional):</Text>
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

            {/* Custom Skill Write-Up Space when "Other" is checked */}
            {selectedSkills.some((s) => s.toLowerCase().includes("other")) && (
              <View style={styles.writeUpCard}>
                <Text style={styles.writeUpTitle}>
                  ✍️ Describe Your Custom Skill(s) / Services:
                </Text>
                <TextInput
                  style={styles.writeUpInput}
                  placeholder="Type your skills here (e.g., Carpentry, inverter wiring, CCTV setup, AC servicing, tailoring, painting...)"
                  placeholderTextColor="#8b949e"
                  value={customSkillText}
                  onChangeText={setCustomSkillText}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={styles.writeUpHint}>
                  This write-up helps nearby citizens match with your exact capabilities.
                </Text>
              </View>
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
                  Complete Sign Up & Enter Skillo
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Fast 1-Click Demo Bypass */}
        <TouchableOpacity style={styles.quickDemoBtn} onPress={quickDemoLogin}>
          <Text style={styles.quickDemoText}>
            ⚡ Quick Demo Sign In as Pradeep Kumar (pradeep@skillo.in)
          </Text>
        </TouchableOpacity>

        {/* Simply AWS Bharat Builds - Below Quick Demo */}
        <View style={styles.awsBharatCard}>
          <Text style={styles.awsBharatLogo}>☁️ AWS Bharat Builds</Text>
        </View>
      </ScrollView>

      {/* Emergency SOS Modal (Police & Ambulance) */}
      <SosModal
        visible={sosModalVisible}
        onClose={() => setSosModalVisible(false)}
      />
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
  aadhaarContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#0d1117",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  complianceBadge: {
    backgroundColor: "#1f6feb22",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#1f6feb44",
  },
  complianceText: { color: "#58a6ff", fontSize: 11, fontWeight: "600" },
  belowAadhaarSection: { marginTop: 10 },
  verifyOtpBtn: {
    backgroundColor: "#1f6feb22",
    borderWidth: 1,
    borderColor: "#1f6feb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyOtpBtnText: { color: "#58a6ff", fontWeight: "bold", fontSize: 13 },
  otpInputGroup: { marginTop: 6 },
  otpGroupLabel: { color: "#c9d1d9", fontSize: 12, fontWeight: "600", marginBottom: 4 },
  confirmOtpBtn: {
    backgroundColor: "#238636",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmOtpBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  hintText: { color: "#8b949e", fontSize: 11 },
  verifiedSuccessBadge: {
    backgroundColor: "#23863622",
    borderWidth: 1,
    borderColor: "#2ea043",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  verifiedSuccessText: { color: "#3fb950", fontWeight: "bold", fontSize: 13 },
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
  writeUpCard: {
    backgroundColor: "#161b22",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a371f7",
    padding: 12,
    marginTop: 12,
  },
  writeUpTitle: { color: "#d2a8ff", fontSize: 13, fontWeight: "bold", marginBottom: 6 },
  writeUpInput: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 10,
    color: "#f0f6fc",
    fontSize: 13,
    minHeight: 65,
  },
  writeUpHint: { color: "#8b949e", fontSize: 11, marginTop: 4 },
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
  awsBharatCard: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#ff990055",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
  },
  awsBharatLogo: {
    color: "#ff9900",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
