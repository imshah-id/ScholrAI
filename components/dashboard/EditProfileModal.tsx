"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MAJOR_MAP } from "@/lib/constants";

// Mappings for Dependent Fields
const QUALIFICATION_MAP: Record<string, string[]> = {
  "High School": ["Science", "Arts", "Commerce", "Vocational"],
  Bachelors: [
    "Engineering",
    "Arts",
    "Commerce",
    "Medicine",
    "Law",
    "Science",
    "Business",
  ],
  Masters: [
    "Engineering",
    "Business (MBA)",
    "Arts",
    "Science",
    "Law",
    "Medicine",
  ],
  PhD: ["Research", "Teaching", "Applied Sciences"],
  Diploma: ["Technical", "Vocational", "Creative Arts"],
};

const CITIZENSHIP_OPTIONS = [
  "India",
  "USA",
  "China",
  "Nigeria",
  "Pakistan",
  "Bangladesh",
  "Nepal",
  "Sri Lanka",
  "Vietnam",
  "Philippines",
  "Indonesia",
  "Malaysia",
  "South Korea",
  "Japan",
  "Germany",
  "France",
  "UK",
  "Canada",
  "Australia",
  "Other",
];

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedData: any) => void;
};

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    targetDegree: user?.degree || "",
    targetMajor: user?.targetMajor || "",
    targetIntake: user?.intake || "Fall 2026",
    highestQualification: user?.highestQualification || "",
    fieldOfStudy: user?.fieldOfStudy || "",
    citizenship: user?.citizenship || "",
    gpa: user?.gpa || "",
    gpaScale: user?.gpaScale || "4.0",
    englishTest: user?.englishTest || "None",
    testScore: user?.testScore || "",
    budget: user?.budget || "20k-40k",
    preferredCountries: user?.countries || [],
  });

  const [loading, setLoading] = useState(false);

  const updateData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Validation Logic

    // 0. Basic Validation
    if (!formData.targetDegree) {
      alert("Please select a Target Degree.");
      return;
    }

    // 1. GPA Validation
    if (!formData.gpa || formData.gpa.trim() === "") {
      alert("Please enter your GPA/Percentage.");
      return;
    }

    const gpaValue = parseFloat(formData.gpa);
    if (isNaN(gpaValue)) {
      alert("Please enter a valid numeric GPA.");
      return;
    }

    if (formData.gpaScale === "4.0" && (gpaValue < 0 || gpaValue > 4.0)) {
      alert("GPA on 4.0 scale must be between 0.0 and 4.0");
      return;
    }
    if (formData.gpaScale === "5.0" && (gpaValue < 0 || gpaValue > 5.0)) {
      alert("GPA on 5.0 scale must be between 0.0 and 5.0");
      return;
    }
    if (formData.gpaScale === "10.0" && (gpaValue < 0 || gpaValue > 10.0)) {
      alert("GPA on 10.0 scale must be between 0.0 and 10.0");
      return;
    }
    if (
      formData.gpaScale === "Percentage" &&
      (gpaValue < 0 || gpaValue > 100)
    ) {
      alert("Percentage must be between 0 and 100");
      return;
    }

    // 2. English Test Validation
    if (
      formData.englishTest !== "None" &&
      (!formData.testScore || formData.testScore.trim() === "")
    ) {
      alert("Please enter your test score or select 'None'.");
      return;
    }

    if (formData.englishTest !== "None" && formData.testScore) {
      const testScoreValue = parseFloat(formData.testScore);
      if (isNaN(testScoreValue)) {
        alert("Please enter a valid numeric test score.");
        return;
      }

      if (
        formData.englishTest === "IELTS" &&
        (testScoreValue < 0 || testScoreValue > 9)
      ) {
        alert("IELTS score must be between 0 and 9");
        return;
      }
      if (
        formData.englishTest === "TOEFL" &&
        (testScoreValue < 0 || testScoreValue > 120)
      ) {
        alert("TOEFL score must be between 0 and 120");
        return;
      }
      if (
        formData.englishTest === "Duolingo" &&
        (testScoreValue < 0 || testScoreValue > 160)
      ) {
        alert("Duolingo score must be between 0 and 160");
        return;
      }
    }

    setLoading(true);
    try {
      // Re-use onboarding API for simplicity as it updates profile
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave(formData);
        onClose();
      } else {
        alert("Failed to update profile");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-navy-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-navy-800/50">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Academic */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wide">
                  Academic Goals
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Citizenship
                    </label>
                    <select
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none"
                      value={formData.citizenship}
                      onChange={(e) =>
                        updateData("citizenship", e.target.value)
                      }
                    >
                      <option value="">Select Citizenship</option>
                      {CITIZENSHIP_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Highest Qualification
                    </label>
                    <select
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none"
                      value={formData.highestQualification}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateData("highestQualification", val);
                        updateData("fieldOfStudy", "");
                      }}
                    >
                      <option value="">Select Qualification</option>
                      {Object.keys(QUALIFICATION_MAP).map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Field of Study
                    </label>
                    <select
                      className={`w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none ${!formData.highestQualification ? "opacity-50" : ""}`}
                      value={formData.fieldOfStudy}
                      onChange={(e) =>
                        updateData("fieldOfStudy", e.target.value)
                      }
                      disabled={!formData.highestQualification}
                    >
                      <option value="">Select Field</option>
                      {formData.highestQualification &&
                        QUALIFICATION_MAP[formData.highestQualification]?.map(
                          (f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ),
                        )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Degree
                    </label>
                    <select
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none"
                      value={formData.targetDegree}
                      onChange={(e) => {
                        updateData("targetDegree", e.target.value);
                        updateData("targetMajor", "");
                      }}
                    >
                      {["Bachelors", "Masters", "PhD", "MBA"].map((deg) => (
                        <option key={deg} value={deg}>
                          {deg}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Target Major
                    </label>
                    <select
                      className={`w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none ${!formData.targetDegree ? "opacity-50" : ""}`}
                      value={formData.targetMajor || ""}
                      onChange={(e) =>
                        updateData("targetMajor", e.target.value)
                      }
                      disabled={!formData.targetDegree}
                    >
                      <option value="">Select Major</option>
                      {formData.targetDegree &&
                        MAJOR_MAP[formData.targetDegree]?.map((major) => (
                          <option key={major} value={major}>
                            {major}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Intake
                    </label>
                    <select
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none"
                      value={formData.targetIntake}
                      onChange={(e) =>
                        updateData("targetIntake", e.target.value)
                      }
                    >
                      <optgroup label="2026">
                        <option>Spring 2026</option>
                        <option>Summer 2026</option>
                        <option>Fall 2026</option>
                        <option>Winter 2026</option>
                      </optgroup>
                      <optgroup label="2027">
                        <option>Spring 2027</option>
                        <option>Summer 2027</option>
                        <option>Fall 2027</option>
                        <option>Winter 2027</option>
                      </optgroup>
                      <optgroup label="2028">
                        <option>Spring 2028</option>
                        <option>Fall 2028</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    GPA / Academic Score
                  </label>

                  {/* GPA Scale Selector */}
                  <div className="flex gap-2 mb-2">
                    {["4.0", "5.0", "10.0", "Percentage"].map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => {
                          updateData("gpaScale", scale);
                          updateData("gpa", "");
                        }}
                        className={`px-2 py-1 rounded border text-xs transition-colors ${
                          formData.gpaScale === scale
                            ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
                            : "border-white/10 hover:bg-white/5 text-gray-400"
                        }`}
                      >
                        {scale === "Percentage" ? "%" : scale}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    step="0.01"
                    placeholder={
                      formData.gpaScale === "4.0"
                        ? "e.g. 3.8"
                        : formData.gpaScale === "5.0"
                          ? "e.g. 4.5"
                          : formData.gpaScale === "10.0"
                            ? "e.g. 8.5"
                            : "e.g. 85"
                    }
                    className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none"
                    value={formData.gpa}
                    onChange={(e) => updateData("gpa", e.target.value)}
                    max={
                      formData.gpaScale === "4.0"
                        ? 4.0
                        : formData.gpaScale === "5.0"
                          ? 5.0
                          : formData.gpaScale === "10.0"
                            ? 10.0
                            : 100
                    }
                    min={0}
                  />
                </div>
              </div>

              {/* Tests */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wide">
                  Tests
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      English Test
                    </label>
                    <select
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none"
                      value={formData.englishTest}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateData("englishTest", val);
                        if (val === "None") updateData("testScore", "");
                      }}
                    >
                      <option>None</option>
                      <option>IELTS</option>
                      <option>TOEFL</option>
                      <option>Duolingo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Score
                    </label>
                    <input
                      type="text"
                      className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 outline-none disabled:opacity-50"
                      value={formData.testScore}
                      onChange={(e) => updateData("testScore", e.target.value)}
                      disabled={formData.englishTest === "None"}
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wide">
                  Preferences
                </h3>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Budget
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["< 20k", "20k-40k", "40k-60k", "60k+"].map((b) => (
                      <button
                        key={b}
                        onClick={() => updateData("budget", b)}
                        className={`px-2 py-1.5 rounded border text-xs transition-colors ${
                          formData.budget === b
                            ? "bg-primary border-primary text-navy-900 font-bold"
                            : "border-white/10 hover:bg-white/5"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Countries
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "USA",
                      "UK",
                      "Canada",
                      "Australia",
                      "Germany",
                      "Singapore",
                      "Ireland",
                      "China",
                      "New Zealand",
                      "Netherlands",
                      "Switzerland",
                    ].map((c) => {
                      const isSelected =
                        formData.preferredCountries.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            const prev = formData.preferredCountries;
                            const next = isSelected
                              ? prev.filter((p: string) => p !== c)
                              : [...prev, c];
                            updateData("preferredCountries", next);
                          }}
                          className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                            isSelected
                              ? "bg-white text-navy-900 font-bold border-white"
                              : "border-white/10 hover:bg-white/5"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-navy-800/50 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 hover:text-white text-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary text-navy-900 font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
