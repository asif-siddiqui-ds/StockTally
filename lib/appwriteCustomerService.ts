// lib/appwriteCustomerService.ts
import { database } from "@/appwrite";
import {
  getAllCustomers,
  markCustomerSynced,
  replaceCustomersForUser,
  saveAllCustomers,
} from "@/lib/customerStorage";
import type {
  Customer,
  CustomerPaymentTerms,
  CustomerType,
} from "@/types/customer";
import { ID, Permission, Query, Role } from "react-native-appwrite";

const DATABASE_ID =
  process.env.EXPO_PUBLIC_DATABASE_ID || "68215d2a00260d43fd49";

const CUSTOMERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_CUSTOMERS_COLLECTION_ID || "customers";


const nowISO = (): string => new Date().toISOString();

const customerPermissions = (userId: string) => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

const cleanOptional = (value?: string | null): string | null => {
  const cleaned = String(value ?? "").trim();
  return cleaned || null;
};

const safeNumber = (
  value: unknown,
  fallback = 0
): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeBoolean = (
  value: unknown,
  fallback = false
): boolean => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const normaliseCustomerType = (
  value: unknown
): CustomerType =>
  value === "individual" ? "individual" : "business";

const normalisePaymentTerms = (
  value: unknown
): CustomerPaymentTerms => {
  const allowed: CustomerPaymentTerms[] = [
    "due_on_receipt",
    "net_7",
    "net_14",
    "net_30",
    "net_45",
    "net_60",
    "custom",
  ];

  return allowed.includes(value as CustomerPaymentTerms)
    ? (value as CustomerPaymentTerms)
    : "net_30";
};

/* -------------------------------------------------------------------------- */
/*                            SERIALISATION                                   */
/* -------------------------------------------------------------------------- */

export function customerToDocument(
  customer: Customer,
  userId: string
): Record<string, unknown> {
  return {
    localId: customer.id,
    customerId: customer.id,
    userId,

    type: customer.type,

    companyName: cleanOptional(customer.companyName),
    contactName: customer.contactName,

    email: cleanOptional(customer.email),
    phone: cleanOptional(customer.phone),

    addressLine1: cleanOptional(customer.addressLine1),
    addressLine2: cleanOptional(customer.addressLine2),
    city: cleanOptional(customer.city),
    county: cleanOptional(customer.county),
    postcode: cleanOptional(customer.postcode),
    country: cleanOptional(customer.country),

    taxNumber: cleanOptional(customer.taxNumber),

    currencyCode: customer.currencyCode || "GBP",
    currencySymbol: customer.currencySymbol || "£",
    locale: customer.locale || "en-GB",

    paymentTerms: customer.paymentTerms || "net_30",
    customPaymentTermDays:
      customer.paymentTerms === "custom"
        ? Math.max(0, Math.round(customer.customPaymentTermDays || 0))
        : null,

    notes: cleanOptional(customer.notes),
    customerCode: cleanOptional(customer.customerCode),

    isActive: customer.isActive !== false,

    syncedAt: nowISO(),
  };
}

export function documentToCustomer(
  document: Record<string, any>
): Customer {
  const paymentTerms = normalisePaymentTerms(
    document.paymentTerms
  );

  return {
    id: document.localId || document.$id,
    cloudId: document.$id,
    userId: document.userId || "guest",

    type: normaliseCustomerType(document.type),

    companyName: document.companyName || undefined,
    contactName: document.contactName || "",

    email: document.email || undefined,
    phone: document.phone || undefined,

    addressLine1: document.addressLine1 || undefined,
    addressLine2: document.addressLine2 || undefined,
    city: document.city || undefined,
    county: document.county || undefined,
    postcode: document.postcode || undefined,
    country: document.country || undefined,

    taxNumber: document.taxNumber || undefined,

    currencyCode: document.currencyCode || "GBP",
    currencySymbol: document.currencySymbol || "£",
    locale: document.locale || "en-GB",

    paymentTerms,
    customPaymentTermDays:
      paymentTerms === "custom"
        ? Math.max(
            0,
            Math.round(
              safeNumber(document.customPaymentTermDays, 0)
            )
          )
        : undefined,

    notes: document.notes || undefined,
    customerCode: document.customerCode || undefined,

    isActive: safeBoolean(document.isActive, true),

    createdAt: document.$createdAt || nowISO(),
    updatedAt: document.$updatedAt || nowISO(),

    synced: true,
    syncedAt: document.syncedAt || nowISO(),
  };
}

