import { describe, expect, it } from "vitest";

import {
  buildPublicGearUrl,
  buildXIntentUrl,
  buildXShareText,
} from "./xShare";

describe("X share", () => {
  it("builds the agreed post without gadget fields", () => {
    const url = "https://example.com/gadgets/share-id";
    expect(buildXShareText(url)).toBe(
      "My new gear...\n\n#僕のマイニューギア #MyNewGear\nhttps://example.com/gadgets/share-id",
    );
  });

  it("normalizes the origin and creates an editable intent", () => {
    const publicUrl = buildPublicGearUrl("https://example.com/", "share-id");
    expect(publicUrl).toBe("https://example.com/gadgets/share-id");
    expect(new URL(buildXIntentUrl(publicUrl)).searchParams.get("text")).toBe(
      buildXShareText(publicUrl),
    );
  });
});
