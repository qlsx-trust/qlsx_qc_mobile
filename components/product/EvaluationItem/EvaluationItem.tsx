import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import ConfirmModal from '@/components/ConfirmModal';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import Checkbox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import EvaluationFromModal from '../EvaluationFromModal';
import { ICheckItem } from '@/providers/ProductionPlanProvider';

interface Props {
    item: ICheckItem;
    index: number;
    onUpdateCheckItem: Function;
}
const EvaluationItem = ({ item, index, onUpdateCheckItem }: Props) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [showConfirmOKModal, setShowConfirmOKModal] = useState<boolean>(false);
    const [showConfirmNGModal, setShowConfirmNGModal] = useState<boolean>(false);
    const [evaluationItem, setEvaluationItem] = useState<ICheckItem>(item);

    useEffect(() => {
        setEvaluationItem(item);
    }, [item]);

    const handleConfirmOk = async () => {
        onUpdateCheckItem(index, {
            ...item,
            note: '',
            status: 'ok',
            reportFileUri: ''
        } as ICheckItem);
        setShowConfirmOKModal(false);
    };

    const getColorText = () => {
        return evaluationItem.status == 'ok'
            ? themeVariables.colors.primary
            : evaluationItem.status == 'ng'
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
                    width={'70%'}
                    style={{ paddingBottom: 10, paddingTop: 10 }}
                >
                    <Checkbox
                        style={styles.checkbox}
                        value={!!evaluationItem.status}
                        disabled
                        color={getColorText()}
                    />
                    <TextWrap
                        style={{ ...styles.description }}
                        color={getColorText()}
                        numberOfLines={2}
                        textAlign="left"
                    >
                        {evaluationItem.name}
                    </TextWrap>
                </FlexBox>

                <FlexBox
                    direction="row"
                    gap={10}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    width={'30%'}
                >
                    <TouchableOpacity
                        style={{
                            borderRightWidth: 1,
                            paddingRight: 10,
                            minWidth: 40,
                            width: '48%',
                            borderRightColor: themeVariables.colors.borderColor,
                            opacity: evaluationItem.status == 'ng' ? 0.4 : 1,
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
                            opacity: evaluationItem.status == 'ok' ? 0.4 : 1,
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
                    evaluationItem={evaluationItem}
                    onConfirmFeedback={(data: any) => {
                        onUpdateCheckItem(index, {
                            ...item,
                            note: data.feedback,
                            status: 'ng',
                            reportFile: null,
                            reportFileUri: data.imageUrl
                        } as ICheckItem);
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
            padding: 4,
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
            marginRight: 4,
        },
    });

export default EvaluationItem;
