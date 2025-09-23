"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import signUp from "@/lib/signUp";
import { X } from "lucide-react";
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      let a = await signIn("credentials", {
        ...formData,
        redirect: false,
        callbackUrl: "/",
      });
      if(a.ok){
        window.location.replace("/");
      } else {
        setErrorMessage("Invalid credentials. Please try again.");
      };
    } else {
      await signUp(formData);
      await signIn("credentials", {
        ...formData,
        redirect: false,
        callbackUrl: "/",
      });
      window.location.replace("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full relative max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <a
          href="\"
          className="absolute right-4 top-4 text-black hover:bg-gray-100 p-1 rounded-b-sm"
        >
          <X size={20} />
        </a>
        <h1 className="mb-6 text-center text-2xl font-bold text-black">
          {isLogin ? "Login" : "Sign Up"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-black">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-400 focus:border-black focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-400 focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black placeholder-gray-400 focus:border-black focus:outline-none"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium cursor-pointer text-black hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
