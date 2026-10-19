import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const env = fs.readFileSync("D:/Data/Project/ERP_2/.env.local", "utf-8");
let url = "", anon = "";
for (const line of env.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) url = line.split("=")[1].trim();
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) anon = line.split("=")[1].trim();
}

async function run() {
  const userClient = createClient(url, anon);
  const { data: authData } = await userClient.auth.signInWithPassword({
    email: "admin@garda.bujp.id",
    password: "Password123!",
  });
  console.log("Admin logged in. User id:", authData.user?.id);

  const { data: checkPerm } = await userClient.rpc("check_user_permission", {
    p_action: "view",
    p_module: "security",
  });
  console.log("check_user_permission('view', 'security'):", checkPerm);

  const { data: pUser, error: pErr, count: cUser } = await userClient.from("personnel").select("*", { count: "exact" });
  console.log("Personnel Count as Admin User:", cUser, "Rows:", pUser?.length, "Error:", pErr);
}
run();
