import { create } from 'zustand';

interface QuickAddStore {
  isOpen: boolean;
  slug: string | null;
  open: (slug: string) => void;
  close: () => void;
}

export const useQuickAddStore = create<QuickAddStore>((set) => ({
  isOpen: false,
  slug: null,
  open: (slug) => set({ isOpen: true, slug }),
  close: () => set({ isOpen: false, slug: null }),
}));
