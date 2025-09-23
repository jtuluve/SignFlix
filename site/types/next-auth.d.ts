    // next-auth.d.ts
    import NextAuth, { DefaultSession } from "next-auth";

    declare module "next-auth" {
      interface Session {
        user: {
          id: string; // Example: Add an 'id' property
          // Add any other custom properties you need
        } & DefaultSession["user"];
      }

      interface User {
        id: string; // Ensure 'id' is defined here as well if you use it in the User object
      }
    }