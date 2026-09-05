import { ImageResponse } from "next/og";

import { readImageDimensions } from "@/lib/imageDimensions";
import {
  downloadPublishedGearImage,
  findPublishedGear,
} from "@/lib/publicGearRepository";

export const alt = "僕のマイニューギアで公開されたガジェット";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

function Brand() {
  return (
    <div
      lang="ja-JP"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      <span style={{ color: "#a3e635" }}>●</span>
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
        fontFamily: "Arial, sans-serif",
        fontSize: size,
        fontWeight: 800,
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
        justifyContent: "space-between",
        padding: "66px 76px",
        color: "white",
        backgroundImage:
          "radial-gradient(circle at 82% 18%, #3f6212 0, #171717 35%, #050505 72%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Brand />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            color: "#a3e635",
            fontFamily: "monospace",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          NEW GADGET LOG
        </div>
        <div style={{ display: "flex", fontSize: 82, fontWeight: 800 }}>
          My new gear...
        </div>
      </div>
    </div>
  );
}

function LandscapeImage({ name, src }: { name: string; src: string }) {
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
        width={1200}
        height={630}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "46px 58px 52px",
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,.36) 0%, rgba(0,0,0,.04) 38%, rgba(0,0,0,.9) 100%)",
        }}
      >
        <Brand />
        <Title name={name} />
      </div>
    </div>
  );
}

function PortraitImage({ name, src }: { name: string; src: string }) {
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
          width={630}
          height={630}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px 50px 58px",
          backgroundImage:
            "radial-gradient(circle at 100% 0%, #365314 0, #09090b 44%)",
        }}
      >
        <Brand />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              color: "#a3e635",
              fontFamily: "monospace",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            MY NEW GEAR
          </div>
          <Title name={name} size={48} />
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

  const image = gear.hasImage
    ? await downloadPublishedGearImage(shareId)
    : null;

  if (!image) {
    return new ImageResponse(<CommonImage />, {
      ...size,
      headers: responseHeaders,
    });
  }

  const bytes = new Uint8Array(await image.arrayBuffer());
  const dimensions = readImageDimensions(bytes, image.type);
  const src = `data:${image.type};base64,${Buffer.from(bytes).toString("base64")}`;
  const isPortrait =
    dimensions !== null && dimensions.height > dimensions.width;

  return new ImageResponse(
    isPortrait ? (
      <PortraitImage name={gear.name} src={src} />
    ) : (
      <LandscapeImage name={gear.name} src={src} />
    ),
    { ...size, headers: responseHeaders },
  );
}
