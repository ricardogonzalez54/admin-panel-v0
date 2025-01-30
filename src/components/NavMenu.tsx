import { Link, useNavigate } from "react-router-dom";
import { Page } from "../utils/pagesConfig";

interface NavMenuProps {
  pages: Page[];
}

// Type Guard para detectar si la página tiene subPages
const isPageWithSubPages = (
  page: Page
): page is Extract<Page, { subPages: any }> => !!(page as any).subPages;

const NavMenu: React.FC<NavMenuProps> = ({ pages }) => {
  // Usamos el hook useNavigate para realizar la navegación de vuelta al login
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
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
          <ul className="navbar-nav me-auto">
            {pages.map((page, index) => (
              <li
                className={`nav-item ${
                  isPageWithSubPages(page) ? "dropdown" : ""
                }`}
                key={index}
              >
                {isPageWithSubPages(page) ? (
                  <>
                    <button
                      className="nav-link dropdown-toggle btn btn-link"
                      id={`dropdown-${index}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {page.name}
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby={`dropdown-${index}`}
                    >
                      {page.subPages.map((subPage, subIndex) => (
                        <li key={subIndex}>
                          <Link to={subPage.path} className="dropdown-item">
                            {subPage.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link to={page.path!} className="nav-link">
                    {page.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavMenu;
