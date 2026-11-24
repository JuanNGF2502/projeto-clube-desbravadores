import { create } from 'zustand';
import type { TabDirection } from '@/utils/tabs';

interface TabTransition {
  direction: TabDirection;
  timestamp: number;
}

interface NavigationState {
  tabTransition: TabTransition | null;
  setTabTransition: (direction: TabDirection) => void;
  clearTabTransition: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  tabTransition: null,

  setTabTransition: (direction) =>
    set({ tabTransition: { direction, timestamp: Date.now() } }),

  clearTabTransition: () => set({ tabTransition: null }),
}));

/**
 * Retorna a direção da última troca de aba apenas se ela for recente.
 * Evita animar a entrada de uma tela após recarregamentos ou navegações antigas.
 */
export function getFreshTabDirection(maxAgeMs = 1000): TabDirection | null {
  const transition = useNavigationStore.getState().tabTransition;
  if (!transition) return null;
  if (Date.now() - transition.timestamp > maxAgeMs) return null;
  return transition.direction;
}
