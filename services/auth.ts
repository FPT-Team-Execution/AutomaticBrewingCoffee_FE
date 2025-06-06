import { ApiResponse } from "@/types/api";
import { BaseService } from "./base"
import { Api } from "@/constants/api";
import { handleToken } from "@/utils/cookie";
import Cookies from 'js-cookie'
import { PagingParams, PagingResponse } from "@/types/paging";
import { Account } from "@/interfaces/account";

export const login = async (payload: { email: string; password: string }): Promise<ApiResponse> => {
    const response = await BaseService.post<ApiResponse>({ url: Api.LOGIN, payload });
    return response;
};


export const refreshToken = async () => {
    try {
        const currentRefreshToken = Cookies.get('refreshToken');
        if (!currentRefreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await BaseService.post({
            url: Api.REFRESH_TOKEN,
            payload: {
                refreshToken: currentRefreshToken
            }
        });

        if (response.isSuccess && response.statusCode === 200) {
            const { accessToken, refreshToken: newRefreshToken } = response.response;
            handleToken(accessToken, newRefreshToken);
            return accessToken;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};


export const getAccounts = async (params: PagingParams = {}): Promise<PagingResponse<Account>> => {
    return BaseService.getPaging<Account>({
        url: Api.ACCOUNTS,
        payload: params,
    });
};

export const getAccount = async (accountId: string) => {
    const response = await BaseService.getById({ url: Api.ACCOUNTS, id: accountId });
    return response;
}


export const banAccount = async (payload: { accountId: string, bannedReason: string }) => {
    const response = await BaseService.put({ url: Api.BAN_ACCOUNT, payload });
    return response;
}

export const unbanAccount = async (payload: { accountId: string, unbannedReason: string }) => {
    const response = await BaseService.put({ url: Api.UNBAN_ACCOUNT, payload });
    return response;
}


export const changePassword = async (payload: { oldPassword: string, newPassword: string }) => {
    const response = await BaseService.put({ url: Api.CHANGE_PASSWORD, payload });
    return response;
}

export const logout = async () => {
    Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName);
    });

    window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<ApiResponse> => {
    const response = await BaseService.get<ApiResponse>({ url: Api.GET_CURRENT_ACCOUNT });
    // @ts-ignore
    return response;
}