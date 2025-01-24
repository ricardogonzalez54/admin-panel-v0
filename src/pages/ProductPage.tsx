import React, { useState, useEffect } from "react";

import SearchBar from "../components/SearchBar";
import ProductTable from "../components/ProductTable";
import Pagination from "../components/PaginationNav";

import AddProductModal from "../components/AddProductModal";
import { useProducts } from "../hooks/useProducts";
import { Product } from "../hooks/useProducts";

const ProductPage: React.FC = () => {
  const { products, loading, error, deleteProduct, updateProduct, addProduct } =
    useProducts(); //Data y funciones asociadas a los productos desde el hook custom
  const [showModal, setShowModal] = useState(false); // Control de estado de AddProductModal

  const [editingProductId, setEditingProductId] = useState<number | null>(null); //Id del producto que se está editando
  const [filteredProducts, setFilteredProducts] = useState(products); //Maneja los productos filtrados por SearchBar
  const [filteredHappened, setFilteredHappened] = useState(false); //Controla si se usó la barra de búsqueda

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Productos por página

  const totalPages = Math.ceil(
    (filteredHappened ? filteredProducts.length : products.length) /
      itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = (
    filteredHappened ? filteredProducts : products
  ).slice(startIndex, startIndex + itemsPerPage);

  // Búsqueda por barra de navegación o cuando se clica en sugerencias
  const handleSearch = (query: string) => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      )
    );
    setFilteredHappened(true);
    setCurrentPage(1); // Reiniciar a la primera página
  };

  // Cambio de página
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Gestión de qué producto se está editando
  const toggleEdit = (id: number | null) => {
    if (editingProductId === id) {
      setEditingProductId(null);
    } else {
      setEditingProductId(id);
    }
  };

  // Manejo de edición de un producto, para coordinarlo con la lista filtrada y de paginación
  const updateProductField = (
    id: number,
    updatedFields: Partial<Omit<Product, "id">>
  ) => {
    // Actualiza la lista filtrada de productos
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, ...updatedFields } : product
      )
    );

    // Llama a `updateProduct` con el nuevo formato
    updateProduct(id, updatedFields); // Pasa el campo y valor como un objeto
  };

  // Manejo de eliminación de productos, para coordinarlo con lista filtrada y de paginación
  const deleteProductField = (id: number) => {
    // Eliminar de filteredProducts
    setFilteredProducts((prev) => prev.filter((product) => product.id !== id));
    deleteProduct(id); // Llamar a la función deleteProduct para eliminar de products globales
  };

  // Manejo de agregar productos
  const handleAddProduct = async (product: Omit<Product, "id">) => {
    // Llamamos a la función addProduct para agregar el producto al backend
    const newProduct = await addProduct(product);
    // Luego, actualizamos filteredProducts con el producto recién agregado
    setFilteredProducts((prev) => [...prev, newProduct]);
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container">
      <h1>Gestión de Productos</h1>
      <div className="d-flex justify-content-between align-items-center">
        <SearchBar
          data={products.map((p) => p.name)}
          onSearch={handleSearch}
          onReset={() => {
            setFilteredProducts(products);
            setFilteredHappened(false);
            setCurrentPage(1);
          }}
        />
        <button
          className="btn btn-primary ml-3"
          onClick={() => setShowModal(true)}
        >
          Agregar Producto
        </button>
      </div>
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAddProduct={handleAddProduct}
        />
      )}
      <ProductTable
        products={paginatedProducts}
        onEdit={toggleEdit}
        onDelete={deleteProductField}
        editingProductId={editingProductId}
        onUpdateProduct={updateProductField}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductPage;
