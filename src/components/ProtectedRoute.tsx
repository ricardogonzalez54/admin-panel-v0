import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("token"); // Verifica si el token existe

  if (!token) {
    return <Navigate to="/login" replace />; // Redirige al login si no hay token
  }

  return <Outlet />; // Renderiza la página protegida
};

export default ProtectedRoute;
