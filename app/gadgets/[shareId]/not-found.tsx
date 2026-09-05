export default function PublicGearNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-neutral-100">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-neutral-500">404</p>
        <h1 className="mt-2 text-2xl font-bold">ページが見つかりません</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          URLが正しくないか、このガジェットは現在公開されていません。
        </p>
      </div>
    </main>
  );
}
