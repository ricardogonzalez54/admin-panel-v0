import React, { useState } from "react";
import { Product } from "../hooks/useProducts";

interface ProductTableProps {
  products: Product[];
  onEdit: (id: number | null) => void;
  onDelete: (id: number) => void;
  editingProductId: number | null;
  onUpdateProduct: (
    id: number,
    updatedFields: Partial<Omit<Product, "id">>
  ) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  editingProductId,
  onUpdateProduct,
}) => {
  const [localEdits, setLocalEdits] = useState<Partial<Product>>({});

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setLocalEdits((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (id: number) => {
    if (Object.keys(localEdits).length > 0) {
      onUpdateProduct(id, localEdits as Partial<Omit<Product, "id">>);
    }
    setLocalEdits({});
    onEdit(null); // Notifica al padre que se ha salido del modo edición
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>URL Imagen</th>
          <th>Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>
              {editingProductId === product.id ? (
                <input
                  type="text"
                  value={localEdits.name ?? product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              ) : (
                product.name
              )}
            </td>
            <td>
              {editingProductId === product.id ? (
                <input
                  type="text"
                  value={localEdits.category ?? product.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                />
              ) : (
                product.category
              )}
            </td>
            <td>
              {editingProductId === product.id ? (
                <input
                  type="text"
                  value={localEdits.imageUrl ?? product.imageUrl}
                  onChange={(e) =>
                    handleInputChange("imageUrl", e.target.value)
                  }
                />
              ) : (
                product.imageUrl || "Sin URL"
              )}
            </td>
            <td>
              {editingProductId === product.id ? (
                <input
                  type="number"
                  value={localEdits.stock ?? product.stock}
                  onChange={(e) =>
                    handleInputChange("stock", parseInt(e.target.value))
                  }
                />
              ) : (
                product.stock
              )}
            </td>
            <td>
              <button
                className="btn btn-primary me-2"
                onClick={() =>
                  editingProductId === product.id
                    ? handleSave(product.id)
                    : onEdit(product.id)
                }
              >
                {editingProductId === product.id ? "Guardar" : "Editar"}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(product.id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
