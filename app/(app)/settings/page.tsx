import { getUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const userId = await getUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-normal tracking-tight">
        Settings
      </h1>
      <SettingsClient email={user.email} />
    </div>
  );
}
