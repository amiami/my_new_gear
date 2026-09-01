import type { Gear } from "@/types/gear";

type GearCardProps = {
  gear: Gear;
  onShare: (gear: Gear) => void;
  onToggleDisposed: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function GearCard({
  gear,
  onShare,
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
            <span className="font-semibold text-base text-white">
              {gear.name}
            </span>

            {gear.isDisposed && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                Disposed
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
        <div className="relative w-full h-48 sm:h-56 bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800">
          <img
            src={gear.imageUrl}
            alt={gear.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
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
    </div>
  );
}