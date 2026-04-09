import { cookies } from "next/headers";

import { isAdminAccessCookie } from "@/lib/admin-cookie";

export async function hasAdminAccess(): Promise<boolean> {
  const hash = process.env.ADMIN_HASH;
  const jar = await cookies();
  return isAdminAccessCookie(jar.get("admin_access")?.value, hash);
}
