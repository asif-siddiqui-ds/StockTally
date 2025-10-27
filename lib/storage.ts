// // lib/storage.ts
// import { ID, Models } from 'appwrite';
// import { database } from '../appwrite';

// const SALE_COLLECTION_ID = '68215e09000dab34a3e5';
// const STOCK_COLLECTION_ID = '68215de900192d30006e';
// const DATABASE_ID = '68215d2a00260d43fd49';

// export type SaleItem = {
//   date: string | number | Date;
//   id: string;
//   name: string;
//   quantity: number;
//   buyerName: string;
//   price: number;
//   paid: boolean;
// };

// export type StockItem = {
//   date: string | number | Date;
//   id: string;
//   name: string;
//   quantity: number;
//   category: string;
// };

// /**
//  * 🔄 Fetch Sale Items from Appwrite Database
//  */
// export const getSaleItems = async () => {
//   try {
//     const response = await database.listDocuments(DATABASE_ID, SALE_COLLECTION_ID);
//     console.log("✅ Fetched Sale Items:", response.documents);
//     return response.documents;
//   } catch (error) {
//     console.error("❌ Error fetching sale items:", error.message);
//     return [];
//   }
// };


// export const getSaleItem = async (id: string) => {
//   try {
//     const response = await database.getDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//     console.log("✅ Fetched Single Sale Item:", response);
//     return response;
//   } catch (error) {
//     console.error("❌ Error fetching sale item:", error.message);
//     return null;
//   }
// };

// /**
//  * 🔄 Fetch Stock Items from Appwrite Database
//  */
// export async function getStockItems(): Promise<StockItem[]> {
//   try {
//     const response = await database.listDocuments(DATABASE_ID, STOCK_COLLECTION_ID);

//     // ✅ Map Appwrite Documents to StockItem
//     return response.documents.map((doc: Models.Document) => ({
//       id: doc.$id,
//       date: doc.date,
//       name: doc.name,
//       quantity: doc.quantity,
//       category: doc.category,
//     })) as StockItem[];

//   } catch (e) {
//     console.error('Error reading stock items from Appwrite:', e);
//     return [];
//   }
// }

// /**
//  * 💾 Save a new Stock Item to Appwrite Database
//  */
// export async function saveStockItem(item: StockItem): Promise<StockItem | null> {
//   try {
//     let response;

//     // Check if the item has an ID, indicating an update rather than a new creation
//     if (item.id) {
//       // Update existing item
//       response = await database.updateDocument(
//         DATABASE_ID,
//         STOCK_COLLECTION_ID,
//         item.id,
//         {
//           name: item.name,         // Ensure all required fields are present
//           quantity: item.quantity,
//           category: item.category,
//           date: item.date,
//         }
//       );
//       console.log('✅ Stock item updated successfully.');
//     } else {
//       // Create a new item
//       response = await database.createDocument(
//         DATABASE_ID,
//         STOCK_COLLECTION_ID,
//         ID.unique(),
//         {
//           name: item.name,
//           quantity: item.quantity,
//           category: item.category,
//           date: item.date,
//         }
//       );
//       console.log('✅ Stock item created successfully.');
//     }

//     // Return the saved or updated item
//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       category: response.category,
//     } as StockItem;
//   } catch (error) {
//     console.error('❌ Error saving or updating stock item to Appwrite:', error);
//     return null;
//   }
// }


// export async function updateStockItem(item: StockItem): Promise<StockItem | null> {
//   try {
//     const response = await database.updateDocument(
//       DATABASE_ID,
//       STOCK_COLLECTION_ID,
//       item.id,
//       {
//         name: item.name,
//         quantity: item.quantity,
//         category: item.category,
//         date: new Date(item.date).toISOString(),
//       }
//     );

//     console.log('✅ Stock item updated successfully.');

//     // Return the updated item
//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       category: response.category,
//     } as StockItem;

//   } catch (error) {
//     console.error('❌ Error updating stock item in Appwrite:', error);
//     return null;
//   }
// }

// export async function saveSaleItem(item: Omit<SaleItem, 'id'>): Promise<SaleItem | null> {
//   try {
//     // ✅ Just send the date directly to Appwrite
//     const response = await database.createDocument(DATABASE_ID, SALE_COLLECTION_ID, ID.unique(), {
//       ...item
//     });
//     return response;
//   } catch (error) {
//     console.error('Error saving sale item to Appwrite:', error);
//     return null;
//   }
// }

// export const updateSaleItem = async (id: string, data: Partial<SaleItem>) => {
//   try {
//     // ✅ Remove `id` from the data before sending to Appwrite
//     const { id: _, ...updateData } = data;

//     console.log("🔄 Updating sale item with data:", updateData);

//     const response = await database.updateDocument(
//       'your-database-id',     // Replace with your actual Database ID
//       'your-collection-id',   // Replace with your actual Collection ID
//       id,                     // Document ID (which is $id in Appwrite)
//       updateData
//     );

//     console.log("✅ Sale item updated successfully:", response);
//     return response;
//   } catch (error) {
//     console.error("❌ Error updating sale item in Appwrite:", error.message);
//     throw error;
//   }
// };

// /**
//  * ❌ Delete a Sale Item from Appwrite Database
//  */
// export async function deleteSaleItem(id: string): Promise<void> {
//   try {
//     await database.deleteDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//     console.log('Sale item deleted successfully.');
//   } catch (e) {
//     console.error('Error deleting sale item from Appwrite:', e);
//     throw e;
//   }
// }

// /**
//  * ❌ Delete a Stock Item from Appwrite Database
//  */
// export async function deleteStockItem(id: string): Promise<void> {
//   try {
//     await database.deleteDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//     console.log('Stock item deleted successfully.');
//   } catch (e) {
//     console.error('Error deleting stock item from Appwrite:', e);
//     throw e;
//   }
// }

// export async function updateStockQuantity(id: string, newQuantity: number): Promise<StockItem | null> {
//   try {
//     const response = await database.updateDocument(
//       DATABASE_ID,
//       STOCK_COLLECTION_ID,
//       id,
//       {
//         quantity: newQuantity,
//       }
//     );

//     console.log('✅ Stock item updated successfully:', response);

//     return {
//       id: response.$id,
//       name: response.name,
//       category: response.category,
//       quantity: response.quantity,
//       date: response.date,
//     } as StockItem;
//   } catch (error) {
//     console.error('❌ Error updating stock quantity in Appwrite:', error);
//     return null;
//   }
// }

// import { ID, Models, Query } from 'appwrite';
// import { database } from '../appwrite';

// const SALE_COLLECTION_ID = '68215e09000dab34a3e5';
// const STOCK_COLLECTION_ID = '68215de900192d30006e';
// const DATABASE_ID = '68215d2a00260d43fd49';

// export type SaleItem = {
//   date: string | number | Date;
//   id: string;
//   name: string;
//   quantity: number;
//   buyerName: string;
//   price: number;
//   paid: boolean;
//   stockItemId: string;
// };

// export type StockItem = {
//   date: string | number | Date;
//   id: string;
//   name: string;
//   quantity: number;
//   category: string;
// };

