import { getSitesList } from "../actions";
import { PersonnelForm } from "../components/PersonnelForm";

export const metadata = {
  title: "Tambah Personil Baru | Garda BUJP ERP",
  description: "Registrasi anggota satpam baru ke dalam database operasional BUJP",
};

export default async function NewPersonnelPage() {
  const sites = await getSitesList();

  return (
    <div className="mx-auto max-w-4xl">
      <PersonnelForm sites={sites} />
    </div>
  );
}
