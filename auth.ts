import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getCsrfToken } from "next-auth/react"
import { SiweMessage } from "siwe"

const providers = [
  CredentialsProvider({
    name: "Ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials, req) {
      try {
        const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"))
        const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string)

        const result = await siwe.verify({
          signature: credentials?.signature || "",
          domain: nextAuthUrl.host,
          nonce: await getCsrfToken({req: { headers: req.headers }}),
        })

        if (result.success) {
          return {
            id: siwe.address,
          }
        }
        return null
      } catch (e) {
        return null
      }
    },
  }),
]

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub
      session.user.name = token.sub
      session.user.image = "https://www.fillmurray.com/128/128"
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
