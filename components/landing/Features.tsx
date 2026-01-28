"use client";

import { motion } from "framer-motion";
import { Brain, FileText, Globe, Zap } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Predictive Modeling Engine",
      description:
        "Utilizes advanced machine learning to forecast university acceptance probabilities based on your unique profile.",
      icon: <Brain className="w-8 h-8 text-primary" />,
      delay: 0,
    },
    {
      title: "Strategic Essay Analysis",
      description:
        "AI-driven feedback on your personal statements to enhance clarity, impact, and authenticity.",
      icon: <FileText className="w-8 h-8 text-teal-400" />,
      delay: 0.1,
    },
    {
      title: "Global Scholarship Finder",
      description:
        "Intelligent matching system to identify relevant scholarship opportunities worldwide.",
      icon: <Globe className="w-8 h-8 text-blue-400" />,
      delay: 0.2,
    },
    {
      title: "Real-time Readiness Score",
      description:
        "Dynamic profile scoring that updates as you complete tasks and improve your resume.",
      icon: <Zap className="w-8 h-8 text-orange-400" />,
      delay: 0.3,
    },
  ];

  return (
    <section id="features" className="py-24 relative bg-background">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Our Core AI Features
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-teal-400 rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              className="glass p-8 rounded-2xl hover:bg-secondary/50 transition-colors group cursor-default border border-border hover:border-primary/20 dark:hover:bg-white/5 dark:border-white/5"
            >
              <div className="mb-6 p-4 bg-secondary/50 dark:bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
