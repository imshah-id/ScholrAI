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
  gpaScale: string; // NEW: Track GPA scale
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
    gpaScale: "4.0", // Default scale
    englishTest: "None",
    testScore: "",
    budget: "20k-40k",
    preferredCountries: [],
  });

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const [loading, setLoading] = useState(false);

  const nextStep = async () => {
    // Validation Logic
    if (step === 2) {
      // Validate GPA
      if (!data.gpa || data.gpa.trim() === "") {
        alert("Please enter your GPA/Percentage before continuing.");
        return;
      }

      // Validate GPA is numeric
      const gpaValue = parseFloat(data.gpa);
      if (isNaN(gpaValue)) {
        alert("Please enter a valid numeric GPA value.");
        return;
      }

      // Validate based on scale
      if (data.gpaScale === "4.0" && (gpaValue < 0 || gpaValue > 4.0)) {
        alert("GPA on 4.0 scale must be between 0.0 and 4.0");
        return;
      }
      if (data.gpaScale === "5.0" && (gpaValue < 0 || gpaValue > 5.0)) {
        alert("GPA on 5.0 scale must be between 0.0 and 5.0");
        return;
      }
      if (data.gpaScale === "10.0" && (gpaValue < 0 || gpaValue > 10.0)) {
        alert("GPA on 10.0 scale must be between 0.0 and 10.0");
        return;
      }
      if (data.gpaScale === "Percentage" && (gpaValue < 0 || gpaValue > 100)) {
        alert("Percentage must be between 0 and 100");
        return;
      }
      // Validate English test score if test is selected
      if (
        data.englishTest !== "None" &&
        (!data.testScore || data.testScore.trim() === "")
      ) {
        alert("Please enter your test score or select 'None'.");
        return;
      }

      // Validate English test score ranges
      if (data.englishTest !== "None" && data.testScore) {
        const testScoreValue = parseFloat(data.testScore);
        if (isNaN(testScoreValue)) {
          alert("Please enter a valid numeric test score.");
          return;
        }

        if (
          data.englishTest === "IELTS" &&
          (testScoreValue < 0 || testScoreValue > 9)
        ) {
          alert("IELTS score must be between 0 and 9");
          return;
        }
        if (
          data.englishTest === "TOEFL" &&
          (testScoreValue < 0 || testScoreValue > 120)
        ) {
          alert("TOEFL score must be between 0 and 120");
          return;
        }
        if (
          data.englishTest === "Duolingo" &&
          (testScoreValue < 0 || testScoreValue > 160)
        ) {
          alert("Duolingo score must be between 0 and 160");
          return;
        }
      }
    }

    if (step === 3) {
      // Validate preferred countries
      if (data.preferredCountries.length === 0) {
        alert("Please select at least one preferred country.");
        return;
      }
    }

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
                        <motion.button
                          whileTap={{ scale: 0.98 }}
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
                        </motion.button>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Select when you plan to start your studies
                    </p>
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
                      GPA / Academic Score
                    </label>

                    {/* GPA Scale Selector */}
                    <div className="flex gap-3 mb-3">
                      {["4.0", "5.0", "10.0", "Percentage"].map((scale) => (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          key={scale}
                          type="button"
                          onClick={() => {
                            updateData("gpaScale", scale);
                            updateData("gpa", "");
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            data.gpaScale === scale
                              ? "border-teal-400 bg-teal-400/10 text-teal-400"
                              : "border-white/10 bg-navy-900/50 hover:bg-navy-700 text-gray-400"
                          }`}
                        >
                          {scale === "Percentage" ? "%" : scale}
                        </motion.button>
                      ))}
                    </div>

                    <input
                      type="number"
                      step="0.01"
                      placeholder={
                        data.gpaScale === "4.0"
                          ? "e.g. 3.8"
                          : data.gpaScale === "5.0"
                            ? "e.g. 4.5"
                            : data.gpaScale === "10.0"
                              ? "e.g. 8.5"
                              : "e.g. 85"
                      }
                      className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                      value={data.gpa}
                      onChange={(e) => updateData("gpa", e.target.value)}
                      max={
                        data.gpaScale === "4.0"
                          ? 4.0
                          : data.gpaScale === "5.0"
                            ? 5.0
                            : data.gpaScale === "10.0"
                              ? 10.0
                              : 100
                      }
                      min={0}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {data.gpaScale === "4.0" &&
                        "Enter on 4.0 scale (0.0 - 4.0)"}
                      {data.gpaScale === "5.0" &&
                        "Enter on 5.0 scale (0.0 - 5.0)"}
                      {data.gpaScale === "10.0" &&
                        "Enter on 10.0 scale (0.0 - 10.0)"}
                      {data.gpaScale === "Percentage" &&
                        "Enter percentage (0 - 100)"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        English Test
                      </label>
                      <select
                        className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 outline-none"
                        value={data.englishTest}
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Score
                      </label>
                      <input
                        type="text"
                        placeholder={
                          data.englishTest === "None" ? "N/A" : "e.g. 7.5"
                        }
                        className={`w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none ${
                          data.englishTest === "None"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        value={data.testScore}
                        onChange={(e) =>
                          updateData("testScore", e.target.value)
                        }
                        disabled={data.englishTest === "None"}
                      />
                    </div>
                  </div>
                  {data.englishTest !== "None" && !data.testScore && (
                    <div className="text-red-400 text-xs">
                      * Score is required for {data.englishTest}
                    </div>
                  )}
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
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          key={b}
                          onClick={() => updateData("budget", b)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            data.budget === b
                              ? "border-teal-400 bg-teal-400/10 text-teal-400"
                              : "border-white/10 bg-navy-900/50 hover:bg-navy-700"
                          }`}
                        >
                          {b} USD
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Countries
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
                      ].map((country) => {
                        const isSelected =
                          data.preferredCountries.includes(country);
                        return (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
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
                          </motion.button>
                        );
                      })}
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

            <motion.button
              whileTap={{ scale: 0.98 }}
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
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
