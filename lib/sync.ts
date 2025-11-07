// import { database, ID, Query } from "@/appwrite";
// import { getLocal, setLocal } from "./storage";

// const DATABASE_ID = "68215d2a00260d43fd49";
// const STOCK_COLLECTION_ID = "68215de900192d30006e";
// const SALE_COLLECTION_ID = "68215e09000dab34a3e5";
// const RETURN_COLLECTION_ID = "returns";
// const COMPANY_COLLECTION_ID = "companyprofile";

// // Helper to add timestamp safely
// function nowISO() {
//   return new Date().toISOString();
// }

// // ---- 1️⃣ Upload Unsynced Local Data → Cloud ----
// async function uploadUnsynced(
//   arr: any[],
//   coll: string,
//   key: string,
//   userId: string
// ) {
//   const updatedArr: any[] = [];

//   for (const item of arr) {
//     try {
//       // Only upload items belonging to guest or not yet synced
//       if (item.userId === "guest" || !item.synced) {
//         const { id, ...data } = item;

//         const res = await database.createDocument(DATABASE_ID, coll, ID.unique(), {
//           ...data,
//           userId,
//           syncedAt: nowISO(),
//           synced: true,
//         });

//         updatedArr.push({
//           ...item,
//           id: res.$id,
//           userId,
//           synced: true,
//           syncedAt: nowISO(),
//         });
//       } else {
//         updatedArr.push(item);
//       }
//     } catch (error) {
//       console.error(`❌ Upload failed (${coll})`, error);
//       updatedArr.push({ ...item, synced: false });
//     }
//   }

//   // Save updated local data
//   await setLocal(key, updatedArr);
//   console.log(`✅ Uploaded & updated local: ${key}`);
// }

// // ---- 2️⃣ Download Cloud Data → Local (merge, no duplicates) ----
// async function downloadCloudData(
//   coll: string,
//   key: string,
//   userId: string
// ) {
//   const localData = await getLocal<any>(key);
//   const res = await database.listDocuments(DATABASE_ID, coll, [
//     Query.equal("userId", userId),
//     Query.orderDesc("$createdAt"),
//   ]);

//   const cloudDocs = res.documents.map((doc) => ({
//     id: doc.$id,
//     ...doc,
//     synced: true,
//   }));

//   // Merge logic: keep unique IDs, prefer cloud if newer
//   const merged = [
//     ...cloudDocs,
//     ...localData.filter(
//       (localItem: any) => !cloudDocs.some((cloud) => cloud.id === localItem.id)
//     ),
//   ];

//   await setLocal(key, merged);
//   console.log(`✅ Synced from cloud → local: ${key}`);
// }

// // ---- 3️⃣ Master Function: Full Sync ----
// export async function syncAllData(userId: string) {
//   console.log("🔄 Starting full two-way sync...");

//   const stock = await getLocal("stock");
//   const sales = await getLocal("sales");
//   const returns = await getLocal("returns");
//   const profiles = await getLocal("companyprofile");

//   // Upload unsynced (guest) → cloud
//   await uploadUnsynced(stock, STOCK_COLLECTION_ID, "stock", userId);
//   await uploadUnsynced(sales, SALE_COLLECTION_ID, "sales", userId);
//   await uploadUnsynced(returns, RETURN_COLLECTION_ID, "returns", userId);
//   await uploadUnsynced(profiles, COMPANY_COLLECTION_ID, "companyprofile", userId);

//   // Download latest from cloud → local
//   await downloadCloudData(STOCK_COLLECTION_ID, "stock", userId);
//   await downloadCloudData(SALE_COLLECTION_ID, "sales", userId);
//   await downloadCloudData(RETURN_COLLECTION_ID, "returns", userId);
//   await downloadCloudData(COMPANY_COLLECTION_ID, "companyprofile", userId);

//   console.log("✅ Full sync complete!");
// }

import { database, ID, Query, storage } from "@/appwrite";
import * as FileSystem from "expo-file-system";
import { getLocal, setLocal } from "./storage";


const DATABASE_ID = "68215d2a00260d43fd49";
const STOCK_COLLECTION_ID = "68215de900192d30006e";
const SALE_COLLECTION_ID = "68215e09000dab34a3e5";
const RETURN_COLLECTION_ID = "returns";
const COMPANY_COLLECTION_ID = "companyprofile";
const LOGO_BUCKET_ID = "68215d59001c82087763"; // ✅ create this in Appwrite Storage

function nowISO() {
  return new Date().toISOString();  
}

// ---- 1️⃣ Upload Unsynced Local Data → Cloud ----