/* -------------------------------------------------------------------------- */
/*                              CLOUD HELPERS                                 */
/* -------------------------------------------------------------------------- */

async function findCustomerDocument(
  customer: Pick<Customer, "id" | "cloudId">,
  userId: string
): Promise<Record<string, any> | null> {
  if (customer.cloudId) {
    try {
      return await database.getDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        customer.cloudId
      );
    } catch {
      // Fall back to localId lookup below.
    }
  }

  const response = await database.listDocuments(
    DATABASE_ID,
    CUSTOMERS_COLLECTION_ID,
    [
      Query.equal("customerId", customer.id),
      Query.equal("userId", userId),
      Query.limit(1),
    ]
  );

  return response.documents[0] || null;
}

async function createCloudCustomer(
  customer: Customer,
  userId: string
): Promise<Customer> {
  const created = await database.createDocument(
    DATABASE_ID,
    CUSTOMERS_COLLECTION_ID,
    ID.unique(),
    customerToDocument(customer, userId),
    customerPermissions(userId)
  );

  return {
    ...customer,
    cloudId: created.$id,
    userId,
    synced: true,
    syncedAt: created.syncedAt || nowISO(),
  };
}

async function updateCloudCustomer(
  customer: Customer,
  cloudId: string,
  userId: string
): Promise<Customer> {
  const updated = await database.updateDocument(
    DATABASE_ID,
    CUSTOMERS_COLLECTION_ID,
    cloudId,
    customerToDocument(customer, userId)
  );

  return {
    ...customer,
    cloudId,
    userId,
    synced: true,
    syncedAt: updated.syncedAt || nowISO(),
  };
}

export async function upsertCustomerToCloud(
  customer: Customer,
  userId: string
): Promise<Customer> {
  const existing = await findCustomerDocument(customer, userId);

  if (existing?.$id) {
    return updateCloudCustomer(
      { ...customer, userId },
      existing.$id,
      userId
    );
  }

  return createCloudCustomer(
    { ...customer, userId },
    userId
  );
}

/* -------------------------------------------------------------------------- */
/*                                 UPLOAD                                     */
/* -------------------------------------------------------------------------- */

export interface CustomerUploadResult {
  uploaded: number;
  failed: number;
  failures: Array<{
    customerId: string;
    customerName: string;
    message: string;
  }>;
}

export async function uploadUnsyncedCustomers(
  userId: string
): Promise<CustomerUploadResult> {
  const all = await getAllCustomers();
  const updatedCustomers: Customer[] = [];
  const failures: CustomerUploadResult["failures"] = [];
  let uploaded = 0;

  for (const customer of all) {
    const belongsToCurrentUser =
      customer.userId === userId ||
      customer.userId === "guest";

    if (!belongsToCurrentUser) {
      updatedCustomers.push(customer);
      continue;
    }

    if (
      customer.synced &&
      customer.userId === userId &&
      customer.cloudId
    ) {
      updatedCustomers.push(customer);
      continue;
    }

    try {
      const syncedCustomer = await upsertCustomerToCloud(
        {
          ...customer,
          userId,
          synced: false,
        },
        userId
      );

      updatedCustomers.push(syncedCustomer);
      uploaded += 1;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown customer sync error";

      console.error(
        `❌ Customer upload failed (${customer.id})`,
        error
      );

      updatedCustomers.push({
        ...customer,
        userId:
          customer.userId === "guest"
            ? userId
            : customer.userId,
        synced: false,
        syncedAt: undefined,
      });

      failures.push({
        customerId: customer.id,
        customerName:
          customer.companyName ||
          customer.contactName ||
          "Unnamed customer",
        message,
      });
    }
  }

  await saveAllCustomers(updatedCustomers);

  return {
    uploaded,
    failed: failures.length,
    failures,
  };
}

