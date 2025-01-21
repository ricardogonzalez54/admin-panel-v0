import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  setAuthenticated: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!sessionStorage.getItem("token"), // Revisar si el token existe en sessionStorage al cargar
  setAuthenticated: (status) => set({ isAuthenticated: status }),
}));
