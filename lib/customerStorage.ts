// lib/customerStorage.ts
import { getCachedUserId } from "@/context/AuthContext";
import { getLocal, setLocal } from "@/lib/storage";
import {
  DEFAULT_CUSTOMER_PAYMENT_TERMS,
  getCustomerDisplayName,
  getCustomerSecondaryLabel,
} from "@/types/customer";
import type {
  CreateCustomerInput,
  Customer,
  CustomerOption,
  CustomerPaymentTerms,
  CustomerType,
  UpdateCustomerInput,
} from "@/types/customer";

const CUSTOMER_STORAGE_KEY = "customers";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const nowISO = (): string => new Date().toISOString();

const createLocalId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getCurrentUserId = async (): Promise<string> =>
  (await getCachedUserId()) || "guest";

const cleanText = (value?: string | null): string | undefined => {
  const cleaned = String(value ?? "").trim();
  return cleaned || undefined;
};

const cleanRequiredText = (value?: string | null): string =>
  String(value ?? "").trim();

const normaliseEmail = (value?: string | null): string =>
  String(value ?? "").trim().toLowerCase();

const normalisePhone = (value?: string | null): string =>
  String(value ?? "").replace(/[^\d+]/g, "").trim();

const normaliseComparableText = (value?: string | null): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const safeDateTime = (value?: string): number => {
  if (!value) return 0;

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const sortCustomers = (customers: Customer[]): Customer[] =>
  [...customers].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    return getCustomerDisplayName(a).localeCompare(
      getCustomerDisplayName(b),
      "en-GB",
      { sensitivity: "base" }
    );
  });

const sanitisePaymentTerms = (
  value?: CustomerPaymentTerms
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

  return value && allowed.includes(value)
    ? value
    : DEFAULT_CUSTOMER_PAYMENT_TERMS;
};

const sanitiseCustomerType = (value?: CustomerType): CustomerType =>
  value === "individual" ? "individual" : "business";

const sanitiseCustomPaymentDays = (
  paymentTerms: CustomerPaymentTerms,
  value?: number
): number | undefined => {
  if (paymentTerms !== "custom") return undefined;

  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed)) return 0;

  return Math.max(0, Math.round(parsed));
};

const sanitiseCustomer = (customer: Customer): Customer => {
  const paymentTerms = sanitisePaymentTerms(customer.paymentTerms);

  return {
    ...customer,
    id: customer.id || createLocalId(),
    cloudId: cleanText(customer.cloudId),
    userId: cleanRequiredText(customer.userId) || "guest",

    type: sanitiseCustomerType(customer.type),

    companyName: cleanText(customer.companyName),
    contactName: cleanRequiredText(customer.contactName),

    email: cleanText(customer.email),
    phone: cleanText(customer.phone),

    addressLine1: cleanText(customer.addressLine1),
    addressLine2: cleanText(customer.addressLine2),
    city: cleanText(customer.city),
    county: cleanText(customer.county),
    postcode: cleanText(customer.postcode),
    country: cleanText(customer.country),

    taxNumber: cleanText(customer.taxNumber),

    currencyCode: cleanText(customer.currencyCode) || "GBP",
    currencySymbol: cleanText(customer.currencySymbol) || "£",
    locale: cleanText(customer.locale) || "en-GB",

    paymentTerms,
    customPaymentTermDays: sanitiseCustomPaymentDays(
      paymentTerms,
      customer.customPaymentTermDays
    ),

    notes: cleanText(customer.notes),
    customerCode: cleanText(customer.customerCode),

    isActive: customer.isActive !== false,

    createdAt: customer.createdAt || nowISO(),
    updatedAt: customer.updatedAt || customer.createdAt || nowISO(),

    synced: Boolean(customer.synced),
    syncedAt: cleanText(customer.syncedAt),
  };
};

const validateCustomerInput = (
  input: Pick<
    CreateCustomerInput,
    "type" | "companyName" | "contactName" | "email"
  >
): void => {
  const type = sanitiseCustomerType(input.type);
  const companyName = cleanRequiredText(input.companyName);
  const contactName = cleanRequiredText(input.contactName);
  const email = cleanRequiredText(input.email);

  if (type === "business" && !companyName && !contactName) {
    throw new Error(
      "Enter a company name or contact name for this customer."
    );
  }

  if (type === "individual" && !contactName) {
    throw new Error("Customer name is required.");
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("Enter a valid customer email address.");
  }
};

