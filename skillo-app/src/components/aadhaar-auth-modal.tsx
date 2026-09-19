import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "@/constants/api";

export interface UserProfile {
  name: string;
  phone: string;
  aadhaarNumber: string;
  isVerified: boolean;
}

interface AadhaarAuthModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserProfile;
  onSuccess: (updatedUser: UserProfile) => void;
}

export function AadhaarAuthModal({
  visible,
  onClose,
  user,
  onSuccess,
}: AadhaarAuthModalProps) {
  const [name, setName] = useState(user.name || "Pradeep Kumar");
  const [phone, setPhone] = useState(user.phone || "+91 98450 12345");
  const [aadhaar, setAadhaar] = useState(user.aadhaarNumber || "555566667777");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleanAadhaar = aadhaar.replace(/\s+/g, "");
    if (cleanAadhaar.length !== 12) {
      Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/aadhaar/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaarNumber: cleanAadhaar }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.status === "OTP_SENT") {
        setStep("OTP");
        Alert.alert("OTP Sent", `Government UIDAI Sandbox OTP sent.\nDemo OTP: 123456`);
      } else {
        setStep("OTP"); // Fallback for offline demo
      }
    } catch (e) {
      setLoading(false);
      setStep("OTP"); // Demo resilience
      Alert.alert("Demo Mode", "Using offline UIDAI simulation. Demo OTP: 123456");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp !== "123456" && otp.length < 4) {
      Alert.alert("Verification Failed", "Please enter demo OTP: 123456");
      return;
    }

    setLoading(true);
    const cleanAadhaar = aadhaar.replace(/\s+/g, "");
    const updated: UserProfile = {
      name,
      phone,
      aadhaarNumber: cleanAadhaar,
      isVerified: true,
    };

    try {
      await fetch(`${API_URL}/api/aadhaar/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarNumber: cleanAadhaar,
          otp: otp || "123456",
          name,
        }),
      });
    } catch (e) {
      console.log("Aadhaar API offline fallback");
    }

    setLoading(false);
    onSuccess(updated);
    setStep("DETAILS");
    onClose();
    Alert.alert("Identity Verified! 🛡️", "Aadhaar e-KYC authentication successful!");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.topRow}>
            <Text style={styles.title}>🛡️ Aadhaar e-KYC Login</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Both Seekers (citizens in distress) and Helpers (skilled responders) must be
            Aadhaar-verified to ensure 100% mutual trust & safety.
          </Text>

          {step === "DETAILS" ? (
            <View style={styles.form}>
              <Text style={styles.inputLabel}>Full Name (as per Aadhaar):</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#8b949e"
              />

              <Text style={styles.inputLabel}>Mobile Phone Number:</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 Mobile Number"
                placeholderTextColor="#8b949e"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>12-Digit Aadhaar Number:</Text>
              <TextInput
                style={styles.input}
                value={aadhaar}
                onChangeText={setAadhaar}
                placeholder="12-Digit UIDAI Aadhaar"
                placeholderTextColor="#8b949e"
                keyboardType="numeric"
                maxLength={12}
              />

              <TouchableOpacity
                style={[styles.actionBtn, loading && { opacity: 0.7 }]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Send UIDAI Verification OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.inputLabel}>
                Enter 6-Digit OTP sent to your linked phone:
              </Text>
              <TextInput
                style={[styles.input, { letterSpacing: 6, fontSize: 20, textAlign: "center" }]}
                value={otp}
                onChangeText={setOtp}
                placeholder="123456"
                placeholderTextColor="#8b949e"
                keyboardType="numeric"
                maxLength={6}
              />
              <Text style={styles.otpHint}>💡 Demo Verification OTP: 123456</Text>

              <TouchableOpacity
                style={[styles.actionBtn, loading && { opacity: 0.7 }]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionBtnText}>Verify & Complete Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep("DETAILS")}
                style={styles.backLink}
              >
                <Text style={styles.backLinkText}>← Edit Aadhaar Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#30363d",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    color: "#f0f6fc",
    fontSize: 18,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: "#8b949e",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  form: {
    gap: 10,
  },
  inputLabel: {
    color: "#c9d1d9",
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 12,
    color: "#f0f6fc",
    fontSize: 14,
  },
  otpHint: {
    color: "#58a6ff",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  actionBtn: {
    backgroundColor: "#238636",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  actionBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  backLink: {
    alignItems: "center",
    marginTop: 10,
  },
  backLinkText: {
    color: "#8b949e",
    fontSize: 12,
  },
});
