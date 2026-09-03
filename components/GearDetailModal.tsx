"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Gear } from "@/types/gear";

type GearDetailModalProps = { gear: Gear; onClose: () => void };

function formatDate(date: string) {
  if (!date) return "未設定";
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

export default function GearDetailModal({ gear, onClose }: GearDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (isImageExpanded) setIsImageExpanded(false);
        else onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isImageExpanded, onClose]);

  const hasImage = Boolean(gear.imageUrl) && !imageFailed;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (isImageExpanded) setIsImageExpanded(false);
        else onClose();
      }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="gear-detail-title" tabIndex={-1}
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl outline-none sm:max-h-[calc(100dvh-3rem)]">
        {isImageExpanded && hasImage ? (
          <div
            className="relative flex min-h-[calc(100dvh-1.5rem)] items-center justify-center bg-black p-3 sm:min-h-[calc(100dvh-3rem)] sm:p-8"
            onMouseDown={(event) => event.target === event.currentTarget && setIsImageExpanded(false)}
          >
            <h2 id="gear-detail-title" className="sr-only">{gear.name}の画像</h2>
            <button type="button" autoFocus onClick={() => setIsImageExpanded(false)} aria-label="画像の拡大表示を閉じる"
              className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-neutral-600 bg-neutral-900/90 text-xl text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">×</button>
            <div className="relative h-[calc(100dvh-5rem)] w-full">
              <Image src={gear.imageUrl!} alt={`${gear.name}の登録画像`} fill unoptimized sizes="100vw" className="object-contain" onError={() => setImageFailed(true)} />
            </div>
          </div>
        ) : (
          <>
            <button type="button" onClick={onClose} aria-label="Gear詳細を閉じる"
              className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-neutral-600 bg-neutral-900/90 text-xl text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">×</button>
            <div className="grid md:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]">
              <div className="flex min-h-64 items-center justify-center bg-neutral-950 p-4 md:min-h-[34rem]">
                {hasImage ? (
                  <button type="button" onClick={() => setIsImageExpanded(true)} aria-label={`${gear.name}の画像を拡大`}
                    className="group relative h-full min-h-56 w-full cursor-zoom-in rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:min-h-[30rem]">
                    <Image src={gear.imageUrl!} alt={`${gear.name}の登録画像`} fill unoptimized sizes="(max-width: 767px) 100vw, 60vw" className="object-contain" onError={() => setImageFailed(true)} />
                    <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs text-white">画像を拡大</span>
                  </button>
                ) : (
                  <div className="flex min-h-56 w-full items-center justify-center rounded-lg border border-dashed border-neutral-800 text-sm text-neutral-500 md:min-h-[30rem]">画像なし</div>
                )}
              </div>
              <div className="min-w-0 space-y-6 p-5 pr-16 sm:p-7 sm:pr-20">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-neutral-500">Gear details</p>
                  <h2 id="gear-detail-title" className="break-words text-2xl font-bold text-white">{gear.name}</h2>
                  <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${gear.isDisposed ? "border-neutral-700 bg-neutral-800 text-neutral-300" : "border-emerald-800 bg-emerald-950 text-emerald-300"}`}>
                    {gear.isDisposed ? "手放し済み" : "所持中"}
                  </span>
                </div>
                <dl className="space-y-5 text-sm">
                  <div><dt className="mb-1 text-xs font-medium text-neutral-500">購入日</dt><dd className="text-neutral-200">{formatDate(gear.boughtAtDate)}</dd></div>
                  <div><dt className="mb-1 text-xs font-medium text-neutral-500">購入場所</dt><dd className="break-words text-neutral-200">{gear.boughtLocation || "未設定"}</dd></div>
                  <div><dt className="mb-1 text-xs font-medium text-neutral-500">コメント</dt><dd className="whitespace-pre-wrap break-words leading-relaxed text-neutral-200">{gear.comment || "コメントなし"}</dd></div>
                </dl>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
