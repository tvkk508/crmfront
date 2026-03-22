import { Skeleton } from "../Skeleton";
import { TableCell } from "./TableCell";
import { TableRow } from "./TableRow";

export type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

/** Placeholder rows — use inside `<TableBody>` while loading. */
export function TableSkeleton({ rows = 6, columns = 4 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex} overflow="truncate" className="min-w-[6rem]">
              <Skeleton className="h-4 w-full max-w-[10rem]" variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
