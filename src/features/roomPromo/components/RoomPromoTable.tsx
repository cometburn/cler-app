"use client";

import { useState } from "react";
import {
    Cell,
    flexRender,
    getCoreRowModel,
    Row,
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
import { formatDate } from "@/helpers/date.helper";

import {
    useRoomPromos,
    useUpdateRoomPromo,
    useDeleteRoomPromo,
    useCreateRoomPromo,
} from "../hooks/useRoomPromos";
import { roomPromoSchema } from "../types/roomPromo.types";
import { RoomPromo } from "../types/roomPromo.types";
import { DAYS } from "@/constants/system";

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
            { accessorKey: "room_rate.name", header: "Type" },
            { accessorKey: "start_datetime", header: "Start Date" },
            { accessorKey: "end_datetime", header: "End Date" },
            { accessorKey: "days_of_week", header: "Days of Week" },
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

    const renderCellContent = (index: number, row: Row<RoomPromo>, cell: Cell<RoomPromo, unknown>) => {
        switch (true) {
            case index === 6:
                return (
                    <>
                        <ConfirmDeleteDialog
                            entityName={`${row.original.name} - Room Promo`}
                            loading={deleteMutation.isPending}
                            onConfirm={async () => await deleteMutation.mutate(row.original.id!)}
                        />
                        <RoomPromoDialog
                            mode="edit"
                            initialData={row.original}
                            onSubmit={async (data: RoomPromo) => {
                                await updateMutation.mutateAsync(roomPromoSchema.parse(data));
                            }}
                            trigger={
                                <Button variant="ghost" className="size-7 cursor-pointer float-right">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            }
                        />
                    </>
                );

            case cell.column.id === "days_of_week":
                const arr = cell.getValue() as number[]
                const allDays = DAYS.map(d => d.value);
                const weekdays = [1, 2, 3, 4, 5];
                const weekends = [0, 6];

                // All Days
                if (arr.length === 7 && allDays.every(d => arr.includes(d))) return "All Days";

                // Weekdays
                if (arr.length === 5 && weekdays.every(d => arr.includes(d))) return "Weekdays";

                // Weekends
                if (arr.length === 2 && weekends.every(d => arr.includes(d))) return "Weekends";

                // Otherwise, list individual day labels
                return DAYS
                    .filter(d => arr.includes(d.value))
                    .map(d => d.label)
                    .join(", ");

            case cell.column.id === "start_datetime" || cell.column.id === "end_datetime":
                return formatDate(cell.getValue() as string, "MM/DD/YYYY hh:mm A");

            default:
                return flexRender(cell.column.columnDef.cell, cell.getContext());
        }
    };

    return (
        <div className="md:max-w-7xl mx-auto">
            <Table className="bg-white">
                <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header, index) =>
                                index !== 6 ? (
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
                                            onSubmit={async (data: RoomPromo) => {
                                                await createMutation.mutateAsync(roomPromoSchema.parse(data));
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
                                        {renderCellContent(index, row, cell)}
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