// /**
//  * 🔄 Fetch All Sale Items
//  */
// // export const getSaleItems = async (): Promise<SaleItem[]> => {
// //   try {
// //     const response = await database.listDocuments(DATABASE_ID, SALE_COLLECTION_ID);
// //     console.log("✅ Fetched Sale Items:", response.documents);

// //     return response.documents.map((doc: Models.Document) => ({
// //       id: doc.$id,
// //       date: doc.date,
// //       name: doc.name,
// //       quantity: doc.quantity,
// //       buyerName: doc.buyerName,
// //       price: doc.price,
// //       paid: doc.paid ?? false,
// //       stockItemId: doc.stockItemId,
// //     }));
// //   } catch (error) {
// //     console.error("❌ Error fetching sale items:", error.message);
// //     return [];
// //   }
// // };

// export async function getSaleItems(): Promise<SaleItem[]> {
//   const response = await database.listDocuments(
//     DATABASE_ID,
//     SALE_COLLECTION_ID,
//     [
//       Query.orderDesc('$createdAt') // 🔁 Show latest items first
//     ]
//   );

//   return response.documents.map(doc => ({
//     id: doc.$id,
//     name: doc.name,
//     quantity: doc.quantity,
//     price: doc.price,
//     buyerName: doc.buyerName,
//     paid: doc.paid ?? false,
//     date: doc.date,
//     stockItemId: doc.stockItemId,
//   }));
// }


// /**
//  * 🔄 Fetch a Single Sale Item
//  */
// export const getSaleItem = async (id: string): Promise<SaleItem | null> => {
//   try {
//     const response = await database.getDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//     console.log("✅ Fetched Single Sale Item:", response);

//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       buyerName: response.buyerName,
//       price: response.price,
//       paid: response.paid ?? false,
//       stockItemId: response.stockItemId,
//     };
//   } catch (error) {
//     console.error("❌ Error fetching sale item:", error.message);
//     return null;
//   }
// };

// /**
//  * 💾 Save a New Sale Item
//  */
// export async function saveSaleItem(item: Omit<SaleItem, 'id'>): Promise<SaleItem | null> {
//   try {
//     const response = await database.createDocument(
//       DATABASE_ID, 
//       SALE_COLLECTION_ID, 
//       ID.unique(), 
//       {
//         ...item,
//         paid: item.paid ?? false,
//       }
//     );
//     console.log("✅ Sale item saved successfully:", response);

//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       buyerName: response.buyerName,
//       price: response.price,
//       paid: response.paid,
//       stockItemId: response.stockItemId,
//     };
//   } catch (error) {
//     console.error('❌ Error saving sale item to Appwrite:', error);
//     return null;
//   }
// }

// /**
//  * ✏️ Update an Existing Sale Item
//  */
// export const updateSaleItem = async (id: string, data: Partial<SaleItem>): Promise<SaleItem | null> => {
//   try {
//     const { id: _, ...updateData } = data;

//     console.log("🔄 Updating sale item with data:", updateData);

//     const response = await database.updateDocument(
//       DATABASE_ID,
//       SALE_COLLECTION_ID,
//       id,
//       {
//         ...updateData,
//         paid: updateData.paid ?? false,
//       }
//     );

//     console.log("✅ Sale item updated successfully:", response);
//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       buyerName: response.buyerName,
//       price: response.price,
//       paid: response.paid,
//       stockItemId: response.stockItemId,
//     };
//   } catch (error) {
//     console.error("❌ Error updating sale item in Appwrite:", error.message);
//     throw error;
//   }
// };

// /**
//  * ❌ Delete a Sale Item
//  */

// export async function deleteSaleItem(id: string): Promise<boolean> {
//   try {
//     await database.deleteDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//     return true;
//   } catch (error) {
//     console.error('❌ Error deleting sale item:', error);
//     return false;
//   }
// }


// /**
//  * ❌ Delete a Stock Item
//  */
// export async function deleteStockItem(id: string): Promise<void> {
//   try {
//     await database.deleteDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//     console.log('✅ Stock item deleted successfully.');
//   } catch (e) {
//     console.error('❌ Error deleting stock item from Appwrite:', e);
//     throw e;
//   }
// }

// export async function getStockItems(): Promise<StockItem[]> {
//   try {
//     const response = await database.listDocuments(DATABASE_ID, STOCK_COLLECTION_ID);

//     // ✅ Map Appwrite Documents to StockItem
//     return response.documents.map((doc: Models.Document) => ({
//       id: doc.$id,
//       date: doc.date,
//       name: doc.name,
//       quantity: doc.quantity,
//       category: doc.category,
//     })) as StockItem[];

//   } catch (e) {
//     console.error('Error reading stock items from Appwrite:', e);
//     return [];
//   }
// }

// export const getStockItem = async (id: string): Promise<StockItem | null> => {
//   try {
//     const response = await database.getDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//     console.log("✅ Fetched Single Stock Item:", response);

//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       category: response.category,
//     };
//   } catch (error) {
//     console.error("❌ Error fetching sale item:", error.message);
//     return null;
//   }
// }

// /**
//  * 💾 Save a new Stock Item to Appwrite Database
//  */
// export async function saveStockItem(item: StockItem): Promise<StockItem | null> {
//   try {
//     let response;

//     // Check if the item has an ID, indicating an update rather than a new creation
//     if (item.id) {
//       // Update existing item
//       response = await database.updateDocument(
//         DATABASE_ID,
//         STOCK_COLLECTION_ID,
//         item.id,
//         {
//           name: item.name,         // Ensure all required fields are present
//           quantity: item.quantity,
//           category: item.category,
//           date: item.date,
//         }
//       );
//       console.log('✅ Stock item updated successfully.');
//     } else {
//       // Create a new item
//       response = await database.createDocument(
//         DATABASE_ID,
//         STOCK_COLLECTION_ID,
//         ID.unique(),
//         {
//           name: item.name,
//           quantity: item.quantity,
//           category: item.category,
//           date: item.date,
//         }
//       );
//       console.log('✅ Stock item created successfully.');
//     }
//     // Return the saved or updated item
//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       category: response.category,
//     } as StockItem;
//   } catch (error) {
//     console.error('❌ Error saving or updating stock item to Appwrite:', error);
//     return null;
//   }
// }


// export const updateStockItem = async (stockItemId: string, updates: Partial<StockItem>) => {
//   try {
//     console.log("🔄 Fetching Original Stock Item for Update:", stockItemId);

//     // Fetch the original item to preserve the date
//     const originalItem = await database.getDocument(DATABASE_ID, STOCK_COLLECTION_ID, stockItemId);

//     if (!originalItem) {
//       console.error("❌ Stock item not found for update.");
//       return false;
//     }

//     // Merge the updates while preserving the original date
//     const updatedItem = {
//       quantity: updates.quantity ?? originalItem.quantity,
//       category: updates.category ?? originalItem.category,
//       name: updates.name ?? originalItem.name,  // ✅ Allow name update
//       date: originalItem.date // 🚀 Date is always kept intact
//     };

//     console.log("🔄 Updating Stock Item:", updatedItem);

