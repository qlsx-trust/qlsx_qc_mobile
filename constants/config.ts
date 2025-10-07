import * as Updates from 'expo-updates';

// LOCAL
let Config = {
    EXPO_PUBLIC_ENV: "production",
    EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
};

// STAGING
if (Updates.channel === 'staging') {
    Config.EXPO_PUBLIC_ENV = 'staging';
    Config.EXPO_PUBLIC_BACKEND_URL = 'http://192.168.1.155:3000';
}

if (Updates.channel === 'main') {
    Config.EXPO_PUBLIC_ENV = 'production';
    Config.EXPO_PUBLIC_BACKEND_URL = 'http://192.168.1.155:3000';
}

export default Config;
