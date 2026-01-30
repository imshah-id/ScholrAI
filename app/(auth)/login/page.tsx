"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, LogIn, CheckCircle, AlertCircle } from "lucide-react";
import { useAlert } from "@/components/ui/AlertSystem";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Check for messages in URL
  const message = searchParams.get("message");

  // Show toast if redirected with message
  if (message === "logged_out" && loading === false) {
    // Check if we already showed it? Effect might be better but this works for render logic if handled carefully
    // actually let's use Effect for message toast
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic client-side validation
    if (!formData.email.includes("@")) {
      showAlert("Please enter a valid email address", "error");
      setLoading(false);
      return;
    }

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

      showAlert("Login successful! Redirecting...", "success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      showAlert(err.message || "Invalid credentials", "error");
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-500/20 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-navy-900/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        <div className="mb-8 text-center space-y-2 relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-400">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          {/* URL Messages */}
          {message === "session_expired" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm p-3 rounded-lg flex items-center gap-2 mb-4"
            >
              <AlertCircle className="w-4 h-4" />
              Your session has expired. Please log in again.
            </motion.div>
          )}

          <div className="space-y-5">
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-primary transition-colors h-5 w-5" />
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-navy-950/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-navy-950/80"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-primary transition-colors h-5 w-5" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full bg-navy-950/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-navy-950/80"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end pt-2">
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-primary transition-colors hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-primary to-gold-500 hover:to-gold-400 text-navy-900 font-bold py-4 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20"
          >
            {loading ? (
              "Signing In..."
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Sign In
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 relative z-10">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-teal-400 hover:text-teal-300 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="text-center text-gray-400">Loading...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
