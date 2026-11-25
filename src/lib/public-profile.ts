export function getPublicProfileUrl(username: string | null | undefined) {
  const normalizedUsername = username?.trim();
  return normalizedUsername
    ? `${window.location.origin}/p/${encodeURIComponent(normalizedUsername)}`
    : "";
}
