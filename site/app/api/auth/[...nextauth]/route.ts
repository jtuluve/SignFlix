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
  async jwt({ token, account }) {
    if (account) {
      token.accessToken = account.access_token
    }
    return token
  },
  async session({ session, token, user }) {
    session.accessToken = token.accessToken
    return session
  }
}

}

const handler = NextAuth(authOptions)

export {handler as GET, handler as POST}