//     await database.updateDocument(DATABASE_ID, STOCK_COLLECTION_ID, stockItemId, updatedItem);

//     console.log("✅ Stock Item Updated Successfully.");
//     return true;
//   } catch (error) {
//     console.error("❌ Error updating stock item:", error.message);
//     return false;
//   }
// };


// export async function updateStockQuantity(id: string, newQuantity: number): Promise<StockItem | null> {
//   try {
//     const response = await database.updateDocument(
//       DATABASE_ID,
//       STOCK_COLLECTION_ID,
//       id,
//       {
//         quantity: newQuantity,
//       }
//     );

//     console.log('✅ Stock item updated successfully:', response);

//     return {
//       id: response.$id,
//       name: response.name,
//       category: response.category,
//       quantity: response.quantity,
//       date: response.date,
//     } as StockItem;
//   } catch (error) {
//     console.error('❌ Error updating stock quantity in Appwrite:', error);
//     return null;
//   }
// }

// import { useAuth } from '@/context/AuthContext';
// import { ID, Query } from 'appwrite';
// import { account, database } from '../appwrite';

// const SALE_COLLECTION_ID = '68215e09000dab34a3e5';
// const STOCK_COLLECTION_ID = '68215de900192d30006e';
// const DATABASE_ID = '68215d2a00260d43fd49';
// const COMPANY_COLLECTION_ID = "companyprofile";

// // ------------------ Guest Storage (in-memory only) ------------------
// let guestSales: SaleItem[] = [];
// let guestStocks: StockItem[] = [];

// // Helper: detect if guest or pro
// async function getCurrentUser() {
//   try {
//     const user = await account.get();
//     return { userId: user.$id, isGuest: false };
//   } catch {
//     return { userId: 'guest', isGuest: true };
//   }
// }


// export type SaleItem = {
//   date: string | number | Date;
//   id: string;
//   name: string;
//   quantity: number;
//   buyerName: string;
//   price: number;
//   paid: boolean;
//   stockItemId: string;
//   userId: string;
// };

// export type StockItem = {
//   date: string | number | Date;
//   id: string;
//   name: string;
//   quantity: number;
//   category: string;
//   userId: string;
// };

// export type CompanyProfile = {
//   id: string;
//   companyName: string;
//   address: string;
//   phone: string;
//   logo?: string;   // store Appwrite File ID (if using logo upload)
//   userId: string;  // Appwrite user ID
// };

// /**
//  * 🔄 Fetch company profile for the logged-in user
//  */
// export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
//   try {
//     const res = await database.listDocuments(
//       DATABASE_ID,
//       COMPANY_COLLECTION_ID,
//       [Query.equal("userId", userId)]
//     );

//     if (res.documents.length > 0) {
//       const doc = res.documents[0];
//       return {
//         id: doc.$id,
//         companyName: doc.companyName,
//         address: doc.address,
//         phone: doc.phone,
//         logo: doc.logo,
//         userId: doc.userId,
//       };
//     }

//     return null;
//   } catch (err) {
//     console.error("❌ Error fetching company profile:", err);
//     return null;
//   }
// }

// /**
//  * 💾 Create or update company profile
//  */
// export async function saveCompanyProfile(userId: string, data: Partial<CompanyProfile>): Promise<CompanyProfile | null> {
//   try {
//     const existing = await getCompanyProfile(userId);

//     let res;
//     if (existing) {
//       // Update existing profile
//       res = await database.updateDocument(DATABASE_ID, COMPANY_COLLECTION_ID, existing.id, {
//         ...data,
//       });
//     } else {
//       // Create a new one
//       res = await database.createDocument(DATABASE_ID, COMPANY_COLLECTION_ID, ID.unique(), {
//         ...data,
//         userId,
//       });
//     }

//     return {
//       id: res.$id,
//       companyName: res.companyName,
//       address: res.address,
//       phone: res.phone,
//       logo: res.logo,
//       userId: res.userId,
//     };
//   } catch (err) {
//     console.error("❌ Error saving company profile:", err);
//     return null;
//   }
// }


// // 🔄 Get Sale Items scoped to current user
// export async function getSaleItems(): Promise<SaleItem[]> {
//   const userId = await getCurrentUserId();
//   const response = await database.listDocuments(
//     DATABASE_ID,
//     SALE_COLLECTION_ID,
//     [
//       Query.equal('userId', userId),
//       Query.orderDesc('$createdAt')
//     ]
//   );

//   return response.documents.map(doc => ({
//     id: doc.$id,
//     name: doc.name,
//     quantity: doc.quantity,
//     price: doc.price,
//     buyerName: doc.buyerName,
//     paid: doc.paid ?? false,
//     date: doc.date,
//     stockItemId: doc.stockItemId,
//     userId: doc.userId,
//   }));
// }

// /**
//  * 🔄 Fetch a Single Sale Item
//  */
// export const getSaleItem = async (id: string): Promise<SaleItem | null> => {
//   try {
//     const response = await database.getDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//     console.log("✅ Fetched Single Sale Item:", response);

//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       buyerName: response.buyerName,
//       price: response.price,
//       paid: response.paid ?? false,
//       stockItemId: response.stockItemId,
//       userId: response.userId,
//     };
//   } catch (error) {
//     console.error("❌ Error fetching sale item:", error.message);
//     return null;
//   }
// };

// // 💾 Save Sale Item (include userId)
// export async function saveSaleItem(item: Omit<SaleItem, 'id' | 'userId'>): Promise<SaleItem | null> {
//   try {
//     const userId = await getCurrentUserId();
//     const response = await database.createDocument(
//       DATABASE_ID,
//       SALE_COLLECTION_ID,
//       ID.unique(),
//       { ...item, userId }
//     );
//     return { ...item, id: response.$id, userId };
//   } catch (error) {
//     console.error('❌ Error saving sale item:', error);
//     return null;
//   }
// }

// export const updateSaleItem = async (
//   id: string,
//   updates: Partial<SaleItem>
// ): Promise<SaleItem | null> => {
//   try {
//     const existing = await database.getDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//     if (!existing) throw new Error("Sale item not found.");

//     const updateData = {
//       name: updates.name ?? existing.name,
//       quantity: updates.quantity ?? existing.quantity,
//       price: updates.price ?? existing.price,
//       buyerName: updates.buyerName ?? existing.buyerName,
//       paid: updates.paid ?? existing.paid,
//       stockItemId: updates.stockItemId ?? existing.stockItemId,
//       date: existing.date,
//       userId: existing.userId, // 🔒 preserve ownership
//     };

//     const response = await database.updateDocument(DATABASE_ID, SALE_COLLECTION_ID, id, updateData);

//     return {
//       id: response.$id,
//       name: response.name,
//       quantity: response.quantity,
//       price: response.price,
//       buyerName: response.buyerName,
//       paid: response.paid,
//       date: response.date,
//       stockItemId: response.stockItemId,
//       userId: response.userId,
//     };
//   } catch (error) {
//     console.error("❌ Error updating sale item:", error.message);
//     return null;
//   }
// };

// export async function deleteSaleItem(id: string): Promise<boolean> {
//   try {
//     await database.deleteDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//     return true;
//   } catch (error) {
//     console.error('❌ Error deleting sale item:', error);
//     return false;
//   }
// }