/* -------------------------------------------------------------------------- */
/*                                DOWNLOAD                                    */
/* -------------------------------------------------------------------------- */

export interface CustomerDownloadResult {
  downloaded: number;
  preservedLocalUnsynced: number;
}

export async function downloadCloudCustomers(
  userId: string
): Promise<CustomerDownloadResult> {
  const localCustomers = await getAllCustomers();

  const response = await database.listDocuments(
    DATABASE_ID,
    CUSTOMERS_COLLECTION_ID,
    [
      Query.equal("userId", userId),
      Query.orderDesc("updatedAt"),
      Query.limit(5000),
    ]
  );

  const cloudCustomers = response.documents.map(
    documentToCustomer
  );

  const localUnsynced = localCustomers.filter(
    (customer) =>
      customer.userId === userId && !customer.synced
  );

  await replaceCustomersForUser(
    userId,
    cloudCustomers
  );

  return {
    downloaded: cloudCustomers.length,
    preservedLocalUnsynced: localUnsynced.length,
  };
}

/* -------------------------------------------------------------------------- */
/*                             TWO-WAY SYNC                                   */
/* -------------------------------------------------------------------------- */

export interface CustomerSyncResult {
  upload: CustomerUploadResult;
  download: CustomerDownloadResult;
}

export async function syncCustomers(
  userId: string
): Promise<CustomerSyncResult> {
  const upload = await uploadUnsyncedCustomers(userId);
  const download = await downloadCloudCustomers(userId);

  return {
    upload,
    download,
  };
}

/* -------------------------------------------------------------------------- */
/*                           SINGLE CUSTOMER SYNC                             */
/* -------------------------------------------------------------------------- */

export async function syncCustomerById(
  customerId: string,
  userId: string
): Promise<Customer | null> {
  const all = await getAllCustomers();

  const customer = all.find(
    (item) =>
      item.id === customerId ||
      item.cloudId === customerId
  );

  if (!customer) return null;

  const syncedCustomer = await upsertCustomerToCloud(
    {
      ...customer,
      userId,
      synced: false,
    },
    userId
  );

  await markCustomerSynced(
    customer.id,
    syncedCustomer.cloudId,
    syncedCustomer.syncedAt
  );

  return syncedCustomer;
}

/* -------------------------------------------------------------------------- */
/*                           CLOUD DELETION                                   */
/* -------------------------------------------------------------------------- */

export async function deleteCustomerFromCloud(
  customer: Pick<Customer, "id" | "cloudId">,
  userId: string
): Promise<void> {
  const existing = await findCustomerDocument(
    customer,
    userId
  );

  if (!existing?.$id) return;

  await database.deleteDocument(
    DATABASE_ID,
    CUSTOMERS_COLLECTION_ID,
    existing.$id
  );
}

/* -------------------------------------------------------------------------- */
/*                            CLOUD LOOKUPS                                   */
/* -------------------------------------------------------------------------- */

export async function getCloudCustomerById(
  cloudId: string
): Promise<Customer | null> {
  try {
    const document = await database.getDocument(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      cloudId
    );

    return documentToCustomer(document);
  } catch (error) {
    console.warn(
      `⚠️ Cloud customer not found (${cloudId})`,
      error
    );
    return null;
  }
}

export async function findCloudCustomerByLocalId(
  localId: string,
  userId: string
): Promise<Customer | null> {
  const response = await database.listDocuments(
    DATABASE_ID,
    CUSTOMERS_COLLECTION_ID,
    [
      Query.equal("localId", localId),
      Query.equal("userId", userId),
      Query.limit(1),
    ]
  );

  const document = response.documents[0];

  return document
    ? documentToCustomer(document)
    : null;
}
