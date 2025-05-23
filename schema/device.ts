import { EBaseStatus } from "@/enum/base";
import { EDeviceStatus, EFunctionParameterType } from "@/enum/device";
import { z } from "zod";

export const deviceTypeSchema = z.object({
    name: z.string().min(1, "Tên loại thiết bị không được để trống."),
    status: z.enum([EBaseStatus.Active, EBaseStatus.Inactive], { message: "Vui lòng chọn trạng thái cho loại thiết bị." }),
    description: z.string().optional(),
});


export const deviceModelSchema = z.object({
    modelName: z.string().min(1, "Tên mẫu thiết bị là bắt buộc"),
    manufacturer: z.string().min(1, "Nhà sản xuất là bắt buộc"),
    deviceTypeId: z.string().min(1, "Loại thiết bị là bắt buộc"),
    status: z.nativeEnum(EBaseStatus),
    deviceFunctions: z.array(
        z.object({
            name: z.string().min(1, "Tên chức năng là bắt buộc"),
            status: z.nativeEnum(EBaseStatus),
            functionParameters: z.array(
                z.object({
                    name: z.string().min(1, "Tên tham số là bắt buộc"),
                    min: z.string().nullable().optional(),
                    max: z.string().nullable().optional(),
                    options: z.array(z.string()).nullable().optional(),
                    description: z.string().nullable().optional(),
                    type: z.nativeEnum(EFunctionParameterType),
                    default: z.string().min(1, "Giá trị mặc định là bắt buộc"),
                })
            ).optional(),
        })
    ).optional(),
});

export const deviceSchema = z.object({
    name: z.string().min(1, "Tên loại thiết bị không được để trống."),
    status: z.enum([EDeviceStatus.Maintain, EDeviceStatus.Stock, EDeviceStatus.Working], { message: "Vui lòng chọn trạng thái cho thiết bị." }),
    serialNumber: z.string().min(1, "Số serial không được để trống."),
    deviceModelId: z.string().min(1, "Vui lòng chọn mẫu thiết bị."),
    description: z.string().optional(),
});
