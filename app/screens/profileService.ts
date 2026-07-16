import { database, ID, Query } from "@/appwrite";

const DATABASE_ID = "68215d2a00260d43fd49";
const BUSINESS_PROFILES_COLLECTION_ID = "68215d2a9b1c8e5c0b3e";

export type BusinessProfile = {
  $id?: string;
  userId: string;
  companyName: string;
  businessType: string;
  country: string;
  region: string;
  currencyCode: string;
  currencySymbol: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function getBusinessProfile(userId: string) {
  const res = await database.listDocuments(
    ID,
    BUSINESS_PROFILES_COLLECTION_ID,
    [Query.equal("userId", userId)]
  );

  return res.documents[0] as BusinessProfile | undefined;
}

export async function createBusinessProfile(profile: BusinessProfile) {
  return await databases.createDocument(
    DATABASE_ID,
    BUSINESS_PROFILES_COLLECTION_ID,
    ID.unique(),
    {
      ...profile,
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function updateBusinessProfile(profileId: string, data: Partial<BusinessProfile>) {
  return await databases.updateDocument(
    DATABASE_ID,
    BUSINESS_PROFILES_COLLECTION_ID,
    profileId,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    }
  );
}