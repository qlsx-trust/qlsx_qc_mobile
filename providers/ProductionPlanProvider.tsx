import { CommonRepository } from '@/repositories/CommonRepository';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const initialState: StateType = {
    productionPlan: null,
    toleranceTime: 0,
    gapReviewTime: 0,
    updateProductionPlan() {},
};

export const ProductPlanContext = createContext<StateType>(initialState);

export interface ICheckItem {
    categoryCode: string;
    name: string;
    note: string;
    description?: string;
    status: string;
    reportFileUri: string;
    productImagePrototype?: string[];
}

export interface ProductCheckItem {
    id: string;
    avatarUrl: string;
    cavityCode: string;
    productCode: string;
    cavityIndex: number;
    productName: string;
    productDocuments: {
        documentName: string;
        documentUrl: string;
    }[];
    checkItems: {
        name: string;
        note: string;
        description?: string;
        categoryCode: string;
        productImagePrototype?: string[];
    }[];
    description: string;
    stepItem?: number;
    isSubmitted?: boolean;
}

export interface IProductionPlan {
    id: string;
    machineCode: string;
    productCode: string;
    productName: string;
    customerName: string;
    moldCode: string;
    moldNumber: string;
    materialCode: string;
    planDate: string;
    productionStartTime: string;
    productionEndTime: string;
    machineStartTime: string;
    duringProductionTime: number;
    unit: string;
    quantity: number;
    productionUnit: number;
    bagStandard: number;
    lotNumber: string;
    classification: string;
    planStatus: number;
    totalProductCount: number;
    defectiveProductCount: number;
    isReadyMaterial: boolean;
    isReadyMold: boolean;
    isReadyMachine: boolean;
    assignedToQC: string[];
    cavity: number;
    lastTimeQCChecked: string;
    lastTimeQCCheckedBy: string;
}

type StateType = {
    productionPlan: IProductionPlan | null;
    toleranceTime: number;
    gapReviewTime: number;
    updateProductionPlan(productionPlan: IProductionPlan | null): void;
};

export interface ProductionPlanProviderProps {
    children: ReactNode;
}

export const ProductionPlanContextProvider = ({ children }: ProductionPlanProviderProps) => {
    const [productionPlan, setProductionPlan] = useState<IProductionPlan | null>(null);
    const [toleranceTime, setToleranceTime] = useState<number>(0);
    const [gapReviewTime, setGapReviewTime] = useState<number>(0);

    useEffect(() => {
        getToleranceTime();
        getReviewTime();
    }, []);

    const checkVaidNumber = (checkNum: string) => {
        return /^\d+$/.test(checkNum);
    };

    const getToleranceTime = async () => {
        const response = await CommonRepository.getToleranceTimeQC();
        setToleranceTime(checkVaidNumber(response?.data?.value) ? +response?.data?.value : 0);
    };

    const getReviewTime = async () => {
        const response = await CommonRepository.getConfigReviewTimeQC();
        setGapReviewTime(checkVaidNumber(response?.data?.value) ? +response?.data?.value : 0);
    };

    const updateProductionPlan = (productionPlan: IProductionPlan) => {
        setProductionPlan(productionPlan);
    };

    const productionPlanContextValues = useMemo(
        () => ({
            productionPlan,
            toleranceTime,
            gapReviewTime,
            updateProductionPlan,
        }),
        [productionPlan, toleranceTime, gapReviewTime, updateProductionPlan]
    );

    return (
        <ProductPlanContext.Provider value={productionPlanContextValues}>
            {children}
        </ProductPlanContext.Provider>
    );
};

export const useProductionPlanContext = () => {
    const context = useContext(ProductPlanContext);
    if (context === undefined)
        throw new Error(
            'useProductionPlanContext should be used within a ProductionPlanContextProvider '
        );

    return context;
};
