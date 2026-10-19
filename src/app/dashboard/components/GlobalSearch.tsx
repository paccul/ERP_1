"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Building2,
  MapPin,
  Package,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchGlobal, type SearchResultItem } from "../actions";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      const data = await searchGlobal(val);
      setResults(data);
      setIsOpen(true);
    });
  };

  const getCategoryIcon = (category: SearchResultItem["category"]) => {
    switch (category) {
      case "personnel":
        return <Users className="h-4 w-4 text-[#f59e0b]" />;
      case "client":
        return <Building2 className="h-4 w-4 text-[#60a5fa]" />;
      case "site":
        return <MapPin className="h-4 w-4 text-[#34d399]" />;
      case "item":
        return <Package className="h-4 w-4 text-[#c084fc]" />;
      case "invoice":
        return <FileText className="h-4 w-4 text-[#f472b6]" />;
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Cari cepat personel, klien, pos jaga, kaporlap, atau faktur..."
          className="pl-10 pr-10 bg-[#111827] border-[#374151] text-[#f9fafb] placeholder:text-[#6b7280] focus:border-[#f59e0b] h-10 rounded-xl text-xs sm:text-sm"
        />
        {isPending ? (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#f59e0b]" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#f9fafb]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-[#374151] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#1f2937] max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              results.map((item) => (
                <Link
                  key={`${item.category}-${item.id}`}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-[#1f2937] transition-colors group"
                >
                  <div className="p-2 bg-[#1f2937] group-hover:bg-[#374151] rounded-lg shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-[#f9fafb] truncate group-hover:text-[#f59e0b] transition-colors">
                        {item.title}
                      </p>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1f2937] border border-[#374151] text-[#9ca3af] uppercase shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9ca3af] truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-[#9ca3af] italic">
                Tidak ada data yang cocok dengan &quot;{query}&quot;
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
