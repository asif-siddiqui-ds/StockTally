// // lib/supplierStorage.ts

// import {
//   DEFAULT_SUPPLIER_PAYMENT_TERMS,
//   Supplier,
//   SupplierPaymentTerms,
//   SupplierType,
//   getSupplierDisplayName,
//   CreateSupplierInput,
// } from "@/types/supplier";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const SUPPLIERS_KEY = "stocktally_suppliers";

// const VALID_SUPPLIER_TYPES: SupplierType[] = [
//   "business",
//   "individual",
// ];

// const VALID_PAYMENT_TERMS: SupplierPaymentTerms[] = [
//   "due_on_receipt",
//   "net_7",
//   "net_14",
//   "net_30",
//   "net_45",
//   "net_60",
//   "custom",
// ];

// const generateId = (): string =>
//   `supplier_${Date.now()}_${Math.random()
//     .toString(36)
//     .slice(2, 10)}`;

// const clean = (value?: string | null): string =>
//   typeof value === "string" ? value.trim() : "";

// const numberValue = (
//   value?: number | string | null,
// ): number => {
//   const parsed = Number(value ?? 0);

//   return Number.isFinite(parsed)
//     ? parsed
//     : 0;
// };

// const nonNegativeNumber = (
//   value?: number | string | null,
// ): number => {
//   return Math.max(0, numberValue(value));
// };

// const normaliseSupplierType = (
//   value?: SupplierType | string,
// ): SupplierType => {
//   if (
//     value &&
//     VALID_SUPPLIER_TYPES.includes(
//       value as SupplierType,
//     )
//   ) {
//     return value as SupplierType;
//   }

//   return "business";
// };

// const normalisePaymentTerms = (
//   value?: SupplierPaymentTerms | string,
// ): SupplierPaymentTerms => {
//   if (
//     value &&
//     VALID_PAYMENT_TERMS.includes(
//       value as SupplierPaymentTerms,
//     )
//   ) {
//     return value as SupplierPaymentTerms;
//   }

//   return DEFAULT_SUPPLIER_PAYMENT_TERMS;
// };

// /**
//  * Converts older or incomplete supplier records into the
//  * current Supplier structure.
//  *
//  * This also allows existing local records created before
//  * fields such as type, locale, taxNumber and custom payment
//  * terms were introduced to continue working.
//  */
// const normaliseSupplier = (
//   value: Partial<Supplier>,
// ): Supplier => {
//   const now = new Date().toISOString();

//   const type = normaliseSupplierType(
//     value.type,
//   );

//   const paymentTerms =
//     normalisePaymentTerms(
//       value.paymentTerms,
//     );

//   const customPaymentTermDays =
//     paymentTerms === "custom"
//       ? nonNegativeNumber(
//           value.customPaymentTermDays,
//         )
//       : nonNegativeNumber(
//           value.customPaymentTermDays,
//         );

//   return {
//     id: clean(value.id) || generateId(),

//     cloudId:
//       clean(value.cloudId) || undefined,

//     userId:
//       clean(value.userId) || "guest",

//     type,

//     companyName:
//       clean(value.companyName) ||
//       undefined,

//     contactName:
//       clean(value.contactName),

//     supplierCode:
//       clean(value.supplierCode) ||
//       undefined,

//     email:
//       clean(value.email) || undefined,

//     phone:
//       clean(value.phone) || undefined,

//     website:
//       clean(value.website) || undefined,

//     addressLine1:
//       clean(value.addressLine1) ||
//       undefined,

//     addressLine2:
//       clean(value.addressLine2) ||
//       undefined,

//     city:
//       clean(value.city) || undefined,

//     county:
//       clean(value.county) || undefined,

//     postcode:
//       clean(value.postcode) ||
//       undefined,

//     country:
//       clean(value.country) ||
//       undefined,

//     taxNumber:
//       clean(value.taxNumber) ||
//       undefined,

//     currencyCode:
//       clean(value.currencyCode) ||
//       "GBP",

//     currencySymbol:
//       clean(value.currencySymbol) ||
//       "£",

//     locale:
//       clean(value.locale) ||
//       "en-GB",

