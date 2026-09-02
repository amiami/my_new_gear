"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage("Googleログインを開始できませんでした。");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Googleに移動しています…" : "Googleでログイン"}
      </button>

      {errorMessage && (
        <p role="alert" className="text-xs text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
