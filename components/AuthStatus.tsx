"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (isLoading) {
    return <span className="text-xs text-neutral-500">確認中…</span>;
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="text-xs text-neutral-300 hover:text-white"
      >
        ログイン
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="max-w-48 truncate text-neutral-400">
        {user.email}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="text-neutral-300 hover:text-white"
      >
        ログアウト
      </button>
    </div>
  );
}
