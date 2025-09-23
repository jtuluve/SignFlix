'use server'

import { createUser, getUserByEmail } from "../utils/user"
import bcrypt from 'bcrypt'

export default async function signUp(user: { name: string, email: string, password: string }) {
    if (!user.name || !user.email || !user.password) {
        return null
    }
    user['username'] = user.name;
    const User = await getUserByEmail(user.email);
    if (User) {
        return null;
    }
    const passwordHash = await bcrypt.hash(user.password, 10);
    console.log(User)
    await createUser({ username: user.name, email: user.email, passwordHash: passwordHash });

}