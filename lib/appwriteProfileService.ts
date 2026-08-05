// lib/appwriteProfileService.ts

import { database } from "@/appwrite";
import type { BusinessProfile } from "@/lib/profileService";
import {
    ID,
    Permission,
    Query,
    Role,
} from "react-native-appwrite";

const DATABASE_ID =
  process.env.EXPO_PUBLIC_DATABASE_ID ||
  "68215d2a00260d43fd49";

const BUSINESS_PROFILES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_BUSINESS_PROFILES_COLLECTION_ID ||
  "68215d2a9b1c8e5c0b3e";

const nowISO = (): string =>
  new Date().toISOString();

const permissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

const cleanString = (
  value?: string | null,
): string => String(value ?? "").trim();

const optionalString = (
  value?: string | null,
): string | null => {
  const cleaned = cleanString(value);
  return cleaned || null;
};

const safeNumber = (
  value: unknown,
  fallback = 0,
): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const safeBoolean = (
  value: unknown,
  fallback = false,
): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === 1) {
    return true;
  }

  if (value === "false" || value === 0) {
    return false;
  }

  return fallback;
};

/**
 * Converts a local BusinessProfile into an Appwrite
 * document payload.
 *
 * Appwrite system fields such as $id, $createdAt and
 * $updatedAt must not be included in document data.
 */
export function businessProfileToDocument(
  profile: BusinessProfile,
  userId: string,
): Record<string, unknown> {
  return {
    userId,

    companyName:
      cleanString(profile.companyName),

    companyEmail:
      optionalString(profile.companyEmail),

    phoneNumber:
      optionalString(profile.phoneNumber),

    address:
      optionalString(profile.address),

    website:
      optionalString(profile.website),

    businessType:
      cleanString(profile.businessType),

    country:
      cleanString(profile.country),

    region:
      cleanString(profile.region),

    locale:
      cleanString(profile.locale) ||
      "en-GB",

    currencyCode:
      cleanString(profile.currencyCode) ||
      "GBP",

    currencySymbol:
      cleanString(profile.currencySymbol) ||
      "£",

    logo:
      optionalString(profile.logo),

    logoLocal:
      optionalString(profile.logoLocal),

    logoCloud:
      optionalString(profile.logoCloud),

    taxRegistrationNumber:
      optionalString(
        profile.taxRegistrationNumber,
      ),

    isCustomCountry:
      Boolean(profile.isCustomCountry),

    taxEnabled:
      Boolean(profile.taxEnabled),

    taxLabel:
      cleanString(profile.taxLabel) ||
      "VAT",

    defaultTaxRate:
      safeNumber(
        profile.defaultTaxRate,
        20,
      ),

    pricesIncludeTax:
      Boolean(profile.pricesIncludeTax),

    bankName:
      optionalString(profile.bankName),

    bankAccountName:
      optionalString(
        profile.bankAccountName,
      ),

    bankAccountNumber:
      optionalString(
        profile.bankAccountNumber,
      ),

    bankSortCode:
      optionalString(
        profile.bankSortCode,
      ),

    bankIban:
      optionalString(profile.bankIban),

    bankSwiftCode:
      optionalString(
        profile.bankSwiftCode,
      ),

    defaultPaymentTerms:
      optionalString(
        profile.defaultPaymentTerms,
      ),

    defaultInvoiceNotes:
      optionalString(
        profile.defaultInvoiceNotes,
      ),

    defaultPaymentInstructions:
      optionalString(
        profile.defaultPaymentInstructions,
      ),

    defaultTermsAndConditions:
      optionalString(
        profile.defaultTermsAndConditions,
      ),

    invoiceFooterMessage:
      optionalString(
        profile.invoiceFooterMessage,
      ) ||
      "Thank you for your business.",

    synced: true,
    syncedAt: nowISO(),
  };
}

/**
 * Converts an Appwrite document into the application's
 * BusinessProfile type.
 */
