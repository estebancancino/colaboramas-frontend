import { useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { useCompleteProfile } from "./useCompleteProfile";
import { useUser } from "./useUser";
import countries from "../data/countries.json";
import researchFields from "../data/research_fields.json";
import interests from "../data/interest.json";
import { getLocationCoords } from "../utils/locationUtils";
import { getHomeRoute } from "../utils/roles";

export const useProfileEdit = () => {
  const { completeProfile } = useCompleteProfile();
  const { user } = useUser();
  const router = useRouter();
  const cityCache = useRef({});

  const [formData, setFormData] = useState({
    profileImage: "",
    pais: "",
    ciudad: "",
    motivaciones: "",
    actividadesPersonales: "",
    proyectosRecientes: "",
    aceptaTerminos: false,
    latitude: null as number | null,
    longitude: null as number | null,
    camposInvestigacion: [] as string[],
    lineasInteres: [] as string[],
    historialEducativo: [
      { institucion: "", titulo: "" },
    ] as Array<{ institucion: string; titulo: string }>,
  });

  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "pais") {
        if (value) {
          if (cityCache.current[value]) {
            setFilteredCities(cityCache.current[value]);
          } else {
            const cities = countries[value] || [];
            cityCache.current[value] = cities;
            setFilteredCities(cities);
          }
        } else {
          setFilteredCities([]);
        }

        return { ...newData, ciudad: "" };
      }

      return newData;
    });
  };

  const pickImage = async () => {
    // expo-image-picker funciona también en web (abre el selector de archivos).
    try {
      const ImagePicker = await import("expo-image-picker");
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permiso requerido", "Debes permitir acceso a la galería.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        aspect: [1, 1],
        allowsEditing: true,
        quality: 0.8,
      });

      // result.canceled (new) or result.cancelled (older) handling
      const canceled = (result as any).canceled ?? (result as any).cancelled ?? false;
      const assets = (result as any).assets ?? (result as any).selected ?? null;

      if (!canceled && assets && assets.length > 0) {
        handleChange("profileImage", assets[0].uri);
      }
    } catch (err) {
      console.warn("expo-image-picker not available:", err);
      Alert.alert("Error", "No se pudo abrir el selector de imágenes.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.aceptaTerminos) {
      Alert.alert("Atención", "Debes aceptar los términos y condiciones.");
      return;
    }

    if (formData.camposInvestigacion.length === 0 && formData.lineasInteres.length === 0) {
      Alert.alert("Atención", "Debes seleccionar al menos un campo de investigación o línea de interés.");
      return;
    }

    try {
      // Fetch location from device GPS or geocode from city/country
      const locationCoords = await getLocationCoords(
        formData.ciudad,
        formData.pais
      );

      // Build keywords array from selected fields and interests
      const keywords = [
        ...formData.camposInvestigacion.map((field) => ({
          name: field,
          type: "CAMPO_INVESTIGACION",
        })),
        ...formData.lineasInteres.map((interest) => ({
          name: interest,
          type: "LINEA_INTERES",
        })),
      ];

      // Build profile data in the expected format
      const profileData = {
        // URI local de la foto elegida; completeProfile la sube antes de guardar el perfil
        profileImage: formData.profileImage || undefined,
        pais: formData.pais,
        ciudad: formData.ciudad,
        latitud: locationCoords?.latitude ?? null,
        longitud: locationCoords?.longitude ?? null,
        motivaciones: formData.motivaciones,
        actividadesPersonales: formData.actividadesPersonales,
        proyectosRecientes: formData.proyectosRecientes,
        historialEducativo: formData.historialEducativo.filter(
          (edu) => edu.institucion && edu.titulo
        ),
        keywords,
      };

      const updatedUser = await completeProfile(user.id, profileData);

      await AsyncStorage.setItem("auth_user", JSON.stringify(updatedUser));

      router.replace(getHomeRoute(updatedUser.roles));
      Alert.alert("Éxito", "Perfil guardado correctamente.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo guardar el perfil.");
    }
  };

  const addEducationEntry = () => {
    setFormData((prev) => ({
      ...prev,
      historialEducativo: [
        ...prev.historialEducativo,
        { institucion: "", titulo: "" },
      ],
    }));
  };

  const removeEducationEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      historialEducativo: prev.historialEducativo.filter((_, i) => i !== index),
    }));
  };

  const updateEducationEntry = (
    index: number,
    field: "institucion" | "titulo",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      historialEducativo: prev.historialEducativo.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  // Convertir countries object a array para el Picker
  const countryOptions = Object.keys(countries).map((country) => ({
    label: country,
    value: country,
  }));

  const researchFieldsList = researchFields.research_fields;
  const interestsList = interests.interests;

  return {
    formData,
    setFormData,
    handleChange,
    pickImage,
    handleSubmit,
    addEducationEntry,
    removeEducationEntry,
    updateEducationEntry,
    countries: countryOptions,
    filteredCities,
    researchFieldsList,
    interestsList,
  };
};
