import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data: inst } = await supabase.from("institution_settings").select("*");
  console.log("institution_settings count:", inst?.length);
  if (inst && inst.length > 0) console.log("institution_settings:", inst[0]);

  const { data: org } = await supabase.from("org_units").select("*");
  console.log("org_units count:", org?.length);

  const { data: roles } = await supabase.from("roles").select("id, name, description");
  console.log("roles:", roles);

  const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, role_id, is_active");
  console.log("profiles count:", profiles?.length);
  if (profiles) console.log("profiles:", profiles);
}

check();
