export type ImageDimensions = {
  width: number;
  height: number;
};

function readUint24BigEndian(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2];
}

export function readImageDimensions(
  bytes: Uint8Array,
  contentType: string,
): ImageDimensions | null {
  if (contentType === "image/png" && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  if (contentType === "image/gif" && bytes.length >= 10) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
      width: view.getUint16(6, true),
      height: view.getUint16(8, true),
    };
  }

  if (contentType === "image/jpeg" && bytes.length >= 4) {
    let offset = 2;
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) return null;
      const marker = bytes[offset + 1];
      offset += 2;

      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 2 > bytes.length) return null;

      const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
      if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;

      const isStartOfFrame =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isStartOfFrame && segmentLength >= 7) {
        return {
          height: (bytes[offset + 3] << 8) | bytes[offset + 4],
          width: (bytes[offset + 5] << 8) | bytes[offset + 6],
        };
      }

      offset += segmentLength;
    }
  }

  if (
    contentType === "image/webp" &&
    bytes.length >= 30 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    const format = String.fromCharCode(...bytes.slice(12, 16));
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    if (format === "VP8X") {
      return {
        width: readUint24BigEndian(
          new Uint8Array([bytes[26], bytes[25], bytes[24]]),
          0,
        ) + 1,
        height: readUint24BigEndian(
          new Uint8Array([bytes[29], bytes[28], bytes[27]]),
          0,
        ) + 1,
      };
    }

    if (format === "VP8 " && bytes.length >= 30) {
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    }

    if (format === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
      const bits =
        bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >>> 14) & 0x3fff) + 1,
      };
    }
  }

  return null;
}
