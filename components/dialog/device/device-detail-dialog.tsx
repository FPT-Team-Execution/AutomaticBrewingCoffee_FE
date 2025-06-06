"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { EDeviceStatusViMap } from "@/enum/device"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Info, Monitor, Calendar, FileText, Cpu, Tag, Wrench, HardDrive } from "lucide-react"
import clsx from "clsx"
import { getDeviceStatusColor } from "@/utils/color"
import type { DeviceDialogProps } from "@/types/dialog"
import { EBaseStatusViMap } from "@/enum/base"

const DeviceDetailDialog = ({ device, open, onOpenChange }: DeviceDialogProps) => {
    if (!device) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Monitor className="mr-2 h-5 w-5" />
                            Chi tiết thiết bị
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getDeviceStatusColor(device.status))}>
                            {EDeviceStatusViMap[device.status] || "Không rõ"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã thiết bị: <span className="font-medium ml-1">{device.deviceId}</span>
                        </div>
                        {device.createdDate && (
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(device.createdDate), "dd/MM/yyyy HH:mm")}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-2">
                        {/* Thông tin cơ bản */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin cơ bản
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên thiết bị</span>
                                        <span className="font-medium">{device.name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Số serial</span>
                                        <span className="font-medium">{device.serialNumber || "Không có"}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-muted-foreground">Mô tả</span>
                                        <span className="font-medium">{device.description || "Không có"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin mẫu thiết bị */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <HardDrive className="mr-2 h-4 w-4" />
                                    Thông tin mẫu thiết bị
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên mẫu</span>
                                        <div className="flex items-center mt-1">
                                            <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">{device.deviceModel?.modelName || "Không có"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Nhà sản xuất</span>
                                        <div className="flex items-center mt-1">
                                            <Wrench className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">{device.deviceModel?.manufacturer || "Không có"}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Loại thiết bị</span>
                                        <div className="flex items-center mt-1">
                                            <Cpu className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">{device.deviceModel?.deviceType?.name || "Không có"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Trạng thái mẫu</span>
                                        <Badge
                                            variant="outline"
                                            className={clsx(
                                                "mt-1 w-fit",
                                                device.deviceModel?.status === "Active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800",
                                            )}
                                        >
                                            {device.deviceModel?.status ? EBaseStatusViMap[device.deviceModel.status] : "Không có"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin thời gian */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Thông tin thời gian
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày tạo</span>
                                        <div className="flex items-center mt-1">
                                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">
                                                {device.createdDate ? format(new Date(device.createdDate), "dd/MM/yyyy HH:mm") : "Không có"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày cập nhật</span>
                                        <div className="flex items-center mt-1">
                                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                            <span className="font-medium">
                                                {device.updatedDate
                                                    ? format(new Date(device.updatedDate), "dd/MM/yyyy HH:mm")
                                                    : "Chưa cập nhật"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default DeviceDetailDialog