//     paymentTerms,

//     customPaymentTermDays,

//     openingBalance: numberValue(
//       value.openingBalance,
//     ),

//     creditLimit: nonNegativeNumber(
//       value.creditLimit,
//     ),

//     notes:
//       clean(value.notes) || undefined,

//     isActive:
//       value.isActive === undefined
//         ? true
//         : Boolean(value.isActive),

//     createdAt:
//       clean(value.createdAt) || now,

//     updatedAt:
//       clean(value.updatedAt) || now,

//     synced: Boolean(value.synced),

//     syncedAt:
//       clean(value.syncedAt) ||
//       undefined,
//   };
// };

// const validateSupplier = (
//   supplier: Pick<
//     Supplier,
//     | "type"
//     | "companyName"
//     | "contactName"
//   >,
// ): void => {
//   const companyName =
//     supplier.companyName?.trim() || "";

//   const contactName =
//     supplier.contactName?.trim() || "";

//   if (
//     supplier.type === "business" &&
//     !companyName
//   ) {
//     throw new Error(
//       "Supplier company name is required.",
//     );
//   }

//   if (
//     supplier.type === "individual" &&
//     !contactName
//   ) {
//     throw new Error(
//       "Supplier contact name is required.",
//     );
//   }

//   if (!companyName && !contactName) {
//     throw new Error(
//       "Enter a supplier company name or contact name.",
//     );
//   }
// };

// const supplierCodeExists = (
//   suppliers: Supplier[],
//   supplierCode?: string,
//   excludedSupplierId?: string,
// ): boolean => {
//   const normalisedCode =
//     supplierCode?.trim().toLowerCase();

//   if (!normalisedCode) {
//     return false;
//   }

//   return suppliers.some((supplier) => {
//     if (
//       excludedSupplierId &&
//       supplier.id === excludedSupplierId
//     ) {
//       return false;
//     }

//     return (
//       supplier.supplierCode
//         ?.trim()
//         .toLowerCase() ===
//       normalisedCode
//     );
//   });
// };

// // -------------------------------------------------------
// // SAVE ALL SUPPLIERS
// // -------------------------------------------------------

// export const saveAllSuppliers = async (
//   items: Supplier[],
// ): Promise<void> => {
//   const normalisedItems = items.map(
//     (item) => normaliseSupplier(item),
//   );

//   await AsyncStorage.setItem(
//     SUPPLIERS_KEY,
//     JSON.stringify(normalisedItems),
//   );
// };

// // -------------------------------------------------------
// // GET SUPPLIERS
// // -------------------------------------------------------

// export const getSuppliers =
//   async (): Promise<Supplier[]> => {
//     try {
//       const raw =
//         await AsyncStorage.getItem(
//           SUPPLIERS_KEY,
//         );

//       if (!raw) {
//         return [];
//       }

//       const parsed: unknown =
//         JSON.parse(raw);

//       if (!Array.isArray(parsed)) {
//         return [];
//       }

//       return parsed
//         .map((item) =>
//           normaliseSupplier(
//             item as Partial<Supplier>,
//           ),
//         )
//         .sort((a, b) =>
//           getSupplierDisplayName(
//             a,
//           ).localeCompare(
//             getSupplierDisplayName(b),
//             undefined,
//             {
//               sensitivity: "base",
//             },
//           ),
//         );
//     } catch (error) {
//       console.error(
//         "Failed to load suppliers:",
//         error,
//       );

//       throw new Error(
//         "Could not load suppliers.",
//       );
//     }
//   };

// // -------------------------------------------------------
// // GET ACTIVE SUPPLIERS
// // -------------------------------------------------------

// export const getActiveSuppliers =
//   async (): Promise<Supplier[]> => {
//     const suppliers =
//       await getSuppliers();

//     return suppliers.filter(
//       (supplier) => supplier.isActive,
//     );
//   };

// // -------------------------------------------------------
// // GET SUPPLIER BY LOCAL ID
// // -------------------------------------------------------

// export const getSupplierById = async (
//   id: string,
// ): Promise<Supplier | null> => {
//   const suppliers =
//     await getSuppliers();

