"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Admitted to Stanford",
    content:
      "ScholrAI's prediction engine was spot on. It correctly identified Stanford as a 'Reach' but guided me to strengthen my essay.",
    image: "SJ",
    color: "bg-pink-500",
  },
  {
    name: "Rahul Sharma",
    role: "Admitted to TU Munich",
    content:
      "I was overwhelmed by the German application process. The step-by-step guidance after locking TU Munich made it simple.",
    image: "RS",
    color: "bg-blue-500",
  },
  {
    name: "Elena Rodriguez",
    role: "Admitted to U of Toronto",
    content:
      "The scholarship finder found a grant I didn't know existed. It practically paid for my first year!",
    image: "ER",
    color: "bg-teal-500",
  },
  {
    name: "David Kim",
    role: "Admitted to NYU",
    content:
      "The AI counselor improved my Common App essay significantly. It caught nuance issues I missed.",
    image: "DK",
    color: "bg-purple-500",
  },
  {
    name: "Aisha Patel",
    role: "Admitted to LSE",
    content:
      "Tracking deadlines for 5 different UK universities was a nightmare until I started using the centralized dashboard.",
    image: "AP",
    color: "bg-orange-500",
  },
  {
    name: "Michael Chen",
    role: "Admitted to NUS",
    content:
      "The localized insights for Singapore applications gave me a huge competitive edge.",
    image: "MC",
    color: "bg-red-500",
  },
  {
    name: "Priya Gupta",
    role: "Admitted to Melbourne U",
    content:
      "Drafting the SOP was the hardest part. The AI suggestions were incredibly specific and helpful.",
    image: "PG",
    color: "bg-indigo-500",
  },
  {
    name: "James Wilson",
    role: "Admitted to ETH Zurich",
    content:
      "Knowing my exact acceptance probability helped me manage my expectations and apply strategically.",
    image: "JW",
    color: "bg-green-500",
  },
];

const TestimonialCard = ({ t }: { t: (typeof TESTIMONIALS)[0] }) => (
  <div className="w-[350px] shrink-0 glass p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all mx-4 group select-none">
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
      ))}
    </div>
    <p className="text-gray-300 mb-6 text-sm leading-relaxed italic line-clamp-3">
      "{t.content}"
    </p>
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-white text-sm shrink-0`}
      >
        {t.image}
      </div>
      <div>
        <div className="font-bold text-white text-sm">{t.name}</div>
        <div className="text-xs text-teal-400 font-medium">{t.role}</div>
      </div>
    </div>
  </div>
);

export function Testimonials() {
  return (
    <section className="py-24 bg-navy-950/50 relative overflow-hidden">
      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-navy-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-navy-900 to-transparent z-10 pointer-events-none" />

      <div className="container mx-auto px-6 mb-12 text-center relative z-10">
        <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
          Loved by ambitious students
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Join thousands of students who found their dream university with
          ScholrAI.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Row 1: Left Scroll */}
        <div className="flex overflow-hidden relative w-full">
          <motion.div
            className="flex"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            style={{ width: "fit-content" }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`row1-${i}`} t={t} />
            ))}
          </motion.div>
        </div>

        {/* Row 2: Right Scroll */}
        <div className="flex overflow-hidden relative w-full">
          <motion.div
            className="flex"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 45, ease: "linear", repeat: Infinity }}
            style={{ width: "fit-content" }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`row2-${i}`} t={t} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