// // 🔄 Get Stock Items scoped to current user
// export async function getStockItems(): Promise<StockItem[]> {
//   const userId = await getCurrentUserId();
//   const response = await database.listDocuments(
//     DATABASE_ID,
//     STOCK_COLLECTION_ID,
//     [Query.equal('userId', userId)]
//   );

//   return response.documents.map(doc => ({
//     id: doc.$id,
//     name: doc.name,
//     quantity: doc.quantity,
//     category: doc.category,
//     date: doc.date,
//     userId: doc.userId,
//   }));
// }

// export const getStockItem = async (id: string): Promise<StockItem | null> => {
//   try {
//     const response = await database.getDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//     console.log("✅ Fetched Single Stock Item:", response);

//     return {
//       id: response.$id,
//       date: response.date,
//       name: response.name,
//       quantity: response.quantity,
//       category: response.category,
//       userId: response.userId,
//     };
//   } catch (error) {
//     console.error("❌ Error fetching sale item:", error.message);
//     return null;
//   }
// }

// // 💾 Save Stock Item (include userId)
// export async function saveStockItem(item: Omit<StockItem, 'id' | 'userId'>): Promise<StockItem | null> {
//   try {
//     const userId = await getCurrentUserId();
//     const response = await database.createDocument(
//       DATABASE_ID,
//       STOCK_COLLECTION_ID,
//       ID.unique(),
//       { ...item, userId }
//     );
//     return { ...item, id: response.$id, userId };
//   } catch (error) {
//     console.error('❌ Error saving stock item:', error);
//     return null;
//   }
// }

// export const updateStockItem = async (id: string, updates: Partial<StockItem>): Promise<StockItem | null> => {
//   try {
//     const existing = await database.getDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//     if (!existing) throw new Error("Stock item not found.");

//     const updateData = {
//       name: updates.name ?? existing.name,
//       quantity: updates.quantity ?? existing.quantity,
//       category: updates.category ?? existing.category,
//       date: existing.date, // always keep original
//       userId: existing.userId, // 🔒 required to keep valid
//     };

//     const response = await database.updateDocument(DATABASE_ID, STOCK_COLLECTION_ID, id, updateData);

//     return {
//       id: response.$id,
//       name: response.name,
//       quantity: response.quantity,
//       category: response.category,
//       date: response.date,
//       userId: response.userId,
//     };
//   } catch (error) {
//     console.error("❌ Error updating stock item:", error.message);
//     return null;
//   }
// };


// /**
//  * ❌ Delete a Stock Item
//  */
// export async function deleteStockItem(id: string): Promise<void> {
//   try {
//     await database.deleteDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//     console.log('✅ Stock item deleted successfully.');
//   } catch (e) {
//     console.error('❌ Error deleting stock item from Appwrite:', e);
//     throw e;
//   }
// }

// export async function updateStockQuantity(id: string, newQuantity: number): Promise<StockItem | null> {
//   try {
//     const response = await database.updateDocument(
//       DATABASE_ID,
//       STOCK_COLLECTION_ID,
//       id,
//       {
//         quantity: newQuantity,
//       }
//     );

//     console.log('✅ Stock item updated successfully:', response);

//     return {
//       id: response.$id,
//       name: response.name,
//       category: response.category,
//       quantity: response.quantity,
//       date: response.date,
//     } as StockItem;
//   } catch (error) {
//     console.error('❌ Error updating stock quantity in Appwrite:', error);
//     return null;
//   }
// }

// import { getCachedUserId } from "@/context/AuthContext";
// import { getProUserStatus } from "@/context/ProUserContext";
// import { isGuest } from "@/utils/guest";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ID, Query } from "appwrite";
// import { account, database } from "../appwrite";

// // Database IDs (Appwrite)
// const SALE_COLLECTION_ID = "68215e09000dab34a3e5";
// const STOCK_COLLECTION_ID = "68215de900192d30006e";
// const DATABASE_ID = "68215d2a00260d43fd49";
// const COMPANY_COLLECTION_ID = "companyprofile";
// const RETURNS_COLLECTION_ID = "returns";

// // ---------------- TYPES ---------------- //
// export type SaleItem = {
//   id: string;
//   date: string;
//   name: string;
//   quantity: number;
//   buyerName: string;
//   price: number;
//   paid: boolean;
//   stockItemId: string;
//   userId?: string;
// };

// export type StockItem = {
//   id: string;
//   date: string;
//   name: string;
//   quantity: number;
//   category: string;
//   userId?: string;
// };

// export type CompanyProfile = {
//   id: string;
//   companyName: string;
//   address: string;
//   phone: string;
//   logo?: string;
//   userId: string;
// };

// export type ReturnItem = {
//   id: string;
//   stockItemId: string;
//   name: string;
//   quantity: number;
//   reason: string;
//   date: string;
//   userId?: string;
// };

// // ---------------- HELPERS ---------------- //
// export async function getCurrentUserId(): Promise<string> {
//   // Try cached
//   const cached = await getCachedUserId();
//   if (cached) return cached;

//   // Fallback to live account
//   const current = await account.get();
//   await AsyncStorage.setItem("currentUserId", current.$id);
//   return current.$id;
// }

// async function getLocal<T>(key: string): Promise<T[]> {
//   const raw = await AsyncStorage.getItem(key);
//   return raw ? JSON.parse(raw) : [];
// }

// async function setLocal<T>(key: string, data: T[]): Promise<void> {
//   await AsyncStorage.setItem(key, JSON.stringify(data));
// }

// // ---------------- STOCK ---------------- //
// export async function getStockItems(): Promise<StockItem[]> {
//   if (await isGuest()) {
//     return await getLocal<StockItem>("stock");
//   }

//   const userId = await getCurrentUserId();
//   const res = await database.listDocuments(DATABASE_ID, STOCK_COLLECTION_ID, [
//     Query.equal("userId", userId),
//   ]);

//   return res.documents.map((doc) => ({
//     id: doc.$id,
//     name: doc.name,
//     quantity: doc.quantity,
//     category: doc.category,
//     date: doc.date,
//     userId: doc.userId,
//   }));
// }

// export async function getStockItem(id: string): Promise<StockItem | null> {
//   if (await isGuest()) {
//     const all = await getLocal<StockItem>("stock");
//     return all.find((s) => s.id === id) ?? null;
//   }

//   const doc = await database.getDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//   return {
//     id: doc.$id,
//     name: doc.name,
//     quantity: doc.quantity,
//     category: doc.category,
//     date: doc.date,
//     userId: doc.userId,
//   };
// }

// export async function saveStockItem(
//   item: Omit<StockItem, "id" | "userId">
// ): Promise<StockItem | null> {
//   if (await isGuest()) {
//     const newItem: StockItem = { ...item, id: Date.now().toString(), userId: "guest" };
//     const all = await getLocal<StockItem>("stock");
//     all.push(newItem);
//     await setLocal("stock", all);
//     return newItem;
//   }

