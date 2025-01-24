import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore"; // Importa el store

import ProductPage from "./pages/ProductPage";
import BannerPage from "./pages/BannerPage";
import AdPage from "./pages/AdPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import NavMenu from "./components/NavMenu";

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Obtenemos el estado global de autenticación

  return (
    <Router>
      {isAuthenticated && <NavMenu />}
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/banners" element={<BannerPage />} />
            <Route path="/ads" element={<AdPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </>
        )}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
