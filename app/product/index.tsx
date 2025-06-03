import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import ConfirmModal from '@/components/ConfirmModal';
import AddEvaluationItemModal from '@/components/product/AddEvaluationItemModal';
import CheckListItem from '@/components/product/CheckListItem';
import { BUTTON_COMMON_TYPE, SCREEN_KEY } from '@/constants/common';
import Config from '@/constants/config';
import { ICheckItem, useProductionPlanContext } from '@/providers/ProductionPlanProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { toast } from '@/utils/ToastMessage';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Moment from 'moment';
import { useEffect, useState } from 'react';
import ManageProductDetailModal from '@/components/product/ManageProductDetailModal';

const ProductScreen = () => {
    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };
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
        // QC pick up 1 item
        if (!productionPlan?.id) return;
        qcPickUp(productionPlan?.id);
    }, [productionPlan]);

    useEffect(() => {
        PubSub.subscribe('HANDLE_CAMERA_CHECK_ITEM', (_, isShowCamera) => {
            setShowCamera(Boolean(isShowCamera));
        });

        return () => {
            PubSub.unsubscribe('HANDLE_CAMERA_CHECK_ITEM');
        };
    }, []);

    const qcPickUp = async (planId: string) => {
        try {
            await CommonRepository.qcPickUpItem(planId);
        } catch (error) {
            console.log('@@Error: ', error);
        }
    };

    const qcPickDown = async (planId: string) => {
        try {
            if (!planId) return;
            await CommonRepository.qcPickDownItem(planId);
        } catch (error) {
            console.log('@@Error: ', error);
        }
    };

    const enableSubmitEvaluation =
        checkItems?.length &&
        checkItems?.every((item) => {
            return (
                item.status == 'ok' || (item.status == 'ng' && (item.note || item.reportFileUri))
            );
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

    const handleAddEvaluation = (evaluationItem: any) => {
        const checkItemsTmp = [...checkItems];
        const newItem = {
            categoryCode: `CATADD-${new Date().getTime()}`,
            name: evaluationItem.name,
            note: evaluationItem.note,
            productImagePrototype: [evaluationItem.imageUrl],
            status: '',
            reportFileUri: '',
        };
        if (checkItemsTmp?.length) {
            const nextStep = stepItem + 1;
            checkItemsTmp.splice(nextStep, 0, newItem);
            setCheckItems([...checkItemsTmp]);
            setStepItem(nextStep);
        } else {
            checkItemsTmp.push(newItem);
            setCheckItems([...checkItemsTmp]);
        }
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
            //submit new check item
            // TODO

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
            const isAllPassCheck =
                checkItems.filter((item) => item.status == 'ok')?.length == checkItems?.length;
            const response = await CommonRepository.submitQcTestResult(formdata);
            if (response.data) {
                if (isAllPassCheck && productionPlan?.id) {
                    await qcPickDown(productionPlan?.id);
                }
                toast.success('Gửi các đánh giá thành công');
                backHomeScreen();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        // <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container} onLayout={onLayout}>
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
                                    'DD/MM/YYYY'
                                )}
                            </TextWrap>
                        </TextWrap>
                    </FlexBox>
                </FlexBox>
                <FlexBox
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                        width: '100%',
                        paddingBottom: 20,
                        flexWrap: 'wrap',
                        borderBottomWidth: 1,
                        borderBottomColor: themeVariables.colors.borderColor,
                    }}
                >
                    <FlexBox justifyContent="space-between" alignItems="flex-end">
                        <TextWrap style={styles.title} color={themeVariables.colors.textDefault}>
                            Các mục đã đánh giá ({checkedItems}/{checkItems.length})
                        </TextWrap>
                    </FlexBox>
                    <FlexBox gap={20} alignItems="flex-end">
                        <AppButton
                            label="Thêm mục"
                            onPress={() => setShowAddEvaluationItemModal(true)}
                            viewStyle={{ width: 150 }}
                            variant={BUTTON_COMMON_TYPE.CANCEL}
                        />
                        <AppButton
                            label="Gửi đánh giá"
                            onPress={handleSubmit}
                            viewStyle={{ width: 150 }}
                            isLoading={loadingSubmit}
                            disabled={loadingSubmit || !checkedItems || !enableSubmitEvaluation}
                            variant={BUTTON_COMMON_TYPE.PRIMARY}
                        />
                    </FlexBox>
                </FlexBox>
                {checkItems?.length ? (
                    <FlexBox style={{ width: '100%' }}>
                        <FlexBox direction="column" style={{ width: '100%' }}>
                            <CheckListItem
                                layout={layout}
                                checkItems={checkItems}
                                sessionCheckItem={checkItems[stepItem]}
                                index={stepItem}
                                onUpdateCheckItem={handleUpdateCheckItem}
                                setStepItem={setStepItem}
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
                <ManageProductDetailModal
                    modalProps={{
                        visible: showAddEvaluationItemModal,
                        onClose: () => setShowAddEvaluationItemModal(false),
                    }}
                    onAddProductCheckItem={handleAddEvaluation}
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