//   const userId = await getCurrentUserId();
//   const res = await database.createDocument(DATABASE_ID, STOCK_COLLECTION_ID, ID.unique(), {
//     ...item,
//     userId,
//   });
//   return { ...item, id: res.$id, userId };
// }

// export async function updateStockItem(
//   id: string,
//   updates: Partial<StockItem>
// ): Promise<StockItem | null> {
//   if (await isGuest()) {
//     const all = await getLocal<StockItem>("stock");
//     const index = all.findIndex((s) => s.id === id);
//     if (index === -1) return null;
//     all[index] = { ...all[index], ...updates };
//     await setLocal("stock", all);
//     return all[index];
//   }

//   const existing = await database.getDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//   const res = await database.updateDocument(DATABASE_ID, STOCK_COLLECTION_ID, id, {
//     ...updates,
//     date: existing.date,
//     userId: existing.userId,
//   });
//   return {
//     id: res.$id,
//     name: res.name,
//     quantity: res.quantity,
//     category: res.category,
//     date: res.date,
//     userId: res.userId,
//   };
// }

// export async function deleteStockItem(id: string): Promise<boolean> {
//   if (await isGuest()) {
//     let all = await getLocal<StockItem>("stock");
//     all = all.filter((s) => s.id !== id);
//     await setLocal("stock", all);
//     return true;
//   }

//   await database.deleteDocument(DATABASE_ID, STOCK_COLLECTION_ID, id);
//   return true;
// }

// export async function updateStockQuantity(
//   id: string,
//   newQuantity: number
// ): Promise<StockItem | null> {
//   if (await isGuest()) {
//     const all = await getLocal<StockItem>("stock");
//     const index = all.findIndex((s) => s.id === id);
//     if (index === -1) return null;
//     all[index].quantity = newQuantity;
//     await setLocal("stock", all);
//     return all[index];
//   }

//   const res = await database.updateDocument(DATABASE_ID, STOCK_COLLECTION_ID, id, {
//     quantity: newQuantity,
//   });
//   return {
//     id: res.$id,
//     name: res.name,
//     category: res.category,
//     quantity: res.quantity,
//     date: res.date,
//     userId: res.userId,
//   };
// }

// // ---------------- SALES ---------------- //
// export async function getSaleItems(): Promise<SaleItem[]> {
//   if (await isGuest()) {
//     return await getLocal<SaleItem>("sales");
//   }

//   const userId = await getCurrentUserId();
//   const res = await database.listDocuments(DATABASE_ID, SALE_COLLECTION_ID, [
//     Query.equal("userId", userId),
//     Query.orderDesc("$createdAt"),
//   ]);

//   return res.documents.map((doc) => ({
//     id: doc.$id,
//     name: doc.name,
//     quantity: doc.quantity,
//     price: doc.price,
//     buyerName: doc.buyerName,
//     paid: doc.paid,
//     date: doc.date,
//     stockItemId: doc.stockItemId,
//     userId: doc.userId,
//   }));
// }

// export async function getSaleItem(id: string): Promise<SaleItem | null> {
//   if (await isGuest()) {
//     const all = await getLocal<SaleItem>("sales");
//     return all.find((s) => s.id === id) ?? null;
//   }

//   const doc = await database.getDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//   return {
//     id: doc.$id,
//     name: doc.name,
//     quantity: doc.quantity,
//     price: doc.price,
//     buyerName: doc.buyerName,
//     paid: doc.paid,
//     date: doc.date,
//     stockItemId: doc.stockItemId,
//     userId: doc.userId,
//   };
// }

// export async function saveSaleItem(
//   item: Omit<SaleItem, "id" | "userId">
// ): Promise<SaleItem | null> {
//   if (await isGuest()) {
//     const newItem: SaleItem = { ...item, id: Date.now().toString(), userId: "guest" };
//     const all = await getLocal<SaleItem>("sales");
//     all.push(newItem);
//     await setLocal("sales", all);
//     return newItem;
//   }

//   const userId = await getCurrentUserId();
//   const res = await database.createDocument(DATABASE_ID, SALE_COLLECTION_ID, ID.unique(), {
//     ...item,
//     userId,
//   });
//   return { ...item, id: res.$id, userId };
// }

// export async function updateSaleItem(
//   id: string,
//   updates: Partial<SaleItem>
// ): Promise<SaleItem | null> {
//   if (await isGuest()) {
//     const all = await getLocal<SaleItem>("sales");
//     const index = all.findIndex((s) => s.id === id);
//     if (index === -1) return null;
//     all[index] = { ...all[index], ...updates };
//     await setLocal("sales", all);
//     return all[index];
//   }

//   const existing = await database.getDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//   const res = await database.updateDocument(DATABASE_ID, SALE_COLLECTION_ID, id, {
//     ...updates,
//     date: existing.date,
//     userId: existing.userId,
//   });
//   return {
//     id: res.$id,
//     name: res.name,
//     quantity: res.quantity,
//     price: res.price,
//     buyerName: res.buyerName,
//     paid: res.paid,
//     date: res.date,
//     stockItemId: res.stockItemId,
//     userId: res.userId,
//   };
// }

// export async function deleteSaleItem(id: string): Promise<boolean> {
//   if (await isGuest()) {
//     let all = await getLocal<SaleItem>("sales");
//     all = all.filter((s) => s.id !== id);
//     await setLocal("sales", all);
//     return true;
//   }

//   await database.deleteDocument(DATABASE_ID, SALE_COLLECTION_ID, id);
//   return true;
// }

// // ---------------- COMPANY PROFILE (Pro only) ---------------- //


// /** ✅ Get company profile */
// export async function getCompanyProfile(id?: string): Promise<CompanyProfile | null> {
//   const guest = await isGuest();
//   const isPro = await getProUserStatus(); // new helper that reads from context/storage

//   if (guest && isPro) {
//     const all = await getLocal<CompanyProfile>("companyprofile");
//     return all.length > 0 ? all[0] : null;
//   }

//   if (guest && !isPro) {
//     console.warn("🚫 Guest user without Pro access — company profile disabled");
//     return null;
//   }

//   // 🔑 Signed-in user → fetch from Appwrite
//   const userId = id || (await getCurrentUserId());
//   const res = await database.listDocuments(DATABASE_ID, COMPANY_COLLECTION_ID, [
//     Query.equal("userId", userId),
//   ]);

//   if (!res.documents.length) return null;

//   const doc = res.documents[0];
//   return {
//     id: doc.$id,
//     companyName: doc.companyName,
//     address: doc.address,
//     phone: doc.phone,
//     logo: doc.logo,
//     userId: doc.userId,
//   };
// }

// /** ✅ Save or update company profile */
// export async function saveCompanyProfile(
//   data: Omit<CompanyProfile, "id" | "userId">
// ): Promise<CompanyProfile | null> {
//   const guest = await isGuest();
//   const isPro = await getProUserStatus();

//   if (guest) {
//     if (!isPro) {
//       console.warn("🚫 Guest user cannot save company profile without Pro access");
//       return null;
//     }

//     const newItem: CompanyProfile = {
//       ...data,
//       id: Date.now().toString(),
//       userId: "guest",
//     };

