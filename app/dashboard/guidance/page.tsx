"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, FileText, Upload, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

export default function GuidancePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const toggleTask = async (id: string, currentStatus: string) => {
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
                <button className="bg-teal-500/10 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-teal-500/20 hover:bg-teal-500/20">
                  AI Review
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

            <button className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-bold border border-white/10 transition-colors">
              Generate Essay Outline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
