import Config from '@/constants/config';
import createRepository from './CreateRepository';

export const CommonRepository = createRepository({
    login(fetch, payload: any) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/users/login`, {
            method: 'POST',
            data: payload,
        });
    },

    getMostRecentProductionPlan(fetch, machineCode: string) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/production-plans/most-recent-production-plan?machineCode=${machineCode}`, {
            method: 'GET',
        });
    },

    submitQcTestResult(fetch, payload: any) {
        return fetch<any>(`${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/qc-test-result`, {
            method: 'POST',
            data: payload,
        });
    }

});