const matchesCustomerId = (customer: Customer, id: string): boolean =>
  customer.id === id || customer.cloudId === id;

/* -------------------------------------------------------------------------- */
/*                              RAW READ / WRITE                              */
/* -------------------------------------------------------------------------- */

export async function getAllCustomers(): Promise<Customer[]> {
  const stored =
    (await getLocal<Customer>(CUSTOMER_STORAGE_KEY)) || [];

  return stored.map(sanitiseCustomer);
}

export async function saveAllCustomers(
  customers: Customer[]
): Promise<void> {
  await setLocal(
    CUSTOMER_STORAGE_KEY,
    customers.map(sanitiseCustomer)
  );
}

/* -------------------------------------------------------------------------- */
/*                              READ OPERATIONS                               */
/* -------------------------------------------------------------------------- */

export async function getCustomers(
  includeInactive = false
): Promise<Customer[]> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  return sortCustomers(
    all.filter(
      (customer) =>
        customer.userId === userId &&
        (includeInactive || customer.isActive)
    )
  );
}

export async function getActiveCustomers(): Promise<Customer[]> {
  return getCustomers(false);
}

export async function getInactiveCustomers(): Promise<Customer[]> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  return sortCustomers(
    all.filter(
      (customer) =>
        customer.userId === userId && !customer.isActive
    )
  );
}

export async function getCustomerById(
  id: string
): Promise<Customer | null> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  return (
    all.find(
      (customer) =>
        customer.userId === userId &&
        matchesCustomerId(customer, id)
    ) ?? null
  );
}

export async function getCustomerByCode(
  customerCode: string
): Promise<Customer | null> {
  const userId = await getCurrentUserId();
  const target = normaliseComparableText(customerCode);
  const all = await getAllCustomers();

  if (!target) return null;

  return (
    all.find(
      (customer) =>
        customer.userId === userId &&
        normaliseComparableText(customer.customerCode) === target
    ) ?? null
  );
}

export async function getCustomerByEmail(
  email: string
): Promise<Customer | null> {
  const userId = await getCurrentUserId();
  const target = normaliseEmail(email);
  const all = await getAllCustomers();

  if (!target) return null;

  return (
    all.find(
      (customer) =>
        customer.userId === userId &&
        normaliseEmail(customer.email) === target
    ) ?? null
  );
}

export async function searchCustomers(
  query: string,
  includeInactive = false
): Promise<Customer[]> {
  const customers = await getCustomers(includeInactive);
  const target = normaliseComparableText(query);

  if (!target) return customers;

  const phoneTarget = normalisePhone(query);

  return customers.filter((customer) => {
    const searchableText = [
      getCustomerDisplayName(customer),
      getCustomerSecondaryLabel(customer),
      customer.companyName,
      customer.contactName,
      customer.email,
      customer.phone,
      customer.customerCode,
      customer.taxNumber,
      customer.addressLine1,
      customer.addressLine2,
      customer.city,
      customer.county,
      customer.postcode,
      customer.country,
      customer.notes,
    ]
      .filter(Boolean)
      .map((value) => normaliseComparableText(String(value)));

    if (searchableText.some((value) => value.includes(target))) {
      return true;
    }

    return Boolean(
      phoneTarget &&
        normalisePhone(customer.phone).includes(phoneTarget)
    );
  });
}

