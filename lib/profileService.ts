import { database, ID, Query } from "@/appwrite";

const DATABASE_ID = "68215d2a00260d43fd49";
const BUSINESS_PROFILES_COLLECTION_ID = "68215d2a9b1c8e5c0b3e";

export type BusinessProfile = {
  // Appwrite system fields
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;

  // Ownership and sync
  userId: string;
  synced: boolean;
  syncedAt?: string | null;

  // Company details
  companyName: string;
  companyEmail?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  website?: string | null;

  businessType: string;
  country: string;
  region: string;

  // Logo fields
  logo?: string | null;
  logoLocal?: string | null;
  logoCloud?: string | null;

  // Locale and currency
  locale: string;
  currencyCode: string;
  currencySymbol: string;

  // Tax settings
  taxRegistrationNumber?: string | null;
  isCustomCountry: boolean;
  taxEnabled: boolean;
  taxLabel: string;
  defaultTaxRate: number;
  pricesIncludeTax: boolean;

  // Bank details
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankSortCode?: string | null;
  bankIban?: string | null;
  bankSwiftCode?: string | null;

  // Invoice defaults
  defaultPaymentTerms?: string | null;
  defaultInvoiceNotes?: string | null;
  defaultPaymentInstructions?: string | null;
  defaultTermsAndConditions?: string | null;
  invoiceFooterMessage?: string | null;
};

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  userId: "",

  synced: false,
  syncedAt: null,

  companyName: "",
  companyEmail: null,
  phoneNumber: null,
  address: null,
  website: null,

  businessType: "",
  country: "",
  region: "",

  logo: null,
  logoLocal: null,
  logoCloud: null,

  locale: "en-GB",
  currencyCode: "GBP",
  currencySymbol: "£",

  taxRegistrationNumber: null,
  isCustomCountry: false,
  taxEnabled: false,
  taxLabel: "VAT",
  defaultTaxRate: 20,
  pricesIncludeTax: false,

  bankName: null,
  bankAccountName: null,
  bankAccountNumber: null,
  bankSortCode: null,
  bankIban: null,
  bankSwiftCode: null,

  defaultPaymentTerms: null,
  defaultInvoiceNotes: null,
  defaultPaymentInstructions: null,
  defaultTermsAndConditions: null,
  invoiceFooterMessage: "Thank you for your business.",
};

export async function getBusinessProfile(userId: string) {
  const res = await database.listDocuments(
    DATABASE_ID,
    BUSINESS_PROFILES_COLLECTION_ID,
    [Query.equal("userId", userId)]
  );

  return res.documents[0] as unknown as BusinessProfile
}

export async function createBusinessProfile(profile: BusinessProfile) {
  return await database.createDocument(
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
  return await database.updateDocument(
    DATABASE_ID,
    BUSINESS_PROFILES_COLLECTION_ID,
    profileId,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    }
  );
}