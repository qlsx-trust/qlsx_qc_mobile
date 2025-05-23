import SplashImage from '@/assets/splash.svg';
import ThreeDotsAnimation from '@/components/AnimationIcon/ThreeDotsPulse';
import TextWrap from '@/components/common/TextWrap';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import React, { useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
const Splash = require('@/assets/splash.png');

const LoadingScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    return (
        <View style={[styles.container, { height: layout.height }]} onLayout={onLayout}>
            <ImageBackground
                style={[
                    styles.backgroundImage,
                    {
                        width: layout.width,
                        height: layout.height,
                    },
                ]}
                resizeMode="cover"
                source={Splash}
            >
                {/* <SplashImage style={styles.image} width={imageWidth} height="100%" /> */}
                <View style={styles.wrapContent}>
                    <TextWrap
                        color={themeVariables.colors.textOnImageStrong}
                        style={styles.textHeader}
                    >
                        Vui lòng đợi trong giây lát, Dữ liệu đang được xử lý
                    </TextWrap>
                    <ThreeDotsAnimation />
                </View>
            </ImageBackground>
        </View>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            zIndex: 100,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        backgroundImage: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: themeVariables.colors.textDefault,
        },
        image: {
            flex: 1,
            width: '100%',
        },
        wrapContent: {
            position: 'absolute',
            top: '50%',
        },

        textHeader: {
            fontSize: 13,
            fontStyle: 'normal',
            fontWeight: '600',
            maxWidth: 250,
            textAlign: 'center',
        },
    });

export default LoadingScreen;
