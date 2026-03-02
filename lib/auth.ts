import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";


export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const user = await prisma.user.findUnique({ where: { email: credentials.email as string } })

                if (!user) return null

                const isValid = await bcrypt.compare(credentials.password as string, user.password)
                if (!isValid) return null

                return { id: user.id, email: user.email }
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
    },
})