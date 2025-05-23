import AppButton from '@/components/common/AppButton';
import EmptyFolder from '@/components/common/EmptyList/EmptyFolder';
import FlatListCustom from '@/components/common/FlatListCustom';
import FlexBox from '@/components/common/FlexBox';
import { default as TextWrap, default as TextWrapper } from '@/components/common/TextWrap';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import Config from '@/constants/config';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { containerStyles, IThemeVariables } from '@/shared/theme/themes';
import { IEmployee } from '@/types/employee';
import { toast } from '@/utils/ToastMessage';
import { AntDesign, Feather } from '@expo/vector-icons';
import axios, { HttpStatusCode } from 'axios';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Keyboard,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const ManageEmployeeScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [recallEmployee, setRecallEmployee] = useState<number>(0);
    const [employeeQcCode, setEmployeeQcCode] = useState<string>('');
    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

    // scan qc code
    const [isReady, setIsReady] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const [errorCheckCode, setErrorCheckCode] = useState<string>('');

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
            // playBeep();
            setShowCamera(false);
            setErrorCheckCode('');
            setEmployeeQcCode(result.data);
        }
    };

    useEffect(() => {
        const getQCEmployees = async () => {
            try {
                setIsLoading(true);
                const response = await CommonRepository.getQCEmployees();
                if (response.data) {
                    setEmployees(response.data || []);
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };
        getQCEmployees();
    }, [recallEmployee]);

    const handleAddQC = async () => {
        if (!employeeQcCode) return;
        try {
            Keyboard.dismiss();
            setIsLoadingSubmit(true);

            const resCheck = await CommonRepository.checkQCEmployeeCode(employeeQcCode);
            if (resCheck.error) {
                setIsLoadingSubmit(false);
                setErrorCheckCode('Mã nhân viên không hợp lệ');
                return;
            }
            setErrorCheckCode('');
            const headers = {
                Accept: 'text/plain',
                'Content-Type': 'application/json',
            };

            const data = JSON.stringify(employeeQcCode);
            const response = await axios.post(
                `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/employee/login-qc`,
                data,
                {
                    headers,
                }
            );

            if (response.status != HttpStatusCode.Ok) {
                toast.error('Mã nhân viên không hợp lệ, Thêm nhân viên không thành công');
                return;
            }
            toast.success('Thêm nhân viên thành công');
            setEmployeeQcCode('');
            setRecallEmployee(new Date().getTime());
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    return (
        // <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container} onLayout={onLayout}>
            {showCamera && (
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
            )}

            <FlexBox
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                gap={15}
                style={styles.header}
            >
                <FlexBox justifyContent="space-between" style={{ width: '100%' }}>
                    <TouchableOpacity
                        onPress={() => {
                            router.back();
                        }}
                        style={{ padding: 4 }}
                    >
                        <FlexBox>
                            <AntDesign
                                name="arrowleft"
                                size={20}
                                color={themeVariables.colors.bgRevert}
                                style={{ marginRight: 5 }}
                            />

                            <TextWrapper fontSize={20} fontWeight="bold">
                                Quản lý nhân viên
                            </TextWrapper>
                        </FlexBox>
                    </TouchableOpacity>
                </FlexBox>
            </FlexBox>
            <FlexBox
                direction="column"
                width={'100%'}
                justifyContent="flex-start"
                alignItems="flex-start"
                style={styles.header}
            >
                <TextWrap style={styles.title}>Thêm nhân viên:</TextWrap>
                <TextInput
                    style={[
                        styles.textInput,
                        {
                            borderWidth: 1,
                            borderColor: themeVariables.colors.borderColor,
                        },
                    ]}
                    value={employeeQcCode}
                    onChangeText={setEmployeeQcCode}
                    placeholderTextColor={themeVariables.colors.bgGrey}
                    placeholder="Mã nhân viên"
                />
                {errorCheckCode && (
                    <TextWrap style={{ marginTop: 5 }} color={themeVariables.colors.danger}>
                        {errorCheckCode}
                    </TextWrap>
                )}
                <FlexBox justifyContent="space-between" style={{ width: '100%' }}>
                    <AppButton
                        viewStyle={styles.button}
                        label="Quét mã"
                        variant={BUTTON_COMMON_TYPE.CANCEL}
                        onPress={() => setShowCamera(true)}
                    />
                    <AppButton
                        disabled={isLoadingSubmit || !employeeQcCode}
                        isLoading={isLoadingSubmit}
                        viewStyle={styles.button}
                        label="Thêm"
                        onPress={() => handleAddQC()}
                    />
                </FlexBox>
            </FlexBox>
            <FlexBox
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                gap={10}
                style={{ paddingHorizontal: 20, width: '100%', maxHeight: layout.height - 300 }}
            >
                <TextWrap style={styles.title}>Danh sách nhân viên:</TextWrap>
                <FlatListCustom
                    isLoading={isLoading}
                    isLoadMore={false}
                    styleMore={{ width: '100%', marginBottom: 50 }}
                    onRefreshing={() => {
                        setRecallEmployee(new Date().getTime());
                    }}
                    listData={employees}
                    renderItemComponent={(item: IEmployee) => {
                        return (
                            <FlexBox
                                key={`employee-${item.employeeCode}`}
                                direction="column"
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                style={styles.productCardItem}
                            >
                                <TextWrapper style={{ width: '100%' }} fontSize={16}>
                                    {item.employeeCode},{item.fullName}
                                </TextWrapper>
                            </FlexBox>
                        );
                    }}
                    renderEmptyComponent={() => (
                        <EmptyFolder title="Không có nhân viên nào" description="" />
                    )}
                    onLoadMore={() => {}}
                />
            </FlexBox>
        </SafeAreaView>
        // </KeyboardAvoidingView>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            backgroundColor: themeVariables.colors.bgDefault,
            paddingVertical: 50,
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
        header: {
            width: '100%',
            paddingHorizontal: containerStyles.paddingHorizontal,
            marginBottom: 20,
        },
        productCardItem: {
            paddingVertical: 15,
            borderBottomWidth: 1,
            width: '100%',
            borderBottomColor: themeVariables.colors.borderLightColor,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 26,
        },
        description: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 20,
        },
        button: {
            width: '49%',
        },
        textInput: {
            width: '100%',
            padding: 12,
            overflow: 'scroll',
            height: 50,
            borderRadius: 12,
            borderStyle: 'solid',
            borderColor: themeVariables.colors.borderColor,
            borderWidth: 1,
            backgroundColor: themeVariables.colors.BackgroundInputArea,
            fontSize: 14,
            fontWeight: '400',
            color: themeVariables.colors.textDefault,
            marginTop: 10,
        },
        textArea: {
            width: '100%',
            padding: 12,
            overflow: 'scroll',
            height: 120,
            borderRadius: 12,
            borderStyle: 'solid',
            borderColor: themeVariables.colors.borderColor,
            borderWidth: 1,
            backgroundColor: themeVariables.colors.BackgroundInputArea,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
            color: themeVariables.colors.textDefault,
            marginTop: 10,
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
            // height: 0,
            position: 'absolute',
            top: 80,
            right: 20,
            zIndex: 110,
        },
    });

export default ManageEmployeeScreen;
