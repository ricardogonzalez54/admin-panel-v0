import React, { useState } from "react";
import "./PaginationNav.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [editingDots, setEditingDots] = useState<"left" | "right" | null>(null);
  const [inputPage, setInputPage] = useState<string>("");

  const range = 2; // Número de páginas alrededor de la página actual

  const generatePageNumbers = () => {
    const pages = [];
    const range = 2; // Número de páginas alrededor de la actual

    // Siempre agregar la primera página
    pages.push(1);

    // Agregar puntos suspensivos a la izquierda si es necesario
    if (currentPage > range + 2) {
      pages.push("left");
    }

    // Agregar el rango de páginas centrales
    for (
      let i = Math.max(2, currentPage - range);
      i <= Math.min(totalPages - 1, currentPage + range);
      i++
    ) {
      pages.push(i);
    }

    // Agregar puntos suspensivos a la derecha si es necesario
    if (currentPage < totalPages - range - 1) {
      pages.push("right");
    }

    // Siempre agregar la última página
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pageNumber = parseInt(inputPage, 10);

      const min =
        editingDots === "left"
          ? 1
          : Math.min(totalPages, currentPage + range) + 1;

      const max =
        editingDots === "left"
          ? Math.max(1, currentPage - range) - 1
          : totalPages;

      if (!isNaN(pageNumber) && pageNumber >= min && pageNumber <= max) {
        onPageChange(pageNumber);
      }

      setEditingDots(null);
    }
  };

  const handleDotsClick = (dot: "left" | "right") => {
    setEditingDots(dot);
    setInputPage(""); // Limpiar el valor del input
  };

  const pages = generatePageNumbers();

  return (
    <nav className="d-flex justify-content-center mt-4">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
        </li>
        {pages.map((page, index) => {
          if (page === "left" || page === "right") {
            const min =
              page === "left"
                ? 1
                : Math.min(totalPages, currentPage + range) + 1;

            const max =
              page === "left"
                ? Math.max(1, currentPage - range) - 1
                : totalPages;

            const isEditing = editingDots === page;
            return (
              <li key={index} className="page-item">
                {isEditing ? (
                  <input
                    type="number"
                    className="form-control pagination-input"
                    value={inputPage}
                    onChange={handleInputChange}
                    onKeyPress={handleInputKeyPress}
                    onBlur={() => setEditingDots(null)} // Salir del modo edición si pierde el foco
                    autoFocus
                    min={min}
                    max={max}
                  />
                ) : (
                  <button
                    className="page-link pagination-dots"
                    onClick={() => handleDotsClick(page as "left" | "right")}
                  >
                    ...
                  </button>
                )}
              </li>
            );
          }
          return (
            <li
              key={index}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            </li>
          );
        })}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
