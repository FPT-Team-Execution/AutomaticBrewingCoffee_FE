import { ColumnDef } from "@tanstack/react-table";
import { MenuProductMapping } from "@/interfaces/menu";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const columns = ({
    onDelete,
    onOrderChange,
}: {
    onDelete: (mapping: MenuProductMapping) => void;
    onOrderChange: (changes: { [key: string]: number }) => void;
}): ColumnDef<MenuProductMapping>[] => [
        {
            id: "image",
            header: "Hình ảnh",
            cell: ({ row }) => (
                <img
                    src={row.original.product?.imageUrl || "/placeholder.svg"}
                    alt={row.original.product?.name || "Không có tên"}
                    className="h-10 w-10 rounded-md object-cover mx-auto"
                />
            ),
            enableHiding: true,
        },
        {
            id: "name",
            header: "Tên sản phẩm",
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.product?.name || "Không có tên"}
                </div>
            ),
            enableHiding: true,
        },
        {
            id: "price",
            header: "Giá (VND)",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.product?.price?.toLocaleString() || "0"}
                </div>
            ),
            enableHiding: true,
        },
        {
            id: "order",
            header: "Thứ tự",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.displayOrder ?? ""}
                </div>
            ),
            enableHiding: true,
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            enableHiding: true,
        },
    ];