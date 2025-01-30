import { useState, useEffect } from "react";
import axios from "axios";

export interface Product {
  id: number;
  category: string;
  name: string;
  imageUrl: string;
  stock: number;
  price: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    console.log("Se realizó fetchProducts");
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get<Product[]>(
        "http://localhost:5000/api/products",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(response.data);
      console.log("Respuesta del backend:", response.data);
    } catch (err) {
      setError("Error al cargar productos.");
      console.log("Error al cargar productos");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token");
      console.log(`Solicitud para eliminar producto con ID: ${id}`);
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((product) => product.id !== id));
      console.log(`Eliminado exitósamente producto con ID: ${id}`);
    } catch (err) {
      console.error("Error al eliminar producto", err);
      throw err;
    }
  };

  const updateProduct = async (
    id: number,
    updatedFields: Partial<Omit<Product, "id">>
  ): Promise<Product> => {
    try {
      console.log("Editando producto:", { id, updatedFields });

      const token = sessionStorage.getItem("token");
      const response = await axios.put<Product>(
        `http://localhost:5000/api/products/${id}`,
        updatedFields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Respuesta del backend:", response.data);
      const updatedProduct = response.data;
      // Actualización parcial en el estado global
      setProducts(
        (prev) =>
          prev.map((product) =>
            product.id === id ? { ...product, ...updatedProduct } : product
          ) // Si el backend devuelve solo el producto con los campos editados también funciona
      ); // Esto ya que sobreescribe solo los campos de product que updatedProduct tenga diferente
      return updatedProduct;
    } catch (err) {
      console.error("Error al actualizar producto", err);
      throw err;
    }
  };

  const addProduct = async (
    newProduct: Omit<Product, "id">
  ): Promise<Product> => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post<Product>(
        "http://localhost:5000/api/products",
        newProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // La respuesta del backend es el producto si se agregó correctamente
      const addedProduct = response.data;
      // Actualizamos products global
      setProducts((prev) => [...prev, addedProduct]);
      return addedProduct; // Devolvemos el producto recién agregado
    } catch (err) {
      console.error("Error al agregar producto", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    deleteProduct,
    updateProduct,
    addProduct,
  };
};
