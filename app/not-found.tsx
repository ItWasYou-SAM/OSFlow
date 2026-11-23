import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-32 text-center">
      <span className="tint mb-6 grid h-20 w-20 place-items-center rounded-3xl font-mono text-xl font-black" style={{ ["--c" as string]: "var(--p1)" }}>
        404
      </span>
      <h1 className="text-3xl font-extrabold text-ink">Segmentation fault</h1>
      <p className="mt-2 text-muted">That page isn&apos;t mapped in this address space.</p>
      <Link href="/" className="neu focus-ring mt-6 rounded-2xl px-5 py-3 text-sm font-semibold text-ink">
        Back home
      </Link>
    </div>
  );
}
