"use client";

import { motion } from "framer-motion";
import {
  User,
  Book,
  Calculator,
  MapPin,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import EditProfileModal from "@/components/dashboard/EditProfileModal";
import ProfileStrengthCard from "@/components/dashboard/ProfileStrengthCard";

// Animation Variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getMissingFields = (userData: any) => {
    if (!userData) return [];
    const missing = [];
    if (!userData.citizenship) missing.push("Add Citizenship");
    if (!userData.budget) missing.push("Set Budget Range");
    if (!userData.englishTest || userData.englishTest === "None")
      missing.push("English Test Score");
    if (!userData.gpa) missing.push("Academic GPA");
    if (!userData.degree) missing.push("Target Degree");
    return missing;
  };

  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchUserAndDocs() {
      try {
        const [userRes, docRes] = await Promise.all([
          fetch("/api/user/me"),
          fetch("/api/user/documents"),
        ]);

        if (userRes.ok) {
          const data = await userRes.json();
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
            citizenship: data.citizenship,
            countries: countries,
            strength: data.profileStrength || 0, // from API
          });
        }

        if (docRes.ok) {
          setDocuments(await docRes.json());
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndDocs();
  }, []);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: string,
  ) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    // Client-side Validation
    if (file.size > 4 * 1024 * 1024) {
      alert("File too large (Max 4MB)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
      const res = await fetch("/api/user/documents", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments((prev) => [newDoc, ...prev]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/user/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async (updatedData: any) => {
    // Optimistic Update locally
    setUser((prev: any) => ({
      ...prev,
      ...updatedData,
      degree: updatedData.targetDegree,
      intake: updatedData.targetIntake,
      countries: updatedData.preferredCountries,
    }));

    // Ideally re-fetch from server to get accurate new score, but let's just show success
    // The user will see updated score on next load or we could force reload
    window.location.reload();
    // Or we could have extracted fetchUserAndDocs to be reusable
    // but a reload is safer for ensuring all server-side score logic runs
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  if (!user) return <div className="text-white">Failed to load profile</div>;

  // Document Categories
  const DOC_TYPES = ["Resume / CV", "Statement of Purpose", "Transcripts"];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Header Section */}
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            My Profile
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your academic journey and preferences
          </p>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-5 py-2.5 rounded-xl transition-all border border-primary/20 hover:shadow-lg hover:shadow-primary/10 active:scale-95 font-medium"
        >
          <Edit2 className="w-4 h-4" /> Edit Profile
        </button>
      </motion.div>

      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-sm"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">
            Profile updated successfully! AI engine is recalibrating matches...
          </span>
        </motion.div>
      )}

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Identity & Readiness */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Identity Card */}
          <motion.div
            variants={item}
            className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] mb-4 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full rounded-full bg-navy-900 flex items-center justify-center text-4xl font-bold text-white uppercase">
                  {user.name?.charAt(0) || "U"}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{user.email}</p>

              <div className="flex gap-2">
                <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />{" "}
                  {user.currentStage || "Discovery"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Readiness Card */}
          <motion.div variants={item}>
            <ProfileStrengthCard
              strength={user.strength || 0}
              missingFields={getMissingFields(user)}
            />
          </motion.div>

          {/* Documents Status (New Widget) */}
          <motion.div
            variants={item}
            whileHover={{ y: -5 }}
            className="glass p-6 rounded-2xl border border-white/5 group relative flex-1 flex flex-col"
          >
            {uploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              Application Documents
            </h3>

            <div className="space-y-3">
              {DOC_TYPES.map((type) => {
                const uploadedDoc = documents.find((d) => d.category === type);
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 bg-navy-800/50 rounded-xl border border-white/5 hover:border-white/20 transition-colors group/doc"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${uploadedDoc ? "bg-green-500/20 text-green-400" : "bg-white/5 text-gray-400"}`}
                      >
                        <Book className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-medium text-gray-300 group-hover/doc:text-white transition-colors">
                          {type}
                        </span>
                        {uploadedDoc && (
                          <span className="text-[10px] text-gray-500 truncate">
                            {uploadedDoc.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {uploadedDoc ? (
                      <button
                        onClick={() => handleDeleteDoc(uploadedDoc.id)}
                        className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                        title="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    ) : (
                      <label className="text-xs bg-white/5 hover:bg-primary hover:text-navy-900 border border-white/10 px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer">
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.doc,.jpg,.png"
                          onChange={(e) => handleUpload(e, type)}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Middle & Right Column: Details */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          {/* Academic Section */}
          <motion.div
            variants={item}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-primary/5"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                <Book className="w-5 h-5" />
              </div>
              Academic Background
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Citizenship
                </label>
                <div className="text-lg font-medium text-white flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {user.citizenship || "Not specified"}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  English Proficiency
                </label>
                <div className="text-lg font-medium text-white mt-1">
                  {user.englishTest && user.englishTest !== "None" ? (
                    <div className="flex items-center gap-2">
                      {user.englishTest}
                      <span className="bg-white/10 px-2 py-0.5 rounded text-sm text-white/70">
                        {user.testScore}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">No test taken</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Highest Qualification
                </label>
                <div className="text-lg font-medium text-white mt-1">
                  {user.highestQualification || "Not set"}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Field of Study
                </label>
                <div className="text-lg font-medium text-white mt-1 capitalize">
                  {user.fieldOfStudy || "Not set"}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Academic Score (GPA)
                </label>
                <div className="text-2xl font-bold font-mono text-teal-400 mt-1">
                  {user.gpa || "0.0"}{" "}
                  <span className="text-sm text-gray-500 font-sans font-normal">
                    / {user.gpaScale || "4.0"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences Section */}
          <motion.div
            variants={item}
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-orange-500/5 flex-1 flex flex-col"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                <Calculator className="w-5 h-5" />
              </div>
              Study Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Target Intake
                </label>
                <div className="text-lg font-medium text-white mt-1">
                  {user.intake || "Not set"}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Target Major
                </label>
                <div className="text-lg font-medium text-white mt-1 capitalize">
                  {user.targetMajor || "Not set"}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Target Degree
                </label>
                <div className="text-lg font-medium text-white mt-1">
                  {user.degree || "Not set"}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Annual Budget
                </label>
                <div className="text-2xl font-bold text-green-400 mt-1">
                  {user.budget || "Not set"}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-2">
                  Preferred Countries
                </label>
                <div className="flex flex-wrap gap-2">
                  {user.countries?.length > 0 ? (
                    user.countries.map((c: string) => (
                      <span
                        key={c}
                        className="bg-navy-800 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-300 flex items-center gap-2"
                      >
                        <MapPin className="w-3 h-3 text-primary" /> {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">
                      No countries saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
