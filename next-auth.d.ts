import NextAuth, { DefaultSession } from "next-auth"
import {DefaultJWT} from "@auth/core/jwt";

declare module "next-auth" {

    // Extend session to hold the address
    interface Session {
      address: string & DefaultSession
    }

    // Extend token to hold the address before it gets put into session
    interface JWT {
      address: string & DefaultJWT
    }
}