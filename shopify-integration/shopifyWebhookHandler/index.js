import crypto from "crypto";
import { Client, Databases, Query } from "node-appwrite";

export default async function (req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const secret = process.env.SHOPIFY_CLIENT_SECRET;

  try {
    // ✅ Verify HMAC signature for security
    const hmac = req.headers["x-shopify-hmac-sha256"];
    const body = req.bodyRaw || req.body;
    const digest = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("base64");

    if (digest !== hmac) {
      console.warn("⚠️ Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const topic = req.headers["x-shopify-topic"];
    const shop = req.headers["x-shopify-shop-domain"];
    const payload = JSON.parse(body);

    // 🧩 Find linked user by shop domain
    const tokenDocs = await db.listDocuments(process.env.DATABASE_ID, "shopify_tokens", [
      Query.equal("shop", shop),
    ]);
    if (tokenDocs.total === 0) return res.json({ success: false, message: "No linked user found" });

    const userId = tokenDocs.documents[0].userId;

    if (topic === "products/create" || topic === "products/update") {
      const variant = payload.variants?.[0];
      if (!variant) return res.json({ success: true, message: "No variants" });

      const shopifyId = variant.inventory_item_id;
      const name = payload.title;
      const price = variant.price;
      const quantity = variant.inventory_quantity ?? 0;

      const existing = await db.listDocuments(process.env.DATABASE_ID, "stock_items", [
        Query.equal("shopifyId", shopifyId),
        Query.equal("userId", userId),
      ]);

      if (existing.total > 0) {
        await db.updateDocument(process.env.DATABASE_ID, "stock_items", existing.documents[0].$id, {
          name,
          price,
          quantity,
        });
      } else {
        await db.createDocument(process.env.DATABASE_ID, "stock_items", "unique()", {
          userId,
          name,
          price,
          quantity,
          shopifyId,
        });
      }
    }

    if (topic === "inventory_levels/update") {
      const shopifyId = payload.inventory_item_id;
      const quantity = payload.available;

      const existing = await db.listDocuments(process.env.DATABASE_ID, "stock_items", [
        Query.equal("shopifyId", shopifyId),
        Query.equal("userId", userId),
      ]);

      if (existing.total > 0) {
        await db.updateDocument(process.env.DATABASE_ID, "stock_items", existing.documents[0].$id, {
          quantity,
        });
      }
    }

    console.log(`✅ Webhook processed: ${topic}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.json({ success: false, error: err.message });
  }
}
