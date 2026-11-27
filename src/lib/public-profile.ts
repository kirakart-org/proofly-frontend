export function getPublicProfileUrl(username: string | null | undefined) {
  const normalizedUsername = username?.trim();
  return normalizedUsername
    ? `https://${encodeURIComponent(normalizedUsername)}.prooflynk.app`
    : "";
}

export function getSubdomainUsername(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  const domain = ".prooflynk.app";

  if (!host.endsWith(domain)) return null;

  const subdomain = host.slice(0, -domain.length);
  return subdomain && !subdomain.includes(".") && subdomain !== "www"
    ? subdomain
    : null;
}