export async function getCustomerOptions(
  query = "",
  includeInactive = false
): Promise<CustomerOption[]> {
  const customers = await searchCustomers(query, includeInactive);

  return customers.map((customer) => {
    const primary = getCustomerDisplayName(customer);
    const secondary = getCustomerSecondaryLabel(customer);

    return {
      label: secondary ? `${primary} · ${secondary}` : primary,
      value: customer.id,
      customer,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                          DUPLICATE / CODE CHECKS                            */
/* -------------------------------------------------------------------------- */

export interface CustomerDuplicateMatch {
  customer: Customer;
  reason: "email" | "phone" | "name" | "customerCode";
}

export async function findPotentialDuplicateCustomer(
  input: Pick<
    CreateCustomerInput,
    | "companyName"
    | "contactName"
    | "email"
    | "phone"
    | "customerCode"
  >,
  excludeCustomerId?: string
): Promise<CustomerDuplicateMatch | null> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  const email = normaliseEmail(input.email);
  const phone = normalisePhone(input.phone);
  const companyName = normaliseComparableText(input.companyName);
  const contactName = normaliseComparableText(input.contactName);
  const customerCode = normaliseComparableText(input.customerCode);

  const candidates = all.filter(
    (customer) =>
      customer.userId === userId &&
      customer.id !== excludeCustomerId &&
      customer.cloudId !== excludeCustomerId
  );

  if (customerCode) {
    const match = candidates.find(
      (customer) =>
        normaliseComparableText(customer.customerCode) === customerCode
    );

    if (match) {
      return { customer: match, reason: "customerCode" };
    }
  }

  if (email) {
    const match = candidates.find(
      (customer) => normaliseEmail(customer.email) === email
    );

    if (match) {
      return { customer: match, reason: "email" };
    }
  }

  if (phone) {
    const match = candidates.find(
      (customer) => normalisePhone(customer.phone) === phone
    );

    if (match) {
      return { customer: match, reason: "phone" };
    }
  }

  if (companyName || contactName) {
    const match = candidates.find((customer) => {
      const sameCompany =
        companyName &&
        normaliseComparableText(customer.companyName) === companyName;

      const sameContact =
        contactName &&
        normaliseComparableText(customer.contactName) === contactName;

      if (companyName && contactName) {
        return Boolean(sameCompany && sameContact);
      }

      return Boolean(sameCompany || sameContact);
    });

    if (match) {
      return { customer: match, reason: "name" };
    }
  }

  return null;
}

export async function customerCodeExists(
  customerCode: string,
  excludeCustomerId?: string
): Promise<boolean> {
  const userId = await getCurrentUserId();
  const target = normaliseComparableText(customerCode);
  const all = await getAllCustomers();

  if (!target) return false;

  return all.some(
    (customer) =>
      customer.userId === userId &&
      customer.id !== excludeCustomerId &&
      customer.cloudId !== excludeCustomerId &&
      normaliseComparableText(customer.customerCode) === target
  );
}

export async function getNextCustomerCode(
  prefix = "CUS",
  padding = 4
): Promise<string> {
  const userId = await getCurrentUserId();
  const safePrefix =
    String(prefix || "CUS")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toUpperCase() || "CUS";

  const pattern = new RegExp(`^${safePrefix}-(\\d+)$`, "i");
  const all = await getAllCustomers();

  const highest = all
    .filter((customer) => customer.userId === userId)
    .reduce((max, customer) => {
      const match = customer.customerCode?.match(pattern);
      if (!match) return max;

      const value = Number(match[1]);
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);

  return `${safePrefix}-${String(highest + 1).padStart(
    padding,
    "0"
  )}`;
}

/* -------------------------------------------------------------------------- */
/*                             CREATE CUSTOMER                                */
/* -------------------------------------------------------------------------- */

export async function saveCustomer(
  input: CreateCustomerInput,
  options?: {
    allowPotentialDuplicate?: boolean;
    generateCustomerCode?: boolean;
  }
): Promise<Customer> {
  validateCustomerInput(input);

  const userId =
    cleanRequiredText(input.userId) || (await getCurrentUserId());

  const duplicate = await findPotentialDuplicateCustomer(input);

  if (duplicate && !options?.allowPotentialDuplicate) {
    const duplicateName = getCustomerDisplayName(
      duplicate.customer
    );

    throw new Error(
      `A customer named "${duplicateName}" may already exist (${duplicate.reason}).`
    );
  }

  let customerCode = cleanText(input.customerCode);

  if (!customerCode && options?.generateCustomerCode !== false) {
    customerCode = await getNextCustomerCode();
  }

  if (
    customerCode &&
    (await customerCodeExists(customerCode))
  ) {
    throw new Error(
      `Customer code ${customerCode} is already in use.`
    );
  }

  const paymentTerms = sanitisePaymentTerms(input.paymentTerms);
  const now = nowISO();

  const customer: Customer = sanitiseCustomer({
    id: createLocalId(),
    cloudId: undefined,
    userId,

    type: sanitiseCustomerType(input.type),

    companyName: cleanText(input.companyName),
    contactName: cleanRequiredText(input.contactName),

    email: cleanText(input.email),
    phone: cleanText(input.phone),

    addressLine1: cleanText(input.addressLine1),
    addressLine2: cleanText(input.addressLine2),
    city: cleanText(input.city),
    county: cleanText(input.county),
    postcode: cleanText(input.postcode),
    country: cleanText(input.country),

    taxNumber: cleanText(input.taxNumber),

    currencyCode: cleanText(input.currencyCode) || "GBP",
    currencySymbol: cleanText(input.currencySymbol) || "£",
    locale: cleanText(input.locale) || "en-GB",

    paymentTerms,
    customPaymentTermDays: sanitiseCustomPaymentDays(
      paymentTerms,
      input.customPaymentTermDays
    ),

    notes: cleanText(input.notes),
    customerCode,

    isActive: input.isActive !== false,

    createdAt: now,
    updatedAt: now,

    synced: false,
    syncedAt: undefined,
  });

  const all = await getAllCustomers();
  all.push(customer);

  await saveAllCustomers(all);

  return customer;
}

/* -------------------------------------------------------------------------- */
/*                             UPDATE CUSTOMER                                */
/* -------------------------------------------------------------------------- */

export async function updateCustomer(
  id: string,
  updates: UpdateCustomerInput,
  options?: {
    allowPotentialDuplicate?: boolean;
  }
): Promise<Customer | null> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  const index = all.findIndex(
    (customer) =>
      customer.userId === userId &&
      matchesCustomerId(customer, id)
  );

  if (index === -1) return null;

  const current = all[index];

  const candidate: Customer = sanitiseCustomer({
    ...current,
    ...updates,

    id: current.id,
    cloudId: current.cloudId,
    userId: current.userId,

    type: sanitiseCustomerType(
      updates.type ?? current.type
    ),

    companyName:
      updates.companyName !== undefined
        ? cleanText(updates.companyName)
        : current.companyName,

    contactName:
      updates.contactName !== undefined
        ? cleanRequiredText(updates.contactName)
        : current.contactName,

    email:
      updates.email !== undefined
        ? cleanText(updates.email)
        : current.email,

    phone:
      updates.phone !== undefined
        ? cleanText(updates.phone)
        : current.phone,

    paymentTerms: sanitisePaymentTerms(
      updates.paymentTerms ?? current.paymentTerms
    ),

    customerCode:
      updates.customerCode !== undefined
        ? cleanText(updates.customerCode)
        : current.customerCode,

    updatedAt: nowISO(),
    synced: false,
    syncedAt: undefined,
  });

  validateCustomerInput(candidate);

  if (
    candidate.customerCode &&
    (await customerCodeExists(candidate.customerCode, current.id))
  ) {
    throw new Error(
      `Customer code ${candidate.customerCode} is already in use.`
    );
  }

  const duplicate = await findPotentialDuplicateCustomer(
    candidate,
    current.id
  );

  if (duplicate && !options?.allowPotentialDuplicate) {
    throw new Error(
      `Another customer named "${getCustomerDisplayName(
        duplicate.customer
      )}" may already exist (${duplicate.reason}).`
    );
  }

  all[index] = candidate;
  await saveAllCustomers(all);

  return candidate;
}

/* -------------------------------------------------------------------------- */
/*                         ARCHIVE / RESTORE / DELETE                          */
/* -------------------------------------------------------------------------- */

export async function archiveCustomer(
  id: string
): Promise<Customer | null> {
  return updateCustomer(
    id,
    { isActive: false },
    { allowPotentialDuplicate: true }
  );
}

export async function restoreCustomer(
  id: string
): Promise<Customer | null> {
  return updateCustomer(
    id,
    { isActive: true },
    { allowPotentialDuplicate: true }
  );
}

export async function deleteCustomer(
  id: string,
  options?: {
    /**
     * Use only when the caller has confirmed that no invoice references
     * this customer. Otherwise archive the customer instead.
     */
    permanently?: boolean;
  }
): Promise<void> {
  if (!options?.permanently) {
    await archiveCustomer(id);
    return;
  }

  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  await saveAllCustomers(
    all.filter(
      (customer) =>
        !(
          customer.userId === userId &&
          matchesCustomerId(customer, id)
        )
    )
  );
}

/* -------------------------------------------------------------------------- */
/*                                SYNC HELPERS                                */
/* -------------------------------------------------------------------------- */

export async function getUnsyncedCustomers(): Promise<Customer[]> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  return all
    .filter(
      (customer) =>
        customer.userId === userId && !customer.synced
    )
    .sort(
      (a, b) =>
        safeDateTime(a.updatedAt) - safeDateTime(b.updatedAt)
    );
}

export async function markCustomerSynced(
  id: string,
  cloudId?: string,
  syncedAt = nowISO()
): Promise<Customer | null> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  const index = all.findIndex(
    (customer) =>
      customer.userId === userId &&
      matchesCustomerId(customer, id)
  );

  if (index === -1) return null;

  const updated: Customer = {
    ...all[index],
    cloudId: cloudId || all[index].cloudId,
    synced: true,
    syncedAt,
  };

  all[index] = updated;
  await saveAllCustomers(all);

  return updated;
}

export async function markCustomerUnsynced(
  id: string
): Promise<Customer | null> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  const index = all.findIndex(
    (customer) =>
      customer.userId === userId &&
      matchesCustomerId(customer, id)
  );

  if (index === -1) return null;

  const updated: Customer = {
    ...all[index],
    synced: false,
    syncedAt: undefined,
    updatedAt: nowISO(),
  };

  all[index] = updated;
  await saveAllCustomers(all);

  return updated;
}

