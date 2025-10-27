import { storage } from "@/appwrite";
import * as FileSystem from "expo-file-system";

const BUCKET_ID = "68215d59001c82087763";

export function getLogoUri(profile: any) {
  if (profile?.logoLocal) return profile.logoLocal; // prefer local file
  if (profile?.logoCloud)
    return storage.getFilePreview(BUCKET_ID, profile.logoCloud); // fallback from Appwrite
  return null;
}

export async function getInvoiceLogoUri(profile: any): Promise<string | null> {
  try {
    if (profile?.logoLocal?.startsWith("file://")) {
      // ✅ Convert local file to Base64 so <img> can display it in HTML
      const base64 = await FileSystem.readAsStringAsync(profile.logoLocal, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/png;base64,${base64}`;
    }

    if (profile?.logoCloud) {
      // ✅ Use Appwrite CDN preview for cloud-stored logo
      return storage.getFilePreview(BUCKET_ID, profile.logoCloud);
    }

    return null;
  } catch (err) {
    console.warn("⚠️ Could not load logo for invoice:", err);
    return null;
  }
}