import { Client, Functions } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("YOUR_PROJECT_ID");

const functions = new Functions(client);

// Connect Shopify (OAuth)
const handleConnectShopify = async (shop) => {
  const redirect = `https://${shop}/admin/oauth/authorize?client_id=YOUR_SHOPIFY_CLIENT_ID&scope=read_products,read_inventory,write_inventory&redirect_uri=https://YOUR_APPWRITE_FUNCTION_URL/api/shopify/callback`;
  await WebBrowser.openBrowserAsync(redirect);
};

// Sync Shopify products
const handleSync = async () => {
  const exec = await functions.createExecution("syncShopifyStock");
  const result = JSON.parse(exec.response);
  alert(`✅ Synced ${result.syncedCount} products`);
};



// Update Shopify stock for a specific item

export async function updateShopifyStock(stockItemId, newQuantity) {
  try {
    const exec = await functions.createExecution(
      "updateShopifyStock",
      JSON.stringify({ stockItemId, newQuantity })
    );
    const result = JSON.parse(exec.response);
    if (result.success) alert("✅ Shopify stock updated!");
    else alert("⚠️ " + result.error);
  } catch (err) {
    console.error("Update error:", err);
  }
}
