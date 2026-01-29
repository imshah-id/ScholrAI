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

  // Documents State
  interface UploadedFile {
    id: string;
    name: string;
    date: string;
  }
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGuidance();
    // Load persisted docs from local storage if needed, or just start fresh
  }, []);

  useEffect(() => {
    if (university?.name && tips.length === 0) {
      fetchTips();
    }
  }, [university]);

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
        // Simple parsing: split by newlines, filter empty or short lines
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
        // Could revalidate loosely
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
    // Find current status
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const currentStatus = task.status;
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    // Optimistic update
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      await fetch("/api/guidance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id, status: newStatus }),
      });

      // Update Cache
      const updatedTasks = tasks.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t,
      );
      sessionStorage.setItem(
        "scholrai_guidance_tasks",
        JSON.stringify({
          tasks: updatedTasks,
          university: university,
        }),
      );
    } catch (e) {
      console.error("Failed to update task");
      // Revert on failure
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
    setShowReviewModal(true);
  };

  const handleAIReview = async () => {
    if (!reviewText) return;
    setReviewing(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Please review this draft for the task "${activeTaskTitle}" for ${university?.name}. Analyze its strengths and weaknesses and provide constructive feedback: \n\n${reviewText}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviewFeedback(data.reply);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (documents.length >= 5) {
      showAlert("You can only upload up to 5 documents.", "error");
      return;
    }

    const file = files[0];
    if (file.type !== "application/pdf") {
      showAlert("Only PDF files are allowed.", "error");
      return;
    }

    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      date: new Date().toLocaleDateString(),
    };

    setDocuments([...documents, newDoc]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
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

          {/* Document Vault (Functional UI) */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" /> Document Vault
              </h3>
              <span className="text-xs text-gray-400">
                {documents.length}/5 Files
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Upload Input */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-500 transition-colors cursor-pointer group bg-navy-900/30 h-[100px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">
                    Upload PDF
                  </span>
                </div>
              </div>

              {/* Document List */}
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="glass p-3 rounded-xl border border-white/5 flex items-center gap-3 relative group"
                >
                  <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                    <FileText className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{doc.name}</p>
                    <p className="text-[10px] text-gray-400">{doc.date}</p>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="ml-auto p-1.5 hover:bg-red-500/20 hover:text-red-400 text-gray-500 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Assistant Sidebar */}
          <div className="glass p-6 rounded-2xl border border-white/5 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-tr from-teal-400 to-teal-600 rounded-lg">
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
                  <div className="p-2 bg-gradient-to-tr from-teal-400 to-teal-600 rounded-lg">
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
                  <div className="p-2 bg-gradient-to-tr from-teal-400 to-teal-600 rounded-lg">
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
                {!reviewFeedback ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Paste your draft (Essay, SOP, or Resume text)
                      </label>
                      <textarea
                        className="w-full h-64 bg-navy-800 border border-white/10 rounded-xl p-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                        placeholder="Paste your content here..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-navy-800 border border-white/10 rounded-xl p-4">
                      <h3 className="font-bold text-teal-400 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> AI Feedback
                      </h3>
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                        <ReactMarkdown>{reviewFeedback}</ReactMarkdown>
                      </div>
                    </div>
                    <button
                      onClick={() => setReviewFeedback("")}
                      className="text-sm text-gray-400 hover:text-white underline"
                    >
                      Review another draft
                    </button>
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
