import * as Updates from 'expo-updates';

// LOCAL
let Config = {
    EXPO_PUBLIC_ENV: "production",
    EXPO_PUBLIC_BACKEND_URL: "https://moudingco.trustsoft.com.vn",
};

// STAGING
if (Updates.channel === 'staging') {
    Config.EXPO_PUBLIC_ENV = 'staging';
    Config.EXPO_PUBLIC_BACKEND_URL = 'https://moudingco.trustsoft.com.vn';
}

if (Updates.channel === 'main') {
    Config.EXPO_PUBLIC_ENV = 'production';
    Config.EXPO_PUBLIC_BACKEND_URL = 'https://moudingco.trustsoft.com.vn';
}

export default Config;
