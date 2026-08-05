// lib/appwriteSubscriptionTrialService.ts

import type {
  SubscriptionTrial,
  SubscriptionTrialStatus,
} from "@/types/subscriptionTrial";
import {
  ID,
  Permission,
  Query,
  Role,
} from "react-native-appwrite";
import { database } from "../appwrite";

const DATABASE_ID =
  process.env.EXPO_PUBLIC_DATABASE_ID;

const COLLECTION_ID =
  process.env
    .EXPO_PUBLIC_SUBSCRIPTION_TRIALS_COLLECTION_ID;

interface SubscriptionTrialDocument {
  $id: string;
  userId: string;
  startedAt: string;
  endsAt: string;
  status: SubscriptionTrialStatus;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string | null;
}

interface AppwriteLikeError {
  code?: number;
  type?: string;
  message?: string;
}

function requireConfig(): {
  databaseId: string;
  collectionId: string;
} {
  if (!DATABASE_ID) {
    throw new Error(
      "EXPO_PUBLIC_DATABASE_ID is missing."
    );
  }

  if (!COLLECTION_ID) {
    throw new Error(
      "EXPO_PUBLIC_SUBSCRIPTION_TRIALS_COLLECTION_ID is missing."
    );
  }

  return {
    databaseId: DATABASE_ID,
    collectionId: COLLECTION_ID,
  };
}

function documentToTrial(
  document: SubscriptionTrialDocument
): SubscriptionTrial {
  return {
    id: document.$id,
    cloudId: document.$id,
    userId: document.userId,
    startedAt: document.startedAt,
    endsAt: document.endsAt,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    syncedAt: document.syncedAt ?? null,
  };
}

function isConflictError(
  error: unknown
): boolean {
  const candidate =
    error as AppwriteLikeError;

  return (
    candidate?.code === 409 ||
    candidate?.type ===
      "document_already_exists" ||
    candidate?.type ===
      "general_argument_invalid"
  );
}

function getDocumentPermissions(
  userId: string
): string[] {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

export async function getCloudTrialForUser(
  userId: string
): Promise<SubscriptionTrial | null> {
  const { databaseId, collectionId } =
    requireConfig();

  const response =
    await database.listDocuments(
      databaseId,
      collectionId,
      [
        Query.equal("userId", userId),
        Query.limit(1),
      ]
    );

  const document =
    response.documents[0];

  if (!document) {
    return null;
  }

  return documentToTrial(
    document as unknown as
      SubscriptionTrialDocument
  );
}

export async function createCloudTrial(
  userId: string,
  startedAt: string,
  endsAt: string
): Promise<SubscriptionTrial> {
  const { databaseId, collectionId } =
    requireConfig();

  /*
   * This first read avoids unnecessary create calls.
   * The unique userId index remains the real protection
   * against simultaneous duplicate requests.
   */
  const existing =
    await getCloudTrialForUser(userId);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();

  try {
    const document =
      await database.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        {
          userId,
          startedAt,
          endsAt,
          status: "active",
          createdAt: now,
          updatedAt: now,
          syncedAt: now,
        },
        getDocumentPermissions(userId)
      );

    return documentToTrial(
      document as unknown as
        SubscriptionTrialDocument
    );
  } catch (error) {
    /*
     * Two app launches/devices can both pass the initial
     * existence check. The unique userId index allows only
     * one create; restore the winning document after a 409.
     */
    if (isConflictError(error)) {
      const concurrentlyCreated =
        await getCloudTrialForUser(userId);

      if (concurrentlyCreated) {
        return concurrentlyCreated;
      }
    }

    throw error;
  }
}

export async function updateCloudTrialStatus(
  trialCloudId: string,
  userId: string,
  status: SubscriptionTrialStatus
): Promise<SubscriptionTrial> {
  const { databaseId, collectionId } =
    requireConfig();

  const now = new Date().toISOString();

  const document =
    await database.updateDocument(
      databaseId,
      collectionId,
      trialCloudId,
      {
        status,
        updatedAt: now,
        syncedAt: now,
      },
      getDocumentPermissions(userId)
    );

  return documentToTrial(
    document as unknown as
      SubscriptionTrialDocument
  );
}