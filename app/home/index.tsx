import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { isIOS } from '@/utils/Mixed';
import Feather from '@expo/vector-icons/Feather';
import { Dimensions, KeyboardAvoidingView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ScanQRCodeIcon from '@/assets/qr-code-scanner.svg';
import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrapper from '@/components/common/TextWrap';
import ConfirmScanCodeModal from '@/components/home/ConfirmScanCodeModal';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import { useAuthContext } from '@/providers/UserProvider';
import { AntDesign } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
const HomeScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    const { logout } = useAuthContext();
    const [isReady, setIsReady] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const { width } = Dimensions.get('window');
    const maskRowHeight = Math.round((Dimensions.get('window').height - 250) / 20);
    const maskColWidth = (width - 250) / 2;

    const [scanResult, setScanResult] = useState<string>('');
    const [showConfirmResultCode, setShowConfirmResultCode] = useState<boolean>(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const handleScanScreen = () => {
        setShowCamera(true);
    };

    function toggleCameraFacing() {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    }

    // Play beep sound
    const playBeep = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(require('../../assets/beep.mp3'));
            await sound.playAsync();
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const onCameraReady = () => {
        setIsReady(true);
      };

    const handleBarCodeScan = (result: BarcodeScanningResult) => {
        if (result.data) {
            // playBeep();
            setShowCamera(false);
            setScanResult(result.data);
            setShowConfirmResultCode(true);
        }
    };

    return (
        <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
            <SafeAreaView style={styles.container}>
                <FlexBox
                    gap={20}
                    height={'100%'}
                    width={'100%'}
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    {showCamera ? (
                        <>
                            <View style={[styles.cameraContainer]}>
                                <View style={styles.closeBox}>
                                    <TouchableOpacity
                                        onPress={toggleCameraFacing}
                                        style={styles.faceButton}
                                    >
                                        <Feather
                                            name="rotate-ccw"
                                            size={30}
                                            color={themeVariables.colors.textOnImageStrong}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setShowCamera(false)}
                                        style={styles.closeButton}
                                    >
                                        <AntDesign
                                            name="close"
                                            size={30}
                                            color={themeVariables.colors.textOnImageStrong}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <CameraView
                                    barcodeScannerSettings={{
                                        barcodeTypes: ['qr'],
                                    }}
                                    onBarcodeScanned={isReady ? handleBarCodeScan : undefined}
                                    onCameraReady={onCameraReady}

                                    style={[styles.camera, styles.main]}
                                    facing={facing}
                                    ratio={'1:1'}
                                    mute={true}
                                >
                                    <View style={styles.maskOutter}>
                                        <View
                                            style={[
                                                { flex: maskRowHeight },
                                                styles.maskRow,
                                                styles.maskFrame,
                                            ]}
                                        />
                                        <View style={[{ flex: 30 }, styles.maskCenter]}>
                                            <View
                                                style={[{ width: maskColWidth }, styles.maskFrame]}
                                            />
                                            <View style={styles.maskInner} />
                                            <View
                                                style={[{ width: maskColWidth }, styles.maskFrame]}
                                            />
                                        </View>
                                        <View
                                            style={[
                                                { flex: maskRowHeight },
                                                styles.maskRow,
                                                styles.maskFrame,
                                            ]}
                                        />
                                    </View>
                                </CameraView>
                            </View>
                        </>
                    ) : (
                        <>
                            <ScanQRCodeIcon width={300} height={300} />
                            <AppButton
                                label="Quét mã QR"
                                onPress={handleScanScreen}
                                viewStyle={{ width: 250, marginTop: 20 }}
                                variant={BUTTON_COMMON_TYPE.PRIMARY_OUTLINE}
                            />

                            <AppButton
                                label="Đăng xuất"
                                onPress={handleLogout}
                                viewStyle={{ width: 250, marginTop: 0 }}
                                variant={BUTTON_COMMON_TYPE.CANCEL}
                            />

                            {!permission && (
                                <>
                                    <TextWrapper>Không có quyền truy cập Camera</TextWrapper>
                                    <AppButton
                                        label="Cấp quyền"
                                        onPress={requestPermission}
                                        viewStyle={{ width: 150, height: 30 }}
                                        variant={BUTTON_COMMON_TYPE.CANCEL}
                                    />
                                </>
                            )}
                        </>
                    )}
                </FlexBox>

                {scanResult && showConfirmResultCode && (
                    <ConfirmScanCodeModal
                        scanResult={scanResult}
                        modalProps={{
                            visible: showConfirmResultCode,
                            onClose: () => setShowConfirmResultCode(false),
                        }}
                    />
                )}
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            backgroundColor: themeVariables.colors.bgDefault,
            width: '100%',
            height: '100%',
            position: 'relative',
        },
        main: {
            width: '100%',
            height: '100%',
        },
        camera: {
            flex: 1,
        },
        buttonContainer: {
            flex: 1,
            flexDirection: 'row',
            backgroundColor: 'transparent',
            margin: 64,
        },
        closeBox: {
            height: 100,
            backgroundColor: themeVariables.colors.black50,
        },
        closeButton: {
            position: 'absolute',
            top: 120,
            right: 20,
            zIndex: 110,
        },

        faceButton: {
            position: 'absolute',
            top: 120,
            right: 80,
            zIndex: 110,
        },

        flashButton: {
            position: 'absolute',
            top: 120,
            left: 20,
            zIndex: 110,
        },
        cameraContainer: {
            flex: 1,
            zIndex: 100,
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            backgroundColor: themeVariables.colors.black50,
        },
        maskOutter: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'space-around',
        },
        maskInner: {
            width: 250,
            backgroundColor: 'transparent',
            borderColor: 'white',
            borderWidth: 1,
        },
        maskFrame: {
            backgroundColor: 'rgba(1, 1, 1, 0.628)',
        },
        maskRow: {
            width: '100%',
        },
        maskCenter: { flexDirection: 'row' },
    });

export default HomeScreen;
