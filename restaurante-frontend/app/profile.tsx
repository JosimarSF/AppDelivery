import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  primary: "#FA7F08",
  background: "#F4F4F4",
  card: "#FFFFFF",
  text: "#1E1E1E",
  secondary: "#757575",
  danger: "#D32F2F",
};

export default function ProfileScreen() {
  const { user, token, signOut } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const [fieldName, setFieldName] = useState(user?.name ?? "");
  const [fieldEmail, setFieldEmail] = useState(user?.email ?? "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSaveProfile = async () => {
    try {
      if (!confirmPassword) {
        setMessage("Ingresa tu contraseña actual");
        return;
      }

      const response = await fetch(
        "https://appdelivery-vwmv.onrender.com/api/auth/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: fieldName,
            email: fieldEmail,
            current_password: confirmPassword,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setMessage("Perfil actualizado correctamente");

      setTimeout(() => {
        setEditModalVisible(false);
        setMessage("");
      }, 1200);
    } catch (e: any) {
      setMessage(e.message);
    }
  };

  const openWhatsApp = () => {
    const phone = "922826228";
    const url = `https://wa.me/51${phone}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Ionicons
          name="person-circle-outline"
          size={110}
          color={COLORS.primary}
        />
        <Text style={styles.name}>{user?.name ?? "Usuario"}</Text>
        <Text style={styles.email}>{user?.email ?? "correo@ejemplo.com"}</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setEditModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.primary} />
          <Text style={styles.optionText}>Configuración</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, { borderBottomWidth: 0 }]}
          onPress={openWhatsApp}
        >
          <Ionicons
            name="help-circle-outline"
            size={22}
            color={COLORS.primary}
          />
          <Text style={styles.optionText}>Centro de ayuda</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setLogoutModalVisible(true)}
      >
        <Ionicons name="log-out-outline" size={22} color="#FFF" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* MODAL EDITAR PERFIL */}
      <Modal transparent visible={editModalVisible} animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.modalCardCenter}>
            <Text style={styles.modalTitle}>Editar perfil</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={fieldName}
              onChangeText={setFieldName}
            />

            <Text style={styles.label}>Correo</Text>
            <TextInput
              style={styles.input}
              value={fieldEmail}
              autoCapitalize="none"
              onChangeText={setFieldEmail}
            />

            <Text style={styles.label}>Contraseña actual</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {message !== "" && (
              <Text
                style={{
                  color:
                    message.includes("correctamente") ? "green" : COLORS.danger,
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
            )}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.confirmText}>Guardar cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditModalVisible(false);
                setMessage("");
              }}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL LOGOUT */}
      <Modal transparent visible={logoutModalVisible} animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.logoutCardCenter}>
            <Ionicons name="log-out-outline" size={48} color={COLORS.primary} />

            <Text style={styles.logoutTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.logoutSubtitle}>
              Se cerrará tu cuenta del dispositivo.
            </Text>

            <TouchableOpacity style={styles.logoutConfirm} onPress={signOut}>
              <Text style={styles.logoutConfirmText}>Sí, cerrar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutCancel}
              onPress={() => setLogoutModalVisible(false)}
            >
              <Text style={styles.logoutCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    padding: 20,
  },

  center: { alignItems: "center", marginBottom: 30 },
  name: { fontSize: 22, fontWeight: "bold", color: COLORS.text, marginTop: 10 },
  email: { color: COLORS.secondary, marginBottom: 10 },

  card: {
    width: "90%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignSelf: "center",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  optionText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },

  logoutButton: {
    flexDirection: "row",
    backgroundColor: COLORS.danger,
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "90%",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCardCenter: {
    width: "88%",
    backgroundColor: "#FFF",
    borderRadius: 26,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 14,
    textAlign: "center",
  },

  label: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    marginTop: 6,
    fontSize: 16,
  },

  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 22,
  },
  confirmText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  cancelButton: { paddingVertical: 12, marginTop: 10, alignItems: "center" },
  cancelText: { color: COLORS.secondary, fontSize: 15 },

  logoutCardCenter: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 26,
    padding: 26,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  logoutTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 12,
    color: COLORS.text,
  },

  logoutSubtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 6,
    textAlign: "center",
    marginBottom: 22,
  },

  logoutConfirm: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  logoutConfirmText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },

  logoutCancel: {
    paddingVertical: 14,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
  },
  logoutCancelText: {
    color: COLORS.secondary,
    fontWeight: "500",
    fontSize: 15,
  },
});
