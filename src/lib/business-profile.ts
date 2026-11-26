import type { Business } from "../types";

export type BusinessApiProfile = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  category: string | null;
  logo_url: string | null;
  cover_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  social_links: Record<string, string>;
  theme: string;
  is_published: boolean;
};

export function unwrapBusinessApiProfile(value: unknown): unknown {
  if (
    typeof value === "object" &&
    value !== null &&
    "business" in value
  ) {
    return (value as { business: unknown }).business;
  }
  return value;
}

export function isBusinessApiProfile(value: unknown): value is BusinessApiProfile {
  if (typeof value !== "object" || value === null) return false;

  const profile = value as Record<string, unknown>;
  const optionalStrings = [
    profile.bio,
    profile.category,
    profile.logo_url,
    profile.cover_url,
    profile.email,
    profile.phone,
    profile.address,
  ];

  return (
    typeof profile.id === "number" &&
    Number.isSafeInteger(profile.id) &&
    profile.id > 0 &&
    typeof profile.name === "string" &&
    typeof profile.username === "string" &&
    optionalStrings.every((item) => item === null || typeof item === "string") &&
    typeof profile.theme === "string" &&
    typeof profile.is_published === "boolean" &&
    typeof profile.social_links === "object" &&
    profile.social_links !== null &&
    !Array.isArray(profile.social_links) &&
    Object.values(profile.social_links).every((item) => typeof item === "string")
  );
}

export function toBusinessDraft(profile: BusinessApiProfile, tagline = ""): Business {
  return {
    id: profile.id,
    name: profile.name,
    slug: profile.username,
    tagline,
    bio: profile.bio ?? "",
    category: profile.category ?? "",
    location: profile.address ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    instagram: profile.social_links.instagram ?? "",
    coverImage: profile.cover_url ?? "",
    isPublished: profile.is_published,
    logoUrl: profile.logo_url ?? "",
    socialLinks: profile.social_links,
    theme: profile.theme,
  };
}

export function createEmptyBusiness(): Business {
  return {
    name: "",
    slug: "",
    tagline: "",
    bio: "",
    category: "",
    location: "",
    email: "",
    phone: "",
    instagram: "",
    coverImage: "",
    isPublished: false,
    logoUrl: "",
    socialLinks: {},
    theme: "violet",
  };
}
