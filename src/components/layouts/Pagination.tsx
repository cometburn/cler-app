import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { rowPerPage } from "@/constants/system";

interface PaginationProps<TData> {
  table: Table<TData>;
  onChangePage?: (page: number) => void;
  onChangeLimit?: (limit: number) => void;
}

export const Pagination = <TData,>({
  table,
  onChangePage,
  onChangeLimit,
}: PaginationProps<TData>) => {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalPages = table.getPageCount();

  return (
    table.getRowModel().rows.length > 0 && (
      <div className="flex flex-row justify-between sm:flex-row items-center md:justify-start mt-4 gap-3">
        <div className="flex items-center space-x-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              table.previousPage();
              onChangePage?.(pageIndex); // call store fetch
            }}
            disabled={!table.getCanPreviousPage()}
            className="bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-xs font-normal">
            <strong>{pageIndex + 1}</strong> of{" "}
            <strong>{totalPages || 1}</strong>
          </span>

          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              table.nextPage();
              onChangePage?.(pageIndex + 2);
            }}
            disabled={!table.getCanNextPage()}
            className="bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-muted-foreground">Rows:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const newLimit = Number(value);
              table.setPageSize(newLimit);
              onChangeLimit?.(newLimit);
            }}
          >
            <SelectTrigger className="w-[80px] h-8 text-xs bg-white">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {rowPerPage.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  );
}
