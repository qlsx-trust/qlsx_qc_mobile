import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import ConfirmModal from '@/components/ConfirmModal';
import AddEvaluationItemModal from '@/components/product/AddEvaluationItemModal';
import CheckListItem from '@/components/product/CheckListItem';
import ImageSelection from '@/components/product/ImageSelection';
import { BUTTON_COMMON_TYPE, SCREEN_KEY } from '@/constants/common';
import Config from '@/constants/config';
import { ICheckItem, useProductionPlanContext } from '@/providers/ProductionPlanProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { toast } from '@/utils/ToastMessage';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Moment from 'moment';
import { useEffect, useState } from 'react';
import { publish } from 'pubsub-js';

const ProductScreen = () => {
    const dimensions = Dimensions.get('window');
    const { themeVariables, theme } = useThemeContext();
    const { productionPlan } = useProductionPlanContext();
    const styles = styling(themeVariables);
    const [showCamera, setShowCamera] = useState<boolean>(false);

    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [showAddEvaluationItemModal, setShowAddEvaluationItemModal] = useState<boolean>(false);
    const [pdfPreviews, setPdfPreviews] = useState<
        {
            documentName: string;
            documentUrl: string;
        }[]
    >([]);
    const [checkItems, setCheckItems] = useState<ICheckItem[]>([]);

    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

    const [stepItem, setStepItem] = useState<number>(0);

    useEffect(() => {
        getProductEvaluation();
    }, [productionPlan]);

    useEffect(() => {
        PubSub.subscribe('HANDLE_CAMERA_CHECK_ITEM', (_,isShowCamera) => {
            setShowCamera(Boolean(isShowCamera));
        });

        return () => {
            PubSub.unsubscribe('HANDLE_CAMERA_CHECK_ITEM');
        };
    }, []);

    const enableSubmitEvaluation =
        checkItems?.length &&
        checkItems?.every((item) => {
            return item.status == 'ok' || (item.status == 'ng' && (item.note || item.reportFileUri));
        });

    const checkedItems =
        checkItems?.length > 0
            ? checkItems.filter(
                  (item) =>
                      item.status == 'ok' ||
                      (item.status == 'ng' && (item.note || item.reportFileUri))
              ).length
            : 0;

    const getProductEvaluation = async () => {
        if (!productionPlan?.productCode) return;
        try {
            const response = await CommonRepository.getCheckItemProduct(
                productionPlan?.productCode
            );
            if (response.data) {
                const productEvaluation = response.data;
                setPdfPreviews(productEvaluation?.productDocuments);
                if (productEvaluation?.checkItems?.length) {
                    const checkItemFormatted = productEvaluation.checkItems.map((item) => {
                        return {
                            categoryCode: item.categoryCode,
                            name: item.name,
                            productImagePrototype: item?.productImagePrototype,
                            note: '',
                            status: '',
                            reportFileUri: '',
                        };
                    });
                    setCheckItems(checkItemFormatted);
                }
            }
        } catch (error) {}
    };

    const backHomeScreen = () => {
        router.replace(SCREEN_KEY.home);
    };

    const handlePreviewEvaluationForm = async (pdfPreviewUrl: string) => {
        await WebBrowser.openBrowserAsync(`${Config.EXPO_PUBLIC_BACKEND_URL}${pdfPreviewUrl}`);
    };

    const handleAddEvaluation = (evaluationItem: string) => {
        const checkItemsTmp = [...checkItems];
        checkItemsTmp.push({
            categoryCode: `CATADD-${new Date().getTime()}`,
            name: evaluationItem,
            note: '',
            status: '',
            reportFileUri: '',
        });
        setCheckItems([...checkItemsTmp]);
        setShowAddEvaluationItemModal(false);
    };

    const handleUpdateCheckItem = (index: number, updatedItem: ICheckItem) => {
        const checkItemsTmp = [...checkItems];
        checkItemsTmp[index] = { ...updatedItem };
        setCheckItems([...checkItemsTmp]);
    };

    const handleDeleteCheckItem = (deletedItem: ICheckItem) => {
        const checkItemsTmp = [...checkItems].filter(
            (item) => item.categoryCode != deletedItem.categoryCode
        );
        setCheckItems([...checkItemsTmp]);
    };

    const handleSubmit = async () => {
        try {
            setLoadingSubmit(true);
            const formdata = new FormData();
            formdata.append('ConfirmationTime', `${new Date().toISOString()}`);
            const testResult = checkItems.map((item) => {
                return {
                    categoryCode: item.categoryCode,
                    name: item.name,
                    note: item.note,
                    status: item.status,
                };
            });
            formdata.append('TestResult', JSON.stringify(testResult));
            formdata.append('ProductionPlanId', productionPlan?.id);
            checkItems.forEach((item) => {
                if (item.reportFileUri) {
                    formdata.append(item.categoryCode, {
                        name: item.reportFileUri.split('/').pop(),
                        type: 'image/jpeg',
                        uri: item.reportFileUri,
                    });
                }
            });
            const response = await CommonRepository.submitQcTestResult(formdata);
            if (response.data) {
                toast.success('Gửi các đánh giá thành công');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        // <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container}>
            {showCamera && (
                <ImageSelection
                    setShowCamera={setShowCamera}
                    setImageUrl={(url: string) => {
                        PubSub.publish('TAKE_PHOTO_CHECK_ITEM', url);
                    }}
                />
            )}
            <FlexBox
                gap={10}
                height={'100%'}
                width={'100%'}
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
            >
                <TouchableOpacity
                    onPress={() => {
                        if (checkedItems > 0 && checkedItems < checkItems.length) {
                            setShowConfirmModal(true);
                        } else {
                            backHomeScreen();
                        }
                    }}
                    style={styles.closeButton}
                >
                    <TextWrap
                        style={{
                            ...styles.description,
                            textDecorationLine: 'underline',
                            fontSize: 16,
                        }}
                        color={themeVariables.colors.danger}
                    >
                        Quay lại
                    </TextWrap>
                </TouchableOpacity>
                <FlexBox
                    gap={15}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TextWrap style={styles.header} color={themeVariables.colors.textDefault}>
                        <TextWrap>Mã máy ép:</TextWrap>
                        <TextWrap color={themeVariables.colors.primary}>
                            {' '}
                            {productionPlan?.machineCode}
                        </TextWrap>
                    </TextWrap>
                    <FlexBox
                        gap={5}
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <TextWrap
                            style={styles.description}
                            color={themeVariables.colors.textDefault}
                        >
                            <TextWrap>Mã SP: </TextWrap>
                            <TextWrap color={themeVariables.colors.primary}>
                                {' '}
                                {productionPlan?.productCode}
                            </TextWrap>
                        </TextWrap>
                        <TextWrap
                            style={styles.description}
                            color={themeVariables.colors.textDefault}
                        >
                            <TextWrap>Tên sản phẩm: </TextWrap>
                            <TextWrap color={themeVariables.colors.primary}>
                                {' '}
                                {productionPlan?.productName}
                            </TextWrap>
                        </TextWrap>

                        <TextWrap
                            style={styles.description}
                            color={themeVariables.colors.textDefault}
                        >
                            <TextWrap>Từ </TextWrap>
                            <TextWrap color={themeVariables.colors.primary}>
                                {Moment(productionPlan?.productionStartTime || '').format('HH:mm')}
                            </TextWrap>
                            <TextWrap> đến </TextWrap>
                            <TextWrap color={themeVariables.colors.primary}>
                                {Moment(productionPlan?.productionEndTime || '').format('HH:mm')}
                            </TextWrap>
                            <TextWrap> ngày </TextWrap>
                            <TextWrap color={themeVariables.colors.primary}>
                                {Moment(productionPlan?.productionEndTime || '').format(
                                    'DD/MM/YYY'
                                )}
                            </TextWrap>
                        </TextWrap>

                        {pdfPreviews?.length ? (
                            <FlexBox
                                direction="column"
                                gap={5}
                                justifyContent="flex-start"
                                alignItems="flex-start"
                            >
                                <TextWrap
                                    style={styles.description}
                                    color={themeVariables.colors.textDefault}
                                >
                                    Mẫu tham khảo các mục đánh giá:
                                </TextWrap>
                                <FlexBox
                                    direction="row"
                                    gap={5}
                                    justifyContent="flex-start"
                                    alignItems="center"
                                    style={{ flexWrap: 'wrap' }}
                                >
                                    {pdfPreviews.map((pdf, index) => (
                                        <TouchableOpacity
                                            key={`pdf-prewview-${index}`}
                                            onPress={() =>
                                                handlePreviewEvaluationForm(pdf.documentUrl)
                                            }
                                        >
                                            <TextWrap
                                                style={{ ...styles.description }}
                                                color={themeVariables.colors.primary}
                                            >
                                                <AntDesign
                                                    name="pdffile1"
                                                    size={18}
                                                    color={themeVariables.colors.primary}
                                                />{' '}
                                                {pdf.documentName}
                                            </TextWrap>
                                        </TouchableOpacity>
                                    ))}
                                </FlexBox>
                            </FlexBox>
                        ) : (
                            <Text></Text>
                        )}
                    </FlexBox>
                </FlexBox>
                <FlexBox
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                        width: '100%',
                        paddingBottom: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: themeVariables.colors.borderColor,
                    }}
                >
                    <FlexBox justifyContent="space-between" alignItems="flex-end">
                        <TextWrap style={styles.title} color={themeVariables.colors.textDefault}>
                            Các mục đánh giá ({checkedItems}/{checkItems.length})
                        </TextWrap>
                    </FlexBox>
                    <FlexBox gap={30} alignItems="flex-end">
                        <AppButton
                            label="Thêm mục"
                            onPress={() => setShowAddEvaluationItemModal(true)}
                            viewStyle={{}}
                            variant={BUTTON_COMMON_TYPE.CANCEL}
                        />
                        <AppButton
                            label="Gửi đánh giá"
                            onPress={handleSubmit}
                            viewStyle={{}}
                            isLoading={loadingSubmit}
                            disabled={loadingSubmit || !checkedItems || !enableSubmitEvaluation}
                            variant={BUTTON_COMMON_TYPE.PRIMARY}
                        />
                    </FlexBox>
                </FlexBox>
                {checkItems?.length ? (
                    <FlexBox style={{ width: '100%' }}>
                        <FlexBox direction="column" style={{ width: '100%' }}>
                            <FlexBox
                                gap={20}
                                justifyContent="space-between"
                                style={{ width: '100%' }}
                            >
                                <TextWrap color={themeVariables.colors.primary} fontSize={24}>
                                    Mục đánh giá {stepItem + 1}
                                </TextWrap>
                                <FlexBox gap={30}>
                                    <AppButton
                                        label="< Quay lại"
                                        disabled={stepItem == 0}
                                        onPress={() => {
                                            if (stepItem == 0) return;
                                            setStepItem((current) => current - 1);
                                        }}
                                        viewStyle={{}}
                                        variant={BUTTON_COMMON_TYPE.CANCEL}
                                    />
                                    <AppButton
                                        label="Tiếp tục >"
                                        disabled={stepItem == checkItems.length - 1}
                                        onPress={() => {
                                            if (stepItem == checkItems.length - 1) return;
                                            setStepItem((current) => current + 1);
                                        }}
                                        viewStyle={{}}
                                        variant={BUTTON_COMMON_TYPE.CANCEL}
                                    />
                                </FlexBox>
                            </FlexBox>
                            <CheckListItem
                                sessionCheckItem={checkItems[stepItem]}
                                index={stepItem}
                                onUpdateCheckItem={handleUpdateCheckItem}
                            />
                        </FlexBox>
                    </FlexBox>
                ) : (
                    <FlexBox style={{ height: 300, width: '100%' }}>
                        <TextWrap fontSize={18} color={themeVariables.colors.subTextDefault}>
                            Không có mục đánh giá nào, vui lòng liên hệ quản lý hoặc chọn thêm mục
                        </TextWrap>
                    </FlexBox>
                )}
            </FlexBox>
            {showConfirmModal && (
                <ConfirmModal
                    title="Trở lại"
                    description="Bạn có chắc muốn quay lại?"
                    onConfirm={backHomeScreen}
                    modalProps={{
                        visible: showConfirmModal,
                        onClose: () => setShowConfirmModal(false),
                    }}
                />
            )}

            {showAddEvaluationItemModal && (
                <AddEvaluationItemModal
                    onSuccess={handleAddEvaluation}
                    modalProps={{
                        visible: showAddEvaluationItemModal,
                        onClose: () => setShowAddEvaluationItemModal(false),
                    }}
                />
            )}
        </SafeAreaView>
        // </KeyboardAvoidingView>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            backgroundColor: themeVariables.colors.bgDefault,
            width: '100%',
            height: '100%',
            position: 'relative',
            padding: 20,
        },
        main: {
            width: '100%',
            height: '100%',
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 26,
        },
        header: {
            fontSize: 24,
            fontWeight: '600',
        },
        description: {
            fontWeight: '400',
        },
        closeButton: {
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 110,
        },
    });

export default ProductScreen;
