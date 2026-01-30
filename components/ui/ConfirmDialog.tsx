"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, AlertCircle } from "lucide-react";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: AlertCircle,
      iconColor: "text-red-400",
      iconBg: "bg-red-400/20",
      buttonBg: "bg-red-500 hover:bg-red-600",
      buttonText: "text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-orange-400",
      iconBg: "bg-orange-400/20",
      buttonBg: "bg-orange-500 hover:bg-orange-600",
      buttonText: "text-navy-900",
    },
    primary: {
      icon: AlertCircle,
      iconColor: "text-teal-400",
      iconBg: "bg-teal-400/20",
      buttonBg: "bg-primary hover:opacity-90",
      buttonText: "text-navy-900",
    },
  };

  const currentVariant = variantStyles[variant];
  const Icon = currentVariant.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-navy-900 border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full shrink-0 ${currentVariant.iconBg} ${currentVariant.iconColor}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                // We typically don't close automatically here, letting the parent handle it
                // often to show loading states, but for simple confirms we might.
                // The parent should ideally call onClose after confirm logic is done or set properties.
              }}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 ${currentVariant.buttonBg} ${currentVariant.buttonText}`}
            >
              {isLoading && (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
