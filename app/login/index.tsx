import AppButton from '@/components/common/AppButton';
import AppSafeAreaBottom from '@/components/common/AppSafeAreaBottom';
import FlexBox from '@/components/common/FlexBox';
import { default as TextWrap, default as TextWrapper } from '@/components/common/TextWrap';
import { SCREEN_KEY, UserRole } from '@/constants/common';
import Config from '@/constants/config';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IUserInfo, useAuthContext } from '@/providers/UserProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { setSecretStorage } from '@/utils/KeychainHelper';
import { toast } from '@/utils/ToastMessage';
import { AntDesign, Feather } from '@expo/vector-icons';
import axios, { HttpStatusCode } from 'axios';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
const Logo = require('@/assets/iot-logo.jpeg');

interface IntroScreenProps {}
const IntroScreen: React.FC<IntroScreenProps> = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    const { loading, session, setSession, setUser } = useAuthContext();

    const [username, setUsername] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    // scan qc code
    const [isReady, setIsReady] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    const maskRowHeight = Math.round((layout.height - 250) / 20);
    const maskColWidth = (layout.width - 250) / 2;

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    function toggleCameraFacing() {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    }

    const onCameraReady = () => {
        setIsReady(true);
    };

    const handleBarCodeScan = (result: BarcodeScanningResult) => {
        if (result.data) {
            setShowCamera(false);
            setUsername(result.data);
            handleLogin(result.data);
        }
    };

    const resolveAfterSeconds = (time: number) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('resolved');
            }, time);
        });
    };

    const handleLogin = async (username: string) => {
        if (!username || loadingSubmit) return;
        try {
            Keyboard.dismiss();
            setLoadingSubmit(true);
            await resolveAfterSeconds(1000);
            const headers = {
                Accept: 'text/plain',
                'Content-Type': 'application/json',
            };

            const data = JSON.stringify(username);
            const response = await axios.post(
                `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/employee/login-qc`,
                data,
                {
                    headers,
                }
            );

            if (response.status != HttpStatusCode.Ok) {
                toast.error('Đăng nhập thất bại! Mã nhân viên không chính xác');
                return;
            }
            const userData: IUserInfo = response.data?.data;
            if (![UserRole.QC, UserRole.QCManager].includes(userData?.role)) {
                toast.error('Đăng nhập thất bại! Quyền truy cập bị từ chối');
                return;
            }

            setSession(userData);
            setUser(userData);
            await setSecretStorage(userData);

            toast.success('Đăng nhập thành công!');
            router.replace(SCREEN_KEY.home);
        } catch (error) {
            console.log('@@Error: ', error);
            toast.error('Đăng nhập thất bại! Mã nhân viên không chính xác');
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (!loading && session) return <Redirect href={SCREEN_KEY.home} />;

    return (
        <AppSafeAreaBottom style={styles.container} onLayout={onLayout}>
            {showCamera ? (
                <>
                    <View
                        style={[
                            styles.cameraWrapper,
                            {
                                width: layout.width,
                                height: layout.height,
                            },
                        ]}
                    >
                        <FlexBox
                            direction="row"
                            alignItems="flex-start"
                            justifyContent="flex-start"
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
                            style={[
                                styles.cameraContainer,
                                {
                                    width: layout.width,
                                    height: layout.height * 1,
                                },
                            ]}
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
            ) : (
                <View style={styles.container}>
                    <Image source={Logo} width={50} height={50} />
                    <TouchableOpacity onPress={() => setShowCamera(true)}>
                        <FlexBox gap={15} style={{ marginVertical: 30 }} direction="column">
                            <TextWrap fontSize={24} color={themeVariables.colors.primary}>
                                Nhấn quét mã đăng nhập
                            </TextWrap>
                            <AntDesign
                                name="scan1"
                                size={80}
                                color={themeVariables.colors.primary}
                            />
                        </FlexBox>
                    </TouchableOpacity>

                    <View style={{ marginVertical: 30 }}>
                        <TextWrapper>Hoặc nhập</TextWrapper>
                    </View>

                    <FlexBox
                        direction="column"
                        style={{ width: 400 }}
                        gap={10}
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <FlexBox justifyContent="space-between" style={{ width: '100%' }}>
                            <TextWrap h3>Mã nhân viên:</TextWrap>
                        </FlexBox>
                        <TextInput
                            style={[
                                styles.noteTitle,
                                { borderWidth: 1, borderColor: themeVariables.colors.borderColor },
                            ]}
                            value={username}
                            onChangeText={setUsername}
                            placeholderTextColor={themeVariables.colors.bgGrey}
                            placeholder="Mã nhân viên"
                        />
                    </FlexBox>
                    <FlexBox justifyContent="space-between" gap={16} style={{ marginTop: 30 }}>
                        <AppButton
                            disabled={!username || loadingSubmit}
                            isLoading={loadingSubmit}
                            viewStyle={{}}
                            label="Đăng nhập"
                            onPress={() => handleLogin(username)}
                        />
                    </FlexBox>
                </View>
            )}
        </AppSafeAreaBottom>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: themeVariables.colors.bgDefault,
            paddingHorizontal: 10,
        },

        noteTitle: {
            paddingHorizontal: 16,
            width: '100%',
            height: 48,
            fontSize: 16,
            fontWeight: '400',
            borderRadius: 6,
            color: themeVariables.colors.textDefault,
            backgroundColor: 'transparent',
        },
        loginButton: {
            width: 180,
        },
        cameraWrapper: {
            flex: 1,
            zIndex: 90,
            position: 'absolute',
            top: 0,
            left: 0,
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
        cameraContainer: {
            flex: 1,
            zIndex: 100,
            position: 'absolute',
            // top: 0,
            left: 0,
            top: '50%',
            transform: [{ translateY: '-50%' }],
            backgroundColor: themeVariables.colors.black50,
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
        closeBox: {
            height: 100,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: 20,
            right: 20,
            zIndex: 110,
        },
    });

export default IntroScreen;
