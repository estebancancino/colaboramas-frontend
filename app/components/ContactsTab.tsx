import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { lightTheme } from "../../theme";
import { useContacts } from "../../src/hooks/useContact";
import { useUser } from "../../src/hooks/useUser";
import { useTranslation } from "react-i18next";
import { confirmAction, showAlert } from "../../src/utils/alerts";

interface Props {
  type: "recibidas" | "enviadas" | "contestadas";
}

const DEFAULT_AVATAR = "https://i.ibb.co/Y3N0wbh/default-avatar.png";
const ACCEPT_COLOR = "#82A50B";
const REJECT_COLOR = "#E91E63";

export default function ContactsTab({ type }: Props) {
  const { t } = useTranslation();
  const { user: me } = useUser();
  const {
    receivedMessages,
    sentMessages,
    repliedMessages,
    respondToMessage,
    reportUser,
  } = useContacts();
  // Evita responder dos veces la misma solicitud mientras la petición está en curso
  const [busyId, setBusyId] = useState<string | null>(null);

  const data =
    type === "recibidas"
      ? receivedMessages
      : type === "enviadas"
      ? sentMessages
      : repliedMessages;

  if (data.length === 0) {
    return (
      <Text className="text-center mt-5" style={{ color: "#666" }}>
        {t("contacts.empty", { type: t(`contacts.tabs.${type}`) })}
      </Text>
    );
  }

  const respond = (c: any, name: string, accepted: boolean) => {
    const run = async () => {
      setBusyId(c.id);
      try {
        await respondToMessage(c.id, accepted);
      } catch {
        showAlert(t("profile.error"), t("contacts.confirm.respondError"));
      } finally {
        setBusyId(null);
      }
    };
    confirmAction(
      t(accepted ? "contacts.confirm.acceptTitle" : "contacts.confirm.rejectTitle"),
      t(accepted ? "contacts.confirm.acceptBody" : "contacts.confirm.rejectBody", { name }),
      t(accepted ? "contacts.actions.accept" : "contacts.actions.reject"),
      t("contacts.confirm.cancel"),
      run,
      !accepted
    );
  };

  const report = (userId: number, name: string) => {
    confirmAction(
      t("contacts.confirm.reportTitle"),
      t("contacts.confirm.reportBody", { name }),
      t("contacts.actions.report"),
      t("contacts.confirm.cancel"),
      async () => {
        const ok = await reportUser(userId);
        showAlert(
          t("contacts.actions.report"),
          t(ok ? "contacts.confirm.reportDone" : "contacts.confirm.reportError")
        );
      },
      true
    );
  };

  return (
    <View className="rounded-xl flex-col w-full space-y-2 max-w-[375px] mx-auto">
      {data.map((c) => {
        // La otra persona de la solicitud: en "contestadas" hay recibidas y enviadas mezcladas
        const iAmSender = me?.id != null && Number(c.fromUserId) === Number(me.id);
        const user = (type === "recibidas" || (type === "contestadas" && !iAmSender)
          ? c.fromUser
          : c.toUser) ?? {};
        const accepted = c.status === "accepted";
        const busy = busyId === c.id;

        // Quien respondió ve "La aceptaste/rechazaste"; quien envió ve "Aceptada/Rechazada"
        const statusLabel = iAmSender
          ? t(accepted ? "contacts.status.accepted" : "contacts.status.rejected")
          : t(accepted ? "contacts.status.youAccepted" : "contacts.status.youRejected");

        return (
          <LinearGradient
            key={c.id}
            colors={[lightTheme.colors["primary-pink"], lightTheme.colors["primary-purple"]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-lg p-1"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <View className="rounded-lg p-4 bg-transparent space-y-2">
              {/* USER HEADER */}
              <View className="flex-row items-center space-x-3">
                <Image
                  source={{ uri: user.imageUrl || DEFAULT_AVATAR }}
                  className="w-10 h-10 rounded-full"
                />
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">{user.username}</Text>
                  <Text className="text-white text-sm">{user.email}</Text>
                </View>
              </View>

              {/* MESSAGE */}
              {c.subject ? (
                <Text className="text-white font-semibold">{c.subject}</Text>
              ) : null}
              <Text className="text-white">{c.message}</Text>

              {/* RECIBIDAS: Reportar a la izquierda (separado), Rechazar/Aceptar a la derecha */}
              {type === "recibidas" && (
                <View
                  className="flex-row items-center justify-between mt-2"
                  style={{ opacity: busy ? 0.6 : 1 }}
                >
                  <TouchableOpacity
                    className="rounded-md px-3 py-1"
                    style={{ borderWidth: 1, borderColor: "#fff" }}
                    disabled={busy}
                    onPress={() => report(user.id, user.username)}
                  >
                    <Text className="text-white font-semibold">
                      {t("contacts.actions.report")}
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row" style={{ gap: 8 }}>
                    <TouchableOpacity
                      className="rounded-md px-3 py-1"
                      style={{ backgroundColor: REJECT_COLOR, borderWidth: 1, borderColor: "#fff" }}
                      disabled={busy}
                      onPress={() => respond(c, user.username, false)}
                    >
                      <Text className="text-white font-semibold">
                        {t("contacts.actions.reject")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="rounded-md px-3 py-1"
                      style={{ backgroundColor: ACCEPT_COLOR, borderWidth: 1, borderColor: "#fff" }}
                      disabled={busy}
                      onPress={() => respond(c, user.username, true)}
                    >
                      <Text className="text-white font-semibold">
                        {t("contacts.actions.accept")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ENVIADAS */}
              {type === "enviadas" && (
                <View className="items-end">
                  <View
                    className="rounded-md px-3 py-1"
                    style={{ backgroundColor: lightTheme.colors["orange"] }}
                  >
                    <Text className="text-white font-semibold">
                      {t("contacts.status.pending")}
                    </Text>
                  </View>
                </View>
              )}

              {/* CONTESTADAS: el backend usa "accepted" / "rejected" */}
              {type === "contestadas" && (
                <View className="items-end">
                  <View
                    className="rounded-md px-3 py-1"
                    style={{ backgroundColor: accepted ? ACCEPT_COLOR : REJECT_COLOR }}
                  >
                    <Text className="text-white font-semibold">{statusLabel}</Text>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        );
      })}
    </View>
  );
}
