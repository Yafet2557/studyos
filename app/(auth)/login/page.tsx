import Link from "next/link"
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

async function login(formData: FormData) {
  "use server"
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: "/dashboard",
  })
}

export default function LoginPage() {
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
      <form action={login} className="flex flex-col gap-5">
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
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" size="lg" className="w-full mt-1">
          Sign in
        </Button>
      </form>

      {/* Footer link */}
      <p className="text-sm text-center text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  )
}
