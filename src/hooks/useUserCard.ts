// src/hooks/useUserCard.ts
import { useContext, useEffect, useMemo, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../client";
import { UserCardDTO } from "../models/userCard.dto";
import { userAdapter } from "../adapters/user.adapter";
import { ContactsContext } from "../providers/ContactsProvider";

export const useUserCard = () => {
  const [users, setUsers] = useState<UserCardDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cache = useRef<UserCardDTO[] | null>(null);

  const getUsers = async () => {
    try {
      setLoading(true);

      if (cache.current) {
        setUsers(cache.current);
        setLoading(false);
        return;
      }

      const cachedStorage = await AsyncStorage.getItem("cached_users");
      if (cachedStorage) {
        const parsed = JSON.parse(cachedStorage) as UserCardDTO[];
        cache.current = parsed;
        setUsers(parsed);
      }

      const response = await api.get<UserCardDTO[]>("/search/recommendations");
      const mapped = response.data.map(userAdapter.fromCardDto);

      setUsers(mapped);
      cache.current = mapped;
      await AsyncStorage.setItem("cached_users", JSON.stringify(mapped));

    } catch (err: any) {
      setError(err.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  // El backend ordena por relevancia según el perfil del usuario autenticado y
  // no recibe texto de búsqueda; el filtrado por texto se hace en el cliente.
  const getUsersByRelevance = async () => {
    try {
      setLoading(true);
      const response = await api.get<UserCardDTO[]>("/search/recommendations/by-relevance");
      const mapped = response.data.map(userAdapter.fromCardDto);

      setUsers(mapped);
      cache.current = mapped; 
      await AsyncStorage.setItem("cached_users", JSON.stringify(mapped));

    } catch (err: any) {
      setError(err.message || "Error fetching users by relevance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Quita a quienes ya tienen una solicitud con el usuario (enviada, recibida o respondida):
  // el backend no permite repetirla, así que no se ofrece "Contactar" otra vez.
  const contacts = useContext(ContactsContext) as { contactedUserIds?: Set<number> } | undefined;
  const contactedUserIds = contacts?.contactedUserIds;
  const visibleUsers = useMemo(
    () =>
      contactedUserIds && contactedUserIds.size > 0
        ? users.filter((u) => !contactedUserIds.has(Number(u.id)))
        : users,
    [users, contactedUserIds]
  );

  return { users: visibleUsers, loading, error, refresh: getUsers, getUsersByRelevance };
};
