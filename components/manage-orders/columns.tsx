import { Power, ShoppingCart, Store } from "lucide-react";
import { Badge } from "../ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/interfaces/order";
import { EOrderStatus, EOrderStatusViMap, EOrderType, EOrderTypeViMap, EPaymentGateway, EPaymentGatewayViMap } from "@/enum/order";
import { getOrderStatusColor } from "@/utils/color";
import { ActionDropdown } from "../common";
import Image from "next/image";
import { images } from "@/public/assets";

const getOrderTypeConfig = (orderType: EOrderType) => {
    switch (orderType) {
        case EOrderType.Immediate:
            return {
                color: "bg-blue-500",
                icon: <Store className="w-3 h-3 mr-1" />,
            };
        case EOrderType.PreOrder:
            return {
                color: "bg-amber-500",
                icon: <ShoppingCart className="w-3 h-3 mr-1" />,
            };
        default:
            return {
                color: "bg-gray-500",
                icon: <ShoppingCart className="w-3 h-3 mr-1" />,
            };
    }
};

export const columns = (onAction: (order: Order, action: "view") => void): ColumnDef<Order>[] => [
    {
        id: "orderId",
        header: "Mã đơn hàng",
        cell: ({ row }) => {
            const orderId = row.original.orderId || "";
            return <div className="font-medium text-center">ORD-{orderId.substring(0, 8)}</div>;
        },
        enableSorting: false,
    },
    {
        id: "orderType",
        header: "Loại đơn hàng",
        cell: ({ row }) => {
            const orderType = row.original.orderType as EOrderType;
            const orderTypeText = orderType ? EOrderTypeViMap[orderType] || "Không có" : "Không có";
            const { color, icon } = getOrderTypeConfig(orderType);
            return (
                <div className="flex justify-center items-center w-full">
                    <Badge className={`flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs ${color}`}>
                        {icon}
                        {orderTypeText}
                    </Badge>
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: "paymentGateway",
        header: "Phương thức thanh toán",
        cell: ({ row }) => {
            const paymentGateway: EPaymentGateway = row.original.paymentGateway;

            const paymentLogoMap: Record<EPaymentGateway, string> = {
                [EPaymentGateway.MoMo]: images.momo,
                [EPaymentGateway.VNPay]: images.vnpay,
            };

            const logoSrc = paymentLogoMap[paymentGateway];

            return (
                <div className="flex justify-center items-center w-full">
                    {logoSrc ? (
                        <Image src={logoSrc} alt={paymentGateway} width={28} height={28} className="object-contain" />
                    ) : (
                        <span>Không rõ</span>
                    )}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status: EOrderStatus = row.original.status;
            const statusText = EOrderStatusViMap[status] ?? "Không rõ";
            const statusColor = getOrderStatusColor(status);
            return (
                <div className="flex justify-center items-center w-full">
                    <Badge className={`flex items-center justify-center !w-fit !px-2 !py-[2px] !rounded-full !text-white !text-xs ${statusColor}`}>
                        <Power className="w-3 h-3 mr-1" />
                        {statusText}
                    </Badge>
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: "finalAmount",
        header: "Tổng số tiền",
        cell: ({ row }) => {
            const finalAmount = row.original.finalAmount;
            return <div className="text-center">{finalAmount.toLocaleString()} VND</div>;
        },
    },
    {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => (
            <ActionDropdown
                item={row.original}
                onCopy={(item) => navigator.clipboard.writeText(item.orderId)}
                onViewDetails={(item) => onAction(item, "view")}
            />
        ),
        enableSorting: false,
    },
];