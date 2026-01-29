"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAlert } from "@/components/ui/AlertSystem";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

export default function CounsellorPage() {
  const { showAlert } = useAlert();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Load initial state from localStorage if available
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("scholrai_chat_history");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse chat history");
        }
      }
    }
    return [
      {
        id: 1,
        role: "ai",
        content:
          "Hello! I'm your AI Counsellor. I've analyzed your profile. How can I help you refine your university list or applications today?",
      },
    ];
  });

  // Persist messages whenever they change
  useEffect(() => {
    localStorage.setItem("scholrai_chat_history", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    const userMsg: Message = {
      id: Date.now(), // Use timestamp for unique ID
      role: "user",
      content: userText,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Prepare history for API (excluding the last user message which is sent as 'message')
      // Note: We're sending a simplified context for now.
      // In a real app we might trim history to save tokens.
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          messages: history, // Context
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: Date.now() + 1,
          role: "ai",
          content: data.reply,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Fallback error
        const errorMsg: Message = {
          id: Date.now() + 1,
          role: "ai",
          content:
            "I'm having trouble connecting to the server. Please try again.",
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] flex flex-col glass rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-navy-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold">AI Counsellor</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Clear chat history?")) {
                setMessages([
                  {
                    id: 1,
                    role: "ai",
                    content:
                      "Hello! I'm your AI Counsellor. I've analyzed your profile. How can I help you refine your university list or applications today?",
                  },
                ]);
                localStorage.removeItem("scholrai_chat_history");
              }
            }}
            className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Gemini Pro
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-navy-900/30"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "ai"
                  ? "bg-teal-500/20 text-teal-400"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {msg.role === "ai" ? (
                <Bot className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === "ai"
                  ? "bg-navy-800 border border-white/5 text-gray-200 rounded-tl-none"
                  : "bg-primary text-navy-900 font-medium rounded-tr-none shadow-lg shadow-primary/10 whitespace-pre-wrap"
              }`}
            >
              {msg.role === "ai" ? (
                <div className="markdown-prose text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }: any) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }: any) => (
                        <ul className="list-disc list-outside ml-4 mb-2 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }: any) => (
                        <ol className="list-decimal list-outside ml-4 mb-2 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }: any) => (
                        <li className="text-gray-300">{children}</li>
                      ),
                      h1: ({ children }: any) => (
                        <h1 className="text-xl font-bold text-white mt-4 mb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }: any) => (
                        <h2 className="text-lg font-bold text-white mt-3 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }: any) => (
                        <h3 className="text-base font-bold text-white mt-2 mb-1">
                          {children}
                        </h3>
                      ),
                      code: ({ className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const isInline =
                          !match && !String(children).includes("\n");
                        return isInline ? (
                          <code
                            className="bg-black/30 rounded px-1.5 py-0.5 text-xs font-mono text-teal-300"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code
                            className="block bg-black/30 p-3 rounded-lg overflow-x-auto text-xs font-mono text-teal-300 my-2"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      blockquote: ({ children }: any) => (
                        <blockquote className="border-l-4 border-teal-500/50 pl-4 py-1 my-2 italic text-gray-400 bg-teal-500/5 rounded-r-lg">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }: any) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:text-teal-300 hover:underline"
                        >
                          {children}
                        </a>
                      ),
                      table: ({ children }: any) => (
                        <div className="overflow-x-auto my-3 rounded-lg border border-white/10">
                          <table className="w-full text-left text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }: any) => (
                        <thead className="bg-white/5 text-gray-200">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }: any) => (
                        <tbody className="divide-y divide-white/5">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }: any) => (
                        <tr className="hover:bg-white/5 transition-colors">
                          {children}
                        </tr>
                      ),
                      th: ({ children }: any) => (
                        <th className="px-4 py-2 font-semibold">{children}</th>
                      ),
                      td: ({ children }: any) => (
                        <td className="px-4 py-2 text-gray-300">{children}</td>
                      ),
                    }}
                  >
                    {msg.content.replace(/\[SHORTLIST: (.*?)\]/g, "")}
                  </ReactMarkdown>

                  {/* Action Buttons extracted from content */}
                  {(() => {
                    const regex = /\[SHORTLIST: (.*?)\]/g;
                    const matches = [...msg.content.matchAll(regex)];
                    if (matches.length > 0) {
                      return (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {matches.map((match, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                // Quick fetch to shortlist
                                fetch("/api/shortlist", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    universityId: "PLACEHOLDER_ID", // Logic gap: AI doesn't know ID.
                                    // Fix: We need an API that accepts NAME or matches it.
                                    // For MVP, we'll try to find by name in the backend or just alert.
                                    name: match[1],
                                  }),
                                }).then((res) => {
                                  if (res.ok)
                                    showAlert(
                                      `Shortlisted ${match[1]}!`,
                                      "success",
                                    );
                                  else
                                    showAlert(
                                      "Could not find university details.",
                                      "error",
                                    );
                                });
                              }}
                              className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold px-3 py-2 rounded-lg border border-teal-500/30 flex items-center gap-2 transition-colors"
                            >
                              <Sparkles className="w-3 h-3" /> Shortlist{" "}
                              {match[1]}
                            </button>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                msg.content
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-navy-800 border border-white/5 text-gray-200 rounded-2xl rounded-tl-none p-4 text-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-navy-900/50 border-t border-white/10 space-y-3">
        {/* Suggested Prompts - Only show if no user messages yet */}
        {!messages.some((m) => m.role === "user") && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-1">
            {[
              {
                label: "Analyze my profile",
                icon: ShieldCheck,
                text: "Analyze my profile strength and suggest improvements",
              },
              {
                label: "Safe Universities",
                icon: GraduationCap,
                text: "Suggest safe universities based on my GPA",
              },
              {
                label: "Scholarships",
                icon: Banknote,
                text: "What scholarship options are available for me?",
              },
              {
                label: "Draft SOP",
                icon: FileText,
                text: "Help me draft a Statement of Purpose for Computer Science",
              },
            ].map((prompt, i) => (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={prompt.label}
                onClick={() => {
                  setInput(prompt.text);
                  // Optional: auto-send could be implemented here
                }}
                className="flex flex-col gap-2 items-start bg-navy-800/80 hover:bg-navy-700 hover:scale-105 active:scale-95 border border-white/10 hover:border-teal-500/30 p-3 rounded-xl transition-all w-full group text-left"
              >
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 group-hover:text-teal-300 transition-colors">
                  <prompt.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-200 group-hover:text-white block">
                    {prompt.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            placeholder="Ask about universities, scholarships, or essays..."
            className="w-full bg-navy-800 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-white focus:ring-2 focus:ring-teal-500/50 outline-none placeholder:text-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-tr from-teal-400 to-teal-600 rounded-lg text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