/**
 * Inserts or merges a customer received from Appwrite.
 *
 * Merge rule:
 * - If only cloud exists, cache it locally.
 * - If the local record has unsynced changes and is newer, preserve local.
 * - Otherwise use the cloud record.
 */
export async function upsertCustomerFromCloud(
  cloudCustomer: Customer
): Promise<Customer> {
  const incoming = sanitiseCustomer({
    ...cloudCustomer,
    synced: true,
    syncedAt: cloudCustomer.syncedAt || nowISO(),
  });

  const all = await getAllCustomers();

  const index = all.findIndex(
    (customer) =>
      customer.userId === incoming.userId &&
      (customer.id === incoming.id ||
        Boolean(
          customer.cloudId &&
            incoming.cloudId &&
            customer.cloudId === incoming.cloudId
        ))
  );

  if (index === -1) {
    all.push(incoming);
    await saveAllCustomers(all);
    return incoming;
  }

  const local = all[index];

  const keepLocal =
    !local.synced &&
    safeDateTime(local.updatedAt) >
      safeDateTime(incoming.updatedAt);

  if (keepLocal) {
    const preserved: Customer = {
      ...local,
      cloudId: incoming.cloudId || local.cloudId,
    };

    all[index] = preserved;
    await saveAllCustomers(all);
    return preserved;
  }

  all[index] = incoming;
  await saveAllCustomers(all);

  return incoming;
}

