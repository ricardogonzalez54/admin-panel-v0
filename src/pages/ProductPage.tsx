import React, { useState, useEffect } from "react";

import SearchBar from "../components/SearchBar";
import ProductTable from "../components/ProductTable";
import PaginationNav from "../components/PaginationNav";

import AddProductModal from "../components/AddProductModal";
import Confirmation from "../components/Confirmation";
import ProductFilter from "../components/ProductFilter";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { Product, HandleProductAction } from "../hooks/useProducts";

import {
  SortableColumn,
  SortDirection,
  SortItem,
} from "../utils/tableSortTypes";

const ProductPage: React.FC = () => {
  const { products, loading, error, deleteProduct, updateProduct, addProduct } =
    useProducts(); //Data y funciones asociadas a los productos desde el hook custom
  const { categories } = useCategories(products); // Con el hook extraemos las diferentes categorías existentes
  const [firstFilteredProdFill, setFirstFilteredProdFill] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false); // Control de estado de AddProductModal
  const [editingProductId, setEditingProductId] = useState<number | null>(null); //Id del producto que se está editando
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Modal de advertencia al agregar, editar o eliminar productos
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

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); //Maneja los productos filtrados por SearchBar
  const [filteredHappened, setFilteredHappened] = useState(false); //Controla si se usó la barra de búsqueda

  // Sorting State que trackea el orden de prioridad de cada columna para ordenar los elementos
  const [sortPriorities, setSortPriorities] = useState<SortItem[]>([
    { key: "category", direction: "asc" }, //Si los elementos tienen la misma category pasan a ordenarse por name
    { key: "name", direction: "asc" },
  ]);

  const getSortedProducts = (productsToSort: Product[]) => {
    return [...productsToSort].sort((a, b) => {
      // Go through each sort priority in order
      for (const { key, direction } of sortPriorities) {
        const aVal = a[key];
        const bVal = b[key];

        let comparison = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        } else {
          comparison = Number(aVal) - Number(bVal);
        }

        if (comparison !== 0) {
          return direction === "asc" ? comparison : -comparison;
        }
      }
      return 0;
    });
  };

  const sortedAndFilteredProducts = getSortedProducts(filteredProducts);
  // handleSort está hecho para manejar múltiples prioridades de columna, y con el click seleccionar la nueva prioridad principal
  const handleSort = (column: SortableColumn) => {
    setSortPriorities((prev) => {
      // Encuentra el índice de la columna en la lista de prioridades
      const columnIndex = prev.findIndex((item) => item.key === column);

      if (columnIndex === 0) {
        // Si ya es el primary sort, solo cambiamos su dirección
        return prev.map((item, index) =>
          index === 0
            ? { ...item, direction: item.direction === "asc" ? "desc" : "asc" }
            : item
        );
      } else {
        // Si no es el primary sort, salvamos la dirección que guardaba previamente la columna
        const existingItem = prev.find((item) => item.key === column);
        const direction = existingItem ? existingItem.direction : "asc";

        // Mover la columna al frente manteniendo el orden del resto y manteniendo la dirección salvada
        const newPriorities = prev.filter((item) => item.key !== column);
        return [{ key: column, direction }, ...newPriorities];
      }
    });
  };

  //
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Productos por página

  const totalPages = Math.ceil(
    (filteredHappened ? filteredProducts.length : products.length) /
      itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedAndFilteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

  //
  // Manejo de edición de un producto, para coordinarlo con la lista filtrada y de paginación
  // Al confirmar la edición la llamamos
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

  //
  // Manejo de eliminación de productos, para coordinarlo con lista filtrada y de paginación
  // Al confirmar la eliminación la llamamos
  const deleteProductField = (id: number) => {
    // Eliminar de filteredProducts
    setFilteredProducts((prev) => prev.filter((product) => product.id !== id));
    deleteProduct(id); // Llamar a la función deleteProduct para eliminar de products globales
  };

  //
  // Solicita confirmación al agregar, editar o eliminar
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
        if (product && updatedProductFields) {
          console.log("En SelectedProduct metemos:", product);
          console.log("En EditedProductFields metemos:", updatedProductFields);
          setSelectedProduct(product);
          setEditedProductFields(updatedProductFields);
        } else {
          console.log("Error al setear el producto a editar");
        }
        break;
      case "Eliminar":
        if (product) {
          setSelectedProduct(product);
        } else {
          console.log("Error al setear el producto a eliminar");
        }
        break;
    }
    if (action && (selectedProduct || newProductToAdd)) {
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
          // Luego, actualizamos filteredProducts con el producto recién agregado
          setFilteredProducts((prev) => [...prev, newProductAddedToBackend]);
        } else {
          console.log("No se pudo agregar ningún producto");
        }
        break;
      case "Editar":
        console.log("Esto es updatedFields", updatedProductFields);
        if (product && updatedProductFields) {
          updateProductField(product.id, updatedProductFields);
        } else {
          console.log("No se pudo editar el producto");
        }
        break;
      case "Eliminar":
        if (product) {
          deleteProductField(product.id);
        } else {
          console.log("No se pudo eliminar el producto");
        }
        break;
    }
    // Finalmente cerramos el modal
    setShowConfirmationModal(false);
  };

  const handleCategorySelect = (category: string) => {
    console.log("Filtrado por:", category);
    setFilteredProducts(products.filter((prod) => prod.category === category));
    setFilteredHappened(true);
  };

  // Cuando lleguen products, actualizamos filteredProducts
  useEffect(() => {
    if (!firstFilteredProdFill && products.length > 0) {
      setFilteredProducts(products);
      console.log(
        "Ejecutando la primera vez para llenar filteredProducts con lo recibido del backend:"
      );
      setFirstFilteredProdFill(true);
    }
  }, [products]);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container my-3">
      <h1>Gestión de Productos</h1>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <SearchBar
          data={products.map((p) => p.name)}
          onSearch={handleSearch}
          onReset={() => {
            setFilteredProducts(products);
            setFilteredHappened(false);
            setCurrentPage(1);
          }}
        />
        <ProductFilter
          headerKey="Categorías"
          dropdownContent={categories}
          onSelect={handleCategorySelect}
        />

        <button
          className="btn btn-primary ml-3"
          onClick={() => setShowAddModal(true)}
        >
          Agregar Producto
        </button>
      </div>
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAddProduct={handleShowConfirmation}
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
      <ProductTable
        products={paginatedProducts}
        onEdit={toggleEdit}
        editingProductId={editingProductId}
        onUpdateOrDeleteProduct={handleShowConfirmation}
        onSort={handleSort}
        sortPriorities={sortPriorities}
      />
      <PaginationNav
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductPage;
