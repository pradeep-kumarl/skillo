import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Linking,
} from "react-native";

interface SosModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SosModal({ visible, onClose }: SosModalProps) {
  const dialEmergency = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.icon}>🚨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>AWS Bharat Builds • SOS</Text>
                <Text style={styles.subtitle}>National Emergency Dispatch Hotline</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.infoText}>
            Direct 1-tap connection to government emergency services with priority routing.
          </Text>

          {/* Emergency Service 1: POLICE */}
          <TouchableOpacity
            style={styles.actionBtnPolice}
            onPress={() => dialEmergency("112")}
          >
            <Text style={styles.btnIcon}>👮</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.btnTitle}>Police Control Room (PCR)</Text>
              <Text style={styles.btnSub}>National Emergency Number: 112 / 100</Text>
            </View>
            <View style={styles.callBadge}>
              <Text style={styles.callBadgeText}>CALL 112 📞</Text>
            </View>
          </TouchableOpacity>

          {/* Emergency Service 2: AMBULANCE */}
          <TouchableOpacity
            style={styles.actionBtnAmbulance}
            onPress={() => dialEmergency("108")}
          >
            <Text style={styles.btnIcon}>🚑</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.btnTitle}>Medical Emergency Ambulance</Text>
              <Text style={styles.btnSub}>National Ambulance Hotline: 108 / 102</Text>
            </View>
            <View style={styles.callBadge}>
              <Text style={styles.callBadgeText}>CALL 108 📞</Text>
            </View>
          </TouchableOpacity>

          {/* Emergency Service 3: FIRE / DISASTER */}
          <TouchableOpacity
            style={styles.actionBtnFire}
            onPress={() => dialEmergency("101")}
          >
            <Text style={styles.btnIcon}>🚒</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.btnTitle}>Fire & Rescue Department</Text>
              <Text style={styles.btnSub}>Immediate Fire Response: 101</Text>
            </View>
            <View style={styles.callBadge}>
              <Text style={styles.callBadgeText}>CALL 101 📞</Text>
            </View>
          </TouchableOpacity>

          {/* Emergency Service 4: WOMEN & CITIZEN HELPLINE */}
          <TouchableOpacity
            style={styles.actionBtnWomen}
            onPress={() => dialEmergency("1091")}
          >
            <Text style={styles.btnIcon}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.btnTitle}>Women & Citizen Safety</Text>
              <Text style={styles.btnSub}>24x7 Safety Helpline: 1091</Text>
            </View>
            <View style={styles.callBadge}>
              <Text style={styles.callBadgeText}>CALL 1091 📞</Text>
            </View>
          </TouchableOpacity>

          {/* Dismiss */}
          <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
            <Text style={styles.dismissText}>Close Emergency SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e63946",
    padding: 20,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#e63946",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    color: "#ff7b72",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: "#21262d",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  closeText: {
    color: "#8b949e",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoText: {
    color: "#c9d1d9",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtnPolice: {
    backgroundColor: "#1f6feb22",
    borderWidth: 1.5,
    borderColor: "#58a6ff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  actionBtnAmbulance: {
    backgroundColor: "#e6394622",
    borderWidth: 1.5,
    borderColor: "#e63946",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  actionBtnFire: {
    backgroundColor: "#ff990022",
    borderWidth: 1.5,
    borderColor: "#ff9900",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  actionBtnWomen: {
    backgroundColor: "#a371f722",
    borderWidth: 1.5,
    borderColor: "#a371f7",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  btnIcon: {
    fontSize: 24,
  },
  btnTitle: {
    color: "#f0f6fc",
    fontSize: 14,
    fontWeight: "bold",
  },
  btnSub: {
    color: "#8b949e",
    fontSize: 11,
    marginTop: 2,
  },
  callBadge: {
    backgroundColor: "#238636",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  callBadgeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 11,
  },
  dismissBtn: {
    backgroundColor: "#21262d",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  dismissText: {
    color: "#8b949e",
    fontWeight: "bold",
    fontSize: 13,
  },
});
