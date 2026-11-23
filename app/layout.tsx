import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";
import { Providers } from "@/components/ui/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: "OSFLOW: see the operating system think", template: "%s · OSFLOW" },
  description:
    "Learn operating systems one concept at a time: real code on one side, a step-by-step animation of what the machine does on the other. Follows OSTEP.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
  ],
};

// Runs before paint so the saved theme never flashes. Dark is the default.
const themeScript = `try{var t=localStorage.getItem('osflow-theme');document.documentElement.classList.toggle('dark',t?t==='dark':true)}catch(e){document.documentElement.classList.add('dark')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:px-4 focus:py-2 glass-strong"
        >
          Skip to content
        </a>
        <Providers>
          <Nav />
          <main id="main" className="relative">
            {children}
          </main>
          <footer className="relative mx-auto mt-24 max-w-6xl px-4 pb-12 text-sm text-muted sm:px-6">
            <div className="glass flex flex-col gap-2 rounded-3xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <span className="font-semibold text-ink">OSFLOW</span> · learn operating systems by watching them work.
              </p>
              <p>
                Chapter order and example programs follow{" "}
                <a className="underline underline-offset-2 hover:text-ink" href="https://pages.cs.wisc.edu/~remzi/OSTEP/" target="_blank" rel="noreferrer">
                  OSTEP
                </a>{" "}
                by Remzi &amp; Andrea Arpaci-Dusseau (free online).
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