//   return (
//     suppliers.find(
//       (supplier) =>
//         supplier.id === id,
//     ) || null
//   );
// };

// // -------------------------------------------------------
// // GET SUPPLIER BY CLOUD ID
// // -------------------------------------------------------

// export const getSupplierByCloudId =
//   async (
//     cloudId: string,
//   ): Promise<Supplier | null> => {
//     const suppliers =
//       await getSuppliers();

//     return (
//       suppliers.find(
//         (supplier) =>
//           supplier.cloudId === cloudId,
//       ) || null
//     );
//   };

// // -------------------------------------------------------
// // NEW SUPPLIER INPUT
// // -------------------------------------------------------

// export type NewSupplierInput = Omit<
//   Supplier,
//   | "id"
//   | "createdAt"
//   | "updatedAt"
//   | "synced"
//   | "syncedAt"
// >;

// // -------------------------------------------------------
// // SAVE SUPPLIER
// // -------------------------------------------------------

// export const saveSupplier = async (
//   input: NewSupplierInput,
// ): Promise<Supplier> => {
//   const suppliers =
//     await getSuppliers();

//   const now =
//     new Date().toISOString();

//   const supplier =
//     normaliseSupplier({
//       ...input,

//       id: generateId(),

//       createdAt: now,
//       updatedAt: now,

//       synced: false,
//       syncedAt: undefined,
//     });

//   validateSupplier(supplier);

//   if (
//     supplierCodeExists(
//       suppliers,
//       supplier.supplierCode,
//     )
//   ) {
//     throw new Error(
//       "A supplier with this code already exists.",
//     );
//   }

//   await saveAllSuppliers([
//     ...suppliers,
//     supplier,
//   ]);

//   return supplier;
// };

// // -------------------------------------------------------
// // UPDATE SUPPLIER
// // -------------------------------------------------------

// export const updateSupplier = async (
//   id: string,
//   updates: Partial<Supplier>,
// ): Promise<Supplier> => {
//   const suppliers =
//     await getSuppliers();

//   const index =
//     suppliers.findIndex(
//       (supplier) =>
//         supplier.id === id,
//     );

//   if (index < 0) {
//     throw new Error(
//       "Supplier not found.",
//     );
//   }

//   const existing = suppliers[index];

//   const updated =
//     normaliseSupplier({
//       ...existing,
//       ...updates,

//       id: existing.id,
//       cloudId:
//         updates.cloudId ??
//         existing.cloudId,

//       userId:
//         updates.userId ??
//         existing.userId,

//       createdAt:
//         existing.createdAt,

//       updatedAt:
//         new Date().toISOString(),

//       synced: false,
//       syncedAt: undefined,
//     });

//   validateSupplier(updated);

//   if (
//     supplierCodeExists(
//       suppliers,
//       updated.supplierCode,
//       id,
//     )
//   ) {
//     throw new Error(
//       "A supplier with this code already exists.",
//     );
//   }

//   const next = [...suppliers];

//   next[index] = updated;

//   await saveAllSuppliers(next);

//   return updated;
// };

// // -------------------------------------------------------
// // ACTIVATE / DEACTIVATE SUPPLIER
// // -------------------------------------------------------

// export const deactivateSupplier = (
//   id: string,
// ): Promise<Supplier> =>
//   updateSupplier(id, {
//     isActive: false,
//   });

// export const reactivateSupplier = (
//   id: string,
// ): Promise<Supplier> =>
//   updateSupplier(id, {
//     isActive: true,
//   });

// // -------------------------------------------------------
// // DELETE SUPPLIER
// // -------------------------------------------------------

// export const deleteSupplier = async (
//   id: string,
// ): Promise<void> => {
//   const suppliers =
//     await getSuppliers();

//   await saveAllSuppliers(
//     suppliers.filter(
//       (supplier) =>
//         supplier.id !== id,
//     ),
//   );
// };

// // -------------------------------------------------------
// // MARK SUPPLIER AS SYNCED
// // -------------------------------------------------------

