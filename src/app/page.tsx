import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="flex justify-center">
          <Logo size="md" link={false} />
        </h1>
        <p className="mt-6 text-lg text-green-900/70">
          Fresh produce and community trading.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2"
          >
            Go to Shop
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-lg border border-green-700/30 bg-white px-6 py-3 text-sm font-medium text-green-800 transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:ring-offset-2"
          >
            Go to Feed
          </Link>
        </div>
      </div>
    </main>
  );
}
