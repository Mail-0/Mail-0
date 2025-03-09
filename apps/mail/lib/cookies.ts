export const COOKIE_CONSENT_KEY = "cookie-preferences";

export type CookieCategory = "necessary" | "analytics" | "marketing" | "preferences";

export interface CategoryInfo {
  name: string;
  description: string;
  required?: boolean;
}

export const COOKIE_CATEGORIES: Record<CookieCategory, CategoryInfo> = {
  necessary: {
    name: "Necessary",
    description: "Required for the website to function",
    required: true,
  },
  analytics: {
    name: "Analytics",
    description: "Help us understand how you use our website",
  },
  marketing: {
    name: "Marketing",
    description: "Used to deliver personalized advertisements",
  },
  preferences: {
    name: "Preferences",
    description: "Remember your settings and preferences",
  },
};

export type CookiePreferences = Record<CookieCategory, boolean>;
