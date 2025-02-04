import React from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

interface FilterProps {
  headerKey: string; // Nombre de la columna a filtrar (por ahora "Category")
  dropdownContent: string[]; // Lista de categorías disponibles
  onSelect: (selected: string) => void; // Función que maneja la acción al seleccionar una categoría
}

const ProductFilter: React.FC<FilterProps> = ({
  headerKey,
  dropdownContent,
  onSelect,
}) => {
  return (
    <DropdownButton
      as={ButtonGroup}
      id={`dropdown-filter-${headerKey}`}
      variant="success"
      title="Filtrar por:"
    >
      {/* Encabezado sin acción */}
      <Dropdown.Header>{headerKey}</Dropdown.Header>

      {/* Mapeo dinámico de categorías */}
      {dropdownContent.map((category, index) => (
        <Dropdown.Item key={index} onClick={() => onSelect(category)}>
          {category}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default ProductFilter;
