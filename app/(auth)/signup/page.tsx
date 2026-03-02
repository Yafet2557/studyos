import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import bcrypt from "bcryptjs"

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
    <main className="flex min-h-screen items-center justify-center">
      <form action={signup} className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Create account</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="border rounded px-3 py-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="border rounded px-3 py-2"
        />

        <button type="submit" className="bg-black text-white rounded px-3 py-2">
          Sign up
        </button>

        <a href="/login" className="text-sm text-center text-gray-500 hover:underline">
          Already have an account? Sign in
        </a>
      </form>
    </main>
  )
}
