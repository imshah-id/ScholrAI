"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

import {
  CheckCircle2,
  Circle,
  FileText,
  Upload,
  Calendar,
  Lock,
  Loader2,
  Sparkles,
  X,
  MessageSquare,
  Copy,
  Check,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAlert } from "@/components/ui/AlertSystem";

export default function GuidancePage() {
  const { showAlert } = useAlert();
  const [tasks, setTasks] = useState<any[]>([]);
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI State
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [outline, setOutline] = useState("");
  const [showOutlineModal, setShowOutlineModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState("");

  // New Features State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [interviewQuestion, setInterviewQuestion] = useState("");
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState("");
  const [interviewLoading, setInterviewLoading] = useState(false);

  const handleSubmitApplication = () => {
    setHasSubmitted(true);
    // Trigger confetti or sound here if possible
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
    ); // Simple chime
    audio.play().catch((e) => {});
    showAlert("Application Marked as Submitted! Good luck!", "success");
  };

  const handleStartInterview = async () => {
    setInterviewLoading(true);
    setInterviewFeedback("");
    setInterviewAnswer("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate a tough, university-specific interview question for ${university?.name || "a top university"}. Return ONLY the question text.`,
        }),
      });
      const data = await res.json();
      setInterviewQuestion(data.reply);
    } catch (e) {
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleInterviewSubmit = async () => {
    if (!interviewAnswer) return;
    setInterviewLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `I was asked "${interviewQuestion}" for an interview at ${university?.name}. My answer was "${interviewAnswer}". Rate this answer 1-10 and give 2 tips to improve.`,
        }),
      });
      const data = await res.json();
      setInterviewFeedback(data.reply);
    } catch (e) {
    } finally {
      setInterviewLoading(false);
    }
  };

  // Trigger interview start when modal opens
  useEffect(() => {
    if (showInterviewModal && !interviewQuestion) {
      handleStartInterview();
    }
  }, [showInterviewModal]);

  // Trigger interview start when modal opens
  useEffect(() => {
    if (showInterviewModal && !interviewQuestion) {
      handleStartInterview();
    }
  }, [showInterviewModal]);

  useEffect(() => {
    fetchGuidance();
  }, []);

  useEffect(() => {
    if (university?.name && tips.length === 0) {
      fetchTips();
    }
  }, [university]);

  // AO Simulator State
  const [aoVerdict, setAoVerdict] = useState<any>(null);

  const fetchTips = async () => {
    if (!university?.name) return;

    // CACHE CHECK
    const cacheKey = `scholrai_tips_${university.name}`;
    const cachedTips = sessionStorage.getItem(cacheKey);
    if (cachedTips) {
      try {
        setTips(JSON.parse(cachedTips));
        return;
      } catch (e) {}
    }

    setTipsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Give me 3 short, specific, high-impact tips to improve my admission chances for ${university.name} given my profile. Return ONLY the 3 tips as a list, no intro/outro.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Simple parsing
        const cleanTips = data.reply
          .split("\n")
          .filter((line: string) => line.trim().length > 10)
          .slice(0, 3);
        setTips(cleanTips);
        sessionStorage.setItem(cacheKey, JSON.stringify(cleanTips));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTipsLoading(false);
    }
  };

  const fetchGuidance = async () => {
    // CACHE CHECK
    const cachedTasks = sessionStorage.getItem("scholrai_guidance_tasks");
    if (cachedTasks) {
      try {
        const parsed = JSON.parse(cachedTasks);
        setTasks(parsed.tasks);
        setUniversity(parsed.university);
        setLoading(false);
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/guidance");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
        setUniversity(data.university);
        sessionStorage.setItem("scholrai_guidance_tasks", JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && !university) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-4 bg-navy-800 rounded-full text-gray-400">
          <Lock className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">Stage Locked</h2>
        <p className="text-gray-400 max-w-md text-center">
          You must <strong>Lock a University</strong> in your Shortlist to
          unlock Application Guidance.
        </p>
        <Link href="/dashboard/shortlist">
          <button className="bg-primary text-navy-900 font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Go to Shortlist
          </button>
        </Link>
      </div>
    );
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const currentStatus = task.status;
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      await fetch("/api/guidance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id, status: newStatus }),
      });

      const updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t,
      );
      sessionStorage.setItem(
        "scholrai_guidance_tasks",
        JSON.stringify({ tasks: updatedTasks, university }),
      );
    } catch (e) {
      setTasks(
        tasks.map((t) => (t.id === id ? { ...t, status: currentStatus } : t)),
      );
    }
  };

  const handleGenerateOutline = async () => {
    if (!university) return;
    setGeneratingOutline(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate a structured essay outline for a Statement of Purpose for ${university.name}. Focus on key sections to include.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutline(data.reply);
        setShowOutlineModal(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingOutline(false);
    }
  };

  const openReviewModal = (taskTitle: string) => {
    setActiveTaskTitle(taskTitle);
    setReviewText("");
    setReviewFeedback("");
    setAoVerdict(null);
    setShowReviewModal(true);
  };

  const handleAIReview = async () => {
    if (!reviewText) return;
    setReviewing(true);
    setAoVerdict(null); // Reset previous

    try {
      // Direct Prompt for AO Persona
      const prompt = `
        ACT AS A STRICT ADMISSIONS OFFICER from ${university?.name || "a Top Tier University"}.
        Review the following draft for the task "${activeTaskTitle}".
        
        You must be critical, realistic, and slightly harsh if necessary.
        
        Return a JSON object with:
        - score: (0-100 integer)
        - decision: "ACCEPTED", "WAITLISTED", or "REJECTED" (based on draft quality alone)
        - feedback: A short markdown critique (max 3 bullets) focusing on specific weaknesses.
        - oneLiner: A brutal or encouraging valid 1-sentence summary (e.g. "This feels generic.").
        
        Draft:
        "${reviewText.substring(0, 3000)}"
      `;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        const cleanJson = data.reply
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        try {
          const verdict = JSON.parse(cleanJson);
          setAoVerdict(verdict);
        } catch (e) {
          setAoVerdict({
            score: 75,
            decision: "WAITLISTED",
            feedback: data.reply,
            oneLiner:
              "Authentication error (Format), but here is the feedback.",
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewing(false);
    }
  };

  // Calculate Progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Application Guidance</h1>
          <p className="text-gray-400">
            Step-by-step tasks to complete your application for{" "}
            <span className="font-bold text-white max-w-md truncate inline-block align-bottom">
              {university?.name || "your target university"}
            </span>
            .
          </p>
        </div>

        {/* Progress Bar Widget */}
        <div className="bg-navy-800/50 border border-white/5 p-4 rounded-xl min-w-[250px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-300">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-teal-400">{progress}%</span>
          </div>
          <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-300 h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" /> Tasks Checklist
            </h3>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                className={`glass p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-colors relative overflow-hidden ${
                  task.status === "completed"
                    ? "border-green-500/30 bg-green-500/5 opacity-75"
                    : "border-white/5 hover:border-white/20"
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <div
                  className={`p-1 rounded-full ${task.status === "completed" ? "text-green-400" : "text-gray-500"}`}
                >
                  {task.status === "completed" ? <CheckCircle2 /> : <Circle />}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${task.status === "completed" ? "line-through text-gray-500" : "text-white"}`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="bg-white/5 px-2 py-0.5 rounded">
                      {task.type}
                    </span>
                  </div>
                </div>
                {task.type === "Essay" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReviewModal(task.title);
                    }}
                    className="bg-teal-500/10 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-teal-500/20 hover:bg-teal-500/20 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" /> AI Review
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Smart Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            {/* Interview Prep Module */}
            <div className="glass p-5 rounded-xl border border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent hover:border-purple-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-1 rounded">
                  New
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Mock Interview
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Practice university-specific questions with AI feedback.
              </p>
              <button
                onClick={() => setShowInterviewModal(true)}
                className="w-full py-2 rounded-lg bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                Start Session{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Profile Health & App Status */}
            <div className="glass p-5 rounded-xl border border-white/5 hover:border-teal-500/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Ready to Submit?
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tasks Completed</span>
                  <span
                    className={`font-bold ${progress === 100 ? "text-green-400" : "text-gray-200"}`}
                  >
                    {progress}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Documents</span>
                  <Link
                    href="/dashboard/profile"
                    className="text-teal-400 hover:underline flex items-center gap-1"
                  >
                    Manage in Profile <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <button
                onClick={handleSubmitApplication}
                disabled={progress < 100 && !hasSubmitted}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-all relative overflow-hidden group ${hasSubmitted ? "bg-green-500 text-white" : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20"}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {hasSubmitted
                    ? "Application Submitted! 🎉"
                    : "Finalize Application"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Assistant Sidebar */}
          <div className="glass p-6 rounded-2xl border border-white/5 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-linear-to-tr from-teal-400 to-teal-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">AI Tips</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-navy-800/50 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-gray-300 mb-2">
                  &quot;Make sure your Personal Statement highlights your
                  leadership in the Robotics Club. Stanford values
                  initiative.&quot;
                </p>
                <div className="text-xs text-teal-400 font-bold">
                  Based on your Profile
                </div>
              </div>

              <button
                onClick={handleGenerateOutline}
                disabled={generatingOutline}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-bold border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                {generatingOutline ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-gold-400" />
                )}
                {generatingOutline ? "Generating..." : "Generate Essay Outline"}
              </button>
            </div>
          </div>

          {/* AI Standout Strategies (Pro Tips) */}
          <div className="glass p-6 rounded-2xl border border-white/5 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-bold">Standout Strategies</h3>
            </div>

            {tipsLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-navy-800/50 rounded-xl"></div>
                <div className="h-16 bg-navy-800/50 rounded-xl"></div>
                <div className="h-16 bg-navy-800/50 rounded-xl"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {tips.length > 0 ? (
                  tips.map((tip, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-navy-800/50 border border-white/5 text-sm text-gray-300 flex gap-3"
                    >
                      <div className="shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" />
                      </div>
                      <div className="prose prose-invert prose-sm leading-snug">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <span {...props} />,
                          }}
                        >
                          {tip.replace(/^-\s*/, "")}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No specific strategies found. Ensure your profile is
                    updated.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Removed Quick Resources Hub */}
        </div>
      </div>

      {/* Mock Interview Modal */}
      <AnimatePresence>
        {showInterviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-navy-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-navy-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Mock Interview
                    </h2>
                    <p className="text-xs text-gray-400">
                      AI-Powered Session for {university?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
                {/* Question Card */}
                <div className="bg-navy-800 p-5 rounded-xl border border-white/5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Interviewer Has Asked:
                  </h3>
                  {interviewLoading && !interviewQuestion ? (
                    <div className="animate-pulse h-6 bg-white/5 rounded w-3/4"></div>
                  ) : (
                    <p className="text-lg font-bold text-white italic">
                      "{interviewQuestion}"
                    </p>
                  )}
                </div>

                {!interviewFeedback ? (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Your Answer (Type or Transcribe)
                    </label>
                    <textarea
                      className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      placeholder="I believe I am a good fit because..."
                      value={interviewAnswer}
                      onChange={(e) => setInterviewAnswer(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-green-400 font-bold">
                      <Sparkles className="w-4 h-4" /> Feedback
                    </div>
                    <div className="prose prose-invert prose-sm text-gray-300">
                      <ReactMarkdown>{interviewFeedback}</ReactMarkdown>
                    </div>
                    <button
                      onClick={handleStartInterview}
                      className="text-sm text-green-400 hover:text-white underline mt-2"
                    >
                      Next Question
                    </button>
                  </div>
                )}
              </div>

              {!interviewFeedback && (
                <div className="p-6 border-t border-white/10 bg-navy-800/50 flex justify-end gap-3">
                  <button
                    onClick={handleStartInterview}
                    className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleInterviewSubmit}
                    disabled={!interviewAnswer || interviewLoading}
                    className="px-6 py-2 rounded-lg bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {interviewLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit Answer"
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Outline Modal */}
      <AnimatePresence>
        {showOutlineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-navy-900 border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-navy-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-tr from-teal-400 to-teal-600 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Statement of Purpose Outline
                    </h2>
                    <p className="text-xs text-gray-400">
                      Generated for {university?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOutlineModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-navy-900">
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 px-4">
                  <ReactMarkdown>{outline}</ReactMarkdown>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-navy-800/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowOutlineModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(outline);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-primary text-navy-900 hover:bg-gold-400"
                  }`}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-navy-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-navy-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-tr from-teal-400 to-teal-600 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      AI Content Review
                    </h2>
                    <p className="text-xs text-gray-400">{activeTaskTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
                {!reviewFeedback && !aoVerdict ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Paste your draft (Essay, SOP, or Resume text)
                      </label>
                      <textarea
                        className="w-full h-64 bg-navy-800 border border-white/10 rounded-xl p-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none font-mono text-sm leading-relaxed"
                        placeholder="Paste your content here..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* AO Verdict Card */}
                    {aoVerdict && (
                      <div className="bg-navy-800 border-2 border-white/10 rounded-xl p-6 relative overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 w-full h-1 ${
                            aoVerdict.decision === "ACCEPTED"
                              ? "bg-green-500"
                              : aoVerdict.decision === "WAITLISTED"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />

                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                              Admissions Verdict
                            </div>
                            <div
                              className={`text-4xl font-black tracking-tighter ${
                                aoVerdict.decision === "ACCEPTED"
                                  ? "text-green-500"
                                  : aoVerdict.decision === "WAITLISTED"
                                    ? "text-yellow-500"
                                    : "text-red-500"
                              }`}
                            >
                              {aoVerdict.decision}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-white">
                              {aoVerdict.score}
                              <span className="text-lg text-gray-500">
                                /100
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase">
                              Impact Score
                            </div>
                          </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-lg border border-white/5 mb-4">
                          <div className="text-sm font-medium text-gray-300 italic">
                            "{aoVerdict.oneLiner}"
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-bold text-gray-400 uppercase">
                            Officer's Notes
                          </div>
                          <div className="prose prose-invert prose-sm text-gray-300">
                            <ReactMarkdown>{aoVerdict.feedback}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {!aoVerdict && reviewFeedback && (
                      <div className="bg-navy-800 border border-white/10 rounded-xl p-4">
                        <h3 className="font-bold text-teal-400 mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> AI Feedback
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                          <ReactMarkdown>{reviewFeedback}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setReviewFeedback("");
                          setAoVerdict(null);
                        }}
                        className="text-sm text-gray-400 hover:text-white underline hover:no-underline"
                      >
                        Review another draft
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!reviewFeedback && (
                <div className="p-6 border-t border-white/10 bg-navy-800/50 flex justify-end gap-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAIReview}
                    disabled={!reviewText || reviewing}
                    className="px-6 py-2 rounded-lg bg-teal-500 text-navy-900 font-bold text-sm hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {reviewing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {reviewing ? "Analyzing..." : "Analyze Draft"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
