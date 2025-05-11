// enviroment data
export const KEY_THEME_APP = 'Theme-app';
export const KEY_AUTH_TOKEN = 'Basic-TK';
export const KEY_CAMERA_FLASH_MODE = 'Camera-flash-mode';
export const KEY_REQUEST_CAMERA_PERMISSION = 'request-camera-permission';
export const PATH_SERVER_MEDIA = '/uploads/products/';

export const ZOOM_SELECTS = [1, 1.5, 2];

export const ZOOM_CONFIG: any = {
    '1': 0,
    '1.5': 0.1,
    '2': 0.2,
};


export const TIMEOUT_REQUEST = {
    NORMAL: 2 * 60 * 1000
}


export enum OS {
    ANDROID = 'android',
    IOS = 'ios',
}

export const ACCESS_CAMERA = {
    granted: 'granted',
    denied: 'denied',
};

export const SCREEN_KEY = {
    login: 'login',
    home: 'home',
    product: 'product',
    manageProduct: 'manage-product',
    createProduct: 'create-product',
    assignPlanQC: 'assign-plan-qc',
};

export const SCREEN_STACK_DESCRIPTION = {
    [SCREEN_KEY.home]: 'Home Screen',
    [SCREEN_KEY.product]: 'Product Screen',
    [SCREEN_KEY.login]: 'Login Screen',
};

export const BUTTON_COMMON_TYPE = {
    CANCEL: 'cancel',
    CANCEL_BLACK: 'cancel-black',
    PRIMARY: 'primary',
    PRIMARY_OUTLINE: 'primary-outline',
    PRIMARY_WITH_CHILDREN: 'primary-with-children',
    PRIMARY_OUTLINE_WITH_CHILDREN: 'primary-outline-with-children',
    CANCEL_WITH_CHILDREN: 'cancel-with-children',
    DELETE_WITH_CHILDREN: 'cancel-black-with-children',
};

export const BUTTON_LOADING_ICON_COLOR = {
    [BUTTON_COMMON_TYPE.CANCEL]: '#333',
    [BUTTON_COMMON_TYPE.CANCEL_BLACK]: '#fff',
    [BUTTON_COMMON_TYPE.PRIMARY]: '#fff',
    [BUTTON_COMMON_TYPE.PRIMARY_OUTLINE]: '#333',
    [BUTTON_COMMON_TYPE.PRIMARY_WITH_CHILDREN]: '#fff',
    [BUTTON_COMMON_TYPE.PRIMARY_OUTLINE_WITH_CHILDREN]: '#333',
    [BUTTON_COMMON_TYPE.CANCEL_WITH_CHILDREN]: '#333',
    [BUTTON_COMMON_TYPE.DELETE_WITH_CHILDREN]: '#fff',
};

export enum UserRole {
    Admin,
    QC,
    Employee,
    Manager,
    MaterialSupply,
    MoldSupply,
    QCManager,
}


export const PAGE_SIZE = {
    DEFAULT: 15,
    MESSAGE_DEFAULT: 20,
    LOAD_DEFAULT: 20,
};