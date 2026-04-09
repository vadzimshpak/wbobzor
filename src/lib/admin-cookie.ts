import { timingSafeEqualUtf8 } from "@/lib/timing-safe-equal";

export function isAdminAccessCookie(
  cookieValue: string | undefined,
  adminHash: string | undefined
): boolean {
  if (!adminHash || adminHash.length === 0) {
    return false;
  }
  if (cookieValue === undefined || cookieValue.length === 0) {
    return false;
  }
  return timingSafeEqualUtf8(cookieValue, adminHash);
}
