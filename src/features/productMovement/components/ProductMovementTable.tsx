import { useState } from "react";
import { Cell, flexRender, getCoreRowModel, Row, useReactTable } from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { LoaderCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/layouts/Pagination";
import { useProductMovements, useCreateProductMovement, useUpdateProductMovement } from "../hooks/useProductMovements";
import { ProductMovement, productMovementSchema } from "../types/productMovement.types";
import { formatCurrency, removeUnderscore } from "@/helpers/string.helper";
import { ProductMovementDialog } from "./ProductMovementDialog";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/helpers/debounce.helper";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProductMovementDetail } from "./ProductMovementDetail";

export const ProductMovementTable = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [open, setOpen] = useState(false)
    const [selectedProductMovement, setSelectedProductMovement] = useState<ProductMovement>();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebouncedValue(searchQuery, 500);

    const { data, isLoading } = useProductMovements(page, limit, debouncedSearch);
    const createMutation = useCreateProductMovement();
    const updateMutation = useUpdateProductMovement();

    const table = useReactTable({
        data: data?.data ?? [],
        columns: [
            { accessorKey: "product.name", header: "Name" },
            { accessorKey: "type", header: "Type" },
            { accessorKey: "quantity", header: "Quantity" },
            { accessorKey: "unit_cost", header: "Unit Cost" },
            {
                id: "total_cost",
                header: "Total Cost",
                accessorFn: (row) => row.quantity * row.unit_cost,
            },
            { accessorKey: "action", header: "" },
        ],
        pageCount: Math.ceil((data?.meta.total ?? 0) / limit),
        manualPagination: true,
        state: {
            pagination: { pageIndex: page - 1, pageSize: limit },
        },
        getCoreRowModel: getCoreRowModel(),
    });

    const renderCellContent = (index: number, row: Row<ProductMovement>, cell: Cell<ProductMovement, unknown>) => {
        switch (true) {
            case cell.column.id === "quantity":
                return (
                    <TableCell key={cell.id} className="capitalize text-right">
                        {cell.getValue() as number}
                    </TableCell>
                )
            case cell.column.id === "unit_cost":
                return (
                    <TableCell key={cell.id} className="capitalize text-right">
                        {formatCurrency(cell.getValue() as number, { currencySymbol: "" })}
                    </TableCell>
                )
            case cell.column.id === "total_cost":
                return (
                    <TableCell key={cell.id} className="text-right">
                        {formatCurrency(cell.getValue() as number, { currencySymbol: "" })}
                    </TableCell>
                );
            case cell.column.id === "type":
                return (
                    <TableCell key={cell.id} className="capitalize">
                        <Badge
                            className={cn(
                                "",
                                row.original.type === "in" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}
                        >
                            {removeUnderscore(row.original.type)}
                        </Badge>
                    </TableCell>
                );
            case index === 5 && row.original.type === "in":
                return (
                    <TableCell key={cell.id}>

                        <ProductMovementDialog
                            mode="adjustment"
                            initialData={row.original}
                            onSubmit={(data: ProductMovement) => handleSubmit('edit', data)}
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

    const handleSubmit = async (mode: 'add' | 'edit', data: ProductMovement) => {
        console.log('mode', mode)
        if (mode === 'add') {
            await createMutation.mutateAsync(productMovementSchema.parse(data));
        } else {
            await updateMutation.mutateAsync(productMovementSchema.parse(data));
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleProductMovementClick = (data: ProductMovement) => {
        setSelectedProductMovement(data)
        setOpen(!open)
        console.log(data)
    }

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
                                    case 2:
                                    case 3:
                                    case 4:
                                        return (
                                            <TableHead key={header.id} className="text-xs text-right">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    case 5:
                                        return (
                                            <TableHead key={header.id} className="text-xs">
                                                <ProductMovementDialog
                                                    mode="in"
                                                    onSubmit={(data: ProductMovement) => handleSubmit('add', data)}
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
                            <TableCell colSpan={5} className="text-center">
                                <LoaderCircle className="w-6 h-6 animate-spin mx-auto" />
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map(row => (
                            row.original.type === "in" ? (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell, index) => {
                                        return renderCellContent(index, row, cell)
                                    })}
                                </TableRow>
                            ) : (
                                <TableRow
                                    key={row.id}
                                    onClick={() => handleProductMovementClick(row.original)}
                                    className="cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell, index) => {
                                        return renderCellContent(index, row, cell)
                                    })}
                                </TableRow>
                            )
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-xs italic text-gray-400">
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

            <ProductMovementDetail initialData={selectedProductMovement} open={open} setOpen={setOpen} />
        </div>
    );
};
