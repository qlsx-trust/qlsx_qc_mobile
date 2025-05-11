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
import { toast } from '@/utils/ToastMessage';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import SelectDropdown from 'react-native-select-dropdown';

interface IAssignQCModalProps {
    modalProps: CommonModalProps;
    productPlan?: IProductionPlan;
}

const mockUserData = [
    { title: 'QC0', value: 'qc' },
    { title: 'QC01', value: 'qc01' },
    { title: 'QC02', value: 'qc02' },
    { title: 'Khác', value: 'other' },
];

const AssignQCModal = ({ productPlan, modalProps }: IAssignQCModalProps) => {
    const dimensions = Dimensions.get('window');

    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState<string>('');

    const [assignedQc, setAssignedQc] = useState<string[]>(productPlan?.assignedToQC || []);
    const [otherQcCode, setOtherQcCode] = useState<string>('');

    const [showOtherUser, setShowOtherUser] = useState<boolean>(false);

    const deleteAssignQc = async (userCode: string) => {
        try {
            Keyboard.dismiss();
            setIsLoadingDelete(userCode);
            const payload = {
                productionPlanId: productPlan?.id,
                qcAssign: userCode,
            };
            const res = await CommonRepository.deleteAssignQCProductPlan(payload);
            if (!res.error && res.data) {
                PubSub.publish(PUB_TOPIC.RECALL_PRODUCTION_PLAN);
                toast.success('Hủy phân công thành công');
                setAssignedQc(assignedQc.filter((code) => code != userCode));
            } else {
                toast.error('Hủy phân công thất bại');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingDelete('');
        }
    };

    const handleAddQC = async (qcCode: string) => {
        if (!qcCode) return;
        try {
            Keyboard.dismiss();
            setIsLoadingSubmit(true);
            const payload = {
                productionPlanId: productPlan?.id,
                qcAssign: qcCode,
            };
            const res = await CommonRepository.assignQCProductPlan(payload);
            if (!res.error && res.data) {
                PubSub.publish(PUB_TOPIC.RECALL_PRODUCTION_PLAN);
                toast.success('Thêm phân công thành công');
                setAssignedQc([...assignedQc, qcCode]);
            } else {
                toast.error('Thêm phân công thất bại');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    return (
        <>
            <CommonModal {...modalProps}>
                <FlexBox direction="column" width={'100%'}>
                    <TextWrap style={styles.header}>Phân công nhân viên</TextWrap>
                </FlexBox>
                <FlexBox
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    gap={5}
                    style={{ marginTop: 20 }}
                >
                    <TextWrap style={styles.description}>Chọn nhân viên:</TextWrap>
                    <SelectDropdown
                        data={mockUserData}
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
                                        {(selectedItem && selectedItem.title) || 'Chọn nhân viên'}
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
                                isSelected || assignedQc.find((code: string) => code == item.value);
                            return (
                                <View
                                    style={{
                                        ...styles.dropdownItemStyle,
                                        ...(isSelectedQc && { backgroundColor: '#D2D9DF' }),
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

                {showOtherUser && (
                    <FlexBox
                        direction="column"
                        width={'100%'}
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <TextWrap style={styles.description}>Mã nhân viên khác:</TextWrap>
                        <TextInput
                            style={[
                                styles.textInput,
                                { borderWidth: 1, borderColor: themeVariables.colors.borderColor },
                            ]}
                            value={otherQcCode}
                            onChangeText={setOtherQcCode}
                            placeholderTextColor={themeVariables.colors.bgGrey}
                            placeholder="Mã nhân viên"
                        />
                        <AppButton
                            disabled={isLoadingSubmit || !otherQcCode}
                            isLoading={isLoadingSubmit}
                            viewStyle={styles.button}
                            label="Thêm"
                            onPress={() => handleAddQC(otherQcCode)}
                        />
                    </FlexBox>
                )}

                <ScrollView>
                    <FlexBox
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        gap={5}
                    >
                        {assignedQc?.map((qcCode) => (
                            <FlexBox
                                style={{
                                    width: '100%',
                                    paddingVertical: 5,
                                    paddingHorizontal: 10,
                                    borderBottomWidth: 0.5,
                                    borderColor: themeVariables.colors.borderLightColor,
                                }}
                                justifyContent="space-between"
                                alignItems="center"
                                key={`qc-code-${qcCode}`}
                            >
                                <TextWrap fontSize={16}>{qcCode}</TextWrap>
                                {isLoadingDelete == qcCode ? (
                                    <ActivityIndicator size={16} />
                                ) : (
                                    <TouchableOpacity onPress={() => deleteAssignQc(qcCode)}>
                                        <AntDesign
                                            name="close"
                                            size={24}
                                            color={themeVariables.colors.danger}
                                        />
                                    </TouchableOpacity>
                                )}
                            </FlexBox>
                        ))}
                    </FlexBox>
                </ScrollView>

                <AppButton
                    variant={BUTTON_COMMON_TYPE.CANCEL}
                    viewStyle={styles.button}
                    label="Đóng"
                    onPress={() => modalProps.onClose()}
                />
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
