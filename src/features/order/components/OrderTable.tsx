import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cell, flexRender, getCoreRowModel, Row, useReactTable } from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/layouts/Pagination";
import { useOrders, } from "../hooks/useOrder";
import { Order } from "../types/order.types";
import { formatCurrency, removeUnderscore } from "@/helpers/string.helper";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OrderDialog } from "./OrderDialog";

export const OrderTable = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const { data, isLoading, refetch } = useOrders(page, limit);

    const navigate = useNavigate();


    const table = useReactTable({
        data: data?.data ?? [],
        columns: [
            {
                id: "order_type",
                header: "Order Type",
                accessorFn: (row) => row.booking_id ? "Booking" : "Walk-in"
            },
            {
                id: "item_count",
                header: "Items",
                accessorFn: (row) => row.order_items?.length
            },
            { accessorKey: "total_price", header: "Total" },
            { accessorKey: "status", header: "Status" },
            { accessorKey: "action", header: "" },
        ],
        pageCount: Math.ceil((data?.meta.total ?? 0) / limit),
        manualPagination: true,
        state: {
            pagination: { pageIndex: page - 1, pageSize: limit },
        },
        getCoreRowModel: getCoreRowModel(),
    });

    const renderCellContent = (index: number, row: Row<Order>, cell: Cell<Order, unknown>) => {
        switch (true) {
            case cell.column.id === "order_type":
                return (
                    <TableCell key={cell.id}>
                        <Badge
                            className={cn(
                                "",
                                row.original.booking_id ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                            )}
                        >
                            {row.original.booking_id ? `Booking: ${row.original.booking?.room?.name}` : "Walk-in"}
                        </Badge>
                    </TableCell>
                )
            case cell.column.id === "item_count":
                return (
                    <TableCell key={cell.id} className="text-right">
                        {cell.getValue() as number}
                    </TableCell>
                )
            case cell.column.id === "total_price":
                return (
                    <TableCell key={cell.id} className="text-right">
                        {formatCurrency(cell.getValue() as number, { currencySymbol: "" })}
                    </TableCell>
                );
            case cell.column.id === "status":
                return (
                    <TableCell key={cell.id}>
                        <Badge
                            className={cn(
                                "",
                                row.original.status === "pending" ? "bg-gray-200 text-gray-800" : "bg-green-100 text-green-800"
                            )}
                        >
                            {row.original.status ? removeUnderscore(row.original.status) : ""}
                        </Badge>
                    </TableCell>
                );
            case index === 4:
                if (row.original.status === "pending" && row.original.booking_id) {
                    return (
                        <TableCell key={cell.id}>
                            <Button
                                variant="ghost"
                                className="text-gray-400 hover:text-gray-400 cursor-pointer float-right size-7"
                                onClick={() => handleBookingClick(row.original)}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </TableCell>
                    )
                } else if (row.original.status === "completed" && row.original.booking_id) {
                    return (
                        <TableCell key={cell.id}>
                            <Button
                                variant="ghost"
                                className="text-gray-400 hover:text-gray-400 cursor-pointer float-right size-7"
                                onClick={() => handleBookingClick(row.original)}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </TableCell>
                    )
                } else {
                    return (
                        <TableCell key={cell.id}>
                            <OrderDialog
                                mode="edit"
                                initialData={row.original}
                                refreshData={refetch}
                                trigger={
                                    <Button variant="ghost" className="text-gray-400 hover:text-gray-400 cursor-pointer float-right size-7">
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                }
                            />
                        </TableCell>
                    )
                }
            default:
                return <TableCell key={cell.id} className="">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleBookingClick = (data: Order) => {
        if (data.status === "pending") {
            navigate(`/dashboard?room_id=${data.booking?.room_id}&tab=orders`)
        } else {
            navigate(`/booking?id=${data.booking_id}`)
        }
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
                                    case 1:
                                    case 2:
                                        return (
                                            <TableHead key={header.id} className="text-xs text-right">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    case 4:
                                        return (
                                            <TableHead key={header.id} className="text-xs">
                                                <OrderDialog
                                                    mode="add"
                                                    refreshData={refetch}
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
                            <TableRow
                                key={row.id}
                                className="cursor-pointer"
                            >
                                {row.getVisibleCells().map((cell, index) => {
                                    return renderCellContent(index, row, cell)
                                })}
                            </TableRow>
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
        </div>
    );
};