//     const all = await getLocal<CompanyProfile>("companyprofile");
//     const updated = all.length ? [newItem] : [...all, newItem];
//     await setLocal("companyprofile", updated);
//     console.log("💾 Saved company profile locally (guest Pro user)");
//     return newItem;
//   }

//   // ✅ Logged-in user: save to Appwrite cloud
//   const userId = await getCurrentUserId();
//   const existing = await getCompanyProfile(userId);
//   let res;

//   if (existing) {
//     res = await database.updateDocument(DATABASE_ID, COMPANY_COLLECTION_ID, existing.id, {
//       ...data,
//     });
//   } else {
//     res = await database.createDocument(DATABASE_ID, COMPANY_COLLECTION_ID, ID.unique(), {
//       ...data,
//       userId,
//     });
//   }

//   console.log("☁️ Saved company profile to cloud");
//   return {
//     id: res.$id,
//     companyName: res.companyName,
//     address: res.address,
//     phone: res.phone,
//     logo: res.logo,
//     userId: res.userId,
//   };
// }

// /* ---------------------- RETURNS / DAMAGES ---------------------- */
// export async function getReturnItems(): Promise<ReturnItem[]> {
//   if (await isGuest()) {
//     return await getLocal<ReturnItem>("returns");
//   }

//   const userId = await getCurrentUserId();
//   const res = await database.listDocuments(DATABASE_ID, RETURNS_COLLECTION_ID, [
//     Query.equal("userId", userId),
//     Query.orderDesc("$createdAt"),
//   ]);

//   return res.documents.map((doc) => ({
//     id: doc.$id,
//     stockItemId: doc.stockItemId,
//     name: doc.name,
//     quantity: doc.quantity,
//     reason: doc.reason,
//     date: doc.date,
//     userId: doc.userId,
//   }));
// }

// export async function getReturnItem(id: string): Promise<ReturnItem | null> {
//   if (await isGuest()) {
//     const all = await getLocal<ReturnItem>("returns");
//     return all.find((s) => s.id === id) ?? null;
//   }

//   const doc = await database.getDocument(DATABASE_ID, RETURNS_COLLECTION_ID, id);
//   return {
//     id: doc.$id,
//     name: doc.name,
//     quantity: doc.quantity,
//     date: doc.date,
//     reason: doc.reason,
//     stockItemId: doc.stockItemId,
//     userId: doc.userId,
//   };
// }

// export async function saveReturnItem(
//   item: Omit<ReturnItem, "id" | "userId">
// ): Promise<ReturnItem | null> {
//   if (await isGuest()) {
//     const newItem: ReturnItem = {
//       ...item,
//       id: Date.now().toString(),
//       userId: "guest",
//     };
//     const all = await getReturnItems();
//     all.push(newItem);
//     await AsyncStorage.setItem("returns", JSON.stringify(all));
//     return newItem;
//   }

//   const userId = await getCurrentUserId();
//   const res = await database.createDocument(
//     DATABASE_ID,
//     RETURNS_COLLECTION_ID,
//     ID.unique(),
//     { ...item, userId }
//   );

//   return {
//     id: res.$id,
//     stockItemId: res.stockItemId,
//     name: res.name,
//     quantity: res.quantity,
//     reason: res.reason,
//     date: res.date,
//     userId: res.userId,
//   };
// }

// export async function deleteReturnItem(id: string): Promise<boolean> {
//   if (await isGuest()) {
//     let all = await getLocal<ReturnItem>("returns");
//     all = all.filter((r) => r.id !== id);
//     await setLocal("returns", all);
//     return true;
//   }

//   try {
//     await database.deleteDocument(DATABASE_ID, RETURNS_COLLECTION_ID, id);
//     return true;
//   } catch (err) {
//     console.error("❌ Error deleting return item:", err);
//     return false;
//   }
// }

// export async function updateReturnItem(
//   id: string,
//   updates: Partial<ReturnItem>
// ): Promise<ReturnItem | null> {
//   if (await isGuest()) {
//     const all = await getLocal<ReturnItem>("returns");
//     const index = all.findIndex((r) => r.id === id);
//     if (index === -1) return null;

//     all[index] = { ...all[index], ...updates };
//     await setLocal("returns", all);
//     return all[index];
//   }

//   try {
//     const existing = await database.getDocument(DATABASE_ID, RETURNS_COLLECTION_ID, id);
//     const res = await database.updateDocument(DATABASE_ID, RETURNS_COLLECTION_ID, id, {
//       ...updates,
//       date: existing.date,
//       userId: existing.userId,
//     });

//     return {
//       id: res.$id,
//       name: res.name,
//       quantity: res.quantity,
//       reason: res.reason,
//       date: res.date,
//       stockItemId: res.stockItemId,
//       userId: res.userId,
//     } as ReturnItem;
//   } catch (err: any) {
//     console.error("❌ Error updating return item:", err.message);
//     return null;
//   }
// }

// /**
//  * ☁️ Backup local data (stock, sales, company profile) to Appwrite Cloud.
//  * - Updates existing records if found, otherwise creates new ones.
//  * - Saves timestamp to "lastBackup" in AsyncStorage.
//  */
// export async function backupDataToCloud(userId: string) {
//   try {
//     console.log("🚀 Starting data backup to cloud...");

//     // ✅ STOCK BACKUP
//     const localStock = await getLocal<StockItem>("stock");
//     const cloudStock = await database.listDocuments(DATABASE_ID, STOCK_COLLECTION_ID, [
//       Query.equal("userId", userId),
//     ]);

//     for (const s of localStock) {
//       const match = cloudStock.documents.find(
//         (d) => d.name?.trim().toLowerCase() === s.name?.trim().toLowerCase()
//       );

//       if (match) {
//         await database.updateDocument(DATABASE_ID, STOCK_COLLECTION_ID, match.$id, {
//           ...s,
//           userId,
//         });
//         console.log(`🔄 Updated stock: ${s.name}`);
//       } else {
//         await database.createDocument(DATABASE_ID, STOCK_COLLECTION_ID, ID.unique(), {
//           ...s,
//           userId,
//         });
//         console.log(`☁️ Uploaded new stock: ${s.name}`);
//       }
//     }

//     // ✅ SALES BACKUP
//     const localSales = await getLocal<SaleItem>("sales");
//     const cloudSales = await database.listDocuments(DATABASE_ID, SALE_COLLECTION_ID, [
//       Query.equal("userId", userId),
//     ]);

//     for (const sale of localSales) {
//       const match = cloudSales.documents.find(
//         (d) =>
//           d.name?.trim().toLowerCase() === sale.name?.trim().toLowerCase() &&
//           d.date === sale.date
//       );

//       if (match) {
//         await database.updateDocument(DATABASE_ID, SALE_COLLECTION_ID, match.$id, {
//           ...sale,
//           userId,
//         });
//         console.log(`🔄 Updated sale: ${sale.name}`);
//       } else {
//         await database.createDocument(DATABASE_ID, SALE_COLLECTION_ID, ID.unique(), {
//           ...sale,
//           userId,
//         });
//         console.log(`☁️ Uploaded new sale: ${sale.name}`);
//       }
//     }

