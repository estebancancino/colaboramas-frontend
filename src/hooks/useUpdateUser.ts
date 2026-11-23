// src/hooks/useUpdateUser.ts
import api from "../../client";
import { useUser } from "./useUser";
import { buildImageFormData } from "../utils/imageUpload";

export const useUpdateUser = () => {
  const { user } = useUser();

  const updateUser = async (data: any) => {
    if (!user) throw new Error("No user logged");

    const response = await api.put(`/users/update`, {
      id: user.id,
      ...data,
    });

    return response.data;
  };

  const uploadProfileImage = async (imageAsset: any) => {
    if (!user) throw new Error("No user logged");

    const formData = await buildImageFormData(
      imageAsset.uri,
      imageAsset.fileName || `profile_${user.id}.jpg`,
      imageAsset.mimeType
    );

    const response = await api.post(
      `/users/upload-image/${user.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; // backend returns String (imageUrl)
  };

  return {
    updateUser,
    uploadProfileImage,
  };
};
