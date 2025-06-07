export interface IProduct {
    id: string;
    avatarUrl: string;
    cavityCode: string;
    productCode: string;
    cavityIndex: number;
    productName: string;
    productDocuments: [];
    checkItems: IProductCheckItem[];
    description: string;
    isHasCavity: boolean;
    isSubmitted?: boolean;
}

export interface IProductCheckItem {
    categoryCode: string;
    name: string;
    note: string;
    status?: string;
    reportFileUri?: string;
    productImagePrototype?: string[];
}

export interface IProductDocument {
    documentName: string;
    documentUrl: string;
}