//     // ✅ COMPANY PROFILE BACKUP
//     const localProfiles = await getLocal<CompanyProfile>("companyprofile");
//     const cloudProfiles = await database.listDocuments(DATABASE_ID, COMPANY_COLLECTION_ID, [
//       Query.equal("userId", userId),
//     ]);

//     for (const profile of localProfiles) {
//       const match = cloudProfiles.documents.find(
//         (d) =>
//           d.companyName?.trim().toLowerCase() ===
//           profile.companyName?.trim().toLowerCase()
//       );

//       if (match) {
//         await database.updateDocument(DATABASE_ID, COMPANY_COLLECTION_ID, match.$id, {
//           ...profile,
//           userId,
//         });
//         console.log(`🔄 Updated company profile: ${profile.companyName}`);
//       } else {
//         await database.createDocument(DATABASE_ID, COMPANY_COLLECTION_ID, ID.unique(), {
//           ...profile,
//           userId,
//         });
//         console.log(`☁️ Uploaded new company profile: ${profile.companyName}`);
//       }
//     }

//     // ✅ Save backup timestamp
//     const now = new Date().toISOString();
//     await AsyncStorage.setItem("lastBackup", now);
//     console.log("✅ Backup complete:", now);
//   } catch (error) {
//     console.error("❌ Error backing up data:", error);
//   }
// }


// /**
//  * ⬇️ Restore data from Appwrite Cloud to local storage.
//  * - Overwrites local data.
//  * - Updates timestamp to "lastBackup".
//  */
// export async function restoreDataFromCloud(userId: string) {
//   try {
//     console.log("⬇️ Restoring data from cloud...");

//     const [stockRes, salesRes, companyRes] = await Promise.all([
//       database.listDocuments(DATABASE_ID, STOCK_COLLECTION_ID, [Query.equal("userId", userId)]),
//       database.listDocuments(DATABASE_ID, SALE_COLLECTION_ID, [Query.equal("userId", userId)]),
//       database.listDocuments(DATABASE_ID, COMPANY_COLLECTION_ID, [Query.equal("userId", userId)]),
//     ]);

//     await setLocal("stock", stockRes.documents);
//     await setLocal("sales", salesRes.documents);
//     await setLocal("companyprofile", companyRes.documents);

//     const now = new Date().toISOString();
//     await AsyncStorage.setItem("lastBackup", now);

//     console.log("✅ Restore complete:", now);
//   } catch (error) {
//     console.error("❌ Error restoring data from cloud:", error);
//   }
// }

// lib/storage.ts
import { getCachedUserId } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  date: string;
  userId: string;
  syncedAt: string;
  synced: boolean;
}

export interface SaleItem {
  id: string;
  stockItemId: string;
  name: string;
  quantity: number;
  buyerName: string;
  price: number;
  date: string;
  userId: string;
  paid: boolean;
  syncedAt: string;
  synced: boolean;
}

export interface ReturnItem {
  id: string;
  stockItemId: string;
  name: string;
  quantity: number;
  reason: string;
  date: string;
  userId: string;
  syncedAt: string;
  synced: boolean;
}


/* -------------------------------------------------------------------------- */
/*                              LOCAL STORAGE I/O                             */
/* -------------------------------------------------------------------------- */
export async function getLocal<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error(`❌ Failed to read local key ${key}`, err);
    return [];
  }
}

export async function setLocal<T>(key: string, value: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`❌ Failed to write local key ${key}`, err);
  }
}

/* -------------------------------------------------------------------------- */
/*                                STOCK ITEMS                                */
/* -------------------------------------------------------------------------- */
export async function getStockItems(): Promise<StockItem[]> {
  return await getLocal<StockItem>("stock");
}
export async function getStockItem(id: string): Promise<StockItem | null> {
    const all = await getLocal<StockItem>("stock");
    return all.find((s) => s.id === id) ?? null;
}

export async function saveStockItem(
  item: Omit<StockItem, "id" | "userId" | "date">
): Promise<StockItem> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getStockItems();
  const newItem: StockItem = {
    ...item,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    userId,
  };
  all.push(newItem);
  await setLocal("stock", all);
  return newItem;
}

export async function updateStockItem(
  id: string,
  updates: Partial<StockItem>
): Promise<StockItem | null> {
  const all = await getStockItems();
  const i = all.findIndex((s) => s.id === id);
  if (i === -1) return null;
  all[i] = { ...all[i], ...updates };
  await setLocal("stock", all);
  return all[i];
}

export async function deleteStockItem(id: string): Promise<void> {
  const all = await getStockItems();
  await setLocal("stock", all.filter((s) => s.id !== id));
}

export async function updateStockQuantity(
  id: string,
  newQuantity: number
): Promise<StockItem | null> {
    const all = await getLocal<StockItem>("stock");
    const index = all.findIndex((s) => s.id === id);
    if (index === -1) return null;
    all[index].quantity = newQuantity;
    await setLocal("stock", all);
    return all[index];
  }

/* -------------------------------------------------------------------------- */
/*                                 SALE ITEMS                                */
/* -------------------------------------------------------------------------- */
export async function getSaleItems(): Promise<SaleItem[]> {
  return await getLocal<SaleItem>("sales");
}

export async function getSaleItem(id: string): Promise<SaleItem | null> {
    const all = await getLocal<SaleItem>("sales");
    return all.find((s) => s.id === id) ?? null;
}
export async function saveSaleItem(
  item: Omit<SaleItem, "id" | "userId" | "date">
): Promise<SaleItem> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getSaleItems();
  const newItem: SaleItem = {
    ...item,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    userId,
  };
  all.push(newItem);
  await setLocal("sales", all);
  return newItem;
}

export async function updateSaleItem(
  id: string,
  updates: Partial<SaleItem>
): Promise<SaleItem | null> {
  const all = await getSaleItems();
  const i = all.findIndex((s) => s.id === id);
  if (i === -1) return null;
  all[i] = { ...all[i], ...updates };
  await setLocal("sales", all);
  return all[i];
}

export async function deleteSaleItem(id: string): Promise<void> {
  const all = await getSaleItems();
  await setLocal("sales", all.filter((s) => s.id !== id));
}

/* -------------------------------------------------------------------------- */
/*                                RETURN ITEMS                               */
/* -------------------------------------------------------------------------- */
export async function getReturnItems(): Promise<ReturnItem[]> {
  return await getLocal<ReturnItem>("returns");
}

export async function getReturnItem(id: string): Promise<ReturnItem | null> {
    const all = await getLocal<ReturnItem>("returns");
    return all.find((s) => s.id === id) ?? null;
}
export async function saveReturnItem(
  item: Omit<ReturnItem, "id" | "userId" | "date">
): Promise<ReturnItem> {
  const userId = (await getCachedUserId()) || "guest";
  const all = await getReturnItems();
  const newItem: ReturnItem = {
    ...item,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    userId,
  };
  all.push(newItem);
  await setLocal("returns", all);
  return newItem;
}

export async function updateReturnItem(
  id: string,
  updates: Partial<ReturnItem>
): Promise<ReturnItem | null> {
    const all = await getLocal<ReturnItem>("returns");
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return null;

    all[index] = { ...all[index], ...updates };
    await setLocal("returns", all);
    return all[index];
}

