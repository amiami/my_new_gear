import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database";

export type GearRow = Tables<"gears">;

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

export async function listGears(): Promise<GearRow[]> {
  const { supabase, user } = await getAuthenticatedClient();

  const { data, error } = await supabase
    .from("gears")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`ガジェットの取得に失敗しました: ${error.message}`);
  }

  return data;
}

export async function createGear(
  input: CreateGearInput,
): Promise<GearRow> {
  const { supabase, user } = await getAuthenticatedClient();

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

export async function deleteGear(id: string): Promise<void> {
  const { supabase, user } = await getAuthenticatedClient();

  const { error } = await supabase
    .from("gears")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`ガジェットの削除に失敗しました: ${error.message}`);
  }
}
