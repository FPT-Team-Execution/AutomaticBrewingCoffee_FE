"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/hooks/use-debounce";
import { ConfirmDeleteDialog, ExportButton, NoResultsRow, Pagination, RefreshButton, SearchInput } from "@/components/common";
import { multiSelectFilter } from "@/utils/table";
import { useToast } from "@/hooks/use-toast";
import { DeviceFilter } from "@/components/manage-devices/filter";
import { FilterBadges } from "@/components/manage-devices/filter-badges";
import { columns } from "@/components/manage-kiosks/manage-kiosk-versions/columns";
import { KioskVersion } from "@/interfaces/kiosk";
import { getKioskVersions, deleteKioskVersion } from "@/services/kiosk";
import { KioskVersionDialog } from "@/components/dialog/kiosk";
import { useRouter } from "next/navigation";
import { ErrorResponse } from "@/types/error";

const ManageKioskVersions = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState<boolean>(true);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [kioskVersions, setKioskVersions] = useState<KioskVersion[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [sorting, setSorting] = useState<SortingState>([{ id: "createdDate", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<any>({});

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedKioskVersion, setSelectedKioskVersion] = useState<KioskVersion | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [kioskVersionToDelete, setKioskVersionToDelete] = useState<KioskVersion | null>(null);

    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const isInitialMount = useRef(true);

    // Gộp đồng bộ tất cả bộ lọc trong một useEffect
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return; // Bỏ qua lần đầu tiên khi mount
        }
        table.getColumn("versionTitle")?.setFilterValue(debouncedSearchValue || undefined);
        table.getColumn("status")?.setFilterValue(statusFilter || undefined);
    }, [debouncedSearchValue, statusFilter]);

    const fetchKioskVersions = useCallback(async () => {
        try {
            setLoading(true);

            const versionTitleFilter = columnFilters.find((filter) => filter.id === "versionTitle");
            const filterBy = versionTitleFilter ? "versionTitle" : undefined;
            const filterQuery = versionTitleFilter?.value as string | undefined;

            const statusFilterValue = columnFilters.find((filter) => filter.id === "status")?.value as string | undefined;

            const sortBy = sorting.length > 0 ? sorting[0]?.id : undefined;
            const isAsc = sorting.length > 0 ? !sorting[0]?.desc : undefined;

            const response = await getKioskVersions({
                filterBy,
                filterQuery,
                page: currentPage,
                size: pageSize,
                sortBy,
                isAsc,
                status: statusFilterValue,
            });

            setKioskVersions(response.items);
            setTotalItems(response.total);
            setTotalPages(response.totalPages);
        } catch (error) {
            const err = error as ErrorResponse;
            console.error("không thể lấy danh sách kiosk version:", err);
            toast({
                title: "Lỗi khi lấy danh sách kiosk version",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, columnFilters, sorting, toast]);

    // Chỉ gọi fetchKioskVersions khi mount và khi các giá trị thay đổi
    useEffect(() => {
        if (isInitialMount.current) {
            fetchKioskVersions(); // Gọi lần đầu khi mount
            isInitialMount.current = false;
        } else {
            fetchKioskVersions(); // Gọi khi có thay đổi thực sự
        }
    }, [fetchKioskVersions, currentPage, pageSize, sorting, columnFilters]);

    const handleSuccess = () => {
        fetchKioskVersions();
        setDialogOpen(false);
        setSelectedKioskVersion(undefined);
    };

    const handleEdit = (kioskVersion: KioskVersion) => {
        setSelectedKioskVersion(kioskVersion);
        setDialogOpen(true);
    };

    const handleViewDetails = (kioskVersion: KioskVersion) => {
        router.push(`/manage-kiosk-versions/${kioskVersion.kioskVersionId}`);
    };

    const handleDelete = (kioskVersion: KioskVersion) => {
        setKioskVersionToDelete(kioskVersion);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!kioskVersionToDelete) return;
        try {
            await deleteKioskVersion(kioskVersionToDelete.kioskVersionId);
            toast({
                title: "Thành công",
                description: `Phiên bản kiosk đã được xóa.`,
            });
            fetchKioskVersions();
        } catch (error: unknown) {
            const err = error as ErrorResponse;
            console.error("Lỗi khi xóa kiosk version:", err);
            toast({
                title: "Lỗi khi thêm xóa kiosk version",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setKioskVersionToDelete(null);
        }
    };

    const handleAdd = () => {
        setSelectedKioskVersion(undefined);
        setDialogOpen(true);
    };

    const clearAllFilters = () => {
        setStatusFilter("");
        setSearchValue("");
        table.resetColumnFilters();
    };

    const hasActiveFilters = statusFilter !== "" || searchValue !== "";

    const table = useReactTable({
        data: kioskVersions,
        columns: columns({
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onDelete: handleDelete,
        }),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: { pageIndex: currentPage - 1, pageSize },
        },
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
        pageCount: totalPages,
        filterFns: { multiSelect: multiSelectFilter },
    });

    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    useEffect(() => {
        setCurrentPage(1);
    }, [columnFilters]);


    return (
        <div className="w-full">
            <div className="flex flex-col space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý phiên bản kiosk</h2>
                        <p className="text-muted-foreground">Quản lý và giám sát các phiên bản của kiosk.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButton loading={loading} />
                        <RefreshButton loading={loading} toggleLoading={fetchKioskVersions} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center py-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <SearchInput
                            loading={loading}
                            placeHolderText="Tìm kiếm phiên bản..."
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                        />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <DeviceFilter
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            clearAllFilters={clearAllFilters}
                            hasActiveFilters={hasActiveFilters}
                            loading={loading}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Cột <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table.getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id === "kioskVersionId" ? "Mã phiên bản" :
                                                column.id === "versionTitle" ? "Tiêu đề phiên bản" :
                                                    column.id === "versionNumber" ? "Số phiên bản" :
                                                        column.id === "status" ? "Trạng thái" :
                                                            column.id === "createdDate" ? "Ngày tạo" :
                                                                column.id === "updatedDate" ? "Ngày cập nhật" : column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleAdd}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Thêm
                        </Button>
                    </div>
                </div>

                <FilterBadges
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    hasActiveFilters={hasActiveFilters}
                />

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-center">
                                            {header.isPlaceholder ? null : (
                                                header.column.getCanSort() ? (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() ? (
                                                            header.column.getIsSorted() === "asc" ? " ↑" : " ↓"
                                                        ) : null}
                                                    </Button>
                                                ) : (
                                                    flexRender(header.column.columnDef.header, header.getContext())
                                                )
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: pageSize }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                                        {columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { } }).map((column, cellIndex) => (
                                            <TableCell key={`skeleton-cell-${cellIndex}`}>
                                                {column.id === "kioskVersionId" ? (
                                                    <Skeleton className="h-5 w-24 mx-auto" />
                                                ) : column.id === "versionTitle" ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-40" />
                                                    </div>
                                                ) : column.id === "status" ? (
                                                    <Skeleton className="h-6 w-24 rounded-full mx-auto" />
                                                ) : column.id === "createdDate" || column.id === "updatedDate" ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Skeleton className="h-4 w-4 rounded-full" />
                                                        <Skeleton className="h-5 w-24" />
                                                    </div>
                                                ) : column.id === "actions" ? (
                                                    <div className="flex justify-center">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                    </div>
                                                ) : (
                                                    <Skeleton className="h-5 w-full" />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : kioskVersions.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <NoResultsRow columns={columns({ onViewDetails: () => { }, onEdit: () => { }, onDelete: () => { } })} />
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Pagination
                    loading={loading}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={totalItems}
                    totalPages={totalPages}
                />
            </div>
            <KioskVersionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleSuccess}
                kioskVersion={selectedKioskVersion}
            />
            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                description={`Bạn có chắc chắn muốn xóa phiên bản kiosk "${kioskVersionToDelete?.versionTitle}"? Hành động này không thể hoàn tác.`}
                onConfirm={confirmDelete}
                onCancel={() => setKioskVersionToDelete(null)}
            />
        </div>
    );
};

export default ManageKioskVersions;