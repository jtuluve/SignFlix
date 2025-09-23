import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

import {getUserByEmail} from "@/utils/user"
import bcrypt from 'bcrypt'
export const authOptions = {
providers: [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "email", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      
      const user = await getUserByEmail(credentials.email)

      if (user) {
        const pass = await bcrypt.compare(credentials.password,user.passwordHash);
        if(!pass){
            return null;
        }
        return user
      } else {
            return null
      }
    }
  })
],
callbacks: {
    async jwt({ token, account, user }) {
      // First sign-in
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + 60*60,
          user, // keep user info in token
        };
      }

      // If token is still valid, return it
      if (token.accessToken && token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token expired -> clear or refresh
      return {
        ...token,
        accessToken: null,
        accessTokenExpires: null,
      };
    },

    async session({ session, token }) {
      // Copy token info to session
      session.user = token.user as typeof session.user;
      session.accessToken = token.accessToken as string | null;
      session.accessTokenExpires = token.accessTokenExpires as number | null;
      return session;
    },
  },

}

const handler = NextAuth(authOptions)

export {handler as GET, handler as POST}