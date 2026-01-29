"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

type AlertType = "success" | "error" | "info";

interface Alert {
  id: string;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = (message: string, type: AlertType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss
    setTimeout(() => {
      removeAlert(id);
    }, 4000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-3 pointer-events-none p-4">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              layout
              className="pointer-events-auto"
            >
              <div
                className={`
                  relative overflow-hidden
                  min-w-[300px] max-w-md
                  backdrop-blur-xl
                  border
                  rounded-2xl
                  shadow-2xl
                  p-4
                  flex items-start gap-4
                  ${
                    alert.type === "success"
                      ? "bg-green-500/10 border-green-500/20 shadow-green-500/10"
                      : alert.type === "error"
                        ? "bg-red-500/10 border-red-500/20 shadow-red-500/10"
                        : "bg-blue-500/10 border-blue-500/20 shadow-blue-500/10"
                  }
                `}
              >
                {/* Decorative Glow */}
                <div
                  className={`absolute -top-10 -right-10 w-20 h-20 rounded-full blur-2xl opacity-30 
                    ${
                      alert.type === "success"
                        ? "bg-green-500"
                        : alert.type === "error"
                          ? "bg-red-500"
                          : "bg-blue-500"
                    }
                  `}
                />

                <div
                  className={`
                    p-2 rounded-full shrink-0
                    ${
                      alert.type === "success"
                        ? "bg-green-500/20 text-green-400"
                        : alert.type === "error"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-500/20 text-blue-400"
                    }
                  `}
                >
                  {alert.type === "success" && (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {alert.type === "error" && (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {alert.type === "info" && <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1 pt-0.5">
                  <h4
                    className={`font-bold text-sm mb-0.5
                      ${
                        alert.type === "success"
                          ? "text-green-400"
                          : alert.type === "error"
                            ? "text-red-400"
                            : "text-blue-400"
                      }
                    `}
                  >
                    {alert.type === "success"
                      ? "Success"
                      : alert.type === "error"
                        ? "Error"
                        : "Info"}
                  </h4>
                  <p className="text-sm text-gray-300 font-medium leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-1 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
};
