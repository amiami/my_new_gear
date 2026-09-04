"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { Gear } from "@/types/gear";

type PublishGearDialogProps = {
  gear: Gear;
  intent: "publish" | "share" | "unpublish";
  isSubmitting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function formatDate(date: string) {
  if (!date) return "未設定";
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日に購入`;
}

export default function PublishGearDialog({
  gear,
  intent,
  isSubmitting,
  error,
  onCancel,
  onConfirm,
}: PublishGearDialogProps) {
  const isUnpublishing = intent === "unpublish";
  const isSharing = intent === "share";
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
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
  }, [isSubmitting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-dialog-title"
        aria-describedby="publish-dialog-description"
        tabIndex={-1}
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-700 bg-neutral-900 p-5 shadow-2xl sm:p-7"
      >
        <h2 id="publish-dialog-title" className="text-xl font-bold text-white">
          {isUnpublishing
            ? "このガジェットの公開を解除しますか？"
            : isSharing
              ? "公開してXでシェアしますか？"
              : "このガジェットを公開しますか？"}
        </h2>
        <p
          id="publish-dialog-description"
          className="mt-2 text-sm leading-6 text-neutral-400"
        >
          {isUnpublishing
            ? "公開を解除すると、現在の公開URLから閲覧できなくなります。"
            : "公開すると、URLを知っている人はログインせずに以下の内容を閲覧できます。"}
        </p>

        {!isUnpublishing ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950">
            {gear.imageUrl ? (
              <div className="relative h-48 bg-black">
                <Image
                  src={gear.imageUrl}
                  alt={`${gear.name}の公開プレビュー`}
                  fill
                  unoptimized
                  sizes="(max-width: 512px) 100vw, 512px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center text-sm text-neutral-500">
                画像なし
              </div>
            )}
            <div className="space-y-3 p-4">
              <p className="break-words font-semibold text-white">{gear.name}</p>
              {gear.boughtAtDate && (
                <p className="text-sm text-neutral-400">
                  {formatDate(gear.boughtAtDate)}
                </p>
              )}
              {gear.comment && (
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-300">
                  {gear.comment}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {isUnpublishing ? (
          <div className="mt-5 rounded-xl border border-amber-700/70 bg-amber-950/30 p-4">
            <p className="font-medium text-amber-100">現在のURLは無効になります</p>
            <p className="mt-1 text-sm leading-6 text-amber-100/80">
              再公開した場合は新しいURLが発行され、同じURLには戻りません。
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-neutral-700 bg-neutral-950/70 px-4 py-3">
            <p className="text-xs font-semibold text-neutral-200">公開されない情報</p>
            <p className="mt-1 text-xs leading-5 text-neutral-300">
              購入場所、ユーザー情報、登録日時、手放し済み状態、他のガジェットは公開されません。
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-11 rounded-lg border border-neutral-700 px-4 text-sm text-neutral-200 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`min-h-11 rounded-lg px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60 ${
              isUnpublishing
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-white text-neutral-950 hover:bg-neutral-200"
            }`}
          >
            {isSubmitting
              ? isUnpublishing
                ? "解除しています…"
                : "公開しています…"
              : isUnpublishing
                ? "公開を解除"
                : isSharing
                  ? "公開してXでシェア"
                  : "公開する"}
          </button>
        </div>
      </div>
    </div>
  );
}
