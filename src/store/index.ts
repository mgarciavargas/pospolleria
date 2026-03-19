// src/store/authStore.ts

import { create } from 'zustand';
import { Usuario } from '@/types/models';

interface AuthStore {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  setAuth: (usuario: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  usuario: null,
  isAuthenticated: false,

  setAuth: (usuario) => {
    set({ usuario, isAuthenticated: true });
  },

  logout: () => {
    set({ usuario: null, isAuthenticated: false });
  }
}));

// src/store/comandaStore.ts

 
import { ItemCarrito } from '@/types/models';

interface ComandaStore {
  carrito: ItemCarrito[];
  agregarAlCarrito: (item: ItemCarrito) => void;
  eliminarDelCarrito: (id: string) => void;
  limpiarCarrito: () => void;
  total: () => number;
}

export const useComandaStore = create<ComandaStore>((set, get) => ({
  carrito: [],

  agregarAlCarrito: (item) => {
    set(state => ({
      carrito: [...state.carrito, item]
    }));
  },

  eliminarDelCarrito: (id) => {
    set(state => ({
      carrito: state.carrito.filter(item => item.id !== id)
    }));
  },

  limpiarCarrito: () => {
    set({ carrito: [] });
  },

  total: () => {
    return get().carrito.reduce((sum, item) => sum + item.subtotal, 0);
  }
}));
