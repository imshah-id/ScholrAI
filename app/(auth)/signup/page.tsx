"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAlert } from "@/components/ui/AlertSystem";

export default function SignupPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    if (formData.password.length < 6) {
      showAlert("Password must be at least 6 characters long", "error");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert("Passwords do not match", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      // Check content type to avoid JSON parse error on HTML response
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        showAlert("Account created successfully! Redirecting...", "success");

        setTimeout(() => {
          router.push("/onboarding");
        }, 1500);
      } else {
        // If not JSON, it's likely a server error page
        const text = await res.text();
        console.error("Signup response error:", text);
        throw new Error(
          "Server error. Please check console or try again later.",
        );
      }
    } catch (err: any) {
      showAlert(err.message || "Failed to create account", "error");
      setLoading(false);
    }
    // Do not set loading false in success case to prevent UI flicker
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
          Create your account
        </h1>
        <p className="text-gray-400">Join ScholrAI to start your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success/Error states removed in favor of toasts */}
        <div className="space-y-4">
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors h-5 w-5" />
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full bg-navy-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />
          </div>
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
              placeholder="Create a password"
              className="w-full bg-navy-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors h-5 w-5" />
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full bg-navy-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-primary to-gold-500 hover:to-gold-400 text-navy-900 font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}{" "}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-teal-400 hover:text-teal-300 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
