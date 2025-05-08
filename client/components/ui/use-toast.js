"use client";

import { useEffect, useState } from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map();

export const toastState = {
  toasts: [],
  listeners: new Set(),
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  },
  addToast(toast) {
    const id = genId();
    const newToast = { ...toast, id };
    this.toasts = [newToast, ...this.toasts].slice(0, TOAST_LIMIT);
    this.notify();
    return id;
  },
  dismissToast(toastId) {
    const toast = this.toasts.find((toast) => toast.id === toastId);
    if (!toast) return;

    if (toast.onDismiss) {
      toast.onDismiss();
    }

    this.toasts = this.toasts.map((t) =>
      t.id === toastId ? { ...t, open: false } : t
    );
    this.notify();

    if (toastTimeouts.has(toastId)) {
      clearTimeout(toastTimeouts.get(toastId));
      toastTimeouts.delete(toastId);
    }

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== toastId);
      this.notify();
    }, TOAST_REMOVE_DELAY);
  },
  dismissAll() {
    this.toasts.forEach((toast) => {
      if (toast.onDismiss) {
        toast.onDismiss();
      }
    });

    this.toasts = this.toasts.map((t) => ({ ...t, open: false }));
    this.notify();

    toastTimeouts.forEach((timeout, toastId) => {
      clearTimeout(timeout);
      toastTimeouts.delete(toastId);
    });

    setTimeout(() => {
      this.toasts = [];
      this.notify();
    }, TOAST_REMOVE_DELAY);
  },
};

export function useToast() {
  const [toasts, setToasts] = useState(toastState.toasts);

  useEffect(() => {
    return toastState.subscribe(setToasts);
  }, []);

  return {
    toasts,
    toast: (props) => {
      const id = toastState.addToast({ ...props, open: true });

      if (props.duration) {
        toastTimeouts.set(
          id,
          setTimeout(() => {
            toastState.dismissToast(id);
          }, props.duration)
        );
      }

      return {
        id,
        dismiss: () => toastState.dismissToast(id),
        update: (props) => {
          const toast = toastState.toasts.find((t) => t.id === id);
          if (!toast) return;

          toastState.toasts = toastState.toasts.map((t) =>
            t.id === id ? { ...t, ...props } : t
          );
          toastState.notify();
        },
      };
    },
    dismiss: (toastId) => toastState.dismissToast(toastId),
    dismissAll: () => toastState.dismissAll(),
  };
}
