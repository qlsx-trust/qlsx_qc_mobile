import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import { IProductionPlan } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { IThemeVariables } from '@/shared/theme/themes';
import { IEmployee } from '@/types/employee';
import { toast } from '@/utils/ToastMessage';
import { AntDesign, Feather } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { ScrollView } from 'react-native-gesture-handler';


interface IAssignQCModalProps {
    modalProps: CommonModalProps;
    planIds: string[];
    employeesProps: IEmployee[];
    isAssignAll: boolean;
    productPlan?: IProductionPlan | null;
    onRecallListProductPlan: Function;
}

const AssignQCModal = ({
    productPlan,
    isAssignAll,
    employeesProps,
    planIds,
    onRecallListProductPlan,
    modalProps,
}: IAssignQCModalProps) => {
    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
    const [isLoadingSaveConfig, setIsLoadingSaveConfig] = useState<boolean>(false);
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
    const [isDropdownOpened, setIsDropdownOpened] = useState(false);

    const maskRowHeight = Math.round((layout.height - 250) / 20);
    const maskColWidth = (layout.width - 250) / 2;

    const [employees, setEmployees] = useState<IEmployee[]>(employeesProps || []);
    const [recallEmployee, setRecallEmployee] = useState<number>(0);

    useEffect(() => {
        if (employeesProps?.length > 0 && recallEmployee == 0) return;
        const getQCEmployees = async () => {
            try {
                const response = await CommonRepository.getQCEmployees();
                if (response.data) {
                    setEmployees(response.data || []);
                }
            } catch (error) {}
        };
        getQCEmployees();
    }, [recallEmployee, employeesProps]);

    const selectEmployeeOptions = useMemo(() => {
        const data = (employees || []).map((employee) => {
            return {
                value: `${employee.employeeCode}`,
                label: `${employee.employeeCode},${employee.fullName}`,
            };
        });

        data.push({ value: 'other', label: 'Thêm nhân viên' });
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
        // try {
        //     Keyboard.dismiss();
        //     setIsLoadingDelete(userCode);
        //     const payload = {
        //         productionPlanId: productPlan?.id,
        //         qcAssign: userCode.split(',')[0],
        //     };
        //     const res = await CommonRepository.deleteAssignQCProductPlan(payload);
        //     if (!res.error) {
        //         onRecallListProductPlan(productPlan?.id || '');
        //         setRecallEmployee(new Date().getTime());
        //         toast.success('Xóa phân công thành công');
        //         setAssignedQc((current) => current.filter((qcCode) => qcCode != userCode));
        //     } else {
        //         toast.error('Xóa phân công thất bại');
        //     }
        // } catch (err) {
        //     console.error(err);
        // } finally {
        //     setIsLoadingDelete('');
        // }
        setAssignedQc((current) => current.filter((qcCode) => qcCode != userCode));
    };

    const handleSaveConfig = async () => {
        try {
            if (!assignedQc?.length) return;
            Keyboard.dismiss();
            setIsLoadingSaveConfig(true);

            const payload = {
                productionPlanIds: productPlan ? [productPlan.id] : planIds,
                qcAssigns: assignedQc.map((qcFullCode) => qcFullCode.split(',')[0]),
            };
            const res = await CommonRepository.assignQCProductPlanbatch(payload);
            if (!res.error) {
                onRecallListProductPlan(productPlan?.id || '');
                setRecallEmployee(new Date().getTime());
                toast.success('Phân công thành công');
                modalProps.onClose();
            } else {
                toast.error('Phân công thất bại');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingSaveConfig(false);
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

            // refresh employee list
            setRecallEmployee(new Date().getTime());
            setErrorCheckCode('');
            const assignedQcs = [...assignedQc];
            assignedQcs.unshift(qcCode);
            setAssignedQc(assignedQcs);
            setOtherQcCode('');
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
                                <DropDownPicker
                                    open={isDropdownOpened}
                                    value={assignedQc.map((qcFullCode) => qcFullCode.split(',')[0])}
                                    items={selectEmployeeOptions}
                                    setOpen={setIsDropdownOpened}
                                    setValue={() => {}}
                                    onSelectItem={(items) => {
                                        const selectedItem = items[items.length - 1];
                                        
                                        if (selectedItem?.value == 'other') {
                                            setShowOtherUser(true);
                                            setOtherQcCode('');
                                            setIsDropdownOpened(false);
                                        } else {
                                            setShowOtherUser(false);
                                            setAssignedQc(items.map((item) => item.value as string));
                                        }

                                    }}
                                    setItems={() => {}}
                                    multiple={true}
                                    placeholder="Chọn nhân viên"
                                    multipleText="Đã chọn {count} nhân viên"
                                    style={{
                                        borderColor: themeVariables.colors.borderColor,
                                        borderRadius: 12,
                                    }}
                                    dropDownContainerStyle={{
                                        borderColor: themeVariables.colors.borderColor,
                                        borderRadius: 12,
                                    }}
                                />
                            </FlexBox>
                        </FlexBox>

                        {showOtherUser && (
                            <FlexBox
                                direction="column"
                                width={'100%'}
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                style={{ marginBottom: 20 }}
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
                                <FlexBox
                                    justifyContent="space-between"
                                    style={{ width: '100%', paddingHorizontal: 5 }}
                                >
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
                            direction="column"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                            gap={8}
                            style={{ width: '100%', marginVertical: 10 }}
                        >
                            <TextWrap fontSize={16} style={styles.description}>
                                Nhân viên được phân công:
                            </TextWrap>

                            {assignedQc?.length > 0 ? (
                                <ScrollView
                                    style={{
                                        maxHeight: Dimensions.get('window').height * 0.3,
                                        width: '100%',
                                    }}
                                >
                                    {assignedQc.map((qc: string) => (
                                        <FlexBox
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            key={`qc-selected-${qc}`}
                                            style={{
                                                width: 300,
                                                paddingHorizontal: 0,
                                                marginVertical: 15,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <TextWrap
                                                fontSize={16}
                                                style={{}}
                                                color={
                                                    assignedQc?.length
                                                        ? themeVariables.colors.primary
                                                        : themeVariables.colors.danger
                                                }
                                            >
                                                {getFullNameCodeQc(qc)}
                                            </TextWrap>
                                            {isLoadingDelete == qc ? (
                                                <ActivityIndicator size={20} />
                                            ) : (
                                                <TouchableOpacity
                                                    onPress={() => deleteAssignQc(qc)}
                                                >
                                                    <Feather
                                                        name="trash-2"
                                                        size={20}
                                                        color={themeVariables.colors.danger}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </FlexBox>
                                    ))}
                                </ScrollView>
                            ) : (
                                <>
                                    {isAssignAll ? (
                                        <TextWrap
                                            fontSize={14}
                                            color={themeVariables.colors.danger}
                                        >
                                            Chưa có nhân viên nào được chọn
                                        </TextWrap>
                                    ) : (
                                        <TextWrap
                                            fontSize={14}
                                            color={themeVariables.colors.danger}
                                        >
                                            Chưa có nhân viên nào được phân công
                                        </TextWrap>
                                    )}
                                </>
                            )}
                            {isAssignAll && (
                                <TextWrap
                                    textAlign="left"
                                    fontSize={14}
                                    color={themeVariables.colors.yellow}
                                >
                                    Ghi chú: Tất cả nhân viên được phân công trước đó sẽ được thay
                                    thế bằng lượt phân công này
                                </TextWrap>
                            )}
                        </FlexBox>

                        <FlexBox gap={5} justifyContent="space-between" style={{ width: '100%' }}>
                            <AppButton
                                variant={BUTTON_COMMON_TYPE.CANCEL}
                                viewStyle={styles.button}
                                label="Đóng"
                                onPress={() => modalProps.onClose()}
                            />
                            <AppButton
                                variant={BUTTON_COMMON_TYPE.PRIMARY}
                                viewStyle={styles.button}
                                isLoading={isLoadingSaveConfig}
                                disabled={isLoadingSaveConfig}
                                label="Lưu"
                                onPress={handleSaveConfig}
                            />
                        </FlexBox>
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
            marginTop: 16,
        },
        button: {
            width: '46%',
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
