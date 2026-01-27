"use client";

import { motion } from "framer-motion";
import { User, Book, Calculator, MapPin, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import EditProfileModal from "@/components/dashboard/EditProfileModal";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          // Parse preferred countries if string
          let countries = [];
          try {
            countries = JSON.parse(data.preferredCountries || "[]");
          } catch (e) {
            countries = data.preferredCountries
              ? [data.preferredCountries]
              : [];
          }

          setUser({
            ...data,
            name: data.fullName, // Map backend fullName to UI name
            degree: data.targetDegree,
            intake: data.targetIntake,
            countries: countries,
          });
        }
      } catch (e) {
        console.error("Failed to load user", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async (updatedData: any) => {
    // Update local state immediately
    setUser((prev: any) => ({
      ...prev,
      degree: updatedData.targetDegree,
      intake: updatedData.targetIntake,
      gpa: updatedData.gpa,
      englishTest: updatedData.englishTest,
      testScore: updatedData.testScore,
      budget: updatedData.budget,
      countries: updatedData.preferredCountries,
    }));

    // Show success notification
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Refresh data to get updated profile strength
    setTimeout(async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          let countries = [];
          try {
            countries = JSON.parse(data.preferredCountries || "[]");
          } catch (e) {
            countries = data.preferredCountries
              ? [data.preferredCountries]
              : [];
          }
          setUser({
            ...data,
            name: data.fullName,
            degree: data.targetDegree,
            intake: data.targetIntake,
            countries: countries,
          });
        }
      } catch (e) {
        console.error("Refresh failed", e);
      }
    }, 500);
  };

  if (loading) return <div className="text-white">Loading profile...</div>;
  if (!user) return <div className="text-white">Failed to load profile</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all border border-white/10 hover:shadow-lg hover:shadow-white/5 hover:scale-105 active:scale-95"
        >
          <Edit2 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">
            Profile updated successfully! Your match scores are being
            recalculated.
          </span>
        </motion.div>
      )}

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onSave={handleSave}
      />

      {/* Main Info Card */}
      <div className="glass p-8 rounded-2xl border border-white/5 flex items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
          {user.name?.charAt(0) || "U"}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-400">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {user.currentStage || "Discovery"}
            </span>
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Book className="w-5 h-5 text-teal-400" /> Academic Goals
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 uppercase">
                Target Degree
              </div>
              <div className="text-lg font-medium">
                {user.degree || "Not set"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">
                Target Intake
              </div>
              <div className="text-lg font-medium">
                {user.intake || "Not set"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Current GPA</div>
              <div className="text-lg font-medium font-mono">
                {user.gpa || "Not set"}
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-400" /> Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 uppercase">
                Budget Range
              </div>
              <div className="text-lg font-medium text-green-400">
                {user.budget || "Not set"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Tests</div>
              <div className="text-lg font-medium">
                {user.englishTest && user.englishTest !== "None"
                  ? `${user.englishTest}: ${user.testScore || "N/A"}`
                  : "None"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">
                Saved Countries
              </div>
              <div className="flex gap-2 mt-1 flex-wrap">
                {user.countries?.map((c: string) => (
                  <span
                    key={c}
                    className="bg-white/5 text-xs px-2 py-1 rounded text-gray-300 border border-white/5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
