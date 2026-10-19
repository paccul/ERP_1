import { z } from "zod";

export const itemCategoryEnum = z.enum([
  "uniform",
  "tactical",
  "weaponry",
  "electronic",
  "consumable",
  "other",
]);

export type ItemCategory = z.infer<typeof itemCategoryEnum>;

export const itemCategoryLabels: Record<ItemCategory, string> = {
  uniform: "Seragam & Kaporlap",
  tactical: "Perlengkapan Taktikal",
  weaponry: "Senjata & Pertahanan",
  electronic: "Elektronik & HT",
  consumable: "Bahan Habis Pakai",
  other: "Lainnya",
};

export const itemFormSchema = z.object({
  code: z
    .string()
    .min(3, "Kode barang minimal 3 karakter")
    .max(50, "Kode barang maksimal 50 karakter")
    .toUpperCase(),
  name: z.string().min(3, "Nama barang minimal 3 karakter").max(255),
  category: itemCategoryEnum,
  unit: z.string().min(1, "Satuan barang wajib diisi").max(50),
  size: z.string().max(20).optional().nullable(),
  unit_price: z.coerce.number().min(0, "Harga satuan tidak boleh negatif"),
  minimum_stock: z.coerce.number().int().min(0, "Stok minimum minimal 0"),
  initial_stock: z.coerce.number().int().min(0, "Stok awal minimal 0").default(0),
  notes: z.string().max(500).optional().nullable(),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
