"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Mic,
  Keyboard,
  Search,
  Sparkles,
  Volume2,
  ArrowRight,
} from "lucide-react";
import { MAJOR_MAP } from "@/lib/constants";
import { useAlert } from "@/components/ui/AlertSystem";

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

const TEST_MAX_SCORES: Record<string, number> = {
  IELTS: 9,
  TOEFL: 120,
  Duolingo: 160,
  PTE: 90,
};

// Types for form data
type OnboardingData = {
  fullName: string;
  targetDegree: string;
  targetMajor: string;
  targetIntake: string;
  highestQualification: string;
  fieldOfStudy: string;
  citizenship: string;
  gpa: string;
  gpaScale: string;
  englishTest: string;
  testScore: string;
  budget: string;
  preferredCountries: string[];
};

// Simple type definition for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  // Modes: 'selection' | 'manual' | 'voice'
  const [mode, setMode] = useState<"selection" | "manual" | "voice">(
    "selection",
  );

  // Manual Step State
  const [step, setStep] = useState(1);

  // Voice Step State
  // 0: Welcome/Start, 1: Goal, 2: English Test, 3: Country, 4: Budget, 5: CGPA
  // Voice Step State
  // 0: Welcome/Start, 1: Goal, 2: English Test, 3: Country, 4: Budget, 5: CGPA
  const [voiceStep, setVoiceStep] = useState(0);
  const voiceStepRef = useRef(0); // Fix stale closures

  useEffect(() => {
    voiceStepRef.current = voiceStep;
  }, [voiceStep]);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiMessage, setAiMessage] = useState("");

  const recognitionRef = useRef<any>(null);

  // JSON Store for Voice Data (Reliable Persistence)
  const voiceDataRef = useRef<OnboardingData>({
    fullName: "",
    targetDegree: "", // No default, must be detected explicitly
    targetMajor: "",
    targetIntake: "Fall 2026",
    highestQualification: "",
    fieldOfStudy: "",
    citizenship: "",
    gpa: "",
    gpaScale: "4.0",
    englishTest: "None",
    testScore: "",
    budget: "20k-40k",
    preferredCountries: [],
  });

  // Keep state for UI rendering only
  const [data, setData] = useState<OnboardingData>(voiceDataRef.current);

  const [loading, setLoading] = useState(false);

  // --- Voice Logic helpers ---
  // We initialize the recognition object on mount but DO NOT start it automatically
  // to avoid permission blocking.
  useEffect(() => {
    if (mode === "voice") {
      if (typeof window !== "undefined") {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          // Detect user's language for better accent support (e.g., en-IN)
          // Explicitly fallback to 'en-IN' if locale is generic English, as per request for better accent handling
          recognition.lang =
            navigator.language === "en-US"
              ? "en-US"
              : navigator.language || "en-IN";
          if (!recognition.lang.includes("-")) recognition.lang = "en-IN"; // Default to Indian English if undecided
          recognition.interimResults = false;

          recognition.onstart = () => setIsListening(true);

          // CRITICAL: Handle onend logic carefully
          recognition.onend = () => {
            setIsListening(false);
            // We do NOT auto-restart here to avoid infinite loops of silence.
            // Logic depends on successful input processing.
          };

          recognition.onerror = (event: any) => {
            if (event.error === "no-speech" || event.error === "aborted") {
              // Expected behavior:
              // 'no-speech' = user silent
              // 'aborted' = we manually stopped/restarted it
              setIsListening(false);
              return;
            }

            console.error("Speech Recognition Error", event.error);
            setIsListening(false);
            setAiMessage("Error occurred. Please tap the mic to retry.");
          };
          recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            handleVoiceInput(text);
          };

          recognitionRef.current = recognition;
        } else {
          setAiMessage("Voice features are not supported in this browser.");
        }
      }
    }
  }, [mode]);

  const speak = (text: string, callback?: () => void) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Improve Voice Selection for different locales
      const voices = window.speechSynthesis.getVoices();

      // Attempt to find premium/natural sounding voices
      // Priority: Edge/Microsoft Online > Google > System Default
      const preferredVoice =
        voices.find((v) => v.name.includes("Natural")) || // Edge/Online voices often have "Natural"
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("Microsoft Zira")) ||
        voices.find((v) => v.name.includes("Microsoft David")) ||
        voices.find((v) => v.name.includes("Samantha")) ||
        voices.find((v) => v.lang.startsWith("en-")); // Any English fallback

      if (preferredVoice) utterance.voice = preferredVoice;

      // Tuning for more natural sound
      utterance.pitch = 1.0;
      utterance.rate = 1.1; // Slightly faster flows better for most TTS engines

      utterance.onend = () => {
        // Small delay to ensure synthesis is fully teardown before mic starts
        // This prevents the 'stuck' issue on some devices.
        if (callback) setTimeout(callback, 200);
      };

      utterance.onerror = (e) => {
        console.error("Speech Synthesis Error", e);
        if (callback) callback();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setAiMessage(text);
      if (callback) callback();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        // Abort any hanging session first
        recognitionRef.current.abort();
        setTimeout(() => {
          if (recognitionRef.current && mode === "voice") {
            try {
              recognitionRef.current.start();
            } catch (err: any) {
              // If already started, ignore. safely.
              if (err.name !== "InvalidStateError") {
                console.error("Mic restart error", err);
              }
            }
          }
        }, 100);
      } catch (e) {
        console.log("Recognition error", e);
      }
    }
  };

  // AI Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");

  // Triggered by the USER clicking "Start" button
  // Triggered by the USER clicking "Start" button
  const handleStartVoiceInteraction = () => {
    setVoiceStep(1);
    voiceStepRef.current = 1; // Sync Ref!
    speak(
      "Hi there! I'm excited to help you plan your journey. First off, what kind of degree are you looking to pursue?",
      () => {
        startListening();
      },
    );
  };

  const handleMicTap = () => {
    if (isListening) {
      // Mute / Stop Listening
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else if (!isProcessing) {
      // Unmute / Start Listening
      startListening();
    }
  };

  const handleVoiceInput = (text: string) => {
    console.log("🎤 Transcript:", text);
    const lower = text.toLowerCase();
    const currentStep = voiceStepRef.current;

    // JSON Store
    const store = voiceDataRef.current;
    const updateStore = (updates: Partial<OnboardingData>) => {
      Object.assign(store, updates);
      setData({ ...store });
    };

    // --- STEP 1: DEGREE ---
    if (currentStep === 1) {
      let degree = "";
      if (
        lower.includes("bachelor") ||
        lower.includes("undergrad") ||
        lower.includes("ug") ||
        lower.includes("bach")
      )
        degree = "Bachelors";
      else if (lower.includes("phd") || lower.includes("doctorate"))
        degree = "PhD";
      else if (lower.includes("mba")) degree = "MBA";
      else if (
        lower.includes("master") ||
        lower.includes("ms") ||
        lower.includes("m.s")
      )
        degree = "Masters";

      if (!degree) {
        // STRICT MODE: If no keyword matches, REJECT.
        speak(
          "I didn't quite catch that. Please say Bachelors, Masters, PhD, or MBA.",
          () => startListening(),
        );
        return;
      }

      updateStore({ targetDegree: degree });
      speak(
        `Awesome, a ${degree}. What is your highest qualification achieved so far?`,
        () => startListening(),
      );
      setVoiceStep(1.1); // Go to Qualification
      voiceStepRef.current = 1.1;
    }

    // --- STEP 1.1: HIGHEST QUALIFICATION ---
    else if (currentStep === 1.1) {
      const low = text.toLowerCase();
      let qual = "";
      if (
        low.includes("high school") ||
        low.includes("12th") ||
        low.includes("school")
      )
        qual = "High School";
      else if (
        low.includes("bachelor") ||
        low.includes("degree") ||
        low.includes("undergrad")
      )
        qual = "Bachelors";
      else if (low.includes("master") || low.includes("postgrad"))
        qual = "Masters";
      else if (low.includes("diploma")) qual = "Diploma";
      else if (low.includes("phd") || low.includes("doctorate")) qual = "PhD";

      if (!qual) {
        speak(
          "Could you clarify? For example: High School, Bachelors, or Masters.",
          () => startListening(),
        );
        return;
      }

      updateStore({ highestQualification: qual });

      speak("Understood. And what was your field of study?", () =>
        startListening(),
      );
      setVoiceStep(1.2);
      voiceStepRef.current = 1.2;
    }

    // --- STEP 1.2: PAST FIELD OF STUDY (Background) ---
    else if (currentStep === 1.2) {
      const lower = text.toLowerCase();
      let selectedField = "";

      // 1. Keyword check for popular fields
      if (
        lower.includes("cs") ||
        lower.includes("comp sci") ||
        lower.includes("computer")
      )
        selectedField = "Computer Science";
      else if (lower.includes("ai") || lower.includes("artificial"))
        selectedField = "Artificial Intelligence";
      else if (lower.includes("mech")) selectedField = "Mechanical Engineering";
      else if (lower.includes("civil")) selectedField = "Civil Engineering";
      else if (lower.includes("elec")) selectedField = "Electrical Engineering";
      else if (lower.includes("biz") || lower.includes("business"))
        selectedField = "Business Administration";
      else if (lower.includes("psych")) selectedField = "Psychology";
      else if (lower.includes("bio")) selectedField = "Biology";
      else if (lower.includes("chem")) selectedField = "Chemistry";
      else if (lower.includes("phy")) selectedField = "Physics";
      else if (lower.includes("math")) selectedField = "Mathematics";
      else if (lower.includes("eng")) selectedField = "English";
      else if (lower.includes("hist")) selectedField = "History";
      else if (lower.includes("arch")) selectedField = "Architecture";

      // 2. Fallback: custom input
      if (!selectedField) {
        if (
          text.length > 3 &&
          !["no", "yes", "nope", "cancel"].includes(lower)
        ) {
          selectedField = text;
        }
      }

      if (!selectedField) {
        speak(
          `I didn't quite catch your background field. Could you say it again? e.g. "Computer Science" or "Biology"`,
          () => startListening(),
        );
        return;
      }

      updateStore({ fieldOfStudy: selectedField });

      speak(`Got it. Now, what specific major do you want to pursue?`, () =>
        startListening(),
      );
      setVoiceStep(1.3); // New Step for Target Major
      voiceStepRef.current = 1.3;
    }

    // --- STEP 1.3: TARGET DEGREE FIELD (Goal) ---
    else if (currentStep === 1.3) {
      const lower = text.toLowerCase();
      let targetField = "";

      // 1. Check against MAJOR_MAP
      const degreeType = store.targetDegree || "Masters";
      const possibleMajors = MAJOR_MAP[degreeType] || [];
      const match = possibleMajors.find((m) => lower.includes(m.toLowerCase()));

      if (match) targetField = match;

      // 2. Synonyms if not matched
      if (!targetField) {
        if (lower.includes("cs") || lower.includes("comp sci"))
          targetField = "Computer Science";
        else if (lower.includes("ai")) targetField = "Artificial Intelligence";
        else if (lower.includes("data")) targetField = "Data Science";
        else if (lower.includes("cyber")) targetField = "Cybersecurity";
        else if (lower.includes("marketing")) targetField = "Marketing";
        else if (lower.includes("fin")) targetField = "Finance";
      }

      // 3. Fallback
      if (!targetField && text.length > 3) {
        targetField = text;
      }

      if (!targetField) {
        speak(
          `Please specify your target major again. For example: Data Science, MBA, or Psychology.`,
          () => startListening(),
        );
        return;
      }

      updateStore({ targetMajor: targetField });

      speak(
        `Excellent choice. When do you plan to start your studies? For example, Fall 2026.`,
        () => startListening(),
      );
      setVoiceStep(1.5);
      voiceStepRef.current = 1.5;
    }

    // --- STEP 1.5: INTAKE (NEW) ---
    else if (currentStep === 1.5) {
      let intake = "Fall 2026"; // Default

      if (lower.includes("fall")) intake = "Fall";
      else if (lower.includes("spring")) intake = "Spring";
      else if (lower.includes("winter")) intake = "Winter";
      else if (lower.includes("summer")) intake = "Summer";
      else intake = "Fall"; // Default season

      // Smart Year Logic (Current Year: 2026)
      if (lower.includes("2026")) intake += " 2026";
      else if (lower.includes("2027")) intake += " 2027";
      else if (lower.includes("2028")) intake += " 2028";
      else if (lower.includes("next year")) intake += " 2027";
      else if (lower.includes("this year")) intake += " 2026";
      else intake += " 2026"; // Default year

      updateStore({ targetIntake: intake });
      speak(`Noted, ${intake}. What is your country of citizenship?`, () =>
        startListening(),
      );
      setVoiceStep(1.8);
      voiceStepRef.current = 1.8;
    }

    // --- STEP 1.8: CITIZENSHIPFor (NEW) ---
    else if (currentStep === 1.8) {
      const cLower = text.toLowerCase();
      // Basic validation: Must match list or look like a country name
      // Logic: If it's very short or clearly junk, reject.
      // List check is best.
      const validCountries = CITIZENSHIP_OPTIONS.map((c) => c.toLowerCase());
      const match = validCountries.find((c) => cLower.includes(c));
      const country = match
        ? CITIZENSHIP_OPTIONS[validCountries.indexOf(match)]
        : text; // Use matched exact casing or raw text

      if (text.length < 3) {
        speak("Could you please say your citizenship country again?", () =>
          startListening(),
        );
        return;
      }

      updateStore({ citizenship: country });

      speak(
        `Got it, ${country}. Have you taken an English test like IELTS, TOEFL, or Duolingo?`,
        () => startListening(),
      );
      setVoiceStep(2);
      voiceStepRef.current = 2;
    }

    // --- STEP 2: TEST NAME ---
    else if (currentStep === 2) {
      let test = "";
      if (
        lower.includes("ielts") ||
        lower.includes("eye") ||
        lower.includes("elts")
      )
        test = "IELTS";
      else if (lower.includes("toefl") || lower.includes("toffle"))
        test = "TOEFL";
      else if (lower.includes("duolingo") || lower.includes("duo"))
        test = "Duolingo";
      else if (lower.includes("pte")) test = "PTE";
      else if (
        lower.includes("none") ||
        lower.includes("no") ||
        lower.includes("haven't")
      )
        test = "None";

      if (!test) {
        speak(
          "I'm not sure which test you mean. Have you taken IELTS, TOEFL, or none yet?",
          () => startListening(),
        );
        return;
      }

      updateStore({ englishTest: test });

      if (test !== "None") {
        speak(`Great, you've done ${test}. What was your score?`, () =>
          startListening(),
        );
        setVoiceStep(3);
        voiceStepRef.current = 3;
      } else {
        speak("No problem. Which country is your top preference?", () =>
          startListening(),
        );
        setVoiceStep(4);
        voiceStepRef.current = 4;
      }
    }

    // --- STEP 3: TEST SCORE ---
    else if (currentStep === 3) {
      const numbers = text.match(/[\d\.]+/g);
      const score = numbers ? numbers[0] : "";

      if (!score) {
        speak("I didn't hear a number. What was your score?", () =>
          startListening(),
        );
        return;
      }

      const val = parseFloat(score);
      const testType = store.englishTest;
      const maxScore = TEST_MAX_SCORES[testType];

      if (maxScore && val > maxScore) {
        speak(
          `That score seems too high. The maximum for ${testType} is ${maxScore}. Could you repeat it?`,
          () => startListening(),
        );
        return;
      }

      updateStore({ testScore: score });
      speak(
        `Got it, ${score}. Now, which country is your top preference?`,
        () => startListening(),
      );
      setVoiceStep(4);
      voiceStepRef.current = 4;
    }

    // --- STEP 4: COUNTRY (ADD MODE) ---
    else if (currentStep === 4) {
      // We parse ONE country at a time here to avoid confusion
      let newCountry = "";
      if (lower.includes("canada")) newCountry = "Canada";
      else if (
        lower.includes("usa") ||
        lower.includes("america") ||
        lower.includes("states") ||
        lower.includes("us")
      )
        newCountry = "USA";
      else if (
        lower.includes("uk") ||
        lower.includes("kingdom") ||
        lower.includes("england")
      )
        newCountry = "UK";
      else if (lower.includes("germany") || lower.includes("deutschland"))
        newCountry = "Germany";
      else if (
        lower.includes("switzerland") ||
        lower.includes("swiss") ||
        lower.includes("seizer")
      )
        newCountry = "Switzerland";
      else if (lower.includes("ireland")) newCountry = "Ireland";
      else if (lower.includes("netherlands") || lower.includes("dutch"))
        newCountry = "Netherlands";
      else if (lower.includes("france")) newCountry = "France";
      else if (lower.includes("australia")) newCountry = "Australia";
      else if (lower.includes("zealand") || lower.includes("nz"))
        newCountry = "New Zealand";
      else if (lower.includes("singapore")) newCountry = "Singapore";

      if (!newCountry) {
        // Maybe they said "No more" or "That's it" if looping?
        if (lower.includes("no") || lower.includes("done")) {
          // Treat as done
          if (store.preferredCountries.length > 0) {
            speak(
              `Okay, proceeding with ${store.preferredCountries.join(" and ")}. What is your annual budget in USD?`,
              () => startListening(),
            );
            setVoiceStep(5);
            voiceStepRef.current = 5;
            return;
          }
        }

        speak("I didn't catch that country. Could you say it again?", () =>
          startListening(),
        );
        return;
      }

      // Add to list
      const currentList = [...store.preferredCountries];
      if (!currentList.includes(newCountry)) {
        currentList.push(newCountry);
      }
      // If multiple mentioned in one go, could split. For now simple.
      updateStore({ preferredCountries: currentList });

      // Removed "Add another" loop as requested. Proceed to Budget.
      speak(
        `Got it, ${newCountry}. Moving on. What is your approximate annual budget in USD?`,
        () => startListening(),
      );
      setVoiceStep(5);
      voiceStepRef.current = 5;
    }

    // --- STEP 4.5 REMOVED ---

    // --- STEP 5: BUDGET ---
    else if (currentStep === 5) {
      // Enhanced Parsing
      let budget = "";
      let rawNum = 0;
      const numbers = text.match(/[\d\.\,]+/g);

      // Handle "35k" logic
      if (numbers && numbers.length > 0) {
        let valStr = numbers[0].replace(/,/g, "");
        let val = parseFloat(valStr);
        if (lower.includes("k") || val < 100) val *= 1000; // Assume 35 -> 35000 if context implies
        rawNum = val;
      }

      if (rawNum > 0) {
        if (rawNum < 20000) budget = "< 20k";
        else if (rawNum < 40000) budget = "20k-40k";
        else if (rawNum < 60000) budget = "40k-60k";
        else budget = "60k+";
      } else {
        // Fallback keywords
        if (lower.includes("low") || lower.includes("20")) budget = "< 20k";
        else if (
          lower.includes("30") ||
          lower.includes("40") ||
          lower.includes("medium")
        )
          budget = "20k-40k";
        else if (lower.includes("50") || lower.includes("60"))
          budget = "40k-60k";
        else if (lower.includes("high") || lower.includes("80"))
          budget = "60k+";
      }

      if (!budget) {
        speak(
          "I didn't catch the amount. Could you say it again, like '30 thousand'?",
          () => startListening(),
        );
        return;
      }

      updateStore({ budget });
      speak("Noted. Finally, what is your CGPA?", () => startListening());
      setVoiceStep(6);
      voiceStepRef.current = 6;
    }

    // --- STEP 6: GPA VALUE ---
    else if (currentStep === 6) {
      const numbers = text.match(/[\d\.]+/g);
      let gpa = numbers ? numbers[0] : "";

      if (!gpa) {
        speak("I didn't hear a GPA number. Could you repeat it?", () =>
          startListening(),
        );
        return;
      }

      const gpaVal = parseFloat(gpa);

      // Smart Skip Logic: If > 5, assume 10.0 scale and finish
      if (gpaVal > 5.0) {
        updateStore({ gpa, gpaScale: "10.0" });
        speak(
          `Perfect! A GPA of ${gpa} on a 10.0 scale. I've built your profile. Taking you to your dashboard now!`,
          () => {
            submitVoiceData({ ...store, gpa, gpaScale: "10.0" });
          },
        );
        return;
      }

      updateStore({ gpa });
      speak(`Got it, ${gpa}. And what is the total scale? 4.0 or 5.0?`, () =>
        startListening(),
      );
      setVoiceStep(7);
      voiceStepRef.current = 7;
    }

    // --- STEP 7: GPA SCALE ---
    else if (currentStep === 7) {
      const numbers = text.match(/[\d\.]+/g);
      let scale = "4.0";

      if (numbers && numbers.length > 0) scale = numbers[0];
      else if (lower.includes("ten")) scale = "10.0";
      else if (lower.includes("five")) scale = "5.0";
      else if (lower.includes("four")) scale = "4.0";

      // Smart correction
      const currentGpaRaw = store.gpa || "0";
      if (
        parseFloat(scale) < parseFloat(currentGpaRaw) &&
        parseFloat(currentGpaRaw) > 4.0
      ) {
        scale = "10.0";
      }

      updateStore({ gpaScale: scale });

      speak(
        `Perfect! A GPA of ${store.gpa} out of ${scale}. I've built your profile. Taking you to your dashboard now!`,
        () => {
          submitVoiceData({ ...store });
        },
      );
    }
  };

  const submitVoiceData = async (finalData: OnboardingData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) throw new Error("Failed to save profile");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      showAlert("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Manual Logic ---
  const updateData = (key: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = async () => {
    // Validation Logic
    if (step === 1) {
      if (!data.targetDegree) {
        showAlert("Please select your Target Degree.", "error");
        return;
      }
      if (!data.citizenship) {
        showAlert("Please select your Citizenship.", "error");
        return;
      }
      if (!data.highestQualification) {
        showAlert("Please select your Highest Qualification.", "error");
        return;
      }
      if (!data.fieldOfStudy) {
        showAlert("Please select your Field of Study.", "error");
        return;
      }
    }

    if (step === 2) {
      if (!data.gpa || data.gpa.trim() === "") {
        showAlert(
          "Please enter your GPA/Percentage before continuing.",
          "error",
        );
        return;
      }
      const gpaValue = parseFloat(data.gpa);
      if (gpaValue < 0) {
        showAlert("GPA cannot be negative.", "error");
        return;
      }

      if (data.gpaScale === "Percentage") {
        if (gpaValue > 100) {
          showAlert("Percentage cannot exceed 100%.", "error");
          return;
        }
      } else {
        const maxScale = parseFloat(data.gpaScale);
        if (gpaValue > maxScale) {
          showAlert(
            `GPA cannot exceed the selected scale of ${maxScale}.`,
            "error",
          );
          return;
        }
      }

      if (data.englishTest !== "None" && !data.testScore) {
        showAlert(`Please enter your ${data.englishTest} score.`, "error");
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
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
        showAlert("Something went wrong.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // --- Render ---

  if (mode === "selection") {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-5" />
        </div>

        <div className="w-full max-w-5xl relative z-10">
          <div className="text-center mb-16 space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 pb-2 leading-tight"
            >
              Begin Your Journey
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Choose how you want to build your scholar profile today.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8 px-2 md:px-4">
            {/* Manual Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative bg-navy-800/50 hover:bg-navy-800/80 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 p-10 rounded-[2rem] cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
              onClick={() => setMode("manual")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col items-center text-center h-full">
                <div className="w-24 h-24 bg-navy-900 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/5 group-hover:border-blue-500/20 group-hover:scale-110 transition-all duration-300">
                  <Keyboard className="w-10 h-10 text-gray-500 group-hover:text-blue-400 transition-colors" />
                </div>

                <h2 className="text-3xl font-bold mb-3 text-white group-hover:text-blue-100 transition-colors">
                  Classic Route
                </h2>
                <div className="h-1 w-12 bg-blue-500/30 rounded-full mb-6" />

                <p className="text-gray-400 leading-relaxed mb-8">
                  Fill out the comprehensive form at your own pace. Perfect if
                  you have all your documents ready.
                </p>

                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                  Start Manual Entry <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Voice AI Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative bg-navy-800/50 hover:bg-navy-800/80 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 p-10 rounded-[2rem] cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-purple-500/10 overflow-hidden"
              onClick={() => {
                const hasSupport =
                  typeof window !== "undefined" &&
                  ("SpeechRecognition" in window ||
                    "webkitSpeechRecognition" in window);

                if (!hasSupport) {
                  showAlert(
                    "Your browser does not support Voice Recognition. Redirecting to Manual Mode.",
                    "error",
                  );
                  setMode("manual");
                  return;
                }
                setMode("voice");
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Floating elements for AI effect */}
              <div className="absolute top-10 right-10 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-20" />
              <div className="absolute bottom-10 left-10 w-3 h-3 bg-purple-500 rounded-full animate-pulse opacity-20" />

              <div className="relative z-10 flex flex-col items-center text-center h-full">
                <div className="w-24 h-24 bg-navy-900 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/5 group-hover:border-purple-500/20 group-hover:scale-110 transition-all duration-300">
                  <Mic className="w-10 h-10 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>

                <h2 className="text-3xl font-bold mb-3 text-white group-hover:text-purple-100 transition-colors">
                  AI Experience
                </h2>
                <div className="h-1 w-12 bg-purple-500/30 rounded-full mb-6" />

                <p className="text-gray-400 leading-relaxed mb-8">
                  Have a natural conversation with our AI Counsellor. We'll
                  build your profile while you chat.
                </p>

                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                  Start Voice Chat <Sparkles className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "voice") {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Immersive Background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] transition-all duration-1000 ${isListening ? "scale-110 opacity-100" : "scale-100 opacity-60"}`}
        />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-navy-800/60 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-between">
            {/* Decorative Top-light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />

            {voiceStep === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full flex-1">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full animate-pulse blur-xl opacity-50 absolute inset-0" />
                  <div className="w-32 h-32 bg-navy-900 rounded-full flex items-center justify-center relative z-10 border border-white/10 shadow-2xl">
                    <Mic className="w-12 h-12 text-purple-400" />
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 tracking-tight">
                  Start Your Journey
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                  I'm your AI Counselor. Let's have a brief conversation to
                  build your perfect study abroad profile.
                </p>
                <button
                  onClick={handleStartVoiceInteraction}
                  className="group relative px-12 py-5 bg-white text-navy-900 font-bold text-lg rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10">Start Conversation</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between">
                {/* Header: Progress & Status */}
                <div className="w-full px-8 pt-4 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-red-400 tracking-widest uppercase">
                        Live Session
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white/40">
                      Step {Math.floor(voiceStep) || 1} of 7
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(Math.floor(voiceStep) / 7) * 100}%`,
                      }}
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                  </div>
                </div>

                {/* Main Interaction Area */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
                  {/* The AI Avatar Centerpiece */}
                  <div className="relative mb-12">
                    {/* The Glow */}
                    <motion.div
                      animate={{
                        scale: isListening ? [1, 1.2, 1] : [1, 1.05, 1],
                        opacity: isListening ? 0.8 : 0.3,
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-teal-500 rounded-full blur-3xl"
                    />

                    {/* The Orb */}
                    <div className="relative z-10 w-32 h-32 rounded-full bg-navy-900 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden backdrop-blur-md">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />

                      {/* Internal Visualizer */}
                      <div className="flex items-center gap-1 h-12">
                        {isListening ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                height: [10, 30 + Math.random() * 20, 10],
                              }}
                              transition={{
                                duration: 0.4,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                              className="w-1.5 bg-white rounded-full"
                            />
                          ))
                        ) : (
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Message */}
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={aiMessage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-3xl md:text-4xl font-medium text-center text-white leading-tight max-w-2xl px-4"
                    >
                      {aiMessage}
                    </motion.h2>
                  </AnimatePresence>
                </div>

                {/* User Input Area (Hybrid Voice + Text) */}
                <div className="mt-8 min-h-[140px] flex flex-col items-center justify-end pb-8 gap-4">
                  {/* Voice Status / Transcript Display */}
                  <div
                    className={`transition-all duration-300 ${isListening ? "opacity-100 transform scale-100" : "opacity-60 transform scale-95"}`}
                  >
                    {isListening && (
                      <div className="flex items-center gap-2 text-purple-300/80 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 mb-2">
                        <Mic className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-medium">
                          Listening... "{transcript}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Text Input Box */}
                  <div className="relative w-full max-w-lg group">
                    <input
                      type="text"
                      value={inputText}
                      onFocus={() => {
                        // Intelligent Auto-Mute: If focusing to type, stop the mic to prevent interference
                        if (isListening && recognitionRef.current) {
                          recognitionRef.current.stop();
                          setIsListening(false);
                        }
                      }}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && inputText.trim()) {
                          handleVoiceInput(inputText); // Reuse logic!
                          setInputText("");
                          setTranscript(inputText); // Visual feedback
                          // Stop listening if they decided to type
                          if (recognitionRef.current)
                            recognitionRef.current.stop();
                        }
                      }}
                      placeholder={
                        isListening
                          ? "Listening... (Tap to type)"
                          : "Type your answer..."
                      }
                      className="w-full bg-navy-950/50 border border-white/10 rounded-2xl px-6 py-4 pl-14 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-navy-900/80 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-lg backdrop-blur-sm"
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                      <Keyboard className="w-5 h-5" />
                    </div>

                    {/* Send Button (only if text exists) */}
                    {inputText.trim() && (
                      <button
                        onClick={() => {
                          handleVoiceInput(inputText);
                          setInputText("");
                          setTranscript(inputText);
                          if (recognitionRef.current)
                            recognitionRef.current.stop();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-500 hover:bg-purple-400 text-white p-2 rounded-xl transition-all shadow-lg"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Persistent Voice Control Toggle */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleMicTap}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${isListening ? "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20" : "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"}`}
                    >
                      {isListening ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          Tap to Mute Mic
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" /> Tap to Unmute
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setMode("selection")}
            className="text-gray-500 hover:text-white underline text-sm"
          >
            Cancel and return to selection
          </button>
        </div>
      </div>
    );
  }

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
                <h2 className="text-2xl font-bold">Basic Profile</h2>

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
                          onClick={() => {
                            updateData("targetDegree", deg);
                            updateData("targetMajor", "");
                          }}
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

                  {/* Target Major (New Field) */}
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Major / Specialization
                    </label>
                    <select
                      className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none appearance-none text-white transition-colors"
                      value={data.targetMajor || ""}
                      onChange={(e) =>
                        updateData("targetMajor", e.target.value)
                      }
                    >
                      <option value="" className="text-gray-400">
                        Select Target Major
                      </option>
                      {(MAJOR_MAP[data.targetDegree || "Masters"] || []).map(
                        (m) => (
                          <option key={m} value={m} className="bg-navy-900">
                            {m}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Citizenship
                      </label>
                      <select
                        className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                        value={data.citizenship}
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Highest Qualification
                      </label>
                      <select
                        className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                        value={data.highestQualification}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateData("highestQualification", val);
                          updateData("fieldOfStudy", ""); // Reset dependent field
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stream / Field
                      </label>
                      <select
                        className={`w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none appearance-none ${!data.highestQualification ? "opacity-50 cursor-not-allowed" : ""}`}
                        value={data.fieldOfStudy}
                        onChange={(e) =>
                          updateData("fieldOfStudy", e.target.value)
                        }
                        disabled={!data.highestQualification}
                      >
                        <option value="">Select Field</option>
                        {data.highestQualification &&
                          QUALIFICATION_MAP[data.highestQualification]?.map(
                            (f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ),
                          )}
                      </select>
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
                        onChange={(e) => {
                          const val = e.target.value;
                          const numVal = parseFloat(val);
                          const max = TEST_MAX_SCORES[data.englishTest];

                          if (val === "" || (max && numVal <= max)) {
                            updateData("testScore", val);
                          }
                        }}
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
              onClick={() => {
                if (step === 1) setMode("selection");
                else prevStep();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors text-gray-400 hover:text-white"
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
