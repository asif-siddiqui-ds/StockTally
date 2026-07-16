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
    // 🔎 Find user's Shopify token
    const tokenDocs = await db.listDocuments(process.env.DATABASE_ID, "shopify_tokens", [
      Query.equal("userId", userId),
    ]);

    if (tokenDocs.total === 0) {
      return res.json({ success: false, error: "No Shopify account linked" });
    }

    const { shop, accessToken } = tokenDocs.documents[0];

    // 🛒 Fetch Shopify inventory
    const response = await fetch(`https://${shop}/admin/api/2025-01/products.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    const { products } = await response.json();

    if (!products) throw new Error("No products found");

    let syncedCount = 0;

    for (const product of products) {
      const variant = product.variants[0];
      const shopifyId = variant.inventory_item_id;
      const name = product.title;
      const quantity = variant.inventory_quantity;
      const price = variant.price;

      // Check if exists in StockTally
      const existing = await db.listDocuments(process.env.DATABASE_ID, "stock_items", [
        Query.equal("shopifyId", shopifyId),
        Query.equal("userId", userId),
      ]);

      if (existing.total > 0) {
        // Update
        await db.updateDocument(process.env.DATABASE_ID, "stock_items", existing.documents[0].$id, {
          name,
          quantity,
          price,
        });
      } else {
        // Create new
        await db.createDocument(process.env.DATABASE_ID, "stock_items", "unique()", {
          userId,
          name,
          quantity,
          price,
          shopifyId,
        });
      }
      syncedCount++;
    }

    return res.json({ success: true, syncedCount });
  } catch (err) {
    console.error("❌ Sync error:", err);
    return res.json({ success: false, error: err.message });
  }
}
