import AdminDashboardPage from "../pages/AdminDashboardPage";
import ProductPage from "../pages/ProductPage";
import BannerPage from "../pages/BannerPage";
import AdPage from "../pages/AdPage";
import CategoryPage from "../pages/CategoryPage";

// Tipos ajustados para Pages y SubPages
export interface SubPage {
  name: string;
  path: string;
  component: React.ElementType; // Componente React asociado
}

export interface PageWithSubPages {
  name: string;
  order: number;
  subPages: SubPage[]; // Debe contener subpáginas
}

export interface PageWithoutSubPages {
  name: string;
  path: string;
  component: React.ElementType; // Componente React asociado
  order: number;
}

export type Page = PageWithSubPages | PageWithoutSubPages;

export const PAGES: Page[] = [
  {
    name: "Inicio",
    path: "/",
    component: AdminDashboardPage,
    order: 1,
  },
  {
    name: "Productos",
    order: 2,
    subPages: [
      {
        name: "Lista Completa",
        path: "/products",
        component: ProductPage,
      },
      {
        name: "Por Categorías",
        path: "/categories",
        component: CategoryPage,
      },
    ],
  },
  {
    name: "Banners",
    path: "/banners",
    component: BannerPage,
    order: 3,
  },
  {
    name: "Anuncios",
    path: "/ads",
    component: AdPage,
    order: 4,
  },
];