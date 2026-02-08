"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { LoaderCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/layouts/Pagination";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import { RoomTypeDialog } from "./RoomTypeDialog";
import { useRoomTypes, useDeleteRoomType, useUpdateRoomType, useCreateRoomType } from "../hooks/useRoomTypes";
import { RoomType, roomTypeSchema } from "../types/roomType.types";

export const RoomTypeTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useRoomTypes(page, limit);
  const createMutation = useCreateRoomType();
  const updateMutation = useUpdateRoomType();
  const deleteMutation = useDeleteRoomType();

  const table = useReactTable({
    data: data?.data ?? [],
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "description", header: "Description" },
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
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id}>
              {hg.headers.map((header, index) =>
                index !== 2 ? (
                  <TableHead key={header.id} className="text-xs text-gray-600">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ) : (
                  <TableHead key={header.id} className="text-xs">
                    <RoomTypeDialog
                      mode="add"
                      onSubmit={(data: RoomType) => {
                        createMutation.mutate(roomTypeSchema.parse(data));
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
                {row.getVisibleCells().map((cell, index) =>
                  index !== 2 ? (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ) : (
                    <TableCell key={cell.id}>
                      <ConfirmDeleteDialog
                        entityName={`${row.original.name} - Room Type`}
                        loading={deleteMutation.isPending}
                        onConfirm={() =>
                          deleteMutation.mutate(row.original.id!)
                        }
                      />

                      <RoomTypeDialog
                        mode="edit"
                        initialData={row.original}
                        onSubmit={(data: RoomType) => {
                          updateMutation.mutate(roomTypeSchema.parse(data));
                        }}
                        trigger={
                          <Button variant="ghost" className="text-gray-400 hover:text-gray-400 cursor-pointer float-right size-7">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </TableCell>
                  )
                )}
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
