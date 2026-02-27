"use client";

import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export function Toast({ message, type = "info", onClose }: { message: string; type?: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-gray-800";

  return (
    <div className={`fixed right-4 bottom-6 z-50 rounded-md px-4 py-2 text-white ${bg}`}>
      <div className="text-small">{message}</div>
    </div>
  );
}

export default Toast;