export async function deleteReturnItem(id: string): Promise<void> {
  const all = await getReturnItems();
  await setLocal("returns", all.filter((r) => r.id !== id));
}

/* -------------------------------------------------------------------------- */
/*                             COMPANY  PROFILE                              */
/* -------------------------------------------------------------------------- */
import { database, Query, storage } from "@/appwrite";

const DATABASE_ID = "68215d2a00260d43fd49";
const COMPANY_COLLECTION_ID = "companyprofile";
const LOGO_BUCKET_ID = "68215d59001c82087763";

export interface CompanyProfile {
  id: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  logoLocal: string;  // 🖼️ Local file URI (e.g. file:///data/...)
  logoCloud: string;  // ☁️ Appwrite file ID (e.g. file_xxxxx)
  userId: string;
  synced: boolean;
  syncedAt: string;
}


/**
 * Returns the current user's company profile.
 * - Always prefers local data (offline-first)
 * - Builds logo preview from cloud if needed
 */
export async function getCompanyProfile(id: string): Promise<CompanyProfile | null> {
  try {
    // 1️⃣ Get existing local profiles (AsyncStorage)
    const localProfiles = await getLocal<any>("companyprofile");
    const localProfile = localProfiles?.find((p: any) => p.userId === id);

    // 2️⃣ If we already have a local profile, return it immediately
    if (localProfile) {
      // ensure logoLocal or fallback preview URL exists
      if (!localProfile.logoLocal && localProfile.logoCloud) {
        localProfile.logoLocal = storage.getFilePreview(
          LOGO_BUCKET_ID,
          localProfile.logoCloud
        );
      }
      return localProfile;
    }

    // 3️⃣ If no local profile, try to fetch from Appwrite cloud
    const res = await database.listDocuments(DATABASE_ID, COMPANY_COLLECTION_ID, [
      Query.equal("userId", id),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]);

    if (res.total === 0) return null;

    const doc = res.documents[0];
    const profile = {
      id: doc.$id,
      companyName: doc.companyName,
      address: doc.address,
      phoneNumber: doc.phoneNumber,
      userId: doc.userId,
      logoCloud: doc.logoCloud || "",
      logoLocal: doc.logoCloud
        ? storage.getFilePreview(LOGO_BUCKET_ID, doc.logoCloud)
        : "", // fallback preview
      synced: true,
      syncedAt: doc.syncedAt || new Date().toISOString(),
    };

    // 4️⃣ Cache the cloud profile locally for offline access
    await setLocal("companyprofile", [profile]);

    return profile;
  } catch (err) {
    console.error("❌ getCompanyProfile() failed:", err);
    return null;
  }
}

    

// export async function saveCompanyProfile(
//   item: Omit<CompanyProfile, "id" | "userId">
// ): Promise<CompanyProfile> {
//   const userId = (await getCachedUserId()) || "guest";
//   const profiles = await getLocal<CompanyProfile>("companyprofile");

//   const existingIndex = profiles.findIndex((p) => p.userId === userId);
//   const newProfile: CompanyProfile = {
//     ...item,
//     id: existingIndex >= 0 ? profiles[existingIndex].id : Date.now().toString(),
//     userId,
//   };

//   if (existingIndex >= 0) profiles[existingIndex] = newProfile;
//   else profiles.push(newProfile);

//   await setLocal("companyprofile", profiles);
//   return newProfile;
// }
/**
 * Creates or replaces the user's company profile locally.
 * - Works offline-first
 * - Sets synced = false (for uploadUnsynced)
 * - Keeps existing logoCloud if profile already exists
 */
/**
 * Creates or replaces the user's company profile locally.
 * - Works offline-first
 * - Sets synced = false (for uploadUnsynced)
 * - Keeps existing logoCloud if profile already exists
 */
export async function saveCompanyProfile(
  item: Omit<CompanyProfile, "id" | "userId" | "synced" | "syncedAt">
): Promise<CompanyProfile> {
  const userId = (await getCachedUserId()) || "guest";
  const profiles = await getLocal<CompanyProfile>("companyprofile");

  const existingIndex = profiles.findIndex((p) => p.userId === userId);
  const existing = existingIndex >= 0 ? profiles[existingIndex] : null;

  // 🧩 Merge with existing data
  const newProfile: CompanyProfile = {
    ...existing,
    ...item,
    id: existing ? existing.id : Date.now().toString(),
    userId,
    logoLocal: item.logoLocal ?? existing?.logoLocal ?? "",
    logoCloud: item.logoCloud ?? existing?.logoCloud ?? "",
    synced: false, // mark as unsynced until syncAllData runs
    syncedAt: new Date().toISOString(),
  };

  // 🔄 Replace or add to list
  if (existingIndex >= 0) profiles[existingIndex] = newProfile;
  else profiles.push(newProfile);

  // 💾 Save locally
  await setLocal("companyprofile", profiles);

  console.log("✅ Company profile saved locally:", newProfile);
  return newProfile;
}
// /* -------------------------------------------------------------------------- */
// /*                      MANUAL BACKUP / RESTORE HELPERS                       */
// /* -------------------------------------------------------------------------- */
// const DATABASE_ID = "68215d2a00260d43fd49";
// const STOCK_COLLECTION_ID = "68215de900192d30006e";
// const SALE_COLLECTION_ID = "68215e09000dab34a3e5";
// const RETURN_COLLECTION_ID = "returns";
// const COMPANY_COLLECTION_ID = "companyprofile";

// // Push local data → cloud
// export async function backupDataToCloud(userId: string) {
//   const stock = await getLocal<StockItem>("stock");
//   const sales = await getLocal<SaleItem>("sales");
//   const returns = await getLocal<ReturnItem>("returns");
//   const profiles = await getLocal<CompanyProfile>("companyprofile");

//   const pushArray = async (arr: any[], coll: string) => {
//     for (const item of arr) {
//       if (item.userId === "guest") {
//         await database.createDocument(DATABASE_ID, coll, ID.unique(), {
//           ...item,
//           userId,
//         });
//       }
//     }
//   };

//   await pushArray(stock, STOCK_COLLECTION_ID);
//   await pushArray(sales, SALE_COLLECTION_ID);
//   await pushArray(returns, RETURN_COLLECTION_ID);
//   await pushArray(profiles, COMPANY_COLLECTION_ID);
// }

// // Pull cloud → local
// export async function restoreDataFromCloud(userId: string) {
//   const queryData = async (coll: string) =>
//     (await database.listDocuments(DATABASE_ID, coll, [Query.equal("userId", userId)])).documents;

//   const cloudStock = await queryData(STOCK_COLLECTION_ID);
//   const cloudSales = await queryData(SALE_COLLECTION_ID);
//   const cloudReturns = await queryData(RETURN_COLLECTION_ID);
//   const cloudProfiles = await queryData(COMPANY_COLLECTION_ID);

//   await setLocal("stock", cloudStock);
//   await setLocal("sales", cloudSales);
//   await setLocal("returns", cloudReturns);
//   await setLocal("companyprofile", cloudProfiles);
// }
