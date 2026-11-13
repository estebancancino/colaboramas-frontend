import api from "../../client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../hooks/useUser";
import { buildImageFormData } from "../utils/imageUpload";

const AUTHUSER = "auth_user";

export const useCompleteProfile = () => {
  const { setUser } = useUser();
const uploadProfileImage = async (userId: number, imageUri: string) => {
  const form = await buildImageFormData(imageUri, `profile_${userId}.jpg`);

  const response = await api.post(`/users/upload-image/${userId}`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


  const completeProfile = async (userId: number, formData: any) => {
    try {
      let imageUrl = null;

      if (formData.profileImage) {
        imageUrl = await uploadProfileImage(userId, formData.profileImage);
      }

      const submitData = { ...formData };
      delete submitData.profileImage;

      if (imageUrl) {
        submitData.profileImageUrl = imageUrl;
      }

      await api.put(`/profiles/${userId}`, submitData);

      const userResponse = await api.get("/auth/me");
      const updatedUser = userResponse.data;

      setUser(updatedUser);
      await AsyncStorage.setItem(AUTHUSER, JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error: any) {
      console.error(
        "Error al completar perfil:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  return { completeProfile };
};
