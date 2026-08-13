"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              animate-slide-in rounded-xl px-5 py-3.5 text-sm font-medium text-white shadow-2xl
              backdrop-blur-sm transition-all duration-300
              ${toast.type === "success" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : ""}
              ${toast.type === "error" ? "bg-gradient-to-r from-rose-500 to-red-500" : ""}
              ${toast.type === "info" ? "bg-gradient-to-r from-sky-500 to-blue-500" : ""}
            `}
            style={{ minWidth: "280px" }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">
                {toast.type === "success" && "✓"}
                {toast.type === "error" && "✕"}
                {toast.type === "info" && "ℹ"}
              </span>
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
