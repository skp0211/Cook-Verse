import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { COLORS } from "../constants/colors";

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelText}>{cancelLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, destructive && styles.destructiveBtn]}
                  onPress={() => {
                    onClose();
                    onConfirm?.();
                  }}
                >
                  <Text style={[styles.confirmText, destructive && styles.destructiveText]}>
                    {confirmLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  destructiveBtn: {
    backgroundColor: "#FFEBEE",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
  destructiveText: {
    color: "#E53935",
  },
});
