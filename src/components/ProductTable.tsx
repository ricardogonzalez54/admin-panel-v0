import React, { useEffect, useState } from "react";
import { Product, HandleProductAction } from "../hooks/useProducts";
import { SortableColumn, SortItem } from "../utils/tableSortTypes";
import { z } from "zod";

interface ProductTableProps {
  products: Product[];
  onEdit: (id: number | null) => void;
  editingProductId: number | null;
  onUpdateOrDeleteProduct: HandleProductAction;
  onSort: (column: SortableColumn) => void;
  sortPriorities: SortItem[];
}

// Esquema de validación con Zod
const productSchema = z.object({
  name: z
    .string()
    .max(55, { message: "El nombre no puede superar los 55 caracteres" }) // Máximo 55 caracteres
    .optional()
    .refine((val) => val === undefined || val === null || val.trim() !== "", {
      message: "El nombre no puede estar vacío",
    }), // Usamos trim para remover los espacios, así no permitimos cadenas de solo espacios vacíos
  category: z
    .string()
    .max(30, { message: "La categoría no puede superar los 30 caracteres" }) // Máximo 30 caracteres
    .optional()
    .refine((val) => val === undefined || val === null || val.trim() !== "", {
      message: "La categoría no puede estar vacía",
    }),
  imageUrl: z.string().optional(),
  stock: z
    .union([
      z.number().int().min(0, "El stock debe ser un entero mayor o igual a 0"),
      z.null(),
    ])
    .optional(),
  price: z
    .union([
      z.number().min(0, "El stock debe ser un número mayor o igual a 0"),
      z.null(),
    ])
    .optional(),
});

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  editingProductId,
  onUpdateOrDeleteProduct,
  onSort,
  sortPriorities,
}) => {
  //
  // Lógica para los edits
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>(
    {}
  );

  const handleInputChange = (field: keyof Product, value: string) => {
    // Si en un campo numérico el usuario ingresa una cadena vacía lo registramos como null (para indicar que no hay info de ese campo)
    if ((field === "stock" || field === "price") && value === "") {
      setFormData((prev) => ({
        ...prev,
        [field]: null,
      }));
      return;
    }
    // En cualquier otro caso se procede como sigue, campos numéricos Number(value), strings como value
    setFormData((prev) => ({
      ...prev,
      [field]: field === "stock" || field === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    id: number
  ) => {
    event.preventDefault();
    setErrors({}); //En cada submit partimos asumiendo que no hay error

    const parsedData = productSchema.safeParse(formData);
    if (!parsedData.success) {
      const errors = parsedData.error.flatten().fieldErrors; // Extrae solo los errores de los campos

      // TypeScript ya sabe que errors es un Record<string, string[] | undefined>, así que accedemos al primer error de cada campo
      const formattedErrors = Object.fromEntries(
        Object.entries(errors).map(([key, value]) => [key, value?.[0]]) // Solo el primer mensaje de error
      );

      setErrors(formattedErrors);
      return;
    }
    setErrors({});
    console.log("No hubo error y vamos a llamar al modal de confirmación");
    onUpdateOrDeleteProduct(
      "Editar",
      products.find((p) => p.id === id),
      undefined,
      formData as Partial<Omit<Product, "id">>
    );
    setFormData({});
    onEdit(null);
  };

  //
  // Lógica mostrar según qué columna se ordenan (sorting)
  const getSortIndicator = (column: SortableColumn) => {
    const sortItem = sortPriorities.find((item) => item.key === column);
    if (!sortItem) return null;

    // Only show arrow, no priority number
    const direction = sortItem.direction === "desc" ? "↑" : "↓"; // Asc va hacia abajo y Desc hacia arriba porque esto es más intuitivo para el usuario

    // If it's the primary sort, show it prominently
    if (sortPriorities[0].key === column) {
      return <span className="ml-1">{direction}</span>;
    }

    // For secondary sorts, either show nothing or a faded arrow
    return <span className="ml-1 text-muted opacity-50">{direction}</span>;
  };

  // // Seguimos el estado del error cada que cambie
  // useEffect(() => {
  //   error && console.error(error);
  // }, [error]);
  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e, products.find((p) => p.id == editingProductId)!.id);
      }}
    >
      <table className="table">
        <thead>
          <tr>
            <th onClick={() => onSort("name")} style={{ cursor: "pointer" }}>
              Nombre {getSortIndicator("name")}
            </th>
            <th
              onClick={() => onSort("category")}
              style={{ cursor: "pointer" }}
            >
              Categoría {getSortIndicator("category")}
            </th>
            <th>URL Imagen</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              {editingProductId === product.id ? (
                <>
                  <td>
                    <input
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      type="text"
                      defaultValue={product.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                    {errors.name && (
                      <p className="text-danger">{errors.name}</p>
                    )}
                  </td>
                  <td>
                    <input
                      className={`form-control ${
                        errors.category ? "is-invalid" : ""
                      }`}
                      type="text"
                      defaultValue={product.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                    />
                    {errors.category && (
                      <p className="text-danger">{errors.category}</p>
                    )}
                  </td>
                  <td>
                    <input
                      className={`form-control ${
                        errors.imageUrl ? "is-invalid" : ""
                      }`}
                      type="text"
                      defaultValue={product.imageUrl}
                      onChange={(e) =>
                        handleInputChange("imageUrl", e.target.value)
                      }
                    />
                    {errors.imageUrl && (
                      <p className="text-danger">{errors.category}</p>
                    )}
                  </td>
                  <td>
                    <input
                      className={`form-control ${
                        errors.stock ? "is-invalid" : ""
                      }`}
                      type="number"
                      defaultValue={product.stock ?? "Sin info"}
                      min={0}
                      onChange={(e) =>
                        handleInputChange("stock", e.target.value)
                      }
                    />
                    {errors.stock && (
                      <p className="text-danger">{errors.stock}</p>
                    )}
                  </td>
                  <td>
                    <input
                      className={`form-control ${
                        errors.price ? "is-invalid" : ""
                      }`}
                      type="number"
                      step="0.01"
                      defaultValue={product.price ?? "Sin info"}
                      min={0}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                    />
                    {errors.price && (
                      <p className="text-danger">{errors.price}</p>
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-column flex-sm-row justify-content-start gap-2">
                      <button className="btn btn-primary" type="submit">
                        Guardar
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => {
                          onEdit(null);
                          setFormData({});
                          setErrors({});
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.imageUrl || "Sin URL"}</td>
                  <td>
                    {product.stock != null ? product.stock : "Sin información"}
                  </td>
                  <td>
                    {product.price != null ? product.price : "Sin información"}
                  </td>

                  <td>
                    <div className="d-flex flex-column flex-sm-row justify-content-start gap-2">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault(); //Evitamos que editar submitee el form por bug de react
                          setFormData({}); //Al cambiar el producto a editar debemos resetear el form y error
                          setErrors({});
                          onEdit(product.id);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault(); // Add this
                          onUpdateOrDeleteProduct("Eliminar", product);
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </form>
  );
};

export default ProductTable;
