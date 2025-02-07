import React, { useEffect, useState, useRef } from "react";
import { Product, HandleProductAction } from "../hooks/useProducts";
import { SortableColumn, SortItem } from "../utils/tableSortTypes";
import { z } from "zod";
import { CloseButton } from "react-bootstrap"; //Más tarde en el desarrollo incorporamos react-bootstrap ;;

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
  imageFile: z.instanceof(File).optional(), // File upload Opcional
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

// Define allowed image types and max file size
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  //
  // Manejo de preview para los image uploads
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFormErrorAndImgPreview = () => {
    setFormData({});
    setErrors({});
    setImagePreview(null);
  };

  const handleInputChange = (field: keyof Product, value: string | File) => {
    // Clear errors for this field when user starts typing/uploading
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    if (field === "stock" || field === "price") {
      //Campos numéricos
      setFormData((prev) => ({
        ...prev,
        [field]: value === "" ? null : Number(value), //Si el usuario los deja vacío guardamos null
      }));
    } else if (field === "imageFile" && value instanceof File) {
      //Campo de imagen
      // Validate image file
      if (!IMAGE_TYPES.includes(value.type)) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "Tipo de imagen no válido. Use JPEG, PNG, GIF o WebP.",
        }));
        return;
      }

      if (value.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "El archivo es demasiado grande. Máximo 5MB.",
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(value);

      setFormData((prev) => ({
        ...prev,
        imageFile: value,
        imageUrl: undefined,
      }));
    } else {
      //Campos de texto
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // handleFileInputChange es para mejorar la UX. Si no se selecciona un file, se mantiene el nombre del file anteriormente seleccionado
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Si un nuevo file es seleccionado
      handleInputChange("imageFile", file);
    } else {
      // Si se canceló la selección, pero teníamos previamente un file seleccionado salvamos el nombre y lo mantenemos en la UI
      if (fileInputRef.current && formData.imageFile) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(formData.imageFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  // Esta es una función auxiliar para comprobar si el form efectivamente realizó algún cambio al producto
  const hasActualChanges = (
    original: Product,
    changes: Partial<Omit<Product, "id">>
  ) => {
    // Get all the keys that exist in the changes object
    const changedKeys = Object.keys(changes) as Array<keyof typeof changes>;

    // If no keys were changed (user didn't interact with any field), return false
    if (changedKeys.length === 0) return false;

    // Check each changed field
    return changedKeys.some((key) => {
      const newValue = changes[key];
      const originalValue = original[key as keyof Product];

      // Special handling for imageFile - if it exists in changes, it's a new file
      if (key === "imageFile" && newValue) return true;

      // For other fields, check if the new value is different
      return newValue !== originalValue;
    });
  };

  //Verificamos que todo esté en regla para pasar a la pantalla de confirmación
  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    id: number
  ) => {
    event.preventDefault();
    setErrors({}); // Clear all errors at start
    console.log(formData);
    // Prepare data for validation
    const dataToValidate = {
      ...formData,
      imageFile:
        formData.imageFile instanceof File ? formData.imageFile : undefined,
    };

    const parsedData = productSchema.safeParse(dataToValidate);
    if (!parsedData.success) {
      const errors = parsedData.error.flatten().fieldErrors;
      const formattedErrors = Object.fromEntries(
        Object.entries(errors).map(([key, value]) => [key, value?.[0]])
      );
      setErrors(formattedErrors);
      return;
    }

    //Chequeamos que realmente se hicieron cambios en el producto
    const productToEdit = products.find((p) => p.id === editingProductId)!;
    if (!hasActualChanges(productToEdit, formData)) {
      console.log(
        "Se intentó guardar una edición en que no se hicieron cambios en el producto"
      );
      clearFormErrorAndImgPreview();
      onEdit(null);
      return;
    }

    onUpdateOrDeleteProduct(
      "Editar",
      productToEdit,
      undefined,
      formData as Partial<Omit<Product, "id">>
    );

    // Reset form state
    setFormData({});
    setImagePreview(null);
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

  const handleRemoveImage = () => {
    setImagePreview("");
    //Damos a formData el valor original de imageUrl, así hasActualChanges puede discernir que realmente no se ha tocado
    setFormData({
      ...formData,
      imageFile: undefined,
      imageUrl: products.find((p) => p.id === editingProductId)!.imageUrl,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e, products.find((p) => p.id == editingProductId)!.id);
      }}
    >
      <table className="table table-striped table-hover">
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
                    <div className="d-flex flex-column gap-2">
                      {/* File input */}
                      <input
                        className={`form-control ${
                          errors.imageFile ? "is-invalid" : ""
                        }`}
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileInputChange}
                      />
                      {/* Current image status */}
                      {product.imageUrl && (
                        <div className="alert alert-warning p-2 mb-2">
                          <small>
                            Este producto ya tiene una imagen. Al subir una
                            nueva, reemplazará la actual.
                            <a
                              href={product.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ms-2"
                            >
                              Ver actual
                            </a>
                          </small>
                        </div>
                      )}
                      {/* Preview */}

                      {imagePreview && (
                        <div className="d-flex align-items-center gap-3">
                          <div className="mt-2">
                            <small className="text-muted me-2">
                              Nueva imagen:
                            </small>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="mt-1 img-thumbnail"
                              style={{ maxWidth: "90px", maxHeight: "90px" }}
                            />
                          </div>
                          <CloseButton
                            onClick={handleRemoveImage}
                            aria-label="Eliminar imagen"
                          />
                        </div>
                      )}

                      {/* Error message */}
                      {errors.imageFile && (
                        <p className="text-danger mb-0">
                          <small>{errors.imageFile}</small>
                        </p>
                      )}
                    </div>
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
                      min={0.01}
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
                          clearFormErrorAndImgPreview(); //Limpiamos los estados al cancelar
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
                  <td>
                    {product.imageUrl ? (
                      <a
                        href={product.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-flex align-items-center text-success text-decoration-none"
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        Ver imagen
                      </a>
                    ) : (
                      <span className="text-danger">
                        <i className="bi bi-x-circle"></i>
                      </span>
                    )}
                  </td>
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
                          clearFormErrorAndImgPreview(); //Limpiamos los estados siempre que se cambie el producto a editar
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
