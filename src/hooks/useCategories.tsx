import { useState, useEffect } from "react";
import { Product } from "./useProducts";

export const useCategories = (products: Product[]) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category))
    );
    setCategories(uniqueCategories);
  }, [products]);

  return { categories };
};
