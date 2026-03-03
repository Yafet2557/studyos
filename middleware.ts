import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    if (!req.auth) {
        if (req.nextUrl.pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/courses/:path*",
        "/assignments/:path*",
        "/notes/:path*",
        "/study/:path*",
        "/api/((?!auth).*)",
    ],
};