import React, { useState } from "react";
//TO DO, USAR AXIOS PARA CONSEGUIR LOS PRODUCTOS CON UN GET AL BACKEND

const ProductPage = () => {
  // Actualmente incia 1 producto genérico, lo que hay que hacer es que se inicialice haciendo un get al backend.
  const [products, setProducts] = useState([
    { id: 1, name: "Producto 1", imageUrl: "", stock: 10 },
  ]);

  const addProduct = () => {
    setProducts([
      ...products,
      { id: Date.now(), name: "", imageUrl: "", stock: 0 },
    ]);
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const updateProduct = (id: number, field: string, value: string | number) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  return (
    <div className="container">
      <h1>Gestión de Productos</h1>
      <button className="btn btn-primary mb-3" onClick={addProduct}>
        Añadir Producto
      </button>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>URL Imagen</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    updateProduct(product.id, "name", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={product.imageUrl}
                  onChange={(e) =>
                    updateProduct(product.id, "imageUrl", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) =>
                    updateProduct(product.id, "stock", parseInt(e.target.value))
                  }
                />
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteProduct(product.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductPage;
