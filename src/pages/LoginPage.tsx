import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // Importamos el store de autenticación
import axios from "../services/axiosConfig";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated); // Usamos el setter de Zustand

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
        }
      );

      const token = response.data.token;
      sessionStorage.setItem("token", token); // Guardamos el token en sessionStorage
      // Actualizamos el estado global de autenticación
      setAuthenticated(true);
      // Navegamos a la página principal
      navigate("/");
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="container bg-white m-5 px-5 py-4 border border-light rounded w-50">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Usuario
          </label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-dark">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
