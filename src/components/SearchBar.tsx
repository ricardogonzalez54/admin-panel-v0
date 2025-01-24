import React, { useState, useEffect, useRef } from "react";
import "./SearchBar.css";

interface SearchBarProps {
  data: string[]; // Lista de elementos a buscar.
  onSearch: (result: string) => void; // Función para manejar el resultado.
  onReset: () => void; // Función para restablecer la búsqueda.
}

const SearchBar: React.FC<SearchBarProps> = ({ data, onSearch, onReset }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() !== "") {
      const filteredSuggestions = data.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleSearch = () => {
    if (query.trim() !== "") {
      onSearch(query);
      setSuggestions([]);
    }
  };

  const handleReset = () => {
    setQuery(""); // Vacía el campo de búsqueda
    setSuggestions([]); // Limpia las sugerencias
    onReset(); // Llama la función para mostrar todo
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setSuggestions([]);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim() !== "") {
      const filteredSuggestions = data.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          value={query}
          onChange={handleInputChange}
          placeholder="Buscar..."
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Buscar
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Mostrar todo
        </button>
      </div>
      {isFocused && suggestions.length > 0 && (
        <ul ref={suggestionsRef} className="list-group position-absolute mt-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="list-group-item suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
