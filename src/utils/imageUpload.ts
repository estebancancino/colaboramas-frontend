import { Platform } from "react-native";

// Arma el FormData con el campo "file" que espera POST /users/upload-image/{userId}.
// En web el FormData necesita un File real (la URI del selector es blob: o data:);
// en nativo React Native acepta el objeto { uri, name, type }.
export const buildImageFormData = async (
  uri: string,
  name: string,
  mimeType?: string | null
): Promise<FormData> => {
  const form = new FormData();
  const type = mimeType || "image/jpeg";

  if (Platform.OS === "web") {
    const blob = await fetch(uri).then((r) => r.blob());
    form.append("file", new File([blob], name, { type: blob.type || type }));
  } else {
    form.append("file", { uri, name, type } as any);
  }

  return form;
};
