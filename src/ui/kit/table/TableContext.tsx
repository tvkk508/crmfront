import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type TableDensity = "default" | "compact";

const TableDensityContext = createContext<TableDensity>("default");

export function TableDensityProvider({
  value,
  children,
}: {
  value: TableDensity;
  children: ReactNode;
}) {
  return (
    <TableDensityContext.Provider value={value}>
      {children}
    </TableDensityContext.Provider>
  );
}

export function useTableDensity(): TableDensity {
  return useContext(TableDensityContext);
}
