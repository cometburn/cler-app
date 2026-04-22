"use client";

import { useState } from "react";
import { Cell, flexRender, getCoreRowModel, Row, useReactTable } from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { LoaderCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/layouts/Pagination";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../hooks/useProducts";
import { Product, productSchema } from "../types/product.types";
import { formatCurrency, removeUnderscore } from "@/helpers/string.helper";
import { ProductDialog } from "./ProductDialog";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/helpers/debounce.helper";

export const ProductTable = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebouncedValue(searchQuery, 500);

    const { data, isLoading } = useProducts(page, limit, debouncedSearch);
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    const table = useReactTable({
        data: data?.data ?? [],
        columns: [
            { accessorKey: "name", header: "Product" },
            { accessorKey: "price", header: "Price" },
            { accessorKey: "category", header: "Category" },
            { accessorKey: "action", header: "" },
        ],
        pageCount: Math.ceil((data?.meta.total ?? 0) / limit),
        manualPagination: true,
        state: {
            pagination: { pageIndex: page - 1, pageSize: limit },
        },
        getCoreRowModel: getCoreRowModel(),
    });

    const renderCellContent = (index: number, row: Row<Product>, cell: Cell<Product, unknown>) => {
        switch (true) {
            case cell.column.id === "price":
                return (
                    <TableCell key={cell.id} className="capitalize text-right">
                        {formatCurrency(cell.getValue() as number, { currencySymbol: "" })}
                    </TableCell>
                )

            case cell.column.id === "category":
                return (
                    <TableCell key={cell.id} className="capitalize">
                        {removeUnderscore(row.original.category)}
                    </TableCell>
                );
            case index === 3:
                return (
                    <TableCell key={cell.id}>
                        <ConfirmDeleteDialog
                            entityName={`${row.original.name} - Product`}
                            loading={deleteMutation.isPending}
                            onConfirm={async () => await deleteMutation.mutateAsync(row.original.id!)}
                        />

                        <ProductDialog
                            mode="edit"
                            initialData={row.original}
                            onSubmit={(data: Product) => handleSubmit('edit', data)}
                            trigger={
                                <Button variant="ghost" className="text-gray-400 hover:text-gray-400 cursor-pointer float-right size-7">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            }
                        />
                    </TableCell>
                );

            default:
                return <TableCell key={cell.id} className="capitalize">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
        }
    };

    const handleSubmit = async (mode: 'add' | 'edit', data: Product) => {
        data.track_stock = data.category === 'product' ? data.track_stock : false;
        if (mode === 'add') {
            await createMutation.mutateAsync(productSchema.parse(data));
        } else {
            await updateMutation.mutateAsync(productSchema.parse(data));
        }
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
                                        return (
                                            <TableHead key={header.id} className="text-xs text-right">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    case 3:
                                        return (
                                            <TableHead key={header.id} className="text-xs">
                                                <ProductDialog
                                                    mode="add"
                                                    onSubmit={(data: Product) => handleSubmit('add', data)}
                                                />
                                            </TableHead>
                                        );
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
                            <TableCell colSpan={3} className="text-center">
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
                            <TableCell colSpan={3} className="text-center text-xs italic text-gray-400">
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
