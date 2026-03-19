// src/hooks/useProductos.ts

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

export function useProductos(categoriaId?: string) {
  return useQuery({
    queryKey: ['productos', categoriaId],
    queryFn: async () => {
      const { data, error } = await apiService.obtenerProductos(categoriaId);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5
  });
}

// src/hooks/useCategorias.ts

 

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await apiService.obtenerCategorias();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60
  });
}

// src/hooks/useMesas.ts

 

export function useMesas() {
  return useQuery({
    queryKey: ['mesas'],
    queryFn: async () => {
      const { data, error } = await apiService.obtenerMesas();
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000
  });
}

// src/hooks/usePedidos.ts

 
export function usePedidosMesa(mesaId: string) {
  return useQuery({
    queryKey: ['pedidos', mesaId],
    queryFn: async () => {
      const { data, error } = await apiService.obtenerPedidosMesa(mesaId);
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000
  });
}