export function documentToBusinessProfile(
  document: Record<string, any>,
): BusinessProfile {
  return {
    $id: document.$id,
    $createdAt: document.$createdAt,
    $updatedAt: document.$updatedAt,

    userId:
      cleanString(document.userId),

    synced: true,

    syncedAt:
      document.syncedAt ||
      document.$updatedAt ||
      nowISO(),

    companyName:
      cleanString(document.companyName),

    companyEmail:
      document.companyEmail || null,

    phoneNumber:
      document.phoneNumber || null,

    address:
      document.address || null,

    website:
      document.website || null,

    businessType:
      cleanString(document.businessType),

    country:
      cleanString(document.country),

    region:
      cleanString(document.region),

    locale:
      cleanString(document.locale) ||
      "en-GB",

    currencyCode:
      cleanString(document.currencyCode) ||
      "GBP",

    currencySymbol:
      cleanString(document.currencySymbol) ||
      "£",

    logo:
      document.logo || null,

    logoLocal:
      document.logoLocal || null,

    logoCloud:
      document.logoCloud || null,

    taxRegistrationNumber:
      document.taxRegistrationNumber ||
      null,

    isCustomCountry:
      safeBoolean(
        document.isCustomCountry,
        false,
      ),

    taxEnabled:
      safeBoolean(
        document.taxEnabled,
        false,
      ),

    taxLabel:
      cleanString(document.taxLabel) ||
      "VAT",

    defaultTaxRate:
      safeNumber(
        document.defaultTaxRate,
        20,
      ),

    pricesIncludeTax:
      safeBoolean(
        document.pricesIncludeTax,
        false,
      ),

    bankName:
      document.bankName || null,

    bankAccountName:
      document.bankAccountName || null,

    bankAccountNumber:
      document.bankAccountNumber || null,

    bankSortCode:
      document.bankSortCode || null,

    bankIban:
      document.bankIban || null,

    bankSwiftCode:
      document.bankSwiftCode || null,

    defaultPaymentTerms:
      document.defaultPaymentTerms ||
      null,

    defaultInvoiceNotes:
      document.defaultInvoiceNotes ||
      null,

    defaultPaymentInstructions:
      document.defaultPaymentInstructions ||
      null,

    defaultTermsAndConditions:
      document.defaultTermsAndConditions ||
      null,

    invoiceFooterMessage:
      document.invoiceFooterMessage ||
      "Thank you for your business.",
  };
}

/**
 * Finds the first business profile belonging to a user.
 *
 * There should normally be only one profile per user.
 */
export async function getCloudBusinessProfile(
  userId: string,
): Promise<BusinessProfile | null> {
  const normalisedUserId =
    cleanString(userId);

  if (!normalisedUserId) {
    return null;
  }

  const response =
    await database.listDocuments(
      DATABASE_ID,
      BUSINESS_PROFILES_COLLECTION_ID,
      [
        Query.equal(
          "userId",
          normalisedUserId,
        ),
        Query.limit(1),
      ],
    );

  const document =
    response.documents[0];

  if (!document) {
    return null;
  }

  return documentToBusinessProfile(
    document,
  );
}

/**
 * Finds the raw Appwrite profile document.
 */
async function findProfileDocument(
  userId: string,
): Promise<Record<string, any> | null> {
  const normalisedUserId =
    cleanString(userId);

  if (!normalisedUserId) {
    return null;
  }

  const response =
    await database.listDocuments(
      DATABASE_ID,
      BUSINESS_PROFILES_COLLECTION_ID,
      [
        Query.equal(
          "userId",
          normalisedUserId,
        ),
        Query.limit(1),
      ],
    );

  return response.documents[0] || null;
}

/**
 * Creates a new business profile in Appwrite.
 */
export async function createCloudBusinessProfile(
  profile: BusinessProfile,
  userId: string,
): Promise<BusinessProfile> {
  const normalisedUserId =
    cleanString(userId);

  if (!normalisedUserId) {
    throw new Error(
      "A user ID is required to create a business profile.",
    );
  }

  const existing =
    await findProfileDocument(
      normalisedUserId,
    );

  if (existing?.$id) {
    throw new Error(
      "A business profile already exists for this user.",
    );
  }

  const payload =
    businessProfileToDocument(
      {
        ...profile,
        userId: normalisedUserId,
      },
      normalisedUserId,
    );

  const document =
    await database.createDocument(
      DATABASE_ID,
      BUSINESS_PROFILES_COLLECTION_ID,
      ID.unique(),
      payload,
      permissions(normalisedUserId),
    );

  return documentToBusinessProfile(
    document,
  );
}

