import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

// Secure hashing for passwords and PINs
export const hashData = (data: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(data, salt);
};

export const verifyHash = (data: string, hashed: string): boolean => {
  // Fallback for legacy SHA256 hashed passwords without salt
  if (!hashed.startsWith('$2a$') && !hashed.startsWith('$2b$')) {
    return CryptoJS.SHA256(data).toString() === hashed;
  }
  return bcrypt.compareSync(data, hashed);
};

// Validate 4-digit PIN format
export const isValidPin = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};
