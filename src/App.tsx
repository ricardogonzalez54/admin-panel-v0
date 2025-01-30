import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { PAGES, Page, SubPage } from "./utils/pagesConfig";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

import "core-js/actual/array/flat-map"; //Polyfill para poder usar flatMap, ns pq no funciona

function App() {
  // Función para construir las rutas dinámicamente desde PAGES
  const buildRoutes = (pages: Page[]) => {
    return pages.flatMap((page: Page) => {
      if ("subPages" in page) {
        // Si la página tiene subpáginas, construye rutas para cada subpágina
        return page.subPages.map((subPage: SubPage) => (
          <Route
            key={subPage.path}
            path={subPage.path}
            element={<subPage.component />}
          />
        ));
      } else {
        // Si no tiene subpáginas, construye una única ruta
        return (
          <Route
            key={page.path}
            path={page.path}
            element={<page.component />}
          />
        );
      }
    });
  };

  return (
    <Router>
      <Routes>
        {/* Ruta pública para login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Layout principal con NavMenu */}
        <Route element={<Layout />}>
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            {buildRoutes(PAGES)}

            {/* Página no encontrada solo para usuarios autenticados */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Página no encontrada para usuarios NO autenticados */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
