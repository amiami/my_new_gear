import { ImageResponse } from "next/og";

import type { NormalizedOgImage } from "@/lib/normalizeOgImage";
import { normalizeOgImage } from "@/lib/normalizeOgImage";
import {
  downloadPublishedGearImage,
  findPublishedGear,
} from "@/lib/publicGearRepository";

export const alt = "僕のマイニューギアで公開されたガジェット";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// 生成結果はNext.js/Vercelのルートキャッシュへ保存する。公開・解除操作では
// revalidatePathを呼び、同じURLのキャッシュを明示的に破棄する。
export const revalidate = 31_536_000;

const responseHeaders = {
  "Cache-Control": "public, max-age=0, s-maxage=31536000",
  "X-Content-Type-Options": "nosniff",
};

const OGP_FONT_NAME = "WDXL Lubrifont JP N";
const GOOGLE_FONTS_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

async function loadOgpFont(text: string) {
  try {
    const cssUrl = new URL("https://fonts.googleapis.com/css2");
    cssUrl.searchParams.set("family", OGP_FONT_NAME);
    cssUrl.searchParams.set("text", text);

    const cssResponse = await fetch(cssUrl, {
      headers: { "User-Agent": GOOGLE_FONTS_USER_AGENT },
      cache: "force-cache",
    });
    if (!cssResponse.ok) throw new Error(`CSS ${cssResponse.status}`);

    const css = await cssResponse.text();
    const fontUrl = css.match(/src: url\((.+)\) format\('truetype'\)/)?.[1];
    if (!fontUrl) throw new Error("TTF URLが見つかりません");

    const fontResponse = await fetch(fontUrl, { cache: "force-cache" });
    if (!fontResponse.ok) throw new Error(`font ${fontResponse.status}`);
    return await fontResponse.arrayBuffer();
  } catch (error) {
    console.error("Failed to load the OGP font:", error);
    return null;
  }
}

function Brand() {
  return (
    <div
      lang="ja-JP"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 16,
        fontWeight: 400,
        letterSpacing: "0.03em",
        opacity: 0.72,
        fontFamily: OGP_FONT_NAME,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          display: "flex",
          flex: "0 0 auto",
          borderRadius: "50%",
          background: "#a3e635",
        }}
      />
      <span>僕のマイニューギア</span>
    </div>
  );
}

function Title({ name, size = 58 }: { name: string; size?: number }) {
  return (
    <div
      lang="ja-JP"
      style={{
        display: "flex",
        fontFamily: OGP_FONT_NAME,
        fontSize: size,
        fontWeight: 400,
        lineHeight: 1.2,
        letterSpacing: "-0.03em",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {name}
    </div>
  );
}

function CommonImage() {
  return (
    <div
      lang="ja-JP"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "66px 76px",
        color: "white",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          "linear-gradient(125deg, #050505 0%, #171717 58%, #09090b 100%)",
        fontFamily: OGP_FONT_NAME,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 76,
          top: 72,
          width: 260,
          height: 2,
          display: "flex",
          background: "rgba(163,230,53,.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 76,
          top: 88,
          width: 132,
          height: 2,
          display: "flex",
          background: "rgba(255,255,255,.2)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          marginBottom: 92,
        }}
      >
        <div style={{ display: "flex", fontSize: 82, fontWeight: 400 }}>
          My new gear...
        </div>
        <Brand />
      </div>
    </div>
  );
}

function LandscapeImage({
  name,
  src,
  dimensions,
}: {
  name: string;
  src: string;
  dimensions: Pick<NormalizedOgImage, "width" | "height">;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        color: "white",
        background: "#050505",
      }}
    >
      <img
        src={src}
        alt=""
        width={dimensions.width}
        height={dimensions.height}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "46px 58px 52px",
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,.36) 0%, rgba(0,0,0,.04) 38%, rgba(0,0,0,.9) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 38,
          }}
        >
          <Title name={name} />
          <Brand />
        </div>
      </div>
    </div>
  );
}

function PortraitImage({
  name,
  src,
  dimensions,
}: {
  name: string;
  src: string;
  dimensions: Pick<NormalizedOgImage, "width" | "height">;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        color: "white",
        background: "#09090b",
      }}
    >
      <div
        style={{
          width: 630,
          height: "100%",
          display: "flex",
          background: "#000",
        }}
      >
        <img
          src={src}
          alt=""
          width={dimensions.width}
          height={dimensions.height}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "54px 50px 58px",
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(145deg, #18181b 0%, #09090b 58%, #050505 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 50,
            top: 54,
            width: 180,
            height: 2,
            display: "flex",
            background: "rgba(163,230,53,.7)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 50,
            top: 70,
            width: 92,
            height: 2,
            display: "flex",
            background: "rgba(255,255,255,.2)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 68,
          }}
        >
          <Title name={name} size={48} />
          <Brand />
        </div>
      </div>
    </div>
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const gear = await findPublishedGear(shareId);

  if (!gear) {
    return new Response(null, { status: 404, headers: responseHeaders });
  }

  // StorageとGoogle Fontsは互いに独立しているため並列取得する。
  const [image, fontData] = await Promise.all([
    gear.hasImage ? downloadPublishedGearImage(shareId) : null,
    loadOgpFont(`${gear.name}僕のマイニューギアMy new gear...`),
  ]);
  const imageOptions = {
    ...size,
    headers: responseHeaders,
    ...(fontData
      ? {
          fonts: [
            {
              name: OGP_FONT_NAME,
              data: fontData,
              weight: 400 as const,
              style: "normal" as const,
            },
          ],
        }
      : {}),
  };

  if (!image) {
    return new ImageResponse(<CommonImage />, imageOptions);
  }

  const bytes = new Uint8Array(await image.arrayBuffer());
  const normalizedImage = await normalizeOgImage(bytes);
  const isPortrait = normalizedImage.height > normalizedImage.width;

  return new ImageResponse(
    isPortrait ? (
      <PortraitImage
        name={gear.name}
        src={normalizedImage.dataUri}
        dimensions={normalizedImage}
      />
    ) : (
      <LandscapeImage
        name={gear.name}
        src={normalizedImage.dataUri}
        dimensions={normalizedImage}
      />
    ),
    imageOptions,
  );
}
