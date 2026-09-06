import { redirect } from "next/navigation";

import GoogleSignInButton from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 text-neutral-100">
      <section className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
        <p className="mb-2 text-2xl">📦</p>
        <h1 className="font-brand text-xl">僕のマイニューギア</h1>
        <p className="mb-6 mt-2 text-sm leading-relaxed text-neutral-400">
          自分のガジェットを記録するにはログインしてください。
        </p>

        {error && (
          <p role="alert" className="mb-4 text-xs text-red-400">
            ログインを完了できませんでした。もう一度お試しください。
          </p>
        )}

        <GoogleSignInButton />
      </section>
    </main>
  );
}
