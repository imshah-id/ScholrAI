"use client";

import { NavBar } from "@/components/landing/NavBar";
import { motion } from "framer-motion";
import { Lightbulb, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white overflow-hidden selection:bg-teal-500/30">
      <NavBar />

      <section className="pt-32 pb-20 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[128px]" />
        </div>

        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Democratizing Global <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-primary">
                Education Access
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              ScholrAI was born from a simple belief: ambitious students
              shouldn't be held back by lack of guidance. We leverage advanced
              AI to level the playing field, providing Ivy League-level
              counseling to everyone, everywhere.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              {
                icon: Target,
                title: "Our Mission",
                desc: "To empower 10 million students to find their best-fit university and secure funding by 2030.",
              },
              {
                icon: Lightbulb,
                title: "Our Technology",
                desc: "Proprietary AI models trained on millions of successful applications, essays, and admission trends.",
              },
              {
                icon: Users,
                title: "Our Community",
                desc: "A global network of aspiring scholars supporting each other through the complex admissions journey.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>© 2026 ScholrAI. All rights reserved.</p>
      </footer>
    </main>
  );
}
