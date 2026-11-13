import axios from "axios";
import { Platform } from "react-native";

// URL base de la API (incluye el prefijo /api), p. ej. https://colaboramas.example.cl/api.
// Expo la incrusta en el bundle al compilar: definirla en .env (ver .env.example)
// o en las variables de entorno de EAS para los builds.
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

// Respaldo para desarrollo local cuando EXPO_PUBLIC_API_URL no está definida.
// - Android emulator (Android Studio): `10.0.2.2`.
// - Genymotion: `10.0.3.2`.
// - Dispositivo físico: la IP de tu equipo en la red local.
const LOCAL_IP = "172.30.197.106";
const PORT = 8080;

const baseURL =
  ENV_API_URL ||
  (Platform.OS === "web"
    ? `http://localhost:${PORT}/api`
    : `http://${LOCAL_IP}:${PORT}/api`);
console.log("🌐 API BASE URL:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
