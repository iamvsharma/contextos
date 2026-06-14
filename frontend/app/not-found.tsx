// frontend/app/not-found.tsx
"use client";

import { useRouter } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NotFound() {
  const router = useRouter();

  const goHome = () => router.push("/");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas p-8 text-center">
      {/* Illustration */}
      <svg
        className="mb-6 h-48 w-48 text-mute"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
        <path
          d="M20 28h24M20 36h24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 44h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Headline */}
      <h1 className="mb-4 text-4xl font-bold text-ink">
        Oops! Page not found
      </h1>

      {/* Sub‑text */}
      <p className="mb-8 max-w-lg text-base text-mute">
        We couldn’t locate the page you’re looking for. It may have been moved,
        renamed, or removed. Try searching for what you need or return to the
        dashboard.
      </p>

      {/* Search box – integrates with existing search modal */}
      <div className="mb-6 flex w-full max-w-md items-center gap-2">
        <Input
          placeholder="Search documentation, pipelines, datasets…"
          className="flex-1"
          aria-label="Search site"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // Simple client‑side navigation; adapt to real search logic if needed
              const q = (e.target as HTMLInputElement).value.trim();
              if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
            }
          }}
        />
        <Button
          variant="secondary"
          onClick={() => {
            const q = (document.querySelector("input[aria-label='Search site']") as HTMLInputElement)?.value.trim();
            if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <Search size={16} />
        </Button>
      </div>

      {/* Navigation actions */}
      <div className="flex gap-4">
        <Button onClick={goHome} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        <Button
          variant="tab-ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Go Back
        </Button>
      </div>
    </main>
  );
}