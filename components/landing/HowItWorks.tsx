"use client";

import { motion } from "framer-motion";
import { UserCircle, Search, Lock, FileCheck } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Build Your Profile",
    description: "Tell AI Counsellor about your academics, budget, and goals.",
    icon: <UserCircle className="w-6 h-6" />,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Interact & Explore",
    description:
      "Get AI-driven university recommendations and tailored advice.",
    icon: <Search className="w-6 h-6" />,
    color: "bg-purple-500",
  },
  {
    id: 3,
    title: "Lock Your Target",
    description:
      "Commit to a university to unlock specific application guidance.",
    icon: <Lock className="w-6 h-6" />,
    color: "bg-teal-500",
  },
  {
    id: 4,
    title: "Execute & Apply",
    description:
      "Follow the AI-generated checklist to submit your perfect application.",
    icon: <FileCheck className="w-6 h-6" />,
    color: "bg-green-500",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-navy-900 relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Journey to Admission
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From confusion to clarity in four simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col items-center text-center bg-navy-800/40">
                  {/* Step Number Badge */}
                  <div
                    className={`w-12 h-12 rounded-full ${step.color} shadow-lg shadow-${step.color}/20 flex items-center justify-center text-white mb-4 relative z-10`}
                  >
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connector Dot */}
                  <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-4 w-2 h-2 rounded-full bg-white/10" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
