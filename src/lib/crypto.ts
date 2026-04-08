import { customAlphabet } from 'nanoid';
import bcrypt from 'bcrypt';

// Use a safe, URL-friendly alphabet for IDs (10 chars as per specs)
export const generateId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

export const hashPin = async (pin: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(pin, saltRounds);
};

export const verifyPin = async (pin: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(pin, hash);
};
