import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { normalizeOgImage } from "./normalizeOgImage";

describe("normalizeOgImage", () => {
  it("rotates EXIF-oriented JPEG pixels before returning dimensions", async () => {
    const source = await sharp({
      create: {
        width: 30,
        height: 40,
        channels: 3,
        background: "#84cc16",
      },
    })
      .jpeg()
      .withMetadata({ orientation: 8 })
      .toBuffer();

    const normalized = await normalizeOgImage(source);

    expect(normalized.width).toBe(40);
    expect(normalized.height).toBe(30);
    expect(normalized.dataUri).toMatch(/^data:image\/jpeg;base64,/);

    const outputMetadata = await sharp(
      Buffer.from(normalized.dataUri.split(",")[1], "base64"),
    ).metadata();
    expect(outputMetadata.orientation).toBeUndefined();
  });

  it("limits oversized input to the OGP rendering bounds", async () => {
    const source = await sharp({
      create: {
        width: 2400,
        height: 1600,
        channels: 3,
        background: "#84cc16",
      },
    })
      .jpeg()
      .toBuffer();

    const normalized = await normalizeOgImage(source);

    expect(normalized.width).toBe(1200);
    expect(normalized.height).toBe(800);
  });
});
