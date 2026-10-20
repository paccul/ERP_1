"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SiteOption {
  id: string;
  name: string;
  code: string;
}

interface PersonnelFilterProps {
  sites: SiteOption[];
}

export function PersonnelFilter({ sites }: PersonnelFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "all";
  const currentSite = searchParams.get("siteId") || "all";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/personnel?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#9ca3af]">
          <Search className="h-4 w-4" />
        </div>
        <Input
          id="personnel-search"
          name="personnel_search"
          type="text"
          defaultValue={currentSearch}
          placeholder="Cari nama personil, NIK, atau nomor KTA..."
          onChange={(e) => updateParam("search", e.target.value)}
          className="pl-9 bg-[#111827] border-[#374151] text-white placeholder-[#6b7280] text-xs h-9"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Status Filter */}
        <select
          id="personnel-status-filter"
          name="personnel_status_filter"
          value={currentStatus}
          onChange={(e) => updateParam("status", e.target.value)}
          aria-label="Filter Status Personil"
          className="h-9 w-full sm:w-auto max-w-full rounded-lg border border-[#374151] bg-[#111827] px-3 py-1 text-xs text-white focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b]"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="leave">Cuti</option>
          <option value="inactive">Nonaktif</option>
        </select>

        {/* Site Filter */}
        <select
          id="personnel-site-filter"
          name="personnel_site_filter"
          value={currentSite}
          onChange={(e) => updateParam("siteId", e.target.value)}
          aria-label="Filter Pos Jaga (Site)"
          className="h-9 w-full sm:w-auto max-w-full rounded-lg border border-[#374151] bg-[#111827] px-3 py-1 text-xs text-white focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b] truncate"
        >
          <option value="all">Semua Pos Jaga</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.code} - {site.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
