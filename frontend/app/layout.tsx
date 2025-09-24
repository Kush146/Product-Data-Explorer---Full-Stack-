import "./globals.css";
import Providers from "./providers";
import Link from "next/link";
import HistoryListener from "./history-listener";

export const metadata = {
  title: "Product Data Explorer",
  description: "Explore products from World of Books",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Providers>
          {/* a11y: skip to content */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 px-3 py-1 bg-white border rounded shadow"
          >
            Skip to content
          </a>

          {/* Top Header */}
          <header className="bg-green-700 text-white shadow">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
              <Link
                href="/"
                className="text-lg font-bold tracking-tight hover:opacity-90 transition"
                aria-label="Home"
              >
                Product Data Explorer
              </Link>

              <nav className="flex gap-6 text-sm font-medium" aria-label="Primary">
                <Link href="/about" className="hover:text-yellow-200 transition-colors">
                  About
                </Link>
                <Link href="/contact" className="hover:text-yellow-200 transition-colors">
                  Contact
                </Link>
              </nav>
            </div>
          </header>

          <HistoryListener />

          {/* Main Content */}
          <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-6 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-100 border-t mt-16">
            <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-gray-600 flex justify-between">
              <p>© {new Date().getFullYear()} Product Data Explorer</p>
              <p>
                Built with <span className="text-green-700 font-semibold">Next.js</span> &{" "}
                <span className="text-green-700 font-semibold">NestJS</span>
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
