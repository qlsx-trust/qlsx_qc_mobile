import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import { BUTTON_COMMON_TYPE, SCREEN_KEY } from '@/constants/common';
import { useProductionPlanContext } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { IThemeVariables } from '@/shared/theme/themes';
import { toast } from '@/utils/ToastMessage';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

interface IConfirmScanCodeModalProps {
    scanResult: string;
    modalProps: CommonModalProps;
}

const ConfirmScanCodeModal = ({ scanResult, modalProps }: IConfirmScanCodeModalProps) => {
    const { themeVariables } = useThemeContext();
    const { updateProductionPlan } = useProductionPlanContext();
    const styles = styling(themeVariables);
    const [isLoadingConfirm, setIsLoadingConfirm] = useState<boolean>(false);

    const handleConfirmCode = async () => {
        try {
            setIsLoadingConfirm(true);
            const response = await CommonRepository.getMostRecentProductionPlan('A3');
            if (response.data) {
                console.log('response.data:', response.data)
                updateProductionPlan(response.data);
                router.push(`${SCREEN_KEY.product}`);
                modalProps.onClose();
            } else {
                toast.error('Mã máy không hợp lệ, vui lòng thử lại');
            }
        } catch (error) {
            toast.error('Mã máy không hợp lệ, vui lòng thử lại');
        } finally {
            setIsLoadingConfirm(false);
        }
    };

    return (
        <CommonModal {...modalProps}>
            <FlexBox gap={16} direction="column" width={'100%'}>
                <TextWrap style={styles.header} color={themeVariables.colors.textDefault}>
                    Xác nhận
                </TextWrap>

                <TextWrap style={styles.title} color={themeVariables.colors.textDefault}>
                    Mã máy ép:{' '}
                    <TextWrap color={themeVariables.colors.primary}> {scanResult} </TextWrap>
                </TextWrap>

                <FlexBox justifyContent="space-between" gap={16} style={{ marginTop: 16 }}>
                    <AppButton
                        viewStyle={styles.button}
                        variant={BUTTON_COMMON_TYPE.CANCEL}
                        label="Đóng"
                        onPress={modalProps.onClose}
                    />
                    <AppButton
                        viewStyle={styles.button}
                        label="Xác nhận"
                        onPress={handleConfirmCode}
                        isLoading={isLoadingConfirm}
                        disabled={isLoadingConfirm}
                    />
                </FlexBox>
            </FlexBox>
        </CommonModal>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        title: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 26,
        },
        header: {
            fontSize: 26,
            fontWeight: '600',
        },
        description: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
            textAlign: 'center',
        },
        textButton: {
            fontSize: 16,
            fontWeight: '500',
            lineHeight: 24,
            textAlign: 'center',
            width: '100%',
        },
        button: {
            width: '49%',
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
    });

export default ConfirmScanCodeModal;
