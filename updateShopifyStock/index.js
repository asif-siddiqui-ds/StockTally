import { Client, Databases, Query } from "node-appwrite";
import fetch from "node-fetch";

export default async function (req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const userId = req.headers["x-appwrite-user-id"];

  if (!userId) return res.json({ success: false, error: "User not authenticated" });

  try {
    const body = JSON.parse(req.bodyRaw || req.body);
    const { stockItemId, newQuantity } = body;

    if (!stockItemId || newQuantity === undefined) {
      return res.json({ success: false, error: "Missing stockItemId or newQuantity" });
    }

    // 🧩 Get StockTally item
    const item = await db.getDocument(process.env.DATABASE_ID, "stock_items", stockItemId);
    if (!item) throw new Error("Stock item not found");

    // 🔎 Find user's Shopify credentials
    const tokenDocs = await db.listDocuments(process.env.DATABASE_ID, "shopify_tokens", [
      Query.equal("userId", userId),
    ]);
    if (tokenDocs.total === 0) throw new Error("Shopify not linked for this user");

    const { shop, accessToken } = tokenDocs.documents[0];

    // 🛒 Call Shopify Inventory API
    const response = await fetch(
      `https://${shop}/admin/api/2025-01/inventory_levels/set.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location_id: process.env.SHOPIFY_LOCATION_ID, // you’ll fill this below
          inventory_item_id: item.shopifyId,
          available: parseInt(newQuantity, 10),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("⚠️ Shopify response:", result);
      throw new Error("Failed to update Shopify stock");
    }

    // ✅ Update local StockTally DB too
    await db.updateDocument(process.env.DATABASE_ID, "stock_items", stockItemId, {
      quantity: newQuantity,
    });

    return res.json({ success: true, message: "Stock updated on Shopify", result });
  } catch (err) {
    console.error("❌ Shopify update error:", err);
    return res.json({ success: false, error: err.message });
  }
}

const response = await fetch(`https://${shop}/admin/api/2025-01/locations.json`, {
  headers: { "X-Shopify-Access-Token": accessToken },
});
const data = await response.json();
console.log(data.locations);
const locationId = data.locations[0].id; // Use the first location's ID