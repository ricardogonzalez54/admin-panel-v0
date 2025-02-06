import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Button, CloseButton, Alert } from "react-bootstrap";
import { z } from "zod";
import { Product, HandleProductAction } from "../hooks/useProducts";

const ProductSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nombre es requerido" })
    .max(55, { message: "El nombre no puede superar los 55 caracteres" }), // Máximo 55 caracteres,
  category: z
    .string()
    .min(1, { message: "Categoría es requerida" })
    .max(30, { message: "La categoría no puede superar los 30 caracteres" }),
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

interface AddProductModalProps {
  show: boolean;
  onClose: () => void;
  onAddProduct: HandleProductAction;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  show,
  onClose,
  onAddProduct,
}) => {
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    category: "",
    imageUrl: "",
    stock: 0,
    price: 0.01,
  });

  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cuando imageFile cambia, actualizar la previsualización
    if (imageFile) {
      const newPreview = URL.createObjectURL(imageFile);
      setImagePreview(newPreview);

      // Limpiar URL cuando el componente se desmonte o imageFile cambie
      return () => URL.revokeObjectURL(newPreview);
    }
  }, [imageFile]);

  const clearFormErrorAndImgPreview = () => {
    setFormData({
      name: "",
      category: "",
      imageUrl: "",
      stock: 0,
      price: 0.01,
    }); //Reset
    setErrors([]);
    setImageFile(undefined);
    setImagePreview("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    // Si el cambio no es en el input de imagen, procesar normalmente
    if (name !== "image") {
      if (name === "stock" || name === "price") {
        //Campos numéricos
        setFormData((prev) => ({
          ...prev,
          [name]: value === "" ? null : Number(value), //Si el usuario los deja vacío guardamos null
        }));
      } else {
        //Campos de texto
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
    // A partir de aquí solo manejamos cambios en el input de imagen
    if (files?.length) {
      setImageFile(files[0]);
      return;
    }

    // Si se canceló la selección y hay una imagen previa, restaurar el input
    console.log("Llegamos antes del bugfix");
    console.log("Y tenemos esto en fileInputRef", fileInputRef);
    console.log("Y esto en imageFile", imageFile);
    if (fileInputRef.current && imageFile) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(imageFile);
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleRemoveImage = () => {
    setImageFile(undefined);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    const result = ProductSchema.safeParse({
      ...formData,
      imageFile,
    });

    if (!result.success) {
      setErrors(result.error.issues);
      return;
    }
    // Ahora solo enviamos el archivo, con una imageUrl vacía
    const productToAdd = {
      ...formData,
      imageFile, // El backend procesará este archivo
      imageUrl: "", // String vacío, el backend generará la URL real
    };
    console.log("ProductToAdd", productToAdd);
    clearFormErrorAndImgPreview(); //Si todo sale bien limpiamos los estados antes de llamar al modal de confirmación
    onAddProduct("Agregar", undefined, productToAdd); //Llamamos al modal de confirmación
    onClose();
  };

  const getErrorMessage = (fieldName: string) => {
    const fieldError = errors.find((error) => error.path[0] === fieldName);
    return fieldError ? fieldError.message : null;
  };
  return (
    <Modal show={show} onHide={onClose} backdrop={"static"}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre (obligatorio)</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              isInvalid={!!getErrorMessage("name")}
            />
            <Form.Control.Feedback type="invalid">
              {getErrorMessage("name")}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría (obligatorio)</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              isInvalid={!!getErrorMessage("category")}
            />
            <Form.Control.Feedback type="invalid">
              {getErrorMessage("category")}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <div className="d-flex align-items-start gap-2">
              <div className="flex-grow-1">
                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </div>
              {imagePreview && (
                <CloseButton
                  onClick={handleRemoveImage}
                  aria-label="Eliminar imagen"
                />
              )}
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                  className="border rounded"
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Stock (obligatorio)</Form.Label>
            <Form.Control
              type="number"
              name="stock"
              value={
                formData.stock || formData.stock == 0 ? formData.stock : ""
              }
              onChange={handleInputChange}
              isInvalid={!!getErrorMessage("stock")}
              min="0"
            />
            <Form.Control.Feedback type="invalid">
              {getErrorMessage("stock")}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio (obligatorio)</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={
                formData.price || formData.price == 0 ? formData.price : ""
              }
              onChange={handleInputChange}
              isInvalid={!!getErrorMessage("price")}
              min="0.01"
              step="0.01"
            />
            <Form.Control.Feedback type="invalid">
              {getErrorMessage("price")}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            onClose();
            clearFormErrorAndImgPreview();
          }}
        >
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProductModal;
