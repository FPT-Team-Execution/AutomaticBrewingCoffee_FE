import { BaseService } from "./base"
import { PagingParams, PagingResponse } from "@/types/paging";
import { Api } from "@/constants/api";
import { Organization } from "@/interfaces/organization";

export const getOrganizations = async (params: PagingParams = {}): Promise<PagingResponse<Organization>> => {
    return BaseService.getPaging<Organization>({
        url: Api.ORGANIZATIONS,
        payload: params,
    });
};

export const getOrganization = async (id: string) => {
    const response = await BaseService.getById({ url: Api.ORGANIZATIONS, id });
    return response;
}

export const createOrganization = async (payload: Partial<Organization>) => {
    const response = await BaseService.post({ url: Api.ORGANIZATIONS, payload });
    return response;
}

export const updateOrganization = async (id: string, payload: Partial<Organization>) => {
    console.log(id)
    const response = await BaseService.put({ url: `${Api.ORGANIZATIONS}/${id}`, payload });
    return response;
}

export const deleteOrganization = async (id: string) => {
    const response = await BaseService.delete({ url: `${Api.ORGANIZATIONS}/${id}` })
    return response;
}
