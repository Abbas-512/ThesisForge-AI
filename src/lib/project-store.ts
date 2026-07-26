import { useSyncExternalStore } from "react";

export type ProjectInput = {
  title: string;
  domain: string;
  idea: string;
  constraints: string;
};

let current: ProjectInput | null = null;
const listeners = new Set<() => void>();

export const projectStore = {
  get: () => current,
  set: (p: ProjectInput | null) => {
    current = p;
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useProject() {
  return useSyncExternalStore(projectStore.subscribe, projectStore.get, () => null);
}
