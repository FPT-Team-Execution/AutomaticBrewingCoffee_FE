"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2, Edit, Plus, Settings2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createDeviceModel, updateDeviceModel, getDeviceTypes } from "@/services/device"
import type { DeviceDialogProps } from "@/types/dialog"
import type { DeviceFunction, DeviceType } from "@/interfaces/device"
import InfiniteScroll from "react-infinite-scroll-component"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import type { ErrorResponse } from "@/types/error"
import { deviceModelSchema } from "@/schema/device"
import { EFunctionParameterType } from "@/enum/device"
import { DeviceFunctionCard } from "@/components/common/device-function-card"

const initialFormData = {
    modelName: "",
    manufacturer: "",
    deviceTypeId: "",
    status: EBaseStatus.Active,
    deviceFunctions: [] as DeviceFunction[],
}

const DeviceModelDialog = ({ open, onOpenChange, onSuccess, deviceModel }: DeviceDialogProps) => {
    const { toast } = useToast()
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchDeviceTypes = async (pageNumber: number) => {
        try {
            const response = await getDeviceTypes({ page: pageNumber, size: 10 })
            if (pageNumber === 1) {
                setDeviceTypes(response.items)
            } else {
                setDeviceTypes((prev) => [...prev, ...response.items])
            }
            if (response.items.length < 10) {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Error fetching device types:", error)
            toast({
                title: "Lỗi",
                description: "Không tải được các loại thiết bị.",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        if (open) {
            fetchDeviceTypes(1)
        }
    }, [open])

    useEffect(() => {
        if (deviceModel) {
            setFormData({
                modelName: deviceModel.modelName || "",
                manufacturer: deviceModel.manufacturer || "",
                deviceTypeId: deviceModel.deviceTypeId || "",
                status: deviceModel.status || EBaseStatus.Active,
                deviceFunctions: deviceModel.deviceFunctions || [],
            })
        } else {
            setFormData(initialFormData)
        }
    }, [deviceModel, open])

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData)
            setPage(1)
            setDeviceTypes([])
            setHasMore(true)
        }
    }, [open])

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const addDeviceFunction = () => {
        setFormData((prev) => ({
            ...prev,
            deviceFunctions: [
                ...prev.deviceFunctions,
                {
                    name: "",
                    functionParameters: [],
                    status: EBaseStatus.Active,
                },
            ],
        }))
    }

    const removeDeviceFunction = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            deviceFunctions: prev.deviceFunctions.filter((_, i) => i !== index),
        }))
    }

    const handleDeviceFunctionChange = (index: number, field: string, value: string) => {
        setFormData((prev) => {
            const updatedFunctions = [...prev.deviceFunctions]
            updatedFunctions[index] = {
                ...updatedFunctions[index],
                [field]: value,
            }
            return { ...prev, deviceFunctions: updatedFunctions }
        })
    }

    const addFunctionParameter = (functionIndex: number) => {
        setFormData((prev) => {
            const updatedFunctions = [...prev.deviceFunctions]
            updatedFunctions[functionIndex].functionParameters.push({
                name: "",
                min: null,
                options: null,
                max: null,
                description: null,
                type: EFunctionParameterType.Text,
                default: "",
            })
            return { ...prev, deviceFunctions: updatedFunctions }
        })
    }

    const removeFunctionParameter = (functionIndex: number, paramIndex: number) => {
        setFormData((prev) => {
            const updatedFunctions = [...prev.deviceFunctions]
            updatedFunctions[functionIndex].functionParameters = updatedFunctions[functionIndex].functionParameters.filter(
                (_, i) => i !== paramIndex,
            )
            return { ...prev, deviceFunctions: updatedFunctions }
        })
    }

    const handleFunctionParameterChange = (functionIndex: number, paramIndex: number, field: string, value: any) => {
        setFormData((prev) => {
            const updatedFunctions = [...prev.deviceFunctions]
            updatedFunctions[functionIndex].functionParameters[paramIndex] = {
                ...updatedFunctions[functionIndex].functionParameters[paramIndex],
                [field]: value,
            }
            return { ...prev, deviceFunctions: updatedFunctions }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Since deviceFunctions is optional, we only validate the core fields
        const validationResult = deviceModelSchema.safeParse({
            modelName: formData.modelName,
            manufacturer: formData.manufacturer,
            deviceTypeId: formData.deviceTypeId,
            status: formData.status,
        })
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten()
            setErrors(fieldErrors)
            return
        }

        setErrors({})
        setLoading(true)
        try {
            const data = {
                modelName: formData.modelName,
                status: formData.status,
                manufacturer: formData.manufacturer,
                deviceTypeId: formData.deviceTypeId,
                deviceFunctions: formData.deviceFunctions.length > 0 ? formData.deviceFunctions : undefined,
            }
            if (deviceModel) {
                await updateDeviceModel(deviceModel.deviceModelId, data)
                toast({
                    title: "Thành công",
                    description: `Cập nhật mẫu thiết bị ${data.modelName} thành công.`,
                    variant: "success"
                })
            } else {
                await createDeviceModel(data)
                toast({
                    title: "Thành công",
                    description: `Thêm mẫu thiết bị ${data.modelName} thành công.`,
                    variant: "success"
                })
            }
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi xử lý mẫu thiết bị:", error)
            toast({
                title: "Có lỗi xảy ra khi xử lý mẫu thiết bị",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const loadMoreDeviceTypes = async () => {
        const nextPage = page + 1
        await fetchDeviceTypes(nextPage)
        setPage(nextPage)
    }

    const isUpdate = !!deviceModel

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto hide-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        {isUpdate ? (
                            <>
                                <Edit className="mr-2 h-5 w-5" />
                                Cập nhật mẫu thiết bị
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Thêm mẫu thiết bị
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="modelName" className="required">
                                Tên mẫu thiết bị
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="modelName"
                                placeholder="Nhập tên mẫu thiết bị"
                                value={formData.modelName}
                                onChange={(e) => handleChange("modelName", e.target.value)}
                                disabled={loading}
                                required
                            />
                            {errors.modelName && <p className="text-red-500 text-sm">{errors.modelName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="manufacturer">
                                Nhà sản xuất
                                <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="manufacturer"
                                placeholder="Nhập nhà sản xuất"
                                value={formData.manufacturer}
                                onChange={(e) => handleChange("manufacturer", e.target.value)}
                                disabled={loading}
                            />
                            {errors.manufacturer && <p className="text-red-500 text-sm">{errors.manufacturer}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deviceTypeId" className="asterisk">
                                Loại thiết bị
                            </Label>
                            <Select
                                value={formData.deviceTypeId}
                                onValueChange={(value) => handleChange("deviceTypeId", value)}
                                disabled={loading}
                            >
                                <SelectTrigger id="deviceTypeId">
                                    <SelectValue placeholder="Chọn loại thiết bị" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                    <InfiniteScroll
                                        dataLength={deviceTypes.length}
                                        next={loadMoreDeviceTypes}
                                        hasMore={hasMore}
                                        loader={<div className="p-2 text-center text-sm">Đang tải...</div>}
                                        scrollableTarget="select-content"
                                        style={{ overflow: "hidden" }}
                                    >
                                        {deviceTypes.map((deviceType) => (
                                            <SelectItem key={deviceType.deviceTypeId} value={deviceType.deviceTypeId}>
                                                {deviceType.name}
                                            </SelectItem>
                                        ))}
                                    </InfiniteScroll>
                                </SelectContent>
                            </Select>
                            {errors.deviceTypeId && <p className="text-red-500 text-sm">{errors.deviceTypeId}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="asterisk">
                                Trạng thái
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EBaseStatusViMap).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                        </div>
                    </div>

                    {/* Device Functions Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5" />
                                <Label className="text-base font-semibold">Chức năng thiết bị</Label>
                                <span className="text-sm text-muted-foreground">(tùy chọn)</span>
                            </div>
                            <Button type="button" variant="outline" onClick={addDeviceFunction} disabled={loading}>
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm chức năng
                            </Button>
                        </div>

                        {formData.deviceFunctions.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                                <Settings2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">Chưa có chức năng nào được thêm</p>
                                <Button type="button" variant="outline" onClick={addDeviceFunction} disabled={loading}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm chức năng đầu tiên
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.deviceFunctions.map((func, index) => (
                                    <DeviceFunctionCard
                                        key={index}
                                        func={func}
                                        index={index}
                                        onUpdate={handleDeviceFunctionChange}
                                        onRemove={removeDeviceFunction}
                                        onAddParameter={addFunctionParameter}
                                        onRemoveParameter={removeFunctionParameter}
                                        onUpdateParameter={handleFunctionParameterChange}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : isUpdate ? (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Cập nhật mẫu thiết bị
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Thêm mẫu thiết bị
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default DeviceModelDialog
