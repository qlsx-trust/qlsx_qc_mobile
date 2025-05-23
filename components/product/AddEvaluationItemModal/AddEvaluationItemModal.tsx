import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { useState } from 'react';
import { Keyboard, StyleSheet, TextInput } from 'react-native';

interface IAddEvaluationItemModalProps {
    modalProps: CommonModalProps;
    onSuccess: (item: string) => void;
}

const AddEvaluationItemModal = ({ modalProps, onSuccess }: IAddEvaluationItemModalProps) => {

    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [evaluationItem, setEvaluationItem] = useState<string>('');

    const handleSubmitAddItem = () => {
        onSuccess(evaluationItem);
    };

    return (
        <>
            <CommonModal {...modalProps}>
                <FlexBox direction="column" width={'100%'}>
                    <TextWrap style={styles.header}>Thêm mục đánh giá</TextWrap>
                </FlexBox>
                <FlexBox
                    direction="column"
                    style={{ marginTop: 30 }}
                    width={'100%'}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TextInput
                        style={[
                            styles.noteTitle,
                            { borderWidth: 1, borderColor: themeVariables.colors.borderColor },
                        ]}
                        value={evaluationItem}
                        onChangeText={setEvaluationItem}
                        placeholderTextColor={themeVariables.colors.bgGrey}
                        placeholder="Nội dung đánh giá"
                        onBlur={Keyboard.dismiss}
                        onEndEditing={Keyboard.dismiss}
                        onSubmitEditing={Keyboard.dismiss}
                    />
                </FlexBox>

                <FlexBox justifyContent="space-between" gap={16} style={{ marginTop: 20 }}>
                    <AppButton
                        viewStyle={styles.button}
                        variant={BUTTON_COMMON_TYPE.CANCEL}
                        label="Đóng"
                        onPress={modalProps.onClose}
                    />
                    <AppButton
                        disabled={!evaluationItem}
                        viewStyle={styles.button}
                        label="Xác nhận"
                        onPress={handleSubmitAddItem}
                    />
                </FlexBox>
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
            lineHeight: 20,
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

export default AddEvaluationItemModal;