// export const markSupplierSynced =
//   async (
//     id: string,
//     cloudId: string,
//     syncedAt = new Date().toISOString(),
//   ): Promise<void> => {
//     const suppliers =
//       await getSuppliers();

//     const next = suppliers.map(
//       (supplier) =>
//         supplier.id === id
//           ? normaliseSupplier({
//               ...supplier,

//               cloudId,

//               synced: true,
//               syncedAt,
//             })
//           : supplier,
//     );

//     await saveAllSuppliers(next);
//   };

// // -------------------------------------------------------
// // MARK SUPPLIER AS UNSYNCED
// // -------------------------------------------------------

// export const markSupplierUnsynced =
//   async (
//     id: string,
//   ): Promise<void> => {
//     const suppliers =
//       await getSuppliers();

//     await saveAllSuppliers(
//       suppliers.map((supplier) =>
//         supplier.id === id
//           ? {
//               ...supplier,
//               synced: false,
//               syncedAt: undefined,
//             }
//           : supplier,
//       ),
//     );
//   };

// // -------------------------------------------------------
// // REPLACE SUPPLIERS FOR USER AFTER CLOUD DOWNLOAD
// // -------------------------------------------------------

// export const replaceSuppliersForUser =
//   async (
//     userId: string,
//     cloudSuppliers: Supplier[],
//   ): Promise<void> => {
//     const localSuppliers =
//       await getSuppliers();

//     const normalisedUserId =
//       clean(userId);

//     if (!normalisedUserId) {
//       throw new Error(
//         "A user ID is required to replace suppliers.",
//       );
//     }

//     /*
//      * Keep suppliers belonging to other authenticated users.
//      */
//     const otherUsers =
//       localSuppliers.filter(
//         (supplier) =>
//           supplier.userId !==
//             normalisedUserId &&
//           supplier.userId !== "guest",
//       );

//     /*
//      * Preserve local records belonging to this user, or
//      * guest records awaiting migration, when they have not
//      * yet been uploaded.
//      */
//     const localUnsynced =
//       localSuppliers.filter(
//         (supplier) =>
//           (supplier.userId ===
//             normalisedUserId ||
//             supplier.userId ===
//               "guest") &&
//           !supplier.synced,
//       );

//     const normalisedCloudSuppliers =
//       cloudSuppliers.map(
//         (supplier) =>
//           normaliseSupplier({
//             ...supplier,

//             userId:
//               clean(supplier.userId) ||
//               normalisedUserId,

//             synced: true,

//             syncedAt:
//               supplier.syncedAt ||
//               new Date().toISOString(),
//           }),
//       );

//     /*
//      * Compare both local IDs and cloud IDs to avoid keeping
//      * a duplicate unsynced copy of a supplier that already
//      * exists in the cloud download.
//      */
//     const cloudLocalIds = new Set(
//       normalisedCloudSuppliers.map(
//         (supplier) => supplier.id,
//       ),
//     );

//     const cloudIds = new Set(
//       normalisedCloudSuppliers
//         .map(
//           (supplier) =>
//             supplier.cloudId,
//         )
//         .filter(
//           (
//             cloudId,
//           ): cloudId is string =>
//             Boolean(cloudId),
//         ),
//     );

//     const preservedUnsynced =
//       localUnsynced.filter(
//         (supplier) =>
//           !cloudLocalIds.has(
//             supplier.id,
//           ) &&
//           !(
//             supplier.cloudId &&
//             cloudIds.has(
//               supplier.cloudId,
//             )
//           ),
//       );

//     await saveAllSuppliers([
//       ...otherUsers,
//       ...preservedUnsynced,
//       ...normalisedCloudSuppliers,
//     ]);
//   };

// // -------------------------------------------------------
// // LINK GUEST SUPPLIERS TO AUTHENTICATED USER
// // -------------------------------------------------------

// export const linkGuestSuppliersToUser =
//   async (
//     userId: string,
//   ): Promise<number> => {
//     const normalisedUserId =
//       clean(userId);

//     if (!normalisedUserId) {
//       return 0;
//     }

//     const suppliers =
//       await getSuppliers();

//     let linkedCount = 0;

