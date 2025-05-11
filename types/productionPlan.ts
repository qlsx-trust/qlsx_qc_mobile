export interface IProductionPlan {
    id: string;
    machineCode: string;
    productCode: string;
    productName: string;
    assignedToQC: string[];
    planDate: string;
    productionStartTime: string;
    productionEndTime: string;
}
