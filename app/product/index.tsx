import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import ConfirmModal from '@/components/ConfirmModal';
import ProductEvaluationItem from '@/components/product/ProductEvaluationItem';
import { SCREEN_KEY } from '@/constants/common';
import {
    ICheckItem,
    ProductCheckItem,
    useProductionPlanContext,
} from '@/providers/ProductionPlanProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { toast } from '@/utils/ToastMessage';
import { router } from 'expo-router';
import Moment from 'moment';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

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

    const [checkItems, setCheckItems] = useState<ICheckItem[]>([]);
    const [productCavities, setproductCavities] = useState<ProductCheckItem[]>([]);

    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

    const [currentSelectedProductCavity, setCurrentSelectedProductCavity] = useState<
        ProductCheckItem | undefined
    >(undefined);
    const [stepItem, setStepItem] = useState<number>(0);

    const isCavityProduct = productionPlan?.cavity == 1;

    const getProductCavity = async () => {
        try {
            if (!productionPlan?.productCode) {
                return;
            }
            const response = await CommonRepository.getProductCavities(productionPlan?.productCode);
            if (response.data) {
                const checkItemsProductCavity: ProductCheckItem[] = (response.data || [])
                    .sort((a: ProductCheckItem, b: ProductCheckItem) =>
                        a.cavityIndex - b.cavityIndex
                    )
                    .map((productCheckItem: ProductCheckItem) => {
                        const checkItemFormatted = productCheckItem.checkItems.map((item) => {
                            return {
                                categoryCode: item.categoryCode,
                                name: item.name,
                                description: item.note,
                                productImagePrototype: item?.productImagePrototype,
                                note: '',
                                status: '',
                                reportFileUri: '',
                            };
                        });
                        return {
                            ...productCheckItem,
                            stepItem: 0,
                            isSubmitted: false,
                            checkItems: checkItemFormatted,
                        };
                    });
                setproductCavities(checkItemsProductCavity);
                if (checkItemsProductCavity?.length) {
                    setCurrentSelectedProductCavity(checkItemsProductCavity[0]);
                    setStepItem(0);
                    setCheckItems(checkItemsProductCavity[0].checkItems as ICheckItem[]);
                    qcPickUp(productionPlan?.id);
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    useEffect(() => {
        if (!productionPlan) {
            return;
        }
        // get cavity
        if (productionPlan?.cavity == 1) {
            getProductCavity();
        } else {
            getProductEvaluation();
            qcPickUp(productionPlan?.id);
        }
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
                if (productEvaluation?.checkItems?.length) {
                    const checkItemFormatted = productEvaluation.checkItems.map((item) => {
                        return {
                            categoryCode: item.categoryCode,
                            name: item.name,
                            description: item.note,
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
    };

    const handleAddEvaluationCavity = (evaluationItem: any) => {
        const checkItemsTmp = [...checkItems];
        const newItem = {
            categoryCode: `CATADD-${new Date().getTime()}`,
            name: evaluationItem.name,
            note: evaluationItem.note,
            productImagePrototype: [evaluationItem.imageUrl],
            status: '',
            reportFileUri: '',
        };
        let nextStep = 0;
        if (checkItemsTmp?.length) {
            nextStep = stepItem + 1;
            checkItemsTmp.splice(nextStep, 0, newItem);
            setCheckItems([...checkItemsTmp]);
            setStepItem(nextStep);
        } else {
            checkItemsTmp.push(newItem);
            setCheckItems([...checkItemsTmp]);
        }

        const productCavitiesUpdate = [...productCavities].map((item) => {
            if (currentSelectedProductCavity?.id == item.id) {
                return {
                    ...item,
                    checkItems: [...checkItemsTmp],
                    stepItem: nextStep,
                };
            }
            return item;
        });
        setproductCavities(productCavitiesUpdate);
        const productCavity = productCavitiesUpdate.find(
            (item) => currentSelectedProductCavity?.id == item.id
        );
        if (productCavity) setCurrentSelectedProductCavity(productCavity);
    };

    const handleUpdateCheckItem = (index: number, updatedItem: ICheckItem) => {
        const checkItemsTmp = [...checkItems];
        checkItemsTmp[index] = { ...updatedItem };
        setCheckItems([...checkItemsTmp]);
    };

    const handleUpdateCheckItemCavity = (index: number, updatedItem: ICheckItem) => {
        const checkItemsTmp = [...checkItems];
        checkItemsTmp[index] = { ...updatedItem };
        setCheckItems([...checkItemsTmp]);
        const productCavitiesUpdate = [...productCavities].map((item) => {
            if (currentSelectedProductCavity?.id == item.id) {
                return {
                    ...item,
                    checkItems: [...checkItemsTmp],
                };
            }
            return item;
        });
        setproductCavities(productCavitiesUpdate);
        const productCavity = productCavitiesUpdate.find(
            (item) => currentSelectedProductCavity?.id == item.id
        );
        if (productCavity) setCurrentSelectedProductCavity(productCavity);
    };

    const handleSubmit = async (isFromCavity: boolean) => {
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

                if (isFromCavity) {
                    const productCavitiesUpdate = [...productCavities].map((item) => {
                        const isSubmitted =
                            currentSelectedProductCavity?.id == item.id ? true : item.isSubmitted;
                        return { ...item, isSubmitted };
                    });
                    setproductCavities(productCavitiesUpdate);
                    const productCavity = productCavitiesUpdate.find(
                        (item) => currentSelectedProductCavity?.id == item.id
                    );
                    if (productCavity) setCurrentSelectedProductCavity(productCavity);
                    toast.success('Gửi đánh giá thành công');

                    // submit all cavity
                    if (
                        productCavitiesUpdate.filter((item) => item.isSubmitted)?.length ==
                        productCavitiesUpdate.length
                    ) {
                        backHomeScreen();
                    }
                } else {
                    toast.success('Gửi đánh giá thành công');
                    backHomeScreen();
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleChangeProductCavity = (productCavity: ProductCheckItem) => {
        setCurrentSelectedProductCavity(productCavity);
        setStepItem(productCavity.stepItem || 0);
        setCheckItems(productCavity.checkItems as ICheckItem[]);
    };

    const handleUpdateStepItemCavity = (step: number) => {
        setStepItem(step);
        const productCavitiesUpdate = [...productCavities].map((item) => {
            return {
                ...item,
                stepItem: currentSelectedProductCavity?.id == item.id ? step : item.stepItem,
            };
        });
        setproductCavities(productCavitiesUpdate);
        const productCavity = productCavitiesUpdate.find(
            (item) => currentSelectedProductCavity?.id == item.id
        );
        if (productCavity) setCurrentSelectedProductCavity(productCavity);
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
                        let isNotFinishSubmit = false;
                        if (isCavityProduct) {
                            isNotFinishSubmit =
                                productCavities.filter((item) => item.isSubmitted)?.length > 0;
                        } else {
                            isNotFinishSubmit =
                                checkedItems > 0 && checkedItems < checkItems.length;
                        }
                        if (isNotFinishSubmit) {
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
                        {isCavityProduct && (
                            <TextWrap
                                style={styles.description}
                                color={themeVariables.colors.textDefault}
                            >
                                <TextWrap>Cavity: </TextWrap>
                                <TextWrap color={themeVariables.colors.primary}>
                                    {' '}
                                    {productCavities?.length}
                                </TextWrap>
                            </TextWrap>
                        )}
                    </FlexBox>
                </FlexBox>
                {!isCavityProduct ? (
                    <ProductEvaluationItem
                        layout={layout}
                        stepItem={stepItem}
                        setStepItem={setStepItem}
                        checkedItems={checkedItems}
                        checkItems={checkItems}
                        loadingSubmit={loadingSubmit}
                        onUpdateCheckItem={handleUpdateCheckItem}
                        onSubmit={handleSubmit}
                        onAddEvaluation={handleAddEvaluation}
                    />
                ) : (
                    <FlexBox direction="column" justifyContent="flex-start" alignItems="flex-start">
                        <FlexBox
                            style={{ flexWrap: 'wrap', marginVertical: 10 }}
                            justifyContent="flex-start"
                            alignItems="flex-start"
                        >
                            {productCavities.map((productCavity: ProductCheckItem, index: number) => (
                                <TouchableOpacity
                                    key={`product-cavity-tab-${productCavity.id}`}
                                    style={{
                                        borderWidth: 1,
                                        padding: 10,
                                        minWidth: 40,
                                        width: 150,
                                        borderColor: themeVariables.colors.borderColor,
                                        backgroundColor:
                                            currentSelectedProductCavity?.productCode ==
                                                productCavity.productCode ||
                                            productCavity.isSubmitted
                                                ? themeVariables.colors.primary200
                                                : themeVariables.colors.bgDefault,
                                    }}
                                    onPress={() => handleChangeProductCavity(productCavity)}
                                >
                                    <FlexBox gap={2}>
                                        <TextWrap
                                            fontSize={18}
                                            textAlign="center"
                                            numberOfLines={1}
                                            color={
                                                currentSelectedProductCavity?.productCode ==
                                                productCavity.productCode
                                                    ? themeVariables.colors.white
                                                    : themeVariables.colors.textDefault
                                            }
                                        >
                                            {productCavity.cavityCode || index + 1}
                                        </TextWrap>
                                        {productCavity?.isSubmitted && (
                                            <MaterialIcons
                                                name="done"
                                                style={{ marginLeft: 10 }}
                                                size={20}
                                                color="green"
                                            />
                                        )}
                                    </FlexBox>
                                </TouchableOpacity>
                            ))}
                        </FlexBox>
                        {currentSelectedProductCavity && (
                            <ProductEvaluationItem
                                currentSelectedProductCavity={currentSelectedProductCavity}
                                layout={layout}
                                stepItem={stepItem}
                                setStepItem={(step: number) => {
                                    handleUpdateStepItemCavity(step);
                                }}
                                checkedItems={checkedItems}
                                checkItems={checkItems}
                                loadingSubmit={loadingSubmit}
                                onUpdateCheckItem={handleUpdateCheckItemCavity}
                                onSubmit={() => handleSubmit(true)}
                                onAddEvaluation={handleAddEvaluationCavity}
                            />
                        )}
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
