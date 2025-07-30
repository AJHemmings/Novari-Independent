"use client";

import React, { useState, useEffect } from "react";
import supabase from "../../../lib/supabase.js";
import { useRouter } from "next/navigation";
import Image from "next/image.js";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
      } else {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("User signed in:", data.user);

      router.push("/");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-custom-green">
      <Image
        src="/images/novari-logo.png"
        alt="Logo"
        width={105}
        height={70}
        className="pr-40"
        style={{
          height: "auto",
          width: "auto",
        }}
      />
      <div className="bg-custom-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-custom-green"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-custom-green"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-700 text-white p-2 rounded-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-custom-green"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/signup"
              className="text-emerald-600 hover:text-emerald-300"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
