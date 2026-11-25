import React, { createContext, useEffect, useMemo, useState } from "react";
import api from "../../client";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";

export const ContactsContext = createContext(undefined);

export const ContactsProvider = ({ children }) => {

  const { user } = useUser();
  const { isAuthenticated } = useAuth();
  const userId = user?.id;

  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [repliedMessages, setRepliedMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadMessages = async () => {
    if (!isAuthenticated || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const [sentRes, recRes] = await Promise.all([
        api.get(`/messages/sent/${userId}`),
        api.get(`/messages/received/${userId}`),
      ]);

      const sent = sentRes.data;
      const received = recRes.data;

      setSentMessages(sent.filter((m) => m.status === "pending"));
      setReceivedMessages(received.filter((m) => m.status === "pending"));
      setRepliedMessages([
        ...received.filter((m) => m.status !== "pending"),
        ...sent.filter((m) => m.status !== "pending"),
      ]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Error desconocido"
      );
    } finally {
      setLoading(false);
    }
  };


  /*useRealtimeNotifications(userId, (newMessage) => {
    console.log("Nueva notificación:", newMessage);
    setReceivedMessages((prev) => [newMessage, ...prev]);
  });*/
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadMessages();
    } else {
      setSentMessages([]);
      setReceivedMessages([]);
      setRepliedMessages([]);
    }
  }, [isAuthenticated, userId]);

  // Usuarios con los que ya hay alguna solicitud (en cualquier sentido y estado):
  // se ocultan de las recomendaciones para no ofrecer "Contactar" de nuevo.
  const contactedUserIds = useMemo(() => {
    const ids = new Set<number>();
    for (const m of [...sentMessages, ...receivedMessages, ...repliedMessages]) {
      if (m.fromUserId != null && m.fromUserId !== userId) ids.add(Number(m.fromUserId));
      if (m.toUserId != null && m.toUserId !== userId) ids.add(Number(m.toUserId));
    }
    return ids;
  }, [sentMessages, receivedMessages, repliedMessages, userId]);

  // Los errores se propagan para que la pantalla muestre el motivo (409 duplicado, 429 límite...)
  const sendMessage = async (payload: { toUserId: number; subject: string; message: string }) => {
    if (!isAuthenticated || !userId) throw new Error("Not authenticated");
    await api.post(`/messages/send`, payload);
    await loadMessages(); // actualizar lista enviada
  };

  const respondToMessage = async (id: string, accepted: boolean) => {
    if (!isAuthenticated || !userId) throw new Error("Not authenticated");
    const status = accepted ? "accepted" : "rejected";
    await api.put(`/messages/${id}/respond?status=${status}`);
    await loadMessages(); // actualizar listas
  };

  const reportUser = async (targetUserId: number) => {
    try {
      const res = await api.post(`/users/${targetUserId}/report`);

      return true;
    } catch (err) {
      console.error("Error reporting user:", err);
      return false;
    }
  };

  return (
    <ContactsContext.Provider
      value={{
        sentMessages,
        receivedMessages,
        repliedMessages,
        contactedUserIds,
        notifications,
        setNotifications,
        sendMessage,
        respondToMessage,
        reportUser,
        reloadMessages: loadMessages,
        loading,
        error,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
};
