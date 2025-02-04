import React from "react";
import { Product } from "../hooks/useProducts";
import "./AddProductModal.css";

interface AddProductModalProps {
  onClose: () => void;
  onAddProduct: (
    action: "Agregar" | "Editar" | "Eliminar",
    product?: Product,
    productToAdd?: Omit<Product, "id">,
    updatedProductFields?: Partial<Omit<Product, "id">>
  ) => void; // Tipo de la función que muestra el modal de confirmación
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  onClose,
  onAddProduct,
}) => {
  const [formData, setFormData] = React.useState<Omit<Product, "id">>({
    name: "",
    category: "",
    imageUrl: "",
    stock: 0,
    price: 0,
  });

  const [error, setError] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" || name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.category ||
      (!formData.stock && formData.stock !== 0) ||
      !formData.price
    ) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    onAddProduct("Agregar", undefined, formData);
    onClose();
  };

  return (
    <>
      <div className="custom-modal-overlay" onClick={onClose}></div>
      <div className="custom-modal">
        <div className="custom-modal-content">
          <h2>Agregar Producto</h2>
          {error && <p className="error">{error}</p>}

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Nombre (obligatorio)
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="form-control"
              placeholder="Nombre (obligatorio)"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label">
              Categoría (obligatorio)
            </label>
            <input
              type="text"
              name="category"
              id="category"
              className="form-control"
              placeholder="Categoría"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="imageUrl" className="form-label">
              Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              id="imageUrl"
              className="form-control"
              placeholder="Image URL"
              value={formData.imageUrl}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="stock" className="form-label">
              Stock (obligatorio)
            </label>
            <input
              type="number"
              name="stock"
              id="stock"
              className="form-control"
              placeholder="Stock (obligatorio)"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="price" className="form-label">
              Precio (obligatorio)
            </label>
            <input
              type="number"
              name="price"
              id="price"
              className="form-control"
              placeholder="Precio (obligatorio)"
              value={formData.price}
              onChange={handleInputChange}
              min="0.01"
            />
          </div>

          <div className="d-flex justify-content-between">
            <button className="btn btn-primary" onClick={handleSubmit}>
              Confirmar
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProductModal;
