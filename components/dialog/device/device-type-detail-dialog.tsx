import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Monitor, Calendar, FileText } from "lucide-react";
import clsx from "clsx";
import { getBaseStatusColor } from "@/utils/color";
import { DeviceDialogProps } from "@/types/dialog";
import { EBaseStatusViMap } from "@/enum/base";


const DeviceTypeDetailDialog = ({
    deviceType,
    open,
    onOpenChange,
}: DeviceDialogProps) => {
    if (!deviceType) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center">
                            <Monitor className="mr-2 h-5 w-5" />
                            Chi tiết loại thiết bị
                        </DialogTitle>
                        <Badge className={clsx("mr-4", getBaseStatusColor(deviceType.status))}>
                            {EBaseStatusViMap[deviceType.status] || "Không rõ"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" />
                            Mã loại thiết bị: <span className="font-medium ml-1">{deviceType.deviceTypeId}</span>
                        </div>
                        {deviceType.createdDate && (
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {format(new Date(deviceType.createdDate), "dd/MM/yyyy HH:mm")}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-2">
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Info className="mr-2 h-4 w-4" />
                                    Thông tin thiết bị
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Tên thiết bị</span>
                                        <span className="font-medium">{deviceType.name}</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-muted-foreground">Mô tả</span>
                                        <span className="font-medium">{deviceType.description || "Không có"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-sm flex items-center mb-3">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Thời gian
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày tạo</span>
                                        <span className="font-medium">
                                            {deviceType.createdDate
                                                ? format(new Date(deviceType.createdDate), "dd/MM/yyyy HH:mm")
                                                : "Không có"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground">Ngày cập nhật</span>
                                        <span className="font-medium">
                                            {deviceType.updatedDate
                                                ? format(new Date(deviceType.updatedDate), "dd/MM/yyyy HH:mm")
                                                : "Chưa cập nhật"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default DeviceTypeDetailDialog;
