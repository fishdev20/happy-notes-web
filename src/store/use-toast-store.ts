import { create } from "zustand";

type ToastVariant = "success" | "error" | "info";

export type AppToast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastStore = {
  toasts: AppToast[];
  pushToast: (toast: Omit<AppToast, "id">) => void;
  removeToast: (id: string) => void;
};

const TOAST_TTL_MS = 3500;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = crypto.randomUUID();
    const nextToast: AppToast = { id, ...toast };
    set((state) => ({ toasts: [...state.toasts, nextToast] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, TOAST_TTL_MS);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
  },
}));

export default useToastStore;
