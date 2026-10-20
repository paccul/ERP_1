import { CalendarDays } from "lucide-react";
import { getPersonnelForRoster, getShifts } from "../actions";
import { getSites } from "../../sites/actions";
import { RosterSubnav } from "@/components/layout/RosterSubnav";
import { ShiftPlotModal } from "../components/ShiftPlotModal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Plotting Jadwal Shift Baru | Garda BUJP ERP",
};

export default async function NewRosterPage() {
  const [shifts, personnelList, { data: sites }] = await Promise.all([
    getShifts(),
    getPersonnelForRoster(),
    getSites(),
  ]);

  return (
    <div className="space-y-6">
      <RosterSubnav />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-[#f59e0b]" />
          Plotting Jadwal Shift Baru (SEC-09)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Tetapkan jadwal jaga personel satpam dengan sistem pencegahan bentrok dinas di hari yang sama.
        </p>
      </div>

      <div className="p-8 rounded-lg border border-[#374151] bg-[#030712] text-center max-w-xl mx-auto space-y-4">
        <CalendarDays className="h-12 w-12 text-[#f59e0b] mx-auto" />
        <h3 className="text-lg font-semibold text-white">Formulir Plotting Cepat Shift</h3>
        <p className="text-sm text-gray-400">
          Silakan buka jendela plotting shift terintegrasi untuk memilih personel, pos jaga tujuan, shift, dan tanggal tugas.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/roster" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-[#374151] text-gray-300 hover:bg-[#111827]">
              Lihat Kalender Roster
            </Button>
          </Link>
          <ShiftPlotModal
            personnelList={personnelList}
            sitesList={sites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
            shiftsList={shifts}
          />
        </div>
      </div>
    </div>
  );
}
