import type { Gear } from "@/types/gear";

const STORAGE_KEY = "my_new_gears";

export const loadGears = (): Gear[] => {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load gears", error);
    return [];
  }
};

export const saveGears = (gears: Gear[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gears));
};
