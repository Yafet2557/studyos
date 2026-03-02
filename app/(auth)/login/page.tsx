import { signIn } from "@/lib/auth"

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
    <main className="flex min-h-screen items-center justify-center">
      <form action={login} className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Sign in</h1>

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
          Sign in
        </button>

        <a href="/signup" className="text-sm text-center text-gray-500 hover:underline">
          Don&apos;t have an account? Sign up
        </a>
      </form>
    </main>
  )
}
