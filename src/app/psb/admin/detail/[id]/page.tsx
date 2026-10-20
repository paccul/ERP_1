import { ApplicantDetailView } from "../../components/ApplicantDetailView";

export const metadata = {
  title: "Detail Kandidat Pelamar Satpam | Garda BUJP ERP",
  description: "Verifikasi dokumen pelamar dan input nilai seleksi",
};

export const dynamic = "force-dynamic";

interface DetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  return <ApplicantDetailView id={id} />;
}
