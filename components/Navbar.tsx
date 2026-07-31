import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  return (
    <header className="border-b border-board-line">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="font-display text-2xl tracking-tight text-ivory shrink-0">
          Petjo <span className="text-amber">Trade</span>
        </Link>

        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        <nav className="flex items-center gap-5 text-sm text-dim shrink-0">
          <Link href="/watchlist" className="hover:text-ivory transition-colors">
            Watchlist
          </Link>
          <Link href="/portfolio" className="hover:text-ivory transition-colors">
            Portfolio
          </Link>
          <Link
            href="/login"
            className="text-board bg-amber px-3 py-1.5 rounded-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
