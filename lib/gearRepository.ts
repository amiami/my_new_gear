import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database";

export type GearRow = Tables<"gears">;
export type GearRowWithShare = GearRow & {
  gear_shares: Pick<Tables<"gear_shares">, "share_id"> | null;
};

export type CreateGearInput = Pick<
  TablesInsert<"gears">,
  | "name"
  | "bought_at"
  | "bought_location"
  | "comment"
  | "image_path"
>;

async function getAuthenticatedClient() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("ログインが必要です");
  }

  return { supabase, user };
}

export async function listGears(): Promise<GearRowWithShare[]> {
  const { supabase, user } = await getAuthenticatedClient();

  const { data, error } = await supabase
    .from("gears")
    .select("*, gear_shares(share_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`ガジェットの取得に失敗しました: ${error.message}`);
  }

  return data;
}

export async function publishGear(id: string): Promise<string> {
  const { supabase } = await getAuthenticatedClient();

  const { data: existing, error: existingError } = await supabase
    .from("gear_shares")
    .select("share_id")
    .eq("gear_id", id)
    .maybeSingle();

  if (existingError) {
    throw new Error(`公開状態の取得に失敗しました: ${existingError.message}`);
  }

  if (existing) return existing.share_id;

  const { data, error } = await supabase
    .from("gear_shares")
    .insert({ gear_id: id })
    .select("share_id")
    .single();

  if (error) {
    // 同時操作で先に公開された場合は、その共有IDを返して冪等に扱う。
    if (error.code === "23505") {
      const { data: concurrentShare, error: concurrentError } = await supabase
        .from("gear_shares")
        .select("share_id")
        .eq("gear_id", id)
        .single();

      if (!concurrentError) return concurrentShare.share_id;
    }

    throw new Error(`ガジェットの公開に失敗しました: ${error.message}`);
  }

  return data.share_id;
}

export async function unpublishGear(id: string): Promise<string | null> {
  const { supabase } = await getAuthenticatedClient();
  const { data, error } = await supabase
    .from("gear_shares")
    .delete()
    .eq("gear_id", id)
    .select("share_id")
    .maybeSingle();

  if (error) {
    throw new Error(`ガジェットの公開解除に失敗しました: ${error.message}`);
  }

  return data?.share_id ?? null;
}

export async function createGear(
  input: CreateGearInput,
): Promise<GearRow> {
  const { supabase, user } = await getAuthenticatedClient();

  if (input.image_path && !input.image_path.startsWith(`${user.id}/`)) {
    throw new Error("画像の保存先が正しくありません");
  }

  const gear: TablesInsert<"gears"> = {
    ...input,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("gears")
    .insert(gear)
    .select()
    .single();

  if (error) {
    throw new Error(`ガジェットの登録に失敗しました: ${error.message}`);
  }

  return data;
}

export async function updateGearDisposed(
  id: string,
  isDisposed: boolean,
): Promise<GearRow> {
  const { supabase, user } = await getAuthenticatedClient();

  const updates: TablesUpdate<"gears"> = {
    is_disposed: isDisposed,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("gears")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`ガジェットの更新に失敗しました: ${error.message}`);
  }

  return data;
}

export async function deleteGear(id: string): Promise<string | null> {
  const { supabase, user } = await getAuthenticatedClient();

  const { data: gear, error: fetchError } = await supabase
    .from("gears")
    .select("image_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    throw new Error(`削除対象の取得に失敗しました: ${fetchError.message}`);
  }

  // 外部公開を最初に止め、後続処理が失敗しても公開URLだけが残らないようにする。
  const unpublishedShareId = await unpublishGear(id);

  if (gear.image_path) {
    const { error: imageError } = await supabase.storage
      .from("gear-images")
      .remove([gear.image_path]);

    if (imageError) {
      throw new Error(`画像の削除に失敗しました: ${imageError.message}`);
    }
  }

  const { error } = await supabase
    .from("gears")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`ガジェットの削除に失敗しました: ${error.message}`);
  }

  return unpublishedShareId;
}
