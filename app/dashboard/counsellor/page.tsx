"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  GraduationCap,
  FileText,
  Banknote,
  ShieldCheck,
  History,
  Lock,
  ArrowRight,
  UserCircle,
  Clock,
  Layout,
  MessageSquare,
  ChevronRight,
  Loader2,
  FileEdit,
  X,
  Plus,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAlert } from "@/components/ui/AlertSystem";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

export default function CounsellorPage() {
  const { showAlert } = useAlert();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      window.speechSynthesis.cancel();
      setIsListening(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window)) {
      showAlert("Voice input not supported in this browser.", "error");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => handleSend(), 500); // Auto-send
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content:
        "Hello! I'm your AI Counsellor. I've analyzed your profile. How can I help you refine your university list or applications today?",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  const [showDraftingPanel, setShowDraftingPanel] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [activePersona, setActivePersona] = useState("Supportive Mentor");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const thinkingSteps = [
    "Analyzing your profile data...",
    "Querying university requirements...",
    "Calculating admission probabilities...",
    "Checking scholarship availability...",
    "Synthesizing personalized advice...",
  ];

  // Text-to-Speech Function
  const speakText = (text: string, callback?: () => void) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Select natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.name.includes("Natural")) ||
        voices.find((v) => v.name.includes("Google US English")) ||
        voices.find((v) => v.name.includes("Microsoft Zira")) ||
        voices.find((v) => v.name.includes("Samantha")) ||
        voices.find((v) => v.lang.startsWith("en-"));

      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.pitch = 1.0;
      utterance.rate = 1.1;

      utterance.onend = () => {
        setIsSpeaking(false);
        if (callback) setTimeout(callback, 200);
      };

      utterance.onerror = (e) => {
        console.error("Speech Synthesis Error", e);
        setIsSpeaking(false);
        if (callback) callback();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      if (callback) callback();
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchShortlist();
    fetchSessions();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch("/api/user/me");
    if (res.ok) {
      const data = await res.json();
      setUserProfile(data);
    }
  };

  const fetchShortlist = async () => {
    const res = await fetch("/api/shortlist");
    if (res.ok) {
      const data = await res.json();
      setShortlist(data);
    }
  };

  const fetchSessions = async () => {
    const res = await fetch("/api/chat/sessions");
    if (res.ok) {
      const data = await res.json();
      setSessions(data);
    }
  };

  const loadSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setCurrentSessionId(data.id);
      }
    } catch (e) {
      console.error("Load session error:", e);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteSession = async () => {
    if (!deleteSessionId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: deleteSessionId }),
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== deleteSessionId));
        if (currentSessionId === deleteSessionId) {
          createNewChat();
        }
        showAlert("Chat deleted", "success");
      }
    } catch (e) {
      console.error("Delete session error:", e);
      showAlert("Failed to delete chat", "error");
    } finally {
      setLoading(false);
      setDeleteSessionId(null);
    }
  };

  const confirmClearAllHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });
      if (res.ok) {
        setSessions([]);
        createNewChat();
        showAlert("All chat history cleared", "success");
      }
    } catch (e) {
      console.error("Clear history error:", e);
      showAlert("Failed to clear history", "error");
    } finally {
      setLoading(false);
      setShowClearHistoryConfirm(false);
    }
  };

  // Replace original functions to just set state
  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setDeleteSessionId(sessionId);
  };

  const clearAllHistory = () => {
    setShowClearHistoryConfirm(true);
  };

  const createNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        id: 1,
        role: "ai",
        content:
          "Hello! I'm your AI Counsellor. I've analyzed your profile. How can I help you refine your university list or applications today?",
      },
    ]);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setThinking(true);

    // Simulate thinking steps for "Agentic" feel
    for (const step of thinkingSteps) {
      setThinkingStep(step);
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          messages: history,
          persona: activePersona,
        }),
      });

      if (!res.ok) throw new Error("Failed to connect to AI");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiReply = "";

      // Add a placeholder AI message that we will populate
      const aiMsgId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: "ai", content: "" },
      ]);

      setThinking(false); // Stop thinking spinner once stream starts

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiReply += chunk;

        // Update the last message (the placeholder)
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: aiReply } : m)),
        );
      }

      // Final check for drafting
      if (
        aiReply.toLowerCase().includes("draft") ||
        aiReply.toLowerCase().includes("essay")
      ) {
        setDraftContent(aiReply);
        setShowDraftingPanel(true);
      }

      // Persistent Save
      const updatedMessages: Message[] = [
        ...messages,
        userMsg,
        { id: aiMsgId, role: "ai", content: aiReply },
      ];
      saveChatToDB(updatedMessages);

      // Auto-speak if voice mode is active
      if (voiceModeActive && aiReply) {
        speakText(aiReply);
      }
    } catch (e: any) {
      console.error(e);
      showAlert(e.message || "Chat failed", "error");
    } finally {
      setLoading(false);
      setThinking(false);
      setThinkingStep("");
    }
  };

  const saveChatToDB = async (newMessages: Message[]) => {
    if (!currentSessionId) {
      // Create new session
      const title =
        newMessages.find((m) => m.role === "user")?.content.slice(0, 30) +
          "..." || "New Chat";
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, messages: newMessages }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentSessionId(data.id);
        fetchSessions();
      }
    } else {
      // Update existing session
      await fetch(`/api/chat/sessions/${currentSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 relative">
      {/* 1. Left Sidebar: Personas & History */}
      <div className="hidden lg:flex w-64 flex-col gap-6">
        <div className="glass p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
            Personas
          </h3>
          {[
            { name: "Supportive Mentor", icon: GraduationCap, color: "teal" },
            {
              name: "Strict Admissions Officer",
              icon: ShieldCheck,
              color: "purple",
            },
            { name: "Strategic Strategist", icon: Sparkles, color: "gold" },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => setActivePersona(p.name)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${activePersona === p.name ? "bg-white/10 border border-white/10 text-white" : "text-gray-400 hover:bg-white/5"}`}
            >
              <div
                className={`p-1.5 rounded-lg bg-${p.color}-500/20 text-${p.color}-400`}
              >
                <p.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-left leading-tight">
                {p.name}
              </span>
            </button>
          ))}
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-2 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Recent Chats
            </h3>
            <button
              onClick={createNewChat}
              className="p-1 hover:bg-white/10 rounded-md transition-all text-teal-400"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
            {sessions.length === 0 ? (
              <p className="text-[10px] text-gray-500 text-center py-4">
                No recent chats
              </p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => loadSession(s.id)}
                  className={`group relative w-full p-2.5 rounded-xl text-[11px] text-left flex items-center gap-3 transition-all cursor-pointer ${
                    currentSessionId === s.id
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-gray-400 hover:bg-white/5"
                  }`}
                >
                  <MessageSquare className="w-3 h-3 shrink-0" />
                  <span className="truncate pr-10">{s.title}</span>
                  <button
                    onClick={(e) => deleteSession(e, s.id)}
                    className="absolute right-2 opacity-30 group-hover:opacity-100 p-1 hover:text-red-400 transition-all z-10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
            Quick Tools
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setInput("Evaluate my SOP for Stanford")}
              className="w-full p-2 text-[11px] text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-left flex items-center gap-2"
            >
              <FileEdit className="w-3 h-3" /> SOP Evaluation
            </button>
            <button
              onClick={() => setInput("Find full-ride scholarships")}
              className="w-full p-2 text-[11px] text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-left flex items-center gap-2"
            >
              <Banknote className="w-3 h-3" /> Scholarship Finder
            </button>
            <button
              onClick={() => setInput("Match me with safe unis")}
              className="w-full p-2 text-[11px] text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-left flex items-center gap-2"
            >
              <Layout className="w-3 h-3" /> Safe University Match
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Chat Window */}
      <div
        className={`flex-1 flex flex-col glass rounded-2xl border border-white/5 overflow-hidden relative ${showDraftingPanel ? "hidden xl:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-navy-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold flex items-center gap-2 decoration-teal-500">
                AI Counsellor{" "}
                <span className="text-[10px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded">
                  v2.0
                </span>
              </h2>
              <div className="flex items-center gap-1.5">
                {isSpeaking ? (
                  <>
                    <div className="flex gap-0.5">
                      <div className="w-1 h-2 bg-teal-400 rounded animate-[bounce_0.6s_ease-in-out_infinite]" />
                      <div className="w-1 h-3 bg-teal-400 rounded animate-[bounce_0.6s_ease-in-out_0.1s_infinite]" />
                      <div className="w-1 h-2 bg-teal-400 rounded animate-[bounce_0.6s_ease-in-out_0.2s_infinite]" />
                    </div>
                    <span className="text-[10px] text-teal-400 uppercase tracking-tighter font-medium">
                      Speaking...
                    </span>
                  </>
                ) : voiceModeActive ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[10px] text-teal-400 uppercase tracking-tighter">
                      Voice Mode Active
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                      Acting as {activePersona}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice Mode Toggle */}
            <button
              onClick={() => {
                setVoiceModeActive(!voiceModeActive);
                if (voiceModeActive) {
                  // Turning off - stop any ongoing speech
                  stopSpeaking();
                }
              }}
              className={`p-2 rounded-lg transition-all ${
                voiceModeActive
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title={voiceModeActive ? "Voice Mode: ON" : "Voice Mode: OFF"}
            >
              {voiceModeActive ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Stop Speaking Button (only show when speaking) */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all animate-pulse"
                title="Stop Speaking"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={clearAllHistory}
              className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Stream */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 bg-navy-900/30 custom-scrollbar"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${
                  msg.role === "ai"
                    ? "bg-navy-800 text-teal-400"
                    : "bg-primary text-navy-900 shadow-xl shadow-primary/20"
                }`}
              >
                {msg.role === "ai" ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-5 text-sm leading-relaxed shadow-sm ${
                  msg.role === "ai"
                    ? "glass border border-white/5 text-white"
                    : "bg-primary/95 text-navy-900 font-medium"
                }`}
              >
                {msg.role === "ai" ? (
                  <div className="markdown-prose">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }: any) => (
                          <p className="mb-3 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }: any) => (
                          <ul className="list-disc ml-5 mb-3 space-y-1">
                            {children}
                          </ul>
                        ),
                        li: ({ children }: any) => (
                          <li className="text-gray-300">{children}</li>
                        ),
                        strong: ({ children }: any) => (
                          <strong className="text-white font-bold">
                            {children}
                          </strong>
                        ),
                        a: ({ href, children }: any) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-400 hover:underline"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}

          {/* Thinking State */}
          {thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-4"
            >
              <div className="w-9 h-9 rounded-xl bg-navy-800 border border-white/10 flex items-center justify-center text-teal-400">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="glass border border-teal-500/20 rounded-2xl p-5 w-fit min-w-[200px]">
                <div className="flex items-center gap-3 text-teal-400 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {thinkingStep}
                  </span>
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-teal-500/50 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-teal-500/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-teal-500/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input UI */}
        <div className="p-6 bg-navy-900/50 border-t border-white/10 relative">
          <div className="max-w-3xl mx-auto relative group">
            <input
              type="text"
              placeholder="Ask anything about your university applications..."
              className="w-full bg-navy-800 border border-white/10 rounded-2xl pl-12 pr-24 py-4 text-white focus:ring-2 focus:ring-teal-500/30 outline-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <button
              onClick={toggleListening}
              className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                isListening
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "hover:bg-white/10 text-gray-400 hover:text-white"
              }`}
              title="Voice Input"
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-3 bg-linear-to-tr from-teal-400 to-teal-600 rounded-xl text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-3 uppercase tracking-widest">
            Powered by Gemini 2.0 Agentic Framework
          </p>
        </div>
      </div>

      {/* 3. Right Sidebar: Context Panel */}
      <div
        className={`hidden 2xl:flex w-72 flex-col gap-6 ${showDraftingPanel ? "hidden" : "flex"}`}
      >
        <div className="glass p-5 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Profile Health
            </h3>
            <span className="text-teal-400 text-xs font-bold">
              {userProfile?.profileStrength || 0}%
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <UserCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-200 truncate">
                {userProfile?.fullName || "Student"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span className="text-gray-200">{userProfile?.targetDegree}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-200">{userProfile?.targetIntake}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span className="text-gray-200">GPA: {userProfile?.gpa}</span>
            </div>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-white/5 flex-1 overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Shortlist Context
          </h3>
          <div className="space-y-3 overflow-y-auto custom-scrollbar">
            {shortlist.length > 0 ? (
              shortlist.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${s.isLocked ? "bg-teal-500/10 border-teal-500/30" : "bg-white/5 border-white/5"}`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {s.university.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {s.university.country}
                    </p>
                  </div>
                  {s.isLocked && <Lock className="w-3 h-3 text-teal-400" />}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Plus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-[10px] text-gray-500">Shortlist is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Overlay: Drafting Panel */}
      <AnimatePresence>
        {showDraftingPanel && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-24 right-6 bottom-6 w-full lg:w-2/3 xl:w-1/2 glass rounded-3xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 bg-navy-800/80 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/20 rounded-xl text-primary">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">
                    AI Drafting Assistance
                  </h3>
                  <p className="text-xs text-gray-400">
                    Collaborating with {activePersona}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDraftingPanel(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <textarea
                className="w-full h-full bg-transparent text-gray-200 text-lg leading-relaxed resize-none focus:outline-none placeholder:text-gray-600"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Start typing or let the AI generate a draft..."
              />
            </div>
            <div className="p-6 border-t border-white/10 bg-navy-800/50 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                {draftContent.split(/\s+/).filter((x) => x).length} Words
              </span>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-all">
                  Export PDF
                </button>
                <button
                  onClick={() => setShowDraftingPanel(false)}
                  className="px-6 py-2 bg-primary text-navy-900 rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all"
                >
                  Save to Vault
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirm Deletion Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteSessionId}
        onClose={() => setDeleteSessionId(null)}
        onConfirm={confirmDeleteSession}
        title="Delete Chat Session"
        message="Are you sure you want to delete this chat session? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={loading}
      />

      <ConfirmDialog
        isOpen={showClearHistoryConfirm}
        onClose={() => setShowClearHistoryConfirm(false)}
        onConfirm={confirmClearAllHistory}
        title="Clear All History"
        message="Are you sure you want to verify delete ALL chat history? This will permanently remove all your past conversations."
        confirmText="Clear All"
        variant="danger"
        isLoading={loading}
      />
    </div>
  );
}
