import * as Updates from 'expo-updates';

// LOCAL
let Config = {
    EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
    EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
};

// STAGING
if (Updates.channel === 'staging') {
    Config.EXPO_PUBLIC_ENV = 'staging';
    Config.EXPO_PUBLIC_BACKEND_URL = 'http://103.57.221.203:5001';
}

if (Updates.channel === 'main') {
    Config.EXPO_PUBLIC_ENV = 'production';
    Config.EXPO_PUBLIC_BACKEND_URL = 'http://103.57.221.203:5001';
}

export default Config;