export async function uploadUnsynced(
  arr: any[],
  coll: string,
  key: string,
  userId: string
) {
  const updatedArr: any[] = [];

  for (const item of arr) {
    try {
      if (item.userId === "guest" || !item.synced) {
        const { id, logoLocal, ...data } = item; // ❌ exclude logoLocal from cloud payload
        let logoCloud = data.logoCloud;

        // 🖼️ Upload company logo only if not uploaded yet
        if (coll === COMPANY_COLLECTION_ID && logoLocal) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(logoLocal);
            if (fileInfo.exists) {
              const fileBlob = await fetch(logoLocal).then((r) => r.blob());
              const uploadRes = await storage.createFile(
                LOGO_BUCKET_ID,
                ID.unique(),
                fileBlob as any
              );
              logoCloud = uploadRes.$id;
              console.log("✅ Logo uploaded:", logoCloud);
              console.log("⬆️ Uploading logo via FileSystem.uploadAsync:", logoLocal);

              // Generate a unique file ID (Appwrite expects file param name "file")
              const fileId = ID.unique();

              // Upload directly to Appwrite storage endpoint
              const response = await FileSystem.uploadAsync(
                `${storage.client.config.endpoint}/storage/buckets/${LOGO_BUCKET_ID}/files`,
                logoLocal,
                {
                  httpMethod: "POST",
                  uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                  fieldName: "file", // Appwrite expects "file"
                  parameters: { fileId }, // optional metadata
                  headers: {
                    "X-Appwrite-Project": "68215c9f00161f204345",
                  },
                }
              );

              const json = JSON.parse(response.body);
              logoCloud = json.$id || json.$fileId;
              console.log("✅ Logo uploaded successfully:", logoCloud);

            } else if (!fileInfo.exists) {
              console.warn("⚠️ Local logo file not found:", logoLocal);
            }
          } catch (err) {
            console.warn("⚠️ Logo upload failed:", err);
          }
        }

        // 🧩 Ensure any date fields are valid ISO strings before upload
        if (data.date && typeof data.date === "string") {
          const d = new Date(data.date);
          if (isNaN(d.getTime())) {
            // fallback if it's localized or unparsable
            const parts = data.date.split("/");
            if (parts.length === 3) {
              const [day, month, year] = parts.map(Number);
              data.date = new Date(year, month - 1, day).toISOString();
            } else {
              data.date = new Date().toISOString(); // fallback to now
            }
          } else {
            data.date = d.toISOString();
          }
        }

        // ✅ Create or update document on Appwrite (without logoLocal)
        const res = await database.createDocument(DATABASE_ID, coll, ID.unique(), {
          ...data,
          logoCloud,
          userId,
          syncedAt: nowISO(),
          synced: true,
        });

        // ✅ Update local version (keep logoLocal)
        updatedArr.push({
          ...item,
          id: res.$id,
          userId,
          logoCloud,
          synced: true,
          syncedAt: nowISO(),
          date: item.date, // ✅ preserve original sale/record date
        });
      } else {
        updatedArr.push(item);
      }
    } catch (error) {
      console.error(`❌ Upload failed (${coll})`, error);
      updatedArr.push({ ...item, synced: false });
    }
  }

  await setLocal(key, updatedArr);
  console.log(`✅ Uploaded & updated local: ${key}`);
}

// ---- 2️⃣ Download Cloud Data → Local ----
// async function downloadCloudData(
//   coll: string,
//   key: string,
//   userId: string
// ) {
//   const localData = await getLocal<any>(key);
//   const res = await database.listDocuments(DATABASE_ID, coll, [
//     Query.equal("userId", userId),
//     Query.orderDesc("$createdAt"),
//   ]);

//   const cloudDocs = res.documents.map((doc) => ({
//     id: doc.$id,
//     ...doc,
//     synced: true,
//   }));

//   const merged = [
//     ...cloudDocs,
//     ...localData.filter(
//       (localItem: any) => !cloudDocs.some((cloud) => cloud.id === localItem.id)
//     ),
//   ];

//   await setLocal(key, merged);
//   console.log(`✅ Synced from cloud → local: ${key}`);
// }

// helper to get Appwrite logo preview URL


// helper to get Appwrite logo preview URL
function getLogoPreviewUrl(fileId?: string) {
  if (!fileId) return null;
  return storage.getFilePreview(LOGO_BUCKET_ID, fileId);
}

export async function downloadCloudData(
  coll: string,
  key: string,
  userId: string
) {
  const localData = await getLocal<any>(key);

  const res = await database.listDocuments(DATABASE_ID, coll, [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ]);

  // 🧩 Convert Appwrite docs to local objects
  const cloudDocs = res.documents.map((doc) => {
    const mapped: any = {
      id: doc.$id,
      ...doc,
      synced: true,
    };

    // 🖼️ Special handling for companyprofile logos
    if (coll === COMPANY_COLLECTION_ID) {
      const logoCloud = doc.logoCloud || null;
      mapped.logoCloud = logoCloud;

      // ⚙️ Only fill logoLocal with cloud preview if we don't already have a local file path
      const localMatch = localData.find(
        (localItem: any) => localItem.id === doc.$id
      );
      mapped.logoLocal =
        localMatch?.logoLocal ||
        (logoCloud ? getLogoPreviewUrl(logoCloud) : null);
    }

    return mapped;
  });

  // 🧠 Merge cloud + local data (keep unique IDs, prefer cloud)
  const merged = [
    ...cloudDocs,
    ...localData.filter(
      (localItem: any) => !cloudDocs.some((cloud) => cloud.id === localItem.id)
    ),
  ];

  await setLocal(key, merged);
  console.log(`✅ Synced from cloud → local: ${key}`);
}

// ---- 3️⃣ Master Function: Full Sync ----
export async function syncAllData(userId: string) {
  console.log("🔄 Starting full two-way sync...");

  const stock = await getLocal("stock");
  const sales = await getLocal("sales");
  const returns = await getLocal("returns");
  const profiles = await getLocal("companyprofile");

  await uploadUnsynced(stock, STOCK_COLLECTION_ID, "stock", userId);
  await uploadUnsynced(sales, SALE_COLLECTION_ID, "sales", userId);
  await uploadUnsynced(returns, RETURN_COLLECTION_ID, "returns", userId);
  await uploadUnsynced(profiles, COMPANY_COLLECTION_ID, "companyprofile", userId);

  await downloadCloudData(STOCK_COLLECTION_ID, "stock", userId);
  await downloadCloudData(SALE_COLLECTION_ID, "sales", userId);
  await downloadCloudData(RETURN_COLLECTION_ID, "returns", userId);
  await downloadCloudData(COMPANY_COLLECTION_ID, "companyprofile", userId);

  console.log("✅ Full sync complete!");
}