//     const updatedSuppliers =
//       suppliers.map((supplier) => {
//         if (
//           supplier.userId !== "guest" &&
//           supplier.userId !== ""
//         ) {
//           return supplier;
//         }

//         linkedCount += 1;

//         return normaliseSupplier({
//           ...supplier,

//           userId: normalisedUserId,

//           updatedAt:
//             new Date().toISOString(),

//           synced: false,
//           syncedAt: undefined,
//         });
//       });

//     if (linkedCount > 0) {
//       await saveAllSuppliers(
//         updatedSuppliers,
//       );
//     }

//     return linkedCount;
//   };

// lib/supplierStorage.ts

import {
  CreateSupplierInput,
  DEFAULT_SUPPLIER_PAYMENT_TERMS,
  Supplier,
  SupplierPaymentTerms,
  SupplierType,
  UpdateSupplierInput,
  getSupplierDisplayName,
} from "@/types/supplier";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPPLIERS_KEY = "stocktally_suppliers";

const VALID_SUPPLIER_TYPES: SupplierType[] = [
  "business",
  "individual",
];

const VALID_PAYMENT_TERMS: SupplierPaymentTerms[] = [
  "due_on_receipt",
  "net_7",
  "net_14",
  "net_30",
  "net_45",
  "net_60",
  "custom",
];

