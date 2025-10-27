import { ID, Query } from 'appwrite';
import { database } from '../appwrite';
import { getUser } from './auth';

const DATABASE_ID = '68215d2a00260d43fd49'; // ✅ replace with your real Appwrite DB ID
const COMPANY_COLLECTION_ID = 'company_profile'; // ✅ create a collection in Appwrite called this (or rename)

/**
 * Type for company profile
 */
export type CompanyProfile = {
  companyName: string;
  address: string;
  phoneNumber: string;
  logoUri?: string;
  userId: string; // link profile to Appwrite user
};

/**
 * Get current user's profile
 */
export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  try {
    const user = await getUser();
    if (!user) return null;

    const response = await database.listDocuments(DATABASE_ID, COMPANY_COLLECTION_ID, [
      Query.equal('userId', user.$id),
      Query.limit(1),
    ]);

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as CompanyProfile;
    }

    return null;
  } catch (err: any) {
    console.error('❌ Error fetching company profile:', err.message);
    return null;
  }
}

/**
 * Save or update company profile
 */
export async function saveCompanyProfile(profile: Omit<CompanyProfile, 'userId'>): Promise<CompanyProfile | null> {
  try {
    const user = await getUser();
    if (!user) throw new Error('User not logged in');

    // check if profile exists
    const existing = await database.listDocuments(DATABASE_ID, COMPANY_COLLECTION_ID, [
      Query.equal('userId', user.$id),
      Query.limit(1),
    ]);

    if (existing.documents.length > 0) {
      // ✅ Update existing profile
      const updated = await database.updateDocument(
        DATABASE_ID,
        COMPANY_COLLECTION_ID,
        existing.documents[0].$id,
        {
          ...profile,
          userId: user.$id,
        }
      );
      return updated as unknown as CompanyProfile;
    } else {
      // ✅ Create new profile
      const created = await database.createDocument(
        DATABASE_ID,
        COMPANY_COLLECTION_ID,
        ID.unique(),
        {
          ...profile,
          userId: user.$id,
        }
      );
      return created as unknown as CompanyProfile;
    }
  } catch (err: any) {
    console.error('❌ Error saving company profile:', err.message);
    return null;
  }
}
