import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  orden?: number;
  created_at?: string;
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await apiService.obtenerCategorias();
      if (error) throw error;
      return (data || []) as Categoria[];
    },
    staleTime: 1000 * 60 * 60
  });
}
