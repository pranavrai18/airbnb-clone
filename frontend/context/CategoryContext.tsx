"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CategoryContextType {
  category: string;
  setCategory: (category: string) => void;
}

const CategoryContext = createContext<CategoryContextType>({
  category: "",
  setCategory: () => {},
});

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState("");

  return (
    <CategoryContext.Provider value={{ category, setCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  return useContext(CategoryContext);
}
