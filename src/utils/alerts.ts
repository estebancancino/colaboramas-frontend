import { Alert, Platform } from "react-native";

// Alert.alert no hace nada en web: ahí se usa window.alert / window.confirm.

export const showAlert = (title: string, message?: string, onClose?: () => void) => {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    onClose?.();
    return;
  }
  Alert.alert(title, message, [{ text: "OK", onPress: onClose }], {
    cancelable: true,
    onDismiss: onClose,
  });
};

export const confirmAction = (
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
  onConfirm: () => void,
  destructive = false
) => {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    { text: confirmLabel, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
};
