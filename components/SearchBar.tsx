"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchResult } from "@/lib/types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
    }, 250); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToSymbol(symbol: string) {
    setOpen(false);
    setQuery("");
    router.push(`/stock/${symbol}`);
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search ticker or company"
        className="w-full bg-board-raised border border-board-line rounded-sm px-3 py-1.5 text-sm text-ivory placeholder:text-dim focus:outline-none focus:ring-1 focus:ring-amber"
      />

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-board-raised border border-board-line rounded-sm overflow-hidden shadow-lg">
          {results.map((r) => (
            <li key={r.symbol}>
              <button
                onClick={() => goToSymbol(r.symbol)}
                className="w-full text-left px-3 py-2 hover:bg-board flex items-center justify-between gap-2"
              >
                <span className="font-mono text-sm text-ivory">{r.symbol}</span>
                <span className="text-xs text-dim truncate">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
