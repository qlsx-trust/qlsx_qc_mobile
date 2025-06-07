import FlexBox from '@/components/common/FlexBox';
import PreviewImageModal from '@/components/common/PreviewImageModal';
import TextWrap from '@/components/common/TextWrap';
import { BUTTON_COMMON_TYPE, PATH_SERVER_MEDIA } from '@/constants/common';
import Config from '@/constants/config';
import { ICheckItem } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppButton from '../common/AppButton';
import EvaluationFromModal from './EvaluationFromModal';

interface Props {
    layout: any;
    isDisableAction?: boolean;
    sessionCheckItem: ICheckItem;
    checkItems: ICheckItem[];
    index: number;
    onUpdateCheckItem: Function;
    setStepItem: Function;
}
const CheckListItem = ({
    layout,
    isDisableAction,
    checkItems,
    sessionCheckItem,
    index,
    onUpdateCheckItem,
    setStepItem,
}: Props) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const isMobilePhoneScreen = layout.width < 500;

    const [showPreviewImageModal, setShowPreviewImageModal] = useState<boolean>(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

    const [showConfirmNGModal, setShowConfirmNGModal] = useState<boolean>(false);

    const productImageModel = useMemo(() => {
        if (
            !sessionCheckItem?.productImagePrototype?.length ||
            !sessionCheckItem?.productImagePrototype[0]
        )
            return null;
        const url = sessionCheckItem.productImagePrototype[0];
        if (url.includes(PATH_SERVER_MEDIA)) {
            return `${Config.EXPO_PUBLIC_BACKEND_URL}${url}`;
        }

        return url;
    }, [sessionCheckItem]);

    const isOK = sessionCheckItem?.status == 'ok';
    const isNG = sessionCheckItem?.status == 'ng';

    const handleConfirmOk = async () => {
        if (sessionCheckItem?.status == 'ok') return;
        onUpdateCheckItem(index, {
            ...sessionCheckItem,
            note: '',
            status: 'ok',
            reportFileUri: '',
        } as ICheckItem);
    };

    const getColorText = () => {
        return isOK
            ? themeVariables.colors.primary
            : isNG
              ? themeVariables.colors.danger
              : themeVariables.colors.textDefault;
    };

    return (
        <FlexBox
            style={{ width: '100%', marginVertical: 10, minHeight: 500 }}
            gap={5}
            direction="row"
            alignItems="flex-start"
        >
            <FlexBox
                direction="column"
                gap={10}
                style={{
                    width: '100%',
                }}
            >
                <FlexBox
                    gap={20}
                    justifyContent="space-between"
                    alignItems="flex-start"
                    style={{ width: '100%', flexWrap: 'wrap' }}
                >
                    <FlexBox
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        width={'50%'}
                    >
                        <FlexBox
                            direction="column"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                            gap={2}
                        >
                            <TextWrap
                                style={{}}
                                color={getColorText()}
                                numberOfLines={2}
                                textAlign="left"
                                fontSize={18}
                            >
                                Mục {index + 1}: {sessionCheckItem.name}
                            </TextWrap>
                            <TextWrap
                                style={{ height: 60 }}
                                color={themeVariables.colors.subTextDefault}
                                numberOfLines={3}
                                textAlign="left"
                                fontSize={14}
                            >
                                {sessionCheckItem.description}
                            </TextWrap>
                        </FlexBox>
                    </FlexBox>
                    <FlexBox
                        direction="row"
                        gap={20}
                        justifyContent="flex-end"
                        alignItems="flex-start"
                    >
                        <TouchableOpacity
                            style={{
                                borderWidth: 1,
                                padding: 10,
                                minWidth: 40,
                                width: 150,
                                borderColor: themeVariables.colors.borderColor,
                                backgroundColor: isOK
                                    ? themeVariables.colors.primary200
                                    : themeVariables.colors.bgDefault,
                                opacity: isNG ? 0.4 : 1,
                            }}
                            disabled={isDisableAction}
                            onPress={handleConfirmOk}
                        >
                            <TextWrap
                                fontSize={18}
                                textAlign="center"
                                color={
                                    isOK
                                        ? themeVariables.colors.white
                                        : themeVariables.colors.textDefault
                                }
                            >
                                OK
                            </TextWrap>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowConfirmNGModal(true)}
                            style={{
                                minWidth: 40,
                                padding: 10,
                                width: 150,
                                opacity: isOK ? 0.4 : 1,
                                borderColor: themeVariables.colors.borderColor,
                                backgroundColor: isNG
                                    ? themeVariables.colors.danger
                                    : themeVariables.colors.bgDefault,
                                borderWidth: 1,
                            }}
                            disabled={isDisableAction}
                        >
                            <TextWrap
                                fontSize={18}
                                textAlign="center"
                                color={
                                    isNG
                                        ? themeVariables.colors.white
                                        : themeVariables.colors.textDefault
                                }
                            >
                                NG
                            </TextWrap>
                        </TouchableOpacity>
                    </FlexBox>
                </FlexBox>
                <View
                    style={{
                        marginTop: isMobilePhoneScreen ? 0 : 30,
                        marginBottom: isMobilePhoneScreen ? 0 : 20,
                    }}
                >
                    {productImageModel ? (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.preventDefault();
                                setShowPreviewImageModal(true);
                                setPreviewImageUrl(productImageModel);
                            }}
                        >
                            <Image
                                source={{ uri: productImageModel }}
                                style={{
                                    width: isMobilePhoneScreen ? 300 : 350,
                                    height: isMobilePhoneScreen ? 300 : 350,
                                    objectFit: 'cover',
                                }}
                            />
                        </TouchableOpacity>
                    ) : (
                        <Image
                            source={{
                                uri: 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg',
                            }}
                            style={{
                                width: isMobilePhoneScreen ? 300 : 350,
                                height: isMobilePhoneScreen ? 300 : 350,
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </View>
                <FlexBox gap={30} style={{ marginTop: isMobilePhoneScreen ? 10 : 30 }}>
                    <AppButton
                        label="< Quay lại"
                        disabled={index == 0}
                        onPress={() => {
                            if (index == 0) return;
                            setStepItem(index - 1);
                        }}
                        viewStyle={{}}
                        variant={BUTTON_COMMON_TYPE.CANCEL}
                    />
                    <AppButton
                        label="Tiếp tục >"
                        disabled={index == checkItems.length - 1}
                        onPress={() => {
                            if (index == checkItems.length - 1) return;
                            setStepItem(index + 1);
                        }}
                        viewStyle={{}}
                        variant={BUTTON_COMMON_TYPE.CANCEL}
                    />
                </FlexBox>
            </FlexBox>

            {previewImageUrl && showPreviewImageModal && (
                <PreviewImageModal
                    source={previewImageUrl}
                    modalProps={{
                        visible: showPreviewImageModal,
                        onClose: () => {
                            setShowPreviewImageModal(false);
                            setPreviewImageUrl('');
                        },
                    }}
                />
            )}

            {showConfirmNGModal && (
                <EvaluationFromModal
                    evaluationItem={sessionCheckItem}
                    onConfirmFeedback={(data: any) => {
                        onUpdateCheckItem(index, {
                            ...sessionCheckItem,
                            note: data.feedback,
                            status: 'ng',
                            reportFile: null,
                            reportFileUri: data.imageUrl,
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
        button: {
            width: '49%',
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
    });

export default CheckListItem;
