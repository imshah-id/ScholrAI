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
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function GuidancePage() {
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
  const [activeTaskTitle, setActiveTaskTitle] = useState("");

  useEffect(() => {
    fetchGuidance();
  }, []);

  const fetchGuidance = async () => {
    try {
      const res = await fetch("/api/guidance");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
        setUniversity(data.university);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !university && tasks.length === 0) {
      // No locked university found (and api returned empty)
      // Need to check if it was a real "empty" or just loading.
      // Actually, if university is null AFTER loading:
      // Redirect
    }
  }, [loading, university, tasks]);
  // Wait, let's do it inside the fetch or Render.

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

  return (
    <div className="space-y-8">
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

      <div className="grid md:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="md:col-span-2 space-y-4">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              className={`glass p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-colors ${
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
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due: {task.due}
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
                "Make sure your Personal Statement highlights your leadership in
                the Robotics Club. Stanford values initiative."
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

            {/* Removed inline outline display in favor of modal */}
          </div>
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
