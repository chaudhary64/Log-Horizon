export const DEFAULT_CATEGORIES = [
  "Blog Tutorial",
  "CodePen",
  "Codrops 3d Articles",
  "Codrops Articles",
  "Decoded Websites",
  "Instagram Post",
  "LinkedIn Post",
  "YouTube",
  "YouTube Playlist",
  "YouTube Shorts",
  "Other",
];

export const MAX_CATEGORIES = 30;
export const MAX_CATEGORY_LENGTH = 40;

export const normalizeCategoryName = (raw: unknown): string =>
  typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";

export const isValidCategoryName = (name: string): boolean =>
  name.length > 0 && name.length <= MAX_CATEGORY_LENGTH;

export const getUserCategoryState = (user: {
  categories?: string[];
  hiddenCategories?: string[];
}): { categories: string[]; hiddenCategories: string[] } => {
  const categories =
    Array.isArray(user.categories) && user.categories.length
      ? user.categories
      : [...DEFAULT_CATEGORIES];
  const hiddenCategories = Array.isArray(user.hiddenCategories)
    ? user.hiddenCategories
    : [];
  return { categories, hiddenCategories };
};
