import type { Metadata } from "next";
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsPage from "@/components/settings/SettingsPage";

export const metadata: Metadata = {
  title: "Settings | Log Horizon",
  description: "Export and import your Log Horizon board data",
};

export default async function Settings() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return <SettingsPage />;
}
