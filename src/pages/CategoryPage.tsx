import React, { useState, useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";

const CategoryPage: React.FC = () => {
  const { products, loading, error, fetchProducts } = useProducts(); // Hook de productos
  const { categories } = useCategories(products); // Hook de categorías

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts(); // Llama a la API si no hay productos cargados
    }
  }, [products, fetchProducts]);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{selectedCategory || "Selecciona una categoría"}</h1>
      <div>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              marginRight: "10px",
              backgroundColor: selectedCategory === category ? "lightblue" : "",
            }}
          >
            {category}
          </button>
        ))}
      </div>
      {filteredProducts.length > 0 ? (
        <ul>
          {filteredProducts.map((product) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      ) : (
        <div>No hay productos en esta categoría.</div>
      )}
    </div>
  );
};

export default CategoryPage;
