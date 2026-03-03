import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getUser(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}
