import crypto from "crypto";

const SESSION_CODE_LENGTH = 10;
const SESSION_CODE_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateSessionCode(length = SESSION_CODE_LENGTH): string {
  const bytes = crypto.randomBytes(length);
  let code = "";

  for (let i = 0; i < length; i++) {
    code += SESSION_CODE_CHARS[bytes[i] % SESSION_CODE_CHARS.length];
  }

  return code;
}
