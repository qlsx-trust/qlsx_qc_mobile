import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import Feather from '@expo/vector-icons/Feather';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ScanQRCodeIcon from '@/assets/qr-code-scanner.svg';
import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrapper from '@/components/common/TextWrap';
import ConfirmScanCodeModal from '@/components/home/ConfirmScanCodeModal';
import ListProductPlanForQC from '@/components/product/ListProductPlanForQC';
import { BUTTON_COMMON_TYPE, SCREEN_KEY, UserRole } from '@/constants/common';
import { useAuthContext } from '@/providers/UserProvider';
import { AntDesign } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
const Logo = require('@/assets/iot-logo.jpeg');

const HomeScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    const { logout, user } = useAuthContext();
    const [isReady, setIsReady] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const { width } = Dimensions.get('window');
    const maskRowHeight = Math.round((Dimensions.get('window').height - 250) / 20);
    const maskColWidth = (width - 250) / 2;

    const [scanResult, setScanResult] = useState<string>('');
    const [showConfirmResultCode, setShowConfirmResultCode] = useState<boolean>(false);

    const managerQc = user?.role == UserRole.QCManager;

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

    const handleManageProduct = () => {
        router.push(SCREEN_KEY.manageProduct);
    };
    const handlePlanAssignment = () => {
        router.push(SCREEN_KEY.assignPlanQC);
    };

    const handleEmployee = () => {
        router.push(SCREEN_KEY.employee);
    };

    return (
        // <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container}>
            <FlexBox
                gap={20}
                height={'100%'}
                width={'100%'}
                direction="column"
                justifyContent="flex-start"
                alignItems="center"
                style={{ paddingVertical: 50 }}
            >
                {showCamera && (
                    <>
                        <View style={[styles.cameraWrapper]}>
                            <FlexBox
                                direction="row"
                                alignItems="center"
                                gap={20}
                                style={styles.closeBox}
                            >
                                <TouchableOpacity onPress={toggleCameraFacing}>
                                    <Feather
                                        name="rotate-ccw"
                                        size={30}
                                        color={themeVariables.colors.textOnImageStrong}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowCamera(false)}>
                                    <AntDesign
                                        name="close"
                                        size={30}
                                        color={themeVariables.colors.textOnImageStrong}
                                    />
                                </TouchableOpacity>
                            </FlexBox>
                            <CameraView
                                barcodeScannerSettings={{
                                    barcodeTypes: ['qr'],
                                }}
                                onBarcodeScanned={isReady ? handleBarCodeScan : undefined}
                                onCameraReady={onCameraReady}
                                style={[styles.cameraContainer]}
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
                                        <View style={[{ width: maskColWidth }, styles.maskFrame]} />
                                        <View style={styles.maskInner} />
                                        <View style={[{ width: maskColWidth }, styles.maskFrame]} />
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
                )}
                
                {managerQc &&   <Image source={Logo} width={50} height={50}/>}
                <FlexBox direction="row" justifyContent="center" alignItems="center">
                    <TextWrapper fontSize={18}>
                        {managerQc ? 'Quản lý: ' : 'Nhân viên: '}
                    </TextWrapper>
                    <TextWrapper fontSize={24} color={themeVariables.colors.primary}>
                        {user?.userName},{user?.fullName}
                    </TextWrapper>
                </FlexBox>

                {!managerQc && <ListProductPlanForQC />}

                <AppButton
                    label="Quét mã CTSX"
                    onPress={handleScanScreen}
                    viewStyle={{ width: '80%', marginTop: 10, marginBottom: managerQc ? 0 : 30 }}
                    labelStyle={{ fontSize: 18 }}
                    variant={BUTTON_COMMON_TYPE.PRIMARY_OUTLINE}
                />
                {managerQc && (
                    <>
                        <AppButton
                            label="Phân công CTSX"
                            onPress={handlePlanAssignment}
                            viewStyle={{ width: '80%', marginTop: 20 }}
                            labelStyle={{ fontSize: 18 }}
                            variant={BUTTON_COMMON_TYPE.PRIMARY_OUTLINE}
                        />

                        <AppButton
                            label="Thiết lập tiêu chí đánh giá ngoại quan"
                            onPress={handleManageProduct}
                            viewStyle={{ width: '80%', marginTop: 20 }}
                            labelStyle={{ fontSize: 18 }}
                            variant={BUTTON_COMMON_TYPE.PRIMARY_OUTLINE}
                        />

                        <AppButton
                            label="Quản lý nhân viên QC"
                            onPress={handleEmployee}
                            viewStyle={{ width: '80%', marginTop: 20 }}
                            labelStyle={{ fontSize: 18 }}
                            variant={BUTTON_COMMON_TYPE.PRIMARY_OUTLINE}
                        />
                    </>
                )}

                <AppButton
                    label="Đăng xuất"
                    onPress={handleLogout}
                    viewStyle={{
                        width: '80%',
                        marginTop: 20,
                        position: 'absolute',
                        bottom: 0,
                    }}
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
        // </KeyboardAvoidingView>
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
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: 20,
            right: 20,
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
            // top: 0,
            left: 0,
            top: '50%',
            transform: [{ translateY: '-50%' }],
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height * 1,
            backgroundColor: themeVariables.colors.black50,
        },

        cameraWrapper: {
            flex: 1,
            zIndex: 90,
            position: 'absolute',
            top: 0,
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
