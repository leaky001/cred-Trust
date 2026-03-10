"use client";

import React from "react";
import { Button } from "./Button";

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmDisabled?: boolean;
}

export function ConfirmModal({
  open,
  title = "Confirm",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  children,
  confirmDisabled = false,
}: Props & { children?: React.ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-surface dark:bg-gray-900 p-6 shadow-elevation-4 border dark:border-gray-800">
        <h3 className="text-h4 mb-2 font-bold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-small text-gray-600 dark:text-gray-400 mb-6">{description}</p>}
        {children}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
