// Ordenamiento para la tabla
export type SortableColumn = "category" | "name";
export  type SortDirection = "asc" | "desc";

export interface SortItem {
    key: SortableColumn;
    direction: SortDirection;
}