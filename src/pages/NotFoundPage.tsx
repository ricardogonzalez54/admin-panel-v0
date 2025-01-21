import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="container text-center">
      <h1>404 - Ruta no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <Link to="/" className="btn btn-primary">
        Volver a la página principal
      </Link>
    </div>
  );
};

export default NotFoundPage;
