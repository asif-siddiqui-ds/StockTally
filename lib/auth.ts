// lib/auth.ts
import { account } from '../appwrite';

export const signUp = async (email: string, password: string, name: string) => {
  await account.create('unique()', email, password, name);
  return await account.createEmailPasswordSession(email, password);
};

export const logIn = async (email: string, password: string) => {
  return await account.createEmailPasswordSession(email, password);
};

export const getUser = async () => {
  return await account.get();
};

export const logOut = async () => {
  await account.deleteSession('current');
};
