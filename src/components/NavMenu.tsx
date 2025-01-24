import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // Importa el store

const NavMenu = () => {
  const navigate = useNavigate(); // Hook para redirigir
  const { setAuthenticated } = useAuthStore(); // Usamos el setter para cambiar el estado de autenticación
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Obtenemos el estado global de autenticación

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    sessionStorage.removeItem("token"); // Eliminar el token
    setAuthenticated(false); // Actualizamos el estado global de autenticación
    navigate("/login"); // Redirigir al login
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Admin Panel
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/products" className="nav-link">
                Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/banners" className="nav-link">
                Banners
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/ads" className="nav-link">
                Anuncios
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-danger" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavMenu;
