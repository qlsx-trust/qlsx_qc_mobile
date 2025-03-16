import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import ConfirmModal from '@/components/ConfirmModal';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import Checkbox from 'expo-checkbox';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import EvaluationFromModal from '../EvaluationFromModal';

interface Props {}
const EvaluationItem = ({}: Props) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [showConfirmOKModal, setShowConfirmOKModal] = useState<boolean>(false);
    const [showConfirmNGModal, setShowConfirmNGModal] = useState<boolean>(false);
    const [confirmItem, setConfirmItem] = useState<'ok' | 'ng' | null>(null);

    const handleConfirmOk = async () => {
        setConfirmItem('ok');
        setShowConfirmOKModal(false);
    };

    const getColorText = () => {
        return confirmItem == 'ok'
            ? themeVariables.colors.primary
            : confirmItem == 'ng'
              ? themeVariables.colors.danger
              : themeVariables.colors.textDefault;
    };

    return (
        <FlexBox direction="column" style={styles.wrapItem}>
            <FlexBox
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                style={{ width: '100%' }}
                gap={10}
            >
                <FlexBox
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    gap={5}
                    width={'80%'}
                    style={{ paddingBottom: 10, paddingTop: 10 }}
                >
                    <Checkbox
                        style={styles.checkbox}
                        value={confirmItem != null}
                        disabled
                        color={getColorText()}
                    />
                    <TextWrap
                        style={{ ...styles.description }}
                        color={getColorText()}
                        numberOfLines={2}
                        textAlign="left"
                    >
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor
                        sit amet consectetur adipisicing elit.
                    </TextWrap>
                </FlexBox>

                <FlexBox
                    direction="row"
                    gap={10}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    width={'20%'}
                >
                    <TouchableOpacity
                        style={{
                            borderRightWidth: 1,
                            paddingRight: 10,
                            minWidth: 40,
                            width: '48%',
                            borderRightColor: themeVariables.colors.borderColor,
                            opacity: confirmItem == 'ng' ? 0.4 : 1,
                        }}
                        onPress={() => setShowConfirmOKModal(true)}
                    >
                        <TextWrap
                            fontSize={18}
                            textAlign="center"
                            color={themeVariables.colors.primary}
                        >
                            OK
                        </TextWrap>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowConfirmNGModal(true)}
                        style={{
                            minWidth: 40,
                            width: '48%',
                            opacity: confirmItem == 'ok' ? 0.4 : 1,
                        }}
                    >
                        <TextWrap
                            fontSize={18}
                            textAlign="center"
                            color={themeVariables.colors.danger}
                        >
                            NG
                        </TextWrap>
                    </TouchableOpacity>
                </FlexBox>
            </FlexBox>
            {showConfirmOKModal && (
                <ConfirmModal
                    title="Xác nhận đạt yêu cầu"
                    description="Bạn có chắc chắn muốn xác nhận mục này đạt yêu cầu"
                    onConfirm={handleConfirmOk}
                    modalProps={{
                        visible: showConfirmOKModal,
                        onClose: () => setShowConfirmOKModal(false),
                    }}
                />
            )}
            {showConfirmNGModal && (
                <EvaluationFromModal
                    onConfirmFeedback={() => {
                        setConfirmItem('ng');
                        setShowConfirmNGModal(false);
                    }}
                    modalProps={{
                        visible: showConfirmNGModal,
                        onClose: () => setShowConfirmNGModal(false),
                    }}
                />
            )}
        </FlexBox>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        wrapItem: {
            width: '100%',
            borderTopWidth: 1,
            borderTopColor: themeVariables.colors.borderColor,
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
        checkbox: {
            margin: 8,
        },
    });

export default EvaluationItem;
