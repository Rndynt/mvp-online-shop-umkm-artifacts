import { create } from 'zustand';

interface QuickAddStore {
  slug: string | null;
  open: (slug: string) => void;
  close: () => void;
}

export const useQuickAddStore = create<QuickAddStore>()((set) => ({
  slug: null,
  open: (slug) => set({ slug }),
  close: () => set({ slug: null }),
}));
