import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { COLORS } from "../constants/colors";

export default function ActionSheetModal({ visible, title, message, actions = [], onClose }) {
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
            <View style={styles.sheet}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={action.label}
                  style={[
                    styles.actionBtn,
                    index < actions.length - 1 && styles.actionBorder,
                  ]}
                  onPress={() => {
                    action.onPress?.();
                    if (!action.keepOpen) onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.actionText,
                      action.destructive && styles.destructiveText,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
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
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: 32,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  message: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  actionBtn: {
    paddingVertical: 16,
    alignItems: "center",
  },
  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  destructiveText: {
    color: "#E53935",
  },
  cancelBtn: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
});
