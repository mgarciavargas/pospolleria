// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { LoginPin } from '@/components/Auth/LoginPin';
import { MesasGrid } from '@/components/Salon/MesasGrid';
import { TomaPedido } from '@/components/Comanda/TomaPedido';
import { DashboardAdmin } from '@/components/Admin/DashboardAdmin';
import { useAuthStore } from '@/store/index';
import { VerCuenta } from '@/components/Comanda/VerCuenta';
import { ConfiguradorImpresora } from '@/components/Admin/ConfiguradorImpresora';
import { TomaPedidoDelivery } from '@/components/Comanda/TomaPedidoDelivery';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  }
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const usuario = useAuthStore(state => state.usuario);
  const isAdmin = usuario?.rol === 'ADMIN' || usuario?.rol === 'GERENTE';
  return isAdmin ? <>{children}</> : <Navigate to="/salon" />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPin />} />
          
          <Route
            path="/salon"
            element={
              <PrivateRoute>
                <MesasGrid />
              </PrivateRoute>
            }
          />

          <Route
            path="/comanda/:mesaId"
            element={
              <PrivateRoute>
                <TomaPedido />
              </PrivateRoute>
            }
          />

          <Route
            path="/comanda-delivery"
            element={
              <PrivateRoute>
                <TomaPedidoDelivery />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <DashboardAdmin />
                </AdminRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/cuenta/:mesaId"
            element={
              <PrivateRoute>
                <VerCuenta />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/impresora"
            element={
              <PrivateRoute>
                <ConfiguradorImpresora />
              </PrivateRoute>
            }
          />
 

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
