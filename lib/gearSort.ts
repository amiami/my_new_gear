import type { Gear } from "@/types/gear";

export const GEAR_SORT_OPTIONS = [
  { value: "created-desc", label: "登録が新しい順" },
  { value: "created-asc", label: "登録が古い順" },
  { value: "bought-desc", label: "購入日が新しい順" },
  { value: "bought-asc", label: "購入日が古い順" },
] as const;

export type GearSort = (typeof GEAR_SORT_OPTIONS)[number]["value"];
export const DEFAULT_GEAR_SORT: GearSort = "created-desc";

export function isGearSort(value: unknown): value is GearSort {
  return GEAR_SORT_OPTIONS.some((option) => option.value === value);
}

function compareCreatedAtNewestFirst(a: Gear, b: Gear) {
  const byCreatedAt = b.createdAt.localeCompare(a.createdAt);
  return byCreatedAt || a.id.localeCompare(b.id);
}

export function sortGears(gears: Gear[], sort: GearSort): Gear[] {
  return [...gears].sort((a, b) => {
    if (sort === "created-desc") return compareCreatedAtNewestFirst(a, b);
    if (sort === "created-asc") {
      const byCreatedAt = a.createdAt.localeCompare(b.createdAt);
      return byCreatedAt || a.id.localeCompare(b.id);
    }

    const aHasDate = Boolean(a.boughtAtDate);
    const bHasDate = Boolean(b.boughtAtDate);
    if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
    if (a.boughtAtDate !== b.boughtAtDate) {
      return sort === "bought-desc"
        ? b.boughtAtDate.localeCompare(a.boughtAtDate)
        : a.boughtAtDate.localeCompare(b.boughtAtDate);
    }
    return compareCreatedAtNewestFirst(a, b);
  });
}
