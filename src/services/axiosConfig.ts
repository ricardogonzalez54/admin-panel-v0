// axiosConfig.ts
import axios from "axios";

// Configura la cabecera de Authorization para cada solicitud
const token = sessionStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default axios;
