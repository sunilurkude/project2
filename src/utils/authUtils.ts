import CryptoJS from 'crypto-js';

// Secure hashing for Aadhaar and PIN
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

export const verifyHash = (data: string, hashed: string): boolean => {
  return hashData(data) === hashed;
};

// Validate 4-digit PIN format
export const isValidPin = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};
