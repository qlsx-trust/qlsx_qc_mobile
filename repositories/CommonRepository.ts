import Config from '@/constants/config';
import createRepository from './CreateRepository';
import { ProductCheckItem } from '@/providers/ProductionPlanProvider';
import { IProduct } from '@/types/product';

export const CommonRepository = createRepository({
    login(fetch, payload: any) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/users/login`, {
            method: 'POST',
            data: payload,
        });
    },

    getMostRecentProductionPlan(fetch, machineCode: string) {
        return fetch<any>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plans/most-recent-production-plan?machineCode=${machineCode}`,
            {
                method: 'GET',
            }
        );
    },

    submitQcTestResult(fetch, payload: any) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/qc-test-result`, {
            method: 'POST',
            data: payload,
        });
    },

    getCheckItemProduct(fetch, productCode: string) {
        return fetch<ProductCheckItem>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/product-management/code/${productCode}`,
            {
                method: 'GET',
            }
        );
    },

    getListProduct(fetch, payload) {
        return fetch<any>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/product-management?Keyword=${payload.Keyword}&Skip=${payload.Skip}&Take=${payload.Take}`,
            {
                method: 'GET',
            }
        );
    },

    getProductDetail(fetch, id: string) {
        return fetch<IProduct>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/product-management/${id}`,
            {
                method: 'GET',
            }
        );
    },
    updateProductDetail(fetch, id: string, payload: any) {
        return fetch<IProduct>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/product-management/${id}`,
            {
                method: 'PUT',
                data: payload,
            }
        );
    },

    createProductDetail(fetch, payload: any) {
        return fetch<IProduct>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/product-management`, {
            method: 'POST',
            data: payload,
        });
    },

    getListProductionPlan(fetch, payload) {
        return fetch<any>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plans/search?Keyword=${payload.Keyword}&Skip=${payload.Skip}&Take=${payload.Take}`,
            {
                method: 'GET',
            }
        );
    },

    assignQCProductPlan(fetch, payload: any) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plan-qcassign`, {
            method: 'POST',
            data: payload,
        });
    },

    deleteAssignQCProductPlan(fetch, payload: any) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plan-qcassign`, {
            method: 'DELETE',
            data: payload,
        });
    },
});
