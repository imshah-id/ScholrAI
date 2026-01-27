"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

// Types for form data
type OnboardingData = {
  fullName: string;
  targetDegree: string;
  targetIntake: string;
  gpa: string;
  englishTest: string;
  testScore: string;
  budget: string;
  preferredCountries: string[];
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    targetDegree: "Masters",
    targetIntake: "Fall 2026",
    gpa: "",
    englishTest: "IELTS",
    testScore: "",
    budget: "20k-40k",
    preferredCountries: [],
  });

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const [loading, setLoading] = useState(false);

  const nextStep = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final Step - Submit Data
      setLoading(true);
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to save profile");

        router.push("/dashboard");
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
            <span>Step {step} of 3</span>
            <span>
              {step === 1
                ? "Basic Profiles"
                : step === 2
                  ? "Academic Background"
                  : "Preferences"}
            </span>
          </div>
          <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary to-teal-400"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="bg-navy-800/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">
                  Let's start multiple choice
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Degree
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {["Bachelors", "Masters", "PhD", "MBA"].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => updateData("targetDegree", deg)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            data.targetDegree === deg
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-navy-900/50 hover:bg-navy-700 hover:border-white/30"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{deg}</span>
                            {data.targetDegree === deg && (
                              <Check className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Planned Intake
                    </label>
                    <select
                      className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                      value={data.targetIntake}
                      onChange={(e) =>
                        updateData("targetIntake", e.target.value)
                      }
                    >
                      <option>Fall 2025</option>
                      <option>Spring 2026</option>
                      <option>Fall 2026</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Academic Overview</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Previous GPA / Percentage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3.8/4.0 or 85%"
                      className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                      value={data.gpa}
                      onChange={(e) => updateData("gpa", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        English Test
                      </label>
                      <select
                        className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 outline-none"
                        value={data.englishTest}
                        onChange={(e) =>
                          updateData("englishTest", e.target.value)
                        }
                      >
                        <option>IELTS</option>
                        <option>TOEFL</option>
                        <option>Duolingo</option>
                        <option>None</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Score
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 7.5"
                        className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                        value={data.testScore}
                        onChange={(e) =>
                          updateData("testScore", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Annual Budget (Tuition + Living)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["< 20k", "20k-40k", "40k-60k", "60k+"].map((b) => (
                        <button
                          key={b}
                          onClick={() => updateData("budget", b)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            data.budget === b
                              ? "border-teal-400 bg-teal-400/10 text-teal-400"
                              : "border-white/10 bg-navy-900/50 hover:bg-navy-700"
                          }`}
                        >
                          {b} USD
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Countries
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["USA", "UK", "Canada", "Australia", "Germany"].map(
                        (country) => {
                          const isSelected =
                            data.preferredCountries.includes(country);
                          return (
                            <button
                              key={country}
                              onClick={() => {
                                const newCountries = isSelected
                                  ? data.preferredCountries.filter(
                                      (c) => c !== country,
                                    )
                                  : [...data.preferredCountries, country];
                                updateData("preferredCountries", newCountries);
                              }}
                              className={`px-4 py-2 rounded-full border text-sm transition-all ${
                                isSelected
                                  ? "border-primary bg-primary text-navy-900 font-bold"
                                  : "border-white/10 bg-navy-900 hover:border-white/30"
                              }`}
                            >
                              {country}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                step === 1
                  ? "opacity-0 cursor-default"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>

            <button
              onClick={nextStep}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-gold-500 text-navy-900 font-bold px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : step === 3
                  ? "Complete Profile"
                  : "Continue"}{" "}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
