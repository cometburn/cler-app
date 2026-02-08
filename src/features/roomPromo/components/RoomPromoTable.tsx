"use client";

import { useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { LoaderCircle, Pencil } from "lucide-react";
import { Pagination } from "@/components/layouts/Pagination";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import { RoomPromoDialog } from "./RoomPromoDialog";
import { formatDateMMDDYYYY } from "@/helpers/date.helper";

import {
    useRoomPromos,
    useUpdateRoomPromo,
    useDeleteRoomPromo,
    useCreateRoomPromo,
} from "../hooks/useRoomPromos";
import { roomPromoSchema } from "../types/roomPromo.types";
import { RoomPromo } from "../types/roomPromo.types";

export const RoomPromoTable = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data, isLoading } = useRoomPromos(page, limit);
    const createMutation = useCreateRoomPromo();
    const updateMutation = useUpdateRoomPromo();
    const deleteMutation = useDeleteRoomPromo();


    const table = useReactTable({
        data: data?.data ?? [],
        columns: [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "rate_type", header: "Type" },
            { accessorKey: "date_start", header: "Start Date" },
            { accessorKey: "date_end", header: "End Date" },
            { accessorKey: "days_of_week", header: "Days of Week" },
            { accessorKey: "time_start", header: "Start Time" },
            { accessorKey: "time_end", header: "End Time" },
            { accessorKey: "price", header: "Price" },
            { accessorKey: "action", header: "" },
        ],
        pageCount: Math.ceil((data?.meta.total ?? 0) / limit),
        manualPagination: true,
        state: {
            pagination: { pageIndex: page - 1, pageSize: limit },
        },
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="md:max-w-7xl mx-auto">
            <Table className="bg-white">
                <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header, index) =>
                                index !== 8 ? (
                                    <TableHead key={header.id} className="text-xs text-gray-600">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ) : (
                                    <TableHead key={header.id}>
                                        <RoomPromoDialog
                                            mode="add"
                                            onSubmit={(data: RoomPromo) => {
                                                createMutation.mutate(roomPromoSchema.parse(data));
                                            }}
                                        />
                                    </TableHead>
                                )
                            )}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center">
                                <LoaderCircle className="w-6 h-6 animate-spin mx-auto" />
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell, index) => (
                                    <TableCell key={cell.id} className="capitalize">
                                        {index === 8 ? (
                                            <>
                                                <ConfirmDeleteDialog
                                                    entityName={`${row.original.name} - Room Promo`}
                                                    loading={deleteMutation.isPending}
                                                    onConfirm={() =>
                                                        deleteMutation.mutate(row.original.id!)
                                                    }
                                                />
                                                <RoomPromoDialog
                                                    mode="edit"
                                                    initialData={row.original}
                                                    onSubmit={(data: RoomPromo) => {
                                                        updateMutation.mutate(roomPromoSchema.parse(data));
                                                    }}
                                                    trigger={
                                                        <Button variant="ghost" className="size-7 cursor-pointer float-right">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    }
                                                />
                                            </>
                                        ) : cell.column.id === "date_start" ||
                                            cell.column.id === "date_end" ? (
                                            formatDateMMDDYYYY(cell.getValue() as string)
                                        ) : (
                                            flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-xs italic">
                                No record
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {!isLoading && data && (
                <Pagination
                    table={table}
                    onChangePage={(page: number) => setPage(page)}
                    onChangeLimit={(limit: number) => {
                        setLimit(limit);
                        setPage(1);
                    }}
                />
            )}
        </div>
    );
};
