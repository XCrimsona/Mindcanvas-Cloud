import argon2 from "argon2";

const BCRYPT_HASH_PREFIXES = ["$2a$", "$2b$", "$2y$"];

export class PasswordService {

  hashPassword = async (password) => {
    return await argon2.hash(password, { type: argon2.argon2id });
  }

  verifyPassword = async (plainTextPassword, hashPassword) => {
    return await argon2.verify(hashPassword, plainTextPassword);
  }

  isLegacyHash = (hash) => {
    if (typeof hash !== "string") return false;
    for (const prefix of BCRYPT_HASH_PREFIXES) {
      if (hash.startsWith(prefix)) return true;
    }
    return false;
  }
}
