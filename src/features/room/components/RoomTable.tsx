"use client";

import { useState } from "react";
import { Cell, flexRender, getCoreRowModel, Row, useReactTable } from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { LoaderCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/layouts/Pagination";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import { RoomDialog } from "./RoomDialog";
import { useRooms, useDeleteRoom, useUpdateRoom, useCreateRoom } from "../hooks/useRooms";
import { Room, roomSchema } from "../types/room.types";
import { Badge } from "@/components/ui/badge";

export const RoomTable = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data, isLoading } = useRooms(page, limit);
    const createMutation = useCreateRoom();
    const updateMutation = useUpdateRoom();
    const deleteMutation = useDeleteRoom();

    const table = useReactTable({
        data: data?.data ?? [],
        columns: [
            { accessorKey: "room_type.name", header: "Type" },
            { accessorKey: "name", header: "Room" },
            { accessorKey: "floor", header: "Floor" },
            { accessorKey: "operational_status", header: "Status" },
            { accessorKey: "action", header: "" },
        ],
        pageCount: Math.ceil((data?.meta.total ?? 0) / limit),
        manualPagination: true,
        state: {
            pagination: { pageIndex: page - 1, pageSize: limit },
        },
        getCoreRowModel: getCoreRowModel(),
    });

    const renderCellContent = (index: number, row: Row<Room>, cell: Cell<Room, unknown>) => {
        switch (true) {
            case index === 4:
                return (
                    <>
                        <ConfirmDeleteDialog
                            entityName={`${row.original.name} - Room Type`}
                            loading={deleteMutation.isPending}
                            onConfirm={async () => await deleteMutation.mutateAsync(row.original.id!)}
                        />

                        <RoomDialog
                            mode="edit"
                            initialData={row.original}
                            onSubmit={async (data: Room) => {
                                await updateMutation.mutateAsync(roomSchema.parse(data));
                            }}
                            trigger={
                                <Button variant="ghost" className="text-gray-400 hover:text-gray-400 cursor-pointer float-right size-7">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            }
                        />
                    </>
                );

            case cell.column.id === "operational_status":
                const cellValue = cell.getValue() as string;
                return (
                    <Badge
                        variant={cellValue === "available" ? "default" : "destructive"}
                        className={cellValue === "available" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}
                    >
                        {cellValue}
                    </Badge>
                );


            default:
                return flexRender(cell.column.columnDef.cell, cell.getContext());
        }
    };

    return (
        <div className="md:max-w-7xl mx-auto">
            <Table className="bg-white">
                <TableHeader>
                    {table.getHeaderGroups().map(hg => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header, index) =>
                                index !== 4 ? (
                                    <TableHead key={header.id} className="text-xs text-gray-600">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ) : (
                                    <TableHead key={header.id} className="text-xs">
                                        <RoomDialog
                                            mode="add"
                                            onSubmit={async (data: Room) => {
                                                await createMutation.mutateAsync(roomSchema.parse(data));
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
                            <TableCell colSpan={3} className="text-center">
                                <LoaderCircle className="w-6 h-6 animate-spin mx-auto" />
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map(row => (
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