const generateId = (): string =>
  `supplier_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

const clean = (value?: string | null): string =>
  typeof value === "string" ? value.trim() : "";

const numberValue = (
  value?: number | string | null,
): number => {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const nonNegativeNumber = (
  value?: number | string | null,
): number => {
  return Math.max(0, numberValue(value));
};

const normaliseSupplierType = (
  value?: SupplierType | string,
): SupplierType => {
  if (
    value &&
    VALID_SUPPLIER_TYPES.includes(
      value as SupplierType,
    )
  ) {
    return value as SupplierType;
  }

  return "business";
};

const normalisePaymentTerms = (
  value?: SupplierPaymentTerms | string,
): SupplierPaymentTerms => {
  if (
    value &&
    VALID_PAYMENT_TERMS.includes(
      value as SupplierPaymentTerms,
    )
  ) {
    return value as SupplierPaymentTerms;
  }

  return DEFAULT_SUPPLIER_PAYMENT_TERMS;
};

/**
 * Converts older or incomplete supplier records into the
 * current Supplier structure.
 *
 * This also allows existing local records created before
 * fields such as type, locale, taxNumber and custom payment
 * terms were introduced to continue working.
 */
const normaliseSupplier = (
  value: Partial<Supplier>,
): Supplier => {
  const now = new Date().toISOString();

  const type = normaliseSupplierType(
    value.type,
  );

  const paymentTerms =
    normalisePaymentTerms(
      value.paymentTerms,
    );

  const customPaymentTermDays =
    paymentTerms === "custom"
      ? nonNegativeNumber(
          value.customPaymentTermDays,
        )
      : nonNegativeNumber(
          value.customPaymentTermDays,
        );

  return {
    id: clean(value.id) || generateId(),

    cloudId:
      clean(value.cloudId) || undefined,

    userId:
      clean(value.userId) || "guest",

    type,

    companyName:
      clean(value.companyName) ||
      undefined,

    contactName:
      clean(value.contactName),

    supplierCode:
      clean(value.supplierCode) ||
      undefined,

    email:
      clean(value.email) || undefined,

    phone:
      clean(value.phone) || undefined,

    website:
      clean(value.website) || undefined,

    addressLine1:
      clean(value.addressLine1) ||
      undefined,

    addressLine2:
      clean(value.addressLine2) ||
      undefined,

    city:
      clean(value.city) || undefined,

    county:
      clean(value.county) || undefined,

    postcode:
      clean(value.postcode) ||
      undefined,

    country:
      clean(value.country) ||
      undefined,

    taxNumber:
      clean(value.taxNumber) ||
      undefined,

    currencyCode:
      clean(value.currencyCode) ||
      "GBP",

    currencySymbol:
      clean(value.currencySymbol) ||
      "£",

    locale:
      clean(value.locale) ||
      "en-GB",

    paymentTerms,

    customPaymentTermDays,

    openingBalance: numberValue(
      value.openingBalance,
    ),

    creditLimit: nonNegativeNumber(
      value.creditLimit,
    ),

    notes:
      clean(value.notes) || undefined,

    isActive:
      value.isActive === undefined
        ? true
        : Boolean(value.isActive),

    createdAt:
      clean(value.createdAt) || now,

    updatedAt:
      clean(value.updatedAt) || now,

    synced: Boolean(value.synced),

    syncedAt:
      clean(value.syncedAt) ||
      undefined,
  };
};

const validateSupplier = (
  supplier: Pick<
    Supplier,
    | "type"
    | "companyName"
    | "contactName"
  >,
): void => {
  const companyName =
    supplier.companyName?.trim() || "";

  const contactName =
    supplier.contactName?.trim() || "";

  if (
    supplier.type === "business" &&
    !companyName
  ) {
    throw new Error(
      "Supplier company name is required.",
    );
  }

  if (
    supplier.type === "individual" &&
    !contactName
  ) {
    throw new Error(
      "Supplier contact name is required.",
    );
  }

  if (!companyName && !contactName) {
    throw new Error(
      "Enter a supplier company name or contact name.",
    );
  }
};

const supplierCodeExists = (
  suppliers: Supplier[],
  supplierCode?: string,
  excludedSupplierId?: string,
): boolean => {
  const normalisedCode =
    supplierCode?.trim().toLowerCase();

  if (!normalisedCode) {
    return false;
  }

  return suppliers.some((supplier) => {
    if (
      excludedSupplierId &&
      supplier.id === excludedSupplierId
    ) {
      return false;
    }

    return (
      supplier.supplierCode
        ?.trim()
        .toLowerCase() ===
      normalisedCode
    );
  });
};

// -------------------------------------------------------
// SAVE ALL SUPPLIERS
// -------------------------------------------------------

export const saveAllSuppliers = async (
  items: Supplier[],
): Promise<void> => {
  const normalisedItems = items.map(
    (item) => normaliseSupplier(item),
  );

  await AsyncStorage.setItem(
    SUPPLIERS_KEY,
    JSON.stringify(normalisedItems),
  );
};

// -------------------------------------------------------
// GET SUPPLIERS
// -------------------------------------------------------

export const getSuppliers =
  async (): Promise<Supplier[]> => {
    try {
      const raw =
        await AsyncStorage.getItem(
          SUPPLIERS_KEY,
        );

      if (!raw) {
        return [];
      }

      const parsed: unknown =
        JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item) =>
          normaliseSupplier(
            item as Partial<Supplier>,
          ),
        )
        .sort((a, b) =>
          getSupplierDisplayName(
            a,
          ).localeCompare(
            getSupplierDisplayName(b),
            undefined,
            {
              sensitivity: "base",
            },
          ),
        );
    } catch (error) {
      console.error(
        "Failed to load suppliers:",
        error,
      );

      throw new Error(
        "Could not load suppliers.",
      );
    }
  };

// -------------------------------------------------------
// GET ACTIVE SUPPLIERS
// -------------------------------------------------------

export const getActiveSuppliers =
  async (): Promise<Supplier[]> => {
    const suppliers =
      await getSuppliers();

    return suppliers.filter(
      (supplier) => supplier.isActive,
    );
  };

// -------------------------------------------------------
// GET SUPPLIER BY LOCAL ID
// -------------------------------------------------------

export const getSupplierById = async (
  id: string,
): Promise<Supplier | null> => {
  const suppliers =
    await getSuppliers();

  return (
    suppliers.find(
      (supplier) =>
        supplier.id === id,
    ) || null
  );
};

// -------------------------------------------------------
// GET SUPPLIER BY CLOUD ID
// -------------------------------------------------------

export const getSupplierByCloudId =
  async (
    cloudId: string,
  ): Promise<Supplier | null> => {
    const suppliers =
      await getSuppliers();

    return (
      suppliers.find(
        (supplier) =>
          supplier.cloudId === cloudId,
      ) || null
    );
  };

// -------------------------------------------------------
// SAVE SUPPLIER
// -------------------------------------------------------

export const saveSupplier = async (
  input: CreateSupplierInput,
): Promise<Supplier> => {
  const suppliers =
    await getSuppliers();

  const now =
    new Date().toISOString();

  const supplier =
    normaliseSupplier({
      ...input,

      id: generateId(),

      createdAt: now,
      updatedAt: now,

      synced: false,
      syncedAt: undefined,
    });

  validateSupplier(supplier);

  if (
    supplierCodeExists(
      suppliers,
      supplier.supplierCode,
    )
  ) {
    throw new Error(
      "A supplier with this code already exists.",
    );
  }

  await saveAllSuppliers([
    ...suppliers,
    supplier,
  ]);

  return supplier;
};

// -------------------------------------------------------
// UPDATE SUPPLIER
// -------------------------------------------------------

// export const updateSupplier = async (
//   id: string,
//   updates: UpdateSupplierInput,
// ): Promise<Supplier> => {
//   const suppliers =
//     await getSuppliers();

//   const index =
//     suppliers.findIndex(
//       (supplier) =>
//         supplier.id === id,
//     );

//   if (index < 0) {
//     throw new Error(
//       "Supplier not found.",
//     );
//   }

//   const existing = suppliers[index];

//   const updated =
//     normaliseSupplier({
//       ...existing,
//       ...updates,

//       id: existing.id,
//       cloudId:
//         updates.cloudId ??
//         existing.cloudId,

//       userId:
//         updates.userId ??
//         existing.userId,

//       createdAt:
//         existing.createdAt,

//       updatedAt:
//         new Date().toISOString(),

//       synced: false,
//       syncedAt: undefined,
//     });

//   validateSupplier(updated);

//   if (
//     supplierCodeExists(
//       suppliers,
//       updated.supplierCode,
//       id,
//     )
//   ) {
//     throw new Error(
//       "A supplier with this code already exists.",
//     );
//   }

//   const next = [...suppliers];

//   next[index] = updated;

//   await saveAllSuppliers(next);

//   return updated;
// };

export const updateSupplier = async (
  id: string,
  updates: UpdateSupplierInput,
): Promise<Supplier> => {
  const suppliers = await getSuppliers();

  const index = suppliers.findIndex(
    (supplier) => supplier.id === id,
  );

  if (index < 0) {
    throw new Error("Supplier not found.");
  }

  const existing = suppliers[index];

  const updated = normaliseSupplier({
    ...existing,
    ...updates,

    id: existing.id,
    cloudId: existing.cloudId,
    userId: existing.userId,

    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),

    synced: false,
    syncedAt: undefined,
  });

  validateSupplier(updated);

  if (
    supplierCodeExists(
      suppliers,
      updated.supplierCode,
      id,
    )
  ) {
    throw new Error(
      "A supplier with this code already exists.",
    );
  }

  const next = [...suppliers];
  next[index] = updated;

  await saveAllSuppliers(next);

  return updated;
};

// -------------------------------------------------------
// ACTIVATE / DEACTIVATE SUPPLIER
// -------------------------------------------------------

export const deactivateSupplier = (
  id: string,
): Promise<Supplier> =>
  updateSupplier(id, {
    isActive: false,
  });

export const reactivateSupplier = (
  id: string,
): Promise<Supplier> =>
  updateSupplier(id, {
    isActive: true,
  });

// -------------------------------------------------------
// DELETE SUPPLIER
// -------------------------------------------------------

export const deleteSupplier = async (
  id: string,
): Promise<void> => {
  const suppliers =
    await getSuppliers();

  await saveAllSuppliers(
    suppliers.filter(
      (supplier) =>
        supplier.id !== id,
    ),
  );
};

// -------------------------------------------------------
// MARK SUPPLIER AS SYNCED
// -------------------------------------------------------

export const markSupplierSynced =
  async (
    id: string,
    cloudId: string,
    syncedAt = new Date().toISOString(),
  ): Promise<void> => {
    const suppliers =
      await getSuppliers();

    const next = suppliers.map(
      (supplier) =>
        supplier.id === id
          ? normaliseSupplier({
              ...supplier,

              cloudId,

              synced: true,
              syncedAt,
            })
          : supplier,
    );

    await saveAllSuppliers(next);
  };

// -------------------------------------------------------
// MARK SUPPLIER AS UNSYNCED
// -------------------------------------------------------

export const markSupplierUnsynced =
  async (
    id: string,
  ): Promise<void> => {
    const suppliers =
      await getSuppliers();

    await saveAllSuppliers(
      suppliers.map((supplier) =>
        supplier.id === id
          ? {
              ...supplier,
              synced: false,
              syncedAt: undefined,
            }
          : supplier,
      ),
    );
  };

// -------------------------------------------------------
// REPLACE SUPPLIERS FOR USER AFTER CLOUD DOWNLOAD
// -------------------------------------------------------

export const replaceSuppliersForUser =
  async (
    userId: string,
    cloudSuppliers: Supplier[],
  ): Promise<void> => {
    const localSuppliers =
      await getSuppliers();

    const normalisedUserId =
      clean(userId);

    if (!normalisedUserId) {
      throw new Error(
        "A user ID is required to replace suppliers.",
      );
    }

    /*
     * Keep suppliers belonging to other authenticated users.
     */
    const otherUsers =
      localSuppliers.filter(
        (supplier) =>
          supplier.userId !==
            normalisedUserId &&
          supplier.userId !== "guest",
      );

    /*
     * Preserve local records belonging to this user, or
     * guest records awaiting migration, when they have not
     * yet been uploaded.
     */
    const localUnsynced =
      localSuppliers.filter(
        (supplier) =>
          (supplier.userId ===
            normalisedUserId ||
            supplier.userId ===
              "guest") &&
          !supplier.synced,
      );

    const normalisedCloudSuppliers =
      cloudSuppliers.map(
        (supplier) =>
          normaliseSupplier({
            ...supplier,

            userId:
              clean(supplier.userId) ||
              normalisedUserId,

            synced: true,

            syncedAt:
              supplier.syncedAt ||
              new Date().toISOString(),
          }),
      );

    /*
     * Compare both local IDs and cloud IDs to avoid keeping
     * a duplicate unsynced copy of a supplier that already
     * exists in the cloud download.
     */
    const cloudLocalIds = new Set(
      normalisedCloudSuppliers.map(
        (supplier) => supplier.id,
      ),
    );

    const cloudIds = new Set(
      normalisedCloudSuppliers
        .map(
          (supplier) =>
            supplier.cloudId,
        )
        .filter(
          (
            cloudId,
          ): cloudId is string =>
            Boolean(cloudId),
        ),
    );

    const preservedUnsynced =
      localUnsynced.filter(
        (supplier) =>
          !cloudLocalIds.has(
            supplier.id,
          ) &&
          !(
            supplier.cloudId &&
            cloudIds.has(
              supplier.cloudId,
            )
          ),
      );

    await saveAllSuppliers([
      ...otherUsers,
      ...preservedUnsynced,
      ...normalisedCloudSuppliers,
    ]);
  };

// -------------------------------------------------------
// LINK GUEST SUPPLIERS TO AUTHENTICATED USER
// -------------------------------------------------------

export const linkGuestSuppliersToUser =
  async (
    userId: string,
  ): Promise<number> => {
    const normalisedUserId =
      clean(userId);

    if (!normalisedUserId) {
      return 0;
    }

    const suppliers =
      await getSuppliers();

    let linkedCount = 0;

    const updatedSuppliers =
      suppliers.map((supplier) => {
        if (
          supplier.userId !== "guest" &&
          supplier.userId !== ""
        ) {
          return supplier;
        }

        linkedCount += 1;

        return normaliseSupplier({
          ...supplier,

          userId: normalisedUserId,

          updatedAt:
            new Date().toISOString(),

          synced: false,
          syncedAt: undefined,
        });
      });

    if (linkedCount > 0) {
      await saveAllSuppliers(
        updatedSuppliers,
      );
    }

    return linkedCount;
  };