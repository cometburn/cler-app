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
import { RoomRateDialog } from "./RoomRateDialog";
import { formatDateMMDDYYYY } from "@/helpers/date.helper";

import {
    useRoomRates,
    useUpdateRoomRate,
    useDeleteRoomRate,
    useCreateRoomRate,
} from "../hooks/useRoomRates";
import { roomRateSchema } from "../types/roomRate.types";
import { RoomRate } from "../types/roomRate.types";
// import { useRoomTypes } from "@/features/roomTypes/hooks/useRoomTypes";

export const RoomRateTable = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data, isLoading } = useRoomRates(page, limit);
    const createMutation = useCreateRoomRate();
    const updateMutation = useUpdateRoomRate();
    const deleteMutation = useDeleteRoomRate();

    // const { data: roomTypes } = useRoomTypes(1, 1000);


    const table = useReactTable({
        data: data?.data ?? [],
        columns: [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "rate_type", header: "Type" },
            { accessorKey: "duration_minutes", header: "Duration" },
            { accessorKey: "base_price", header: "Price" },
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
                                index !== 4 ? (
                                    <TableHead key={header.id} className="text-xs text-gray-600">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ) : (
                                    <TableHead key={header.id} className="">
                                        <RoomRateDialog
                                            mode="add"
                                            onSubmit={(data: RoomRate) => {
                                                createMutation.mutate(roomRateSchema.parse(data));
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
                                        {index === 4 ? (
                                            <>
                                                <ConfirmDeleteDialog
                                                    entityName={`${row.original.name} - Room Rate`}
                                                    loading={deleteMutation.isPending}
                                                    onConfirm={() =>
                                                        deleteMutation.mutate(row.original.id!)
                                                    }
                                                />
                                                <RoomRateDialog
                                                    mode="edit"
                                                    initialData={row.original}
                                                    onSubmit={(data: RoomRate) => {
                                                        updateMutation.mutate(roomRateSchema.parse(data));
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
