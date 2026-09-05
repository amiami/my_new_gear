import { describe, expect, it } from "vitest";

import { readImageDimensions } from "./imageDimensions";

describe("readImageDimensions", () => {
  it("reads PNG dimensions", () => {
    const bytes = new Uint8Array(24);
    const view = new DataView(bytes.buffer);
    view.setUint32(16, 1200);
    view.setUint32(20, 630);
    expect(readImageDimensions(bytes, "image/png")).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it("reads GIF dimensions", () => {
    const bytes = new Uint8Array(10);
    const view = new DataView(bytes.buffer);
    view.setUint16(6, 480, true);
    view.setUint16(8, 640, true);
    expect(readImageDimensions(bytes, "image/gif")).toEqual({
      width: 480,
      height: 640,
    });
  });

  it("reads JPEG dimensions", () => {
    const bytes = new Uint8Array([
      0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x76, 0x04, 0xb0,
      0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    ]);
    expect(readImageDimensions(bytes, "image/jpeg")).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it("returns null for unsupported data", () => {
    expect(readImageDimensions(new Uint8Array([1, 2, 3]), "image/png")).toBeNull();
  });
});
