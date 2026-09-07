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
    // Satoriのcover表示で再拡大されない画素数を残しつつ、巨大な入力は抑える。
    // 縦画像も正方形領域へ配置するため、短辺を630には制限しない。
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return {
    dataUri: `data:image/jpeg;base64,${data.toString("base64")}`,
    width: info.width,
    height: info.height,
  };
}
