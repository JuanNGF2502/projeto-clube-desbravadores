import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Clube {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

interface AppState {
  ClubeAtual: Clube | null;
  setClubeAtual: (clube: Clube | null) => void;
  initClubePadrao: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ClubeAtual: null,

      setClubeAtual: (clube) => set({ ClubeAtual:clube }),

      initClubePadrao: () => {
        const current = get().ClubeAtual;
        if (!current) {
          set({
            ClubeAtual: {
              id: '00000000-0000-0000-0000-000000000001',
              nome: 'Clube Central',
              cidade: 'Sao Paulo',
              estado: 'SP',
            },
          });
        }
      },
    }),
    {
      name: 'app-storage',
    }
  )
);