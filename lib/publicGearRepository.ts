import "server-only";

import { cache } from "react";

import { createAdminClient } from "@/lib/supabase/admin";

export const SHARE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PublicGear = {
  name: string;
  boughtAtDate: string;
  comment: string;
  hasImage: boolean;
};

type PublicGearWithImagePath = PublicGear & {
  imagePath: string | null;
};

async function findPublishedGearUncached(
  shareId: string,
): Promise<PublicGearWithImagePath | null> {
  if (!SHARE_ID_PATTERN.test(shareId)) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gear_shares")
    .select("gears!inner(name, bought_at, comment, image_path)")
    .eq("share_id", shareId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load a published gadget:", error.message);
    throw new Error("公開中のガジェットを取得できませんでした");
  }

  if (!data) return null;

  const gear = data.gears;
  return {
    name: gear.name,
    boughtAtDate: gear.bought_at ?? "",
    comment: gear.comment,
    hasImage: Boolean(gear.image_path),
    imagePath: gear.image_path,
  };
}

// generateMetadataとページ描画の同一リクエスト内だけ取得結果を共有する。
// リクエストをまたぐ永続キャッシュは使わず、公開解除を直ちに反映する。
export const findPublishedGear = cache(findPublishedGearUncached);

export async function downloadPublishedGearImage(shareId: string) {
  const gear = await findPublishedGearUncached(shareId);
  if (!gear?.imagePath) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("gear-images")
    .download(gear.imagePath, {}, { cache: "no-store" });

  if (error) {
    console.error("Failed to download a published gadget image:", error.message);
    return null;
  }

  return data;
}