export async function replaceCustomersForUser(
  userId: string,
  customers: Customer[]
): Promise<void> {
  const all = await getAllCustomers();

  const otherUsers = all.filter(
    (customer) => customer.userId !== userId
  );

  const currentUnsynced = all.filter(
    (customer) =>
      customer.userId === userId && !customer.synced
  );

  const cloudCustomers = customers.map((customer) =>
    sanitiseCustomer({
      ...customer,
      userId,
      synced: true,
      syncedAt: customer.syncedAt || nowISO(),
    })
  );

  const merged = new Map<string, Customer>();

  for (const customer of cloudCustomers) {
    merged.set(customer.id, customer);
  }

  for (const local of currentUnsynced) {
    const matchingCloud = cloudCustomers.find(
      (cloud) =>
        cloud.id === local.id ||
        Boolean(
          cloud.cloudId &&
            local.cloudId &&
            cloud.cloudId === local.cloudId
        )
    );

    if (
      !matchingCloud ||
      safeDateTime(local.updatedAt) >
        safeDateTime(matchingCloud.updatedAt)
    ) {
      merged.set(local.id, {
        ...local,
        cloudId: matchingCloud?.cloudId || local.cloudId,
      });
    }
  }

  await saveAllCustomers([
    ...otherUsers,
    ...Array.from(merged.values()),
  ]);
}

export async function linkGuestCustomersToUser(
  userId: string
): Promise<void> {
  const targetUserId = cleanRequiredText(userId);

  if (!targetUserId || targetUserId === "guest") {
    throw new Error("A valid signed-in user ID is required.");
  }

  const all = await getAllCustomers();
  const changedAt = nowISO();
  let changed = false;

  const updated = all.map((customer) => {
    if (customer.userId !== "guest") return customer;

    changed = true;

    return {
      ...customer,
      userId: targetUserId,
      synced: false,
      syncedAt: undefined,
      updatedAt: changedAt,
    };
  });

  if (changed) {
    await saveAllCustomers(updated);
  }
}

export async function clearCustomers(): Promise<void> {
  const userId = await getCurrentUserId();
  const all = await getAllCustomers();

  await saveAllCustomers(
    all.filter((customer) => customer.userId !== userId)
  );
}

export async function clearAllCustomers(): Promise<void> {
  await setLocal(CUSTOMER_STORAGE_KEY, []);
}
