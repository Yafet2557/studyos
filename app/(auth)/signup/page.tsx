import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

async function signup(formData: FormData) {
  "use server"
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { email, password: hashed } })

  await signIn("credentials", { email, password, redirectTo: "/dashboard" })
}

export default function SignupPage() {
  return (
    <div className="w-full max-w-md glass rounded-3xl p-8 shadow-[var(--shadow-lg)] animate-scale-in">
      {/* Branding */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <span className="text-white font-semibold text-lg leading-none">S</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-serif font-normal tracking-tight">StudyOS</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your AI-powered study companion</p>
        </div>
      </div>

      {/* Form */}
      <form action={signup} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" size="lg" className="w-full mt-1">
          Create account
        </Button>
      </form>

      {/* Footer link */}
      <p className="text-sm text-center text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
