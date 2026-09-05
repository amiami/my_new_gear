import type { Metadata } from "next";
import Image from "next/image";
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

export async function generateMetadata({
  params,
}: PublicGearPageProps): Promise<Metadata> {
  const { shareId } = await params;
  const gear = await findPublishedGear(shareId);

  return {
    title: gear ? `${gear.name} | 僕のマイニューギア` : "ページが見つかりません",
    description: gear?.comment
      ? gear.comment.slice(0, 120)
      : "公開されたガジェットの記録です。",
    robots: {
      index: false,
      follow: false,
    },
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
