import { UserRole } from '@/constants/common';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

const initialState: StateType = {
    productionPlan: null,
    updateProductionPlan() {},
};

export const ProductPlanContext = createContext<StateType>(initialState);

export interface ICheckItem {
    categoryCode: string;
    name: string;
    note: string;
    status: string;
    reportFileUri: string;
    productImagePrototype?: string[]
}

export interface ProductCheckItem {
    id: string;
    avatarUrl: string;
    productCode: string;
    productName: string;
    productDocuments: {
        documentName: string;
        documentUrl: string;
    }[];
    checkItems: {
        name: string;
        note: string;
        categoryCode: string;
        productImagePrototype?: string[]
    }[];
    description: string;
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
    assignedToQC: string[]
}

type StateType = {
    productionPlan: IProductionPlan | null;
    updateProductionPlan(productionPlan: IProductionPlan | null): void;
};

export interface ProductionPlanProviderProps {
    children: ReactNode;
}

export const ProductionPlanContextProvider = ({ children }: ProductionPlanProviderProps) => {
    const [productionPlan, setProductionPlan] = useState<IProductionPlan | null>(null);

    const updateProductionPlan = (productionPlan: IProductionPlan) => {
        setProductionPlan(productionPlan);
    };

    const productionPlanContextValues = useMemo(
        () => ({
            productionPlan,
            updateProductionPlan,
        }),
        [productionPlan, updateProductionPlan]
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
