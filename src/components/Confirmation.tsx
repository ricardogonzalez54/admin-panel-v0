import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Product, HandleProductAction } from "../hooks/useProducts";

interface ConfirmationProps {
  show: boolean;
  action: "Agregar" | "Editar" | "Eliminar";
  product?: Product; // Para eliminar o editar
  newProduct?: Omit<Product, "id">; // Solo para agregar
  updatedProductFields?: Partial<Omit<Product, "id">>; // Campos editados
  onConfirm: HandleProductAction;
  onCancel: () => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  show,
  action,
  product,
  newProduct,
  updatedProductFields,
  onConfirm,
  onCancel,
}) => {
  // En el caso de edición, construimos cómo queda el producto editado para que el usuario confirme los cambios
  const updatedProduct =
    action === "Editar"
      ? {
          ...product,
          ...updatedProductFields, // Esto sobrescribe los campos actualizados
        }
      : undefined;
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{action} Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {action === "Eliminar" && (
          <p>
            ¿Está seguro de que desea <strong>eliminar</strong> este producto?
          </p>
        )}
        {action === "Agregar" && (
          <p>
            ¿Está seguro de que desea <strong>añadir</strong> este producto?
          </p>
        )}
        {action === "Editar" && product && (
          <>
            <p>
              ¿Está seguro de que desea <strong>editar</strong> este producto?
            </p>
            <h5>Cambios:</h5>
            <ul>
              <li>
                <strong>Categoría:</strong> {product.category} →{" "}
                {updatedProduct?.category}
              </li>
              <li>
                <strong>Nombre:</strong> {product.name} → {updatedProduct?.name}
              </li>
              <li>
                <strong>Imagen:</strong>{" "}
                {product.imageUrl ? (
                  <a
                    href={product.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ms-2"
                  >
                    Imagen anterior
                  </a>
                ) : (
                  "Sin imagen"
                )}{" "}
                →{" "}
                {updatedProduct?.imageFile && !product.imageUrl
                  ? `Se agregó: ${updatedProduct.imageFile.name}`
                  : updatedProduct?.imageFile && product.imageUrl
                  ? `${updatedProduct.imageFile.name}`
                  : !updatedProduct?.imageFile && product.imageUrl
                  ? `Se mantiene su Imagen`
                  : `Sin imagen`}
              </li>
              <li>
                <strong>Stock:</strong> {product.stock} →{" "}
                {updatedProduct?.stock}
              </li>
              <li>
                <strong>Precio:</strong> ${product.price} → $
                {updatedProduct?.price}
              </li>
            </ul>
          </>
        )}
        {action === "Eliminar" && product && (
          <div className="mt-3">
            <strong>Detalles:</strong>
            <p>
              Producto: {product.name} | Categoría: {product.category} <br />
              Stock: {product.stock} | Precio: ${product.price} <br />
              Imagen:
              {product.imageUrl ? (
                <a
                  href={product.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-2"
                >
                  Ver
                </a>
              ) : (
                "-"
              )}
            </p>
          </div>
        )}
        {action === "Agregar" && newProduct && (
          <div className="mt-3">
            <strong>Detalles:</strong>
            <p>
              Producto: {newProduct.name} | Categoría: {newProduct.category}
              <br />
              Stock: {newProduct.stock} | Precio: ${newProduct.price}
              <br />
              Imagen:{" "}
              {newProduct.imageFile
                ? `Se agregó: ${newProduct.imageFile.name}`
                : `-`}
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant={action === "Eliminar" ? "danger" : "primary"}
          onClick={() =>
            onConfirm(action, product, newProduct, updatedProductFields)
          }
        >
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Confirmation;
