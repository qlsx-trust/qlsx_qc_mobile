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

    loginCode(fetch, payload: any) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/employee/login-qc`, {
            method: 'POST',
            data: JSON.stringify(payload),
            headers: {
                Accept: 'text/plain',
                'Content-Type': 'application/json',
            },
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

    getMostRecentProductionPlanById(fetch, planId: string) {
        return fetch<any>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plans/${planId}/details`,
            {
                method: 'GET',
            }
        );
    },

    getToleranceTimeQC(fetch) {
        return fetch<any>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/setting-config/tolerance-time-qc`,
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


    qcPickUpItem(fetch, planId: string) {
        return fetch<ProductCheckItem>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plans/${planId}/qc-pick-up`,
            {
                method: 'PUT',
            }
        );
    },

     qcPickDownItem(fetch, planId: string) {
        return fetch<ProductCheckItem>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plans/${planId}/qc-pick-down`,
            {
                method: 'PUT',
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
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plans/search?Keyword=${payload.Keyword}&Skip=${payload.Skip}&Take=${payload.Take}&ProductionStartTime=${payload.ProductionStartTime}&ProductionEndTime=${payload.ProductionEndTime}`,
            {
                method: 'GET',
            }
        );
    },

    getListProductionPlanQC(fetch, payload) {
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

    checkQCEmployeeCode(fetch, employeeQRCode: string) {
        return fetch<any>(
            `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/employee/get-employee-by-code?employeeQRCode=${employeeQRCode}`,
            {
                method: 'GET',
            }
        );
    },

    getQCEmployees(fetch) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/employee/list-qc`, {
            method: 'GET',
        });
    },

    deleteQCEmployees(fetch, employeeCode: string) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/employee/delete-employee-by-code?employeeCode=${employeeCode}`, {
            method: 'DELETE',
        });
    },

    deleteAssignQCProductPlan(fetch, payload: any) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plan-qcassign`, {
            method: 'DELETE',
            data: payload,
        });
    },

    getProductCavities(fetch, productCode: string) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/product-management/cavity/${productCode}`, {
            method: 'GET',
        });
    },
});
