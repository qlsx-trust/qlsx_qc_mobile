import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import { PUB_TOPIC } from '@/constants/pubTopic';
import { IProductionPlan } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { IThemeVariables } from '@/shared/theme/themes';
import { IEmployee } from '@/types/employee';
import { PromiseAllSettled } from '@/utils/Mixed';
import { toast } from '@/utils/ToastMessage';
import { AntDesign, Entypo, Feather } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

interface IAssignQCModalProps {
    modalProps: CommonModalProps;
    productPlan?: IProductionPlan;
    onRecallListProductPlan: Function;
}

const AssignQCModal = ({ productPlan, onRecallListProductPlan, modalProps }: IAssignQCModalProps) => {
    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState<string>('');

    const [assignedQc, setAssignedQc] = useState<string[]>(productPlan?.assignedToQC || []);
    const [otherQcCode, setOtherQcCode] = useState<string>('');

    const [showOtherUser, setShowOtherUser] = useState<boolean>(false);
    const [errorCheckCode, setErrorCheckCode] = useState<string>('');
    // scan qc code
    const [isReady, setIsReady] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');

    const maskRowHeight = Math.round((layout.height - 250) / 20);
    const maskColWidth = (layout.width - 250) / 2;

    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [recallEmployee, setRecallEmployee] = useState<number>(0);

    useEffect(() => {
        const getQCEmployees = async () => {
            try {
                const response = await CommonRepository.getQCEmployees();
                if (response.data) {
                    setEmployees(response.data || []);
                }
            } catch (error) {}
        };
        getQCEmployees();
    }, [recallEmployee]);

    const selectEmployeeOptions = useMemo(() => {
        const data = (employees || []).map((employee) => {
            return {
                value: `${employee.employeeCode}`,
                title: `${employee.employeeCode},${employee.fullName}`,
            };
        });

        data.push({ value: 'other', title: 'Thêm nhân viên' });
        return data;
    }, [employees]);

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
            setOtherQcCode(result.data);
        }
    };

    const deleteAssignQc = async (userCode: string) => {
        try {
            Keyboard.dismiss();
            setIsLoadingDelete(userCode);
            const payload = {
                productionPlanId: productPlan?.id,
                qcAssign: userCode,
            };
            await CommonRepository.deleteAssignQCProductPlan(payload);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingDelete('');
        }
    };

    const handleAddQC = async (qcCode: string, needCheckEmployeeCode?: boolean) => {
        if (!qcCode) return;
        try {
            Keyboard.dismiss();
            setIsLoadingSubmit(true);

            if (needCheckEmployeeCode) {
                const resCheck = await CommonRepository.checkQCEmployeeCode(qcCode);
                if (resCheck.error) {
                    setIsLoadingSubmit(false);
                    setErrorCheckCode('Mã nhân viên không hợp lệ hoặc không tồn tại');
                    return;
                }
            }
            let isDeletedSuccess = false;
            if (assignedQc?.length) {
                const qcAssignedCodes = employees.filter((employee) =>
                    assignedQc.find((qc) => qc.includes(employee.employeeCode))
                );
                const removeAssigedQcpromises = qcAssignedCodes.map((qc) =>
                    deleteAssignQc(qc.employeeCode)
                );
                const res = await PromiseAllSettled(removeAssigedQcpromises);
                if (res?.length) isDeletedSuccess = true;
            }
            setErrorCheckCode('');
            const payload = {
                productionPlanId: productPlan?.id,
                qcAssign: qcCode,
            };
            const res = await CommonRepository.assignQCProductPlan(payload);
            if (!res.error) {
                onRecallListProductPlan();
                setRecallEmployee(new Date().getTime());
                toast.success('Phân công thành công');
                setAssignedQc([qcCode]);
                setOtherQcCode('');
            } else {
                toast.error('Phân công thất bại');
                if (isDeletedSuccess) setAssignedQc([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const getFullNameCodeQc = (qcCode: string) => {
        if (!qcCode) return 'Trống';
        const selectedEmployee = (employees || []).find(
            (employee) => employee.employeeCode == qcCode
        );
        if (!selectedEmployee) return qcCode;
        return `${selectedEmployee.employeeCode},${selectedEmployee.fullName}`;
    };

    return (
        <>
            <CommonModal {...modalProps} onLayoutProps={onLayout}>
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
                    <>
                        <FlexBox direction="column" width={'100%'}>
                            <TextWrap style={styles.header}>Phân công nhân viên</TextWrap>
                        </FlexBox>
                        <FlexBox
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            gap={5}
                            style={{ marginTop: 20, width: '100%' }}
                        >
                            <TextWrap
                                style={{
                                    ...styles.description,
                                    width: '100%',
                                    textAlign: 'left',
                                }}
                            >
                                Chọn nhân viên:
                            </TextWrap>
                            <FlexBox
                                style={{ width: '100%' }}
                                justifyContent="flex-start"
                                alignItems="flex-start"
                            >
                                <SelectDropdown
                                    key={assignedQc?.length}
                                    data={selectEmployeeOptions}
                                    disabled={isLoadingSubmit}
                                    onSelect={(selectedItem, index) => {
                                        if (selectedItem.value == 'other') {
                                            setShowOtherUser(true);
                                            setOtherQcCode('');
                                        } else {
                                            setShowOtherUser(false);
                                            // handle add QC
                                            handleAddQC(selectedItem.value);
                                        }
                                    }}
                                    renderButton={(selectedItem, isOpened) => {
                                        return (
                                            <View style={styles.dropdownButtonStyle}>
                                                <TextWrap style={styles.dropdownButtonTxtStyle}>
                                                    {(selectedItem && selectedItem.title) ||
                                                        'Chọn nhân viên'}
                                                </TextWrap>
                                                {isLoadingSubmit ? (
                                                    <ActivityIndicator />
                                                ) : (
                                                    <>
                                                        {isOpened ? (
                                                            <Entypo
                                                                name="chevron-small-up"
                                                                size={24}
                                                                color="black"
                                                            />
                                                        ) : (
                                                            <Entypo
                                                                name="chevron-small-down"
                                                                size={24}
                                                                color="black"
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </View>
                                        );
                                    }}
                                    renderItem={(item: any, index, isSelected) => {
                                        const isSelectedQc =
                                            isSelected ||
                                            assignedQc.find(
                                                (code: string) =>
                                                    code == item.value || code == item.title
                                            );
                                        return (
                                            <View
                                                style={{
                                                    ...styles.dropdownItemStyle,
                                                    ...(isSelectedQc && {
                                                        backgroundColor: '#D2D9DF',
                                                    }),
                                                    pointerEvents: isSelectedQc ? 'none' : 'auto',
                                                }}
                                            >
                                                <TextWrap style={styles.dropdownItemTxtStyle}>
                                                    {item.title}
                                                </TextWrap>
                                            </View>
                                        );
                                    }}
                                    showsVerticalScrollIndicator={false}
                                    dropdownStyle={styles.dropdownMenuStyle}
                                />
                            </FlexBox>
                        </FlexBox>

                        {showOtherUser && (
                            <FlexBox
                                direction="column"
                                width={'100%'}
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                style={{marginBottom: 20 }}
                            >
                                <TextWrap style={styles.description}>Mã nhân viên khác:</TextWrap>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            borderWidth: 1,
                                            borderColor: themeVariables.colors.borderColor,
                                        },
                                    ]}
                                    value={otherQcCode}
                                    onChangeText={setOtherQcCode}
                                    placeholderTextColor={themeVariables.colors.bgGrey}
                                    placeholder="Mã nhân viên"
                                />
                                {errorCheckCode && (
                                    <TextWrap
                                        style={{ marginTop: 5 }}
                                        color={themeVariables.colors.danger}
                                    >
                                        {errorCheckCode}
                                    </TextWrap>
                                )}
                                <FlexBox justifyContent="space-between" style={{ width: '100%', paddingHorizontal: 5 }}>
                                    <AppButton
                                        viewStyle={styles.button}
                                        label="Quét mã"
                                        variant={BUTTON_COMMON_TYPE.CANCEL}
                                        onPress={() => setShowCamera(true)}
                                    />
                                    <AppButton
                                        disabled={isLoadingSubmit || !otherQcCode}
                                        isLoading={isLoadingSubmit}
                                        viewStyle={styles.button}
                                        label="Thêm"
                                        onPress={() => handleAddQC(otherQcCode, true)}
                                    />
                                </FlexBox>
                            </FlexBox>
                        )}

                        <FlexBox
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                            gap={5}
                            style={{ width: '100%', paddingHorizontal: 0, marginBottom: 20, flexWrap: 'wrap' }}
                        >
                            <TextWrap style={styles.description}>
                                Nhân viên được phân công:
                            </TextWrap>
                            <TextWrap
                                fontSize={18}
                                color={
                                    assignedQc?.length
                                        ? themeVariables.colors.primary
                                        : themeVariables.colors.danger
                                }
                            >
                                {getFullNameCodeQc(assignedQc[0])}
                            </TextWrap>
                        </FlexBox>

                        <AppButton
                            variant={BUTTON_COMMON_TYPE.CANCEL}
                            viewStyle={styles.button}
                            label="Đóng"
                            onPress={() => modalProps.onClose()}
                        />
                    </>
                )}
            </CommonModal>
        </>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 26,
        },
        header: {
            fontSize: 24,
            fontWeight: '600',
        },
        description: {
            fontSize: 16,
            fontWeight: '400',
        },
        button: {
            width: '49%',
        },

        cameraWrapper: {
            flex: 1,
            zIndex: 90,
            // position: 'absolute',
            // top: 0,
            // left: 0,
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
        closeBox: {
            height: 250,
            position: 'absolute',
            top: -250,
            right: 80,
            zIndex: 110,
        },
        dropdownButtonStyle: {
            width: 300,
            marginBottom: 20,
            height: 50,
            backgroundColor: '#E9ECEF',
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 12,
        },
        dropdownButtonTxtStyle: {
            flex: 1,
            fontSize: 18,
            fontWeight: '500',
            color: '#151E26',
        },
        dropdownButtonArrowStyle: {
            fontSize: 28,
        },
        dropdownButtonIconStyle: {
            fontSize: 28,
            marginRight: 8,
        },
        dropdownMenuStyle: {
            backgroundColor: '#E9ECEF',
            borderRadius: 8,
        },
        dropdownItemStyle: {
            width: '100%',
            flexDirection: 'row',
            paddingHorizontal: 12,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 8,
        },
        dropdownItemTxtStyle: {
            flex: 1,
            fontSize: 18,
            fontWeight: '500',
            color: '#151E26',
        },
        dropdownItemIconStyle: {
            fontSize: 28,
            marginRight: 8,
        },
    });

export default AssignQCModal;
