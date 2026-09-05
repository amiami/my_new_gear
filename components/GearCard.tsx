import Image from "next/image";

import type { Gear } from "@/types/gear";

type GearCardProps = {
  gear: Gear;
  onOpen: (gear: Gear) => void;
  onShare: (gear: Gear) => void;
  onPublishChange: (gear: Gear, shouldPublish: boolean) => void;
  onCopyPublicUrl: (gear: Gear) => void;
  isPublishPending: boolean;
  onToggleDisposed: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function GearCard({
  gear,
  onOpen,
  onShare,
  onPublishChange,
  onCopyPublicUrl,
  isPublishPending,
  onToggleDisposed,
  onDelete,
}: GearCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
        gear.isDisposed
          ? "bg-neutral-950/60 border-neutral-900 opacity-60"
          : "bg-neutral-900 border-neutral-800"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onOpen(gear)} className="break-words text-left text-base font-semibold text-white underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {gear.name}
            </button>

            {gear.isDisposed && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                手放し済み
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400 mt-1">
            {gear.boughtAtDate && <span>📅 {gear.boughtAtDate}</span>}
            {gear.boughtLocation && <span>📍 {gear.boughtLocation}</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onShare(gear)}
          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1 transition-colors border border-neutral-700"
          title="Xでポスト"
        >
          <span className="font-bold">𝕏</span>
          シェア
        </button>
      </div>

      {gear.imageUrl && (
        <button type="button" onClick={() => onOpen(gear)} aria-label={`${gear.name}の詳細を開く`} className="relative h-48 w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-56">
          <Image
            src={gear.imageUrl}
            alt={gear.name}
            fill
            unoptimized
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
          />
        </button>
      )}

      {gear.comment && (
        <p className="text-xs text-neutral-300 bg-neutral-950/50 p-2.5 rounded-lg border border-neutral-800/80 leading-relaxed whitespace-pre-wrap">
          {gear.comment}
        </p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-xs text-neutral-400">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
          <input
            type="checkbox"
            checked={gear.isDisposed}
            onChange={() => onToggleDisposed(gear.id)}
            className="rounded border-neutral-700 bg-neutral-950 accent-white"
          />
          <span>手放した（処分・売却）</span>
        </label>

        <button
          type="button"
          onClick={() => onDelete(gear.id)}
          className="text-neutral-500 hover:text-red-400 transition-colors"
        >
          削除
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/60 pt-3 text-xs">
        <div>
          <p className="font-medium text-neutral-200">公開ページ</p>
          <p className={gear.shareId ? "text-emerald-400" : "text-neutral-500"}>
            {gear.shareId ? "公開中" : "非公開"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {gear.shareId && (
            <div className="flex items-center gap-3">
              <a
                href={`/gadgets/${gear.shareId}`}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-300 underline underline-offset-4 hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                公開ページを見る
              </a>
              <button
                type="button"
                onClick={() => onCopyPublicUrl(gear)}
                className="text-neutral-300 underline underline-offset-4 hover:text-white focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                URLをコピー
              </button>
            </div>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(gear.shareId)}
            aria-label={`${gear.name}の公開ページ`}
            onClick={() => onPublishChange(gear, !gear.shareId)}
            disabled={isPublishPending}
            className={`relative h-7 w-12 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              gear.shareId
                ? "border-emerald-500 bg-emerald-600"
                : "border-neutral-600 bg-neutral-800"
            } disabled:cursor-wait disabled:opacity-50`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                gear.shareId ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
