import { useState } from "react";
import { Cell, flexRender, getCoreRowModel, Row, useReactTable } from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { LoaderCircle } from "lucide-react";
import { Pagination } from "@/components/layouts/Pagination";
import { useInventories } from "../hooks/useInventory";
import { Inventory } from "../types/inventory.types";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/helpers/debounce.helper";
import { Input } from "@/components/ui/input";
import { ProductMovement } from "@/features/productMovement/types/productMovement.types";

export const InventoryTable = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebouncedValue(searchQuery, 500);

    const { data, isLoading } = useInventories(page, limit, debouncedSearch);

    const table = useReactTable({
        data: data?.data ?? [],
        columns: [
            { accessorKey: "product.name", header: "Product" },
            { accessorKey: "quantity", header: "Quantity" },
        ],
        pageCount: Math.ceil((data?.meta.total ?? 0) / limit),
        manualPagination: true,
        state: {
            pagination: { pageIndex: page - 1, pageSize: limit },
        },
        getCoreRowModel: getCoreRowModel(),
    });

    const renderCellContent = (index: number, row: Row<Inventory>, cell: Cell<Inventory, unknown>) => {
        return (
            <TableCell key={cell.id} className={cn("text-right", index === 1 || index === 2 ? "text-right" : "text-left")}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
        );
    };

    const handleSubmit = async (mode: 'in' | 'adjustment', data: ProductMovement) => {
        // data.track_stock = data.category === 'product' ? data.track_stock : false;
        // if (mode === 'add') {
        //     await createMutation.mutateAsync(productSchema.parse(data));
        // } else {
        //     await updateMutation.mutateAsync(productSchema.parse(data));
        // }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    return (
        <div className="md:max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 mb-4">
                <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-white"
                />
            </div>
            <Table className="bg-white">
                <TableHeader>
                    {table.getHeaderGroups().map(hg => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header, index) => {
                                switch (index) {
                                    case 1:
                                    case 2:
                                        return (
                                            <TableHead key={header.id} className="text-xs text-right">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )

                                    default:
                                        return (
                                            <TableHead key={header.id} className="text-xs">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                }
                            }
                            )}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                <LoaderCircle className="w-6 h-6 animate-spin mx-auto" />
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell, index) => {
                                    return renderCellContent(index, row, cell)
                                })}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-xs italic text-gray-400">
                                No record
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {!isLoading && data && (
                <Pagination
                    table={table}
                    onChangePage={setPage}
                    onChangeLimit={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                    }}
                />
            )}
        </div>
    );
};