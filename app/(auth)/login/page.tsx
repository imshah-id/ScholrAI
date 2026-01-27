"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "m@example.com",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-gray-400">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors h-5 w-5" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-navy-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors h-5 w-5" />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-navy-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="flex justify-end">
            <Link
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:to-teal-300 text-navy-900 font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            "Signing In..."
          ) : (
            <>
              <LogIn className="w-5 h-5" /> Sign In
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-teal-400 hover:text-teal-300 font-semibold hover:underline"
        >
          Sign up
        </Link>
      </div>
    </motion.div>
  );
}