/**
 * Updates an existing Appwrite business profile.
 */
export async function updateCloudBusinessProfile(
  profileId: string,
  profile: BusinessProfile,
  userId: string,
): Promise<BusinessProfile> {
  const normalisedProfileId =
    cleanString(profileId);

  const normalisedUserId =
    cleanString(userId);

  if (!normalisedProfileId) {
    throw new Error(
      "A profile ID is required.",
    );
  }

  if (!normalisedUserId) {
    throw new Error(
      "A user ID is required.",
    );
  }

  const payload =
    businessProfileToDocument(
      {
        ...profile,
        userId: normalisedUserId,
      },
      normalisedUserId,
    );

  const document =
    await database.updateDocument(
      DATABASE_ID,
      BUSINESS_PROFILES_COLLECTION_ID,
      normalisedProfileId,
      payload,
    );

  return documentToBusinessProfile(
    document,
  );
}

/**
 * Creates or updates the user's business profile.
 */
export async function upsertBusinessProfileToCloud(
  profile: BusinessProfile,
  userId: string,
): Promise<BusinessProfile> {
  const normalisedUserId =
    cleanString(userId);

  if (!normalisedUserId) {
    throw new Error(
      "A user ID is required to sync a business profile.",
    );
  }

  let existing: Record<string, any> | null =
    null;

  /*
   * First try the Appwrite document ID already stored
   * on the profile.
   */
  if (profile.$id) {
    try {
      existing =
        await database.getDocument(
          DATABASE_ID,
          BUSINESS_PROFILES_COLLECTION_ID,
          profile.$id,
        );
    } catch {
      // Continue with userId lookup.
    }
  }

  if (!existing) {
    existing =
      await findProfileDocument(
        normalisedUserId,
      );
  }

  const payload =
    businessProfileToDocument(
      {
        ...profile,
        userId: normalisedUserId,
      },
      normalisedUserId,
    );

  const document = existing?.$id
    ? await database.updateDocument(
        DATABASE_ID,
        BUSINESS_PROFILES_COLLECTION_ID,
        existing.$id,
        payload,
      )
    : await database.createDocument(
        DATABASE_ID,
        BUSINESS_PROFILES_COLLECTION_ID,
        ID.unique(),
        payload,
        permissions(normalisedUserId),
      );

  return documentToBusinessProfile(
    document,
  );
}

/**
 * Downloads the user's business profile from Appwrite.
 */
export async function downloadBusinessProfile(
  userId: string,
): Promise<BusinessProfile | null> {
  return getCloudBusinessProfile(
    userId,
  );
}

/**
 * Uploads a profile only when it has not already been
 * marked as synced.
 */
export async function uploadBusinessProfile(
  profile: BusinessProfile,
  userId: string,
): Promise<BusinessProfile> {
  if (
    profile.synced &&
    profile.$id &&
    profile.userId === userId
  ) {
    return profile;
  }

  return upsertBusinessProfileToCloud(
    {
      ...profile,
      userId,
      synced: false,
    },
    userId,
  );
}

/**
 * Deletes a business profile from Appwrite.
 */
export async function deleteBusinessProfileFromCloud(
  profileId: string,
): Promise<void> {
  const normalisedProfileId =
    cleanString(profileId);

  if (!normalisedProfileId) {
    return;
  }

  await database.deleteDocument(
    DATABASE_ID,
    BUSINESS_PROFILES_COLLECTION_ID,
    normalisedProfileId,
  );
}

/**
 * Deletes the business profile belonging to a user.
 */
export async function deleteBusinessProfileByUserId(
  userId: string,
): Promise<void> {
  const existing =
    await findProfileDocument(userId);

  if (!existing?.$id) {
    return;
  }

  await database.deleteDocument(
    DATABASE_ID,
    BUSINESS_PROFILES_COLLECTION_ID,
    existing.$id,
  );
}