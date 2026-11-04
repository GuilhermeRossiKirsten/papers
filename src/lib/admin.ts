export function isAdminLogin(
  login: string | null | undefined,
  envList: string | undefined = process.env.ADMIN_GITHUB_LOGINS,
): boolean {
  if (!login || !envList) return false;
  const admins = envList
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(login.trim().toLowerCase());
}
