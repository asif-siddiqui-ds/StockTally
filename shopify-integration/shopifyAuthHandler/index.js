import { Client, Databases } from "node-appwrite";
import fetch from "node-fetch";

/**
 * Handles Shopify OAuth callback: exchanges ?code for an access token
 * and stores { userId, shop, accessToken, scope } in the `shopify_tokens` collection.
 *
 * Supported calls:
 *  - GET /?install&shop={shop-domain}
 *      → Redirects user to Shopify permission screen.
 *  - GET /?shop={shop-domain}&code={temp_code}
 *      → Exchanges code for permanent access token and stores it.
 *
 * Notes:
 *  - Execution mode must be PUBLIC.
 *  - This handler supports both "start install" and "callback" in one URL,
 *    so you can point Shopify’s Redirect URL here directly.
 */
export default async (context) => {
  const req = context.req;
  const res = context.res;

  const db = new Databases(
    new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY)
  );

  const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
  const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

  // Parse params
  const method = (req.method || "GET").toUpperCase();
  const query = req.query || {};
  const shop = (query.shop || "").trim(); // e.g. mystore.myshopify.com
  const code = query.code;
  const install = "install" in query; // start install step

  // Who is the current app user? (Optional in public mode)
  // If called from your app first (openBrowserAsync), pass user id in a header:
  //   "x-stocktally-user-id": user.$id
  // Otherwise, fallback to unknown and let the app attach later if needed.
  const userId =
    req.headers["x-stocktally-user-id"] ||
    req.headers["x-appwrite-user-id"] ||
    null;

  const fail = (status, message) => res.status(status).send(message);

  try {
    if (method !== "GET") return fail(405, "Method Not Allowed");

    // Basic validation
    if (!shop) return fail(400, "Missing ?shop (e.g., mystore.myshopify.com)");

    // STEP A: start install – redirect merchant to Shopify OAuth screen
    if (install && !code) {
      const scopes = [
        "read_products",
        "read_inventory",
        "write_inventory",
        "read_locations",
      ].join(",");

      // Redirect back to THIS function after grant.
      // Because this function is public and has a stable domain, use it.
      
      // const redirectUri = getFunctionBaseUrl(req); // this function's own public URL
       const redirectUri = "https://690f7dac0018d682fede.fra.appwrite.run"

      const authUrl =
        `https://${shop}/admin/oauth/authorize` +
        `?client_id=${encodeURIComponent(SHOPIFY_CLIENT_ID)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`;

      return res.redirect(authUrl);
    }

    // STEP B: callback – exchange code for token
    if (code) {
      const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: SHOPIFY_CLIENT_ID,
          client_secret: SHOPIFY_CLIENT_SECRET,
          code,
        }),
      });

      if (!tokenRes.ok) {
        const text = await tokenRes.text();
        throw new Error(`Token exchange failed: ${tokenRes.status} ${text}`);
      }

      const tokenJson = await tokenRes.json();
      const accessToken = tokenJson.access_token;
      const scope = tokenJson.scope;

      if (!accessToken) throw new Error("No access_token returned by Shopify");

      // Save document (userId may be null if called directly by Shopify)
      await db.createDocument(
        process.env.DATABASE_ID,
        "shopify_tokens",
        "unique()",
        {
          userId,
          shop,
          accessToken,
          scope,
        }
      );

      return res.send(`
        <html><body style="font-family: sans-serif">
          <h2>✅ Shopify store connected</h2>
          <p>Store: ${shop}</p>
          <p>You can close this window and return to StockTally.</p>
        </body></html>
      `);
    }

    // If neither ?install nor ?code is present:
    return res.send(
      `<html><body style="font-family:sans-serif">
        <h3>StockTally Shopify Auth</h3>
        <p>Use <code>?install&shop=yourstore.myshopify.com</code> to begin OAuth.</p>
      </body></html>`
    );
  } catch (err) {
    console.error("Auth error:", err);
    return fail(500, `Shopify auth error: ${err.message}`);
  }
}

/**
 * Derive this function's public URL from request headers.
 * Appwrite passes the function’s own domain in the Host header.
 */
function getFunctionBaseUrl(req) {
  const host = req.headers["host"];
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return `${proto}://${host}`;
}
