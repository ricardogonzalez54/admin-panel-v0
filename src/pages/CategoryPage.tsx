import React, { useState, useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import { Product, HandleProductAction } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import AddProductModal from "../components/AddProductModal";
import Confirmation from "../components/Confirmation";
// CategoryPage NO UTILIZADA
const CategoryPage: React.FC = () => {
  const { products, loading, error, fetchProducts, addProduct } = useProducts(); // Hook de productos
  const { categories } = useCategories(products); // Hook de categorías

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // selectedCategory también la usamos para no renderizar ningún producto si aún no se ha seleccionado categoría
  const [filteredProducts, setFilteredProducts] = useState(
    products.filter((product) => product.category === selectedCategory)
  );

  // Manejo de agregar productos
  const [showModal, setShowModal] = useState(false); // Control de estado de AddProductModal
  const [newProductToAdd, setNewProductToAdd] = useState<Omit<Product, "id">>({
    category: "",
    name: "",
    imageUrl: "",
    stock: 0,
    price: 0,
  });
  const [actionType, setActionType] = useState<
    "Agregar" | "Editar" | "Eliminar"
  >("Agregar"); //Default agregar pq no puede ser null
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Modal de advertencia al agregar, editar o eliminar productos
  //
  // Estados para poder consumir Confirmation.tsx (serivirían para gestionar Edición o eliminación en un futuro)
  //
  const [selectedProduct, setSelectedProduct] = useState<Product>({
    id: -54,
    category: "",
    name: "",
    imageUrl: "",
    stock: 0,
    price: 0,
  }); //Default value pq no puede ser null, selectedProduct para eliminar o editar
  const [editedProductFields, setEditedProductFields] = useState<
    Partial<Omit<Product, "id">>
  >({ name: "Default value" }); //Default value de campos a editar
  // Solicita confirmación al agregar
  // Función para abrir el modal de confirmación
  const handleShowConfirmation: HandleProductAction = (
    action: "Agregar" | "Editar" | "Eliminar",
    product?: Product,
    productToAdd?: Omit<Product, "id">,
    updatedProductFields?: Partial<Omit<Product, "id">>
  ) => {
    setActionType(action);
    switch (action) {
      case "Agregar":
        if (productToAdd) {
          setNewProductToAdd(productToAdd);
        } else {
          console.log("No existe un producto a agregar", productToAdd);
        }
        break;
      case "Editar":
        console.log("CategoryPage aún no soporta la edición");
        break;
      case "Eliminar":
        console.log("CategoryPage aún no soporta la eliminación");
        break;
    }
    if (action && newProductToAdd) {
      setShowConfirmationModal(true);
    } else {
      console.log("No se pudo pasar al modal de confirmación");
    }
  };
  // Función que confirma definitivamente y gestiona el agregar, editar o eliminar
  const handleConfirmedAction = async (
    action: "Agregar" | "Editar" | "Eliminar",
    product?: Product,
    newProduct?: Omit<Product, "id">,
    updatedProductFields?: Partial<Omit<Product, "id">>
  ) => {
    console.log(
      "UpdatedFields antes de entrar al switch",
      updatedProductFields
    );
    switch (action) {
      case "Agregar":
        if (newProduct) {
          // Llamamos a la función addProduct para agregar el producto al backend
          const newProductAddedToBackend = await addProduct(newProduct);
          // Luego, actualizamos filteredProducts con el producto recién agregado si es que pertenece a la categoría que estamos viendo
          if (newProductAddedToBackend.category === selectedCategory) {
            setFilteredProducts((prev) => [...prev, newProductAddedToBackend]);
          }
        } else {
          console.log("No se pudo agregar ningún producto");
        }
        break;
      case "Editar":
        console.log("CategoryPage aún no soporta la edición");
        break;
      case "Eliminar":
        console.log("CategoryPage aún no soporta la eliminación");
        break;
    }
    // Finalmente cerramos el modal
    setShowConfirmationModal(false);
  };
  useEffect(() => {
    if (products.length === 0 && !error) {
      fetchProducts(); // Llama a la API si no hay productos cargados
    }
  }, [products, fetchProducts]);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) => product.category === selectedCategory)
    );
  }, [selectedCategory]);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container my-3">
      <h1>{"Selecciona una categoría"}</h1>
      <div className="list-group">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className="list-group-item list-group-item-action"
          >
            {category}
          </button>
        ))}
      </div>
      {filteredProducts.length > 0 ? (
        <div className="container">
          <button
            className="btn btn-primary ml-3"
            onClick={() => setShowModal(true)}
            type="button"
          >
            Agregar Producto
          </button>
          {showModal && (
            <AddProductModal
              onClose={() => setShowModal(false)}
              onAddProduct={handleShowConfirmation} // Old AddProduct Version, ahora debe hacerse un handleShowConfirmationModal
            />
          )}
          {showConfirmationModal && (
            <Confirmation
              action={actionType}
              show={showConfirmationModal}
              product={selectedProduct}
              updatedProductFields={editedProductFields}
              newProduct={newProductToAdd}
              onCancel={() => setShowConfirmationModal(false)}
              onConfirm={handleConfirmedAction}
            />
          )}
          <ul>
            {filteredProducts.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        selectedCategory && <div>No hay productos en esta categoría.</div>
      )}
    </div>
  );
};

export default CategoryPage;
