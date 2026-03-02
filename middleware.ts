export { auth as middleware } from "@/lib/auth"

export const config = {
    matcher: ["/dashboard/:path*", "/courses/:path*", "/assignments/:path*", "/notes/:path*"],
}