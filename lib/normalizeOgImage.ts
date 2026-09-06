import sharp from "sharp";

export type NormalizedOgImage = {
  dataUri: string;
  width: number;
  height: number;
};

export async function normalizeOgImage(
  bytes: Uint8Array,
): Promise<NormalizedOgImage> {
  const { data, info } = await sharp(bytes, { animated: false })
    // EXIF Orientationを実ピクセルへ反映し、ブラウザ表示と同じ向きにする。
    .rotate()
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return {
    dataUri: `data:image/jpeg;base64,${data.toString("base64")}`,
    width: info.width,
    height: info.height,
  };
}
