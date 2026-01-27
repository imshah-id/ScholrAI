"use client";

import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
};

export default function CounsellorPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content:
        "Hello! I'm your AI Counsellor. I've analyzed your profile. How can I help you refine your university list or applications today?",
    },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    const userMsg: Message = {
      id: messages.length + 1,
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
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
          id: messages.length + 2,
          role: "ai",
          content: data.reply,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Fallback error
        const errorMsg: Message = {
          id: messages.length + 2,
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
    <div className="h-[calc(100vh-8rem)] flex flex-col glass rounded-2xl border border-white/5 overflow-hidden">
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
        <button className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Gemini Pro
        </button>
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
                      p: ({ children }: { children: React.ReactNode }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }: { children: React.ReactNode }) => (
                        <ul className="list-disc list-outside ml-4 mb-2 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }: { children: React.ReactNode }) => (
                        <ol className="list-decimal list-outside ml-4 mb-2 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }: { children: React.ReactNode }) => (
                        <li className="text-gray-300">{children}</li>
                      ),
                      h1: ({ children }: { children: React.ReactNode }) => (
                        <h1 className="text-lg font-bold text-white mt-4 mb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }: { children: React.ReactNode }) => (
                        <h2 className="text-base font-bold text-white mt-3 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }: { children: React.ReactNode }) => (
                        <h3 className="text-sm font-bold text-white mt-2 mb-1">
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
                      blockquote: ({
                        children,
                      }: {
                        children: React.ReactNode;
                      }) => (
                        <blockquote className="border-l-4 border-teal-500/50 pl-4 py-1 my-2 italic text-gray-400 bg-teal-500/5 rounded-r-lg">
                          {children}
                        </blockquote>
                      ),
                      a: ({
                        href,
                        children,
                      }: {
                        href?: string;
                        children: React.ReactNode;
                      }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:text-teal-300 hover:underline"
                        >
                          {children}
                        </a>
                      ),
                      table: ({ children }: { children: React.ReactNode }) => (
                        <div className="overflow-x-auto my-3 rounded-lg border border-white/10">
                          <table className="w-full text-left text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }: { children: React.ReactNode }) => (
                        <thead className="bg-white/5 text-gray-200">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }: { children: React.ReactNode }) => (
                        <tbody className="divide-y divide-white/5">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }: { children: React.ReactNode }) => (
                        <tr className="hover:bg-white/5 transition-colors">
                          {children}
                        </tr>
                      ),
                      th: ({ children }: { children: React.ReactNode }) => (
                        <th className="px-4 py-2 font-semibold">{children}</th>
                      ),
                      td: ({ children }: { children: React.ReactNode }) => (
                        <td className="px-4 py-2 text-gray-300">{children}</td>
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
      <div className="p-4 bg-navy-900/50 border-t border-white/10">
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
