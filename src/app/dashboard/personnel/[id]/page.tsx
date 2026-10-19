import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { getPersonnelById, getSitesList } from "../actions";
import { PersonnelForm } from "../components/PersonnelForm";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Edit Data Personil | Garda BUJP ERP",
  description: "Perbarui informasi dan legalitas personil satpam",
};

interface EditPersonnelPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPersonnelPage({ params }: EditPersonnelPageProps) {
  const { id } = await params;

  const [{ data: personnel, error }, sites] = await Promise.all([
    getPersonnelById(id),
    getSitesList(),
  ]);

  if (error || !personnel) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <UserX className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Data Personil Tidak Ditemukan</h2>
        <p className="mt-1 text-xs text-[#9ca3af]">
          Data personil dengan ID tersebut tidak ada atau telah dihapus dari sistem.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/personnel">
            <Button variant="outline" className="border-[#374151] bg-[#111827] text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Personil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PersonnelForm
        initialData={{
          ...personnel,
          gender: (personnel.gender as "Laki-laki" | "Perempuan") || "Laki-laki",
          gada_level: (personnel.gada_level as any) || "Belum Ada",
          status: (personnel.status as any) || "active",
        }}
        sites={sites}
      />
    </div>
  );
}
