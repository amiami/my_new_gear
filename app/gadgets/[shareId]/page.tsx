import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { findPublishedGear } from "@/lib/publicGearRepository";

export const dynamic = "force-dynamic";

type PublicGearPageProps = {
  params: Promise<{ shareId: string }>;
};

function formatBoughtAt(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日に購入`;
}

async function getMetadataBase() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0];
  const host = forwardedHost ?? requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0];
  const protocol = forwardedProto === "http" ? "http" : "https";

  if (host) {
    try {
      return new URL(`${protocol}://${host}`);
    } catch {
      // Fall through to the deployment URL when forwarding headers are invalid.
    }
  }

  const deploymentHost =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;
  return new URL(
    deploymentHost
      ? deploymentHost.startsWith("http")
        ? deploymentHost
        : `https://${deploymentHost}`
      : "http://localhost:3001",
  );
}

export async function generateMetadata({
  params,
}: PublicGearPageProps): Promise<Metadata> {
  const { shareId } = await params;
  const [gear, metadataBase] = await Promise.all([
    findPublishedGear(shareId),
    getMetadataBase(),
  ]);

  return {
    metadataBase,
    title: gear ? `${gear.name} | 僕のマイニューギア` : "ページが見つかりません",
    description: gear?.comment
      ? gear.comment.slice(0, 120)
      : "公開されたガジェットの記録です。",
    robots: {
      index: false,
      follow: false,
    },
    ...(gear
      ? {
          openGraph: {
            title: gear.name,
            description: "僕のマイニューギアで公開されたガジェットです。",
            type: "website",
            images: [
              {
                url: `/gadgets/${shareId}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: `${gear.name}のシェア画像`,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title: gear.name,
            description: "僕のマイニューギアで公開されたガジェットです。",
            images: [`/gadgets/${shareId}/opengraph-image`],
          },
        }
      : {}),
  };
}

export default async function PublicGearPage({ params }: PublicGearPageProps) {
  const { shareId } = await params;
  const gear = await findPublishedGear(shareId);

  if (!gear) notFound();

  return (
    <main className="flex min-h-screen items-center bg-neutral-950 px-4 py-8 text-neutral-100 sm:px-6 sm:py-12">
      <article className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="relative flex min-h-64 items-center justify-center bg-black sm:min-h-96">
          {gear.hasImage ? (
            <Image
              src={`/gadgets/${shareId}/image`}
              alt={`${gear.name}の画像`}
              fill
              unoptimized
              preload
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
            />
          ) : (
            <p className="text-sm text-neutral-500">画像なし</p>
          )}
        </div>

        <div className="space-y-6 p-5 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              My new gear...
            </p>
            <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {gear.name}
            </h1>
            {gear.boughtAtDate && (
              <p className="text-sm text-neutral-400">
                {formatBoughtAt(gear.boughtAtDate)}
              </p>
            )}
          </div>

          {gear.comment && (
            <p className="whitespace-pre-wrap break-words border-t border-neutral-800 pt-6 text-sm leading-7 text-neutral-200 sm:text-base">
              {gear.comment}
            </p>
          )}
        </div>
      </article>
    </main>
  );
}
