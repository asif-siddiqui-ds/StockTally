// // appwrite.ts
// import { Account, Client, Databases, ID, Storage } from "appwrite";

// const client: Client = new Client()
//   .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite Endpoint
//   .setProject('68215c9f00161f204345'); // Your Project ID

// export const account: Account = new Account(client);
// export const database: Databases = new Databases(client);
// export const storage: Storage = new Storage(client);
// export { ID };

// appwrite.ts
import { Account, Client, Databases, ID, Query, Storage } from "appwrite";

// ✅ Initialize the Appwrite client
const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // 🔗 Your Appwrite Endpoint
  .setProject('68215c9f00161f204345'); // 🔐 Your Project ID

// ✅ Initialize services
export const account = new Account(client);
export const database = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };

