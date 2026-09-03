import { describe, expect, it } from "vitest";

import { isGearSort, sortGears } from "./gearSort";
import type { Gear } from "../types/gear";

function gear(id: string, boughtAtDate: string, createdAt: string): Gear {
  return {
    id,
    name: id,
    boughtAtDate,
    boughtLocation: "",
    comment: "",
    isDisposed: false,
    createdAt,
  };
}

const gears = [
  gear("a", "2026-01-01", "2026-02-01T00:00:00Z"),
  gear("b", "", "2026-03-01T00:00:00Z"),
  gear("c", "2026-01-01", "2026-04-01T00:00:00Z"),
  gear("d", "2025-01-01", "2026-01-01T00:00:00Z"),
];

describe("sortGears", () => {
  it("sorts registration dates in either direction without mutating input", () => {
    const original = [...gears];
    expect(sortGears(gears, "created-desc").map(({ id }) => id)).toEqual(["c", "b", "a", "d"]);
    expect(sortGears(gears, "created-asc").map(({ id }) => id)).toEqual(["d", "a", "b", "c"]);
    expect(gears).toEqual(original);
  });

  it("keeps missing purchase dates last in both directions", () => {
    expect(sortGears(gears, "bought-desc").map(({ id }) => id)).toEqual(["c", "a", "d", "b"]);
    expect(sortGears(gears, "bought-asc").map(({ id }) => id)).toEqual(["d", "c", "a", "b"]);
  });

  it("uses newest registration first when purchase dates match", () => {
    expect(sortGears(gears, "bought-desc").slice(0, 2).map(({ id }) => id)).toEqual(["c", "a"]);
  });
});

describe("isGearSort", () => {
  it("accepts only supported persisted values", () => {
    expect(isGearSort("created-desc")).toBe(true);
    expect(isGearSort("unknown")).toBe(false);
    expect(isGearSort(null)).toBe(false);
  });
});
