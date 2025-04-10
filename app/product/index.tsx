import { useThemeContext } from '@/providers/ThemeProvider';
import { containerStyles, IThemeVariables } from '@/shared/theme/themes';
import { isIOS } from '@/utils/Mixed';
import {
    Dimensions,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import ConfirmModal from '@/components/ConfirmModal';
import AddEvaluationItemModal from '@/components/product/AddEvaluationItemModal';
import EvaluationItem from '@/components/product/EvaluationItem';
import { BUTTON_COMMON_TYPE, SCREEN_KEY } from '@/constants/common';
import { ICheckItem, useProductionPlanContext } from '@/providers/ProductionPlanProvider';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Moment from 'moment';
import { useState } from 'react';
import { CommonRepository } from '@/repositories/CommonRepository';
import { toast } from '@/utils/ToastMessage';

const ProductScreen = () => {
    const dimensions = Dimensions.get('window');
    const { themeVariables, theme } = useThemeContext();
    const { productionPlan } = useProductionPlanContext();
    const styles = styling(themeVariables);

    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [showAddEvaluationItemModal, setShowAddEvaluationItemModal] = useState<boolean>(false);


    const [checkItems, setCheckItems] = useState<ICheckItem[]>([
        {
            categoryCode: 'CAT001',
            name: 'Check Item 1',
            note: '',
            status: '',
            reportFileUri: '',
        },
    ]);

    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

    const checkedItems =
        checkItems?.length > 0 ? checkItems.filter((item) => item.status).length : 0;

    const backHomeScreen = () => {
        router.replace(SCREEN_KEY.home);
    };

    const handlePreviewEvaluationForm = async () => {
        await WebBrowser.openBrowserAsync(
            'https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf'
        );
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
            console.log('response: ', JSON.stringify(response.error));
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
        <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
            <SafeAreaView style={styles.container}>
                <FlexBox
                    gap={10}
                    height={'100%'}
                    width={'100%'}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TouchableOpacity
                        onPress={() => setShowConfirmModal(true)}
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
                            Mã máy ép:
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
                                Tên sản phẩm:{' '}
                                <TextWrap color={themeVariables.colors.primary}>
                                    {' '}
                                    {productionPlan?.productName}
                                </TextWrap>
                            </TextWrap>
                            <TextWrap
                                style={styles.description}
                                color={themeVariables.colors.textDefault}
                            >
                                CTSX:{' '}
                                <TextWrap color={themeVariables.colors.primary}>
                                    {' '}
                                    {productionPlan?.productCode}
                                </TextWrap>
                            </TextWrap>
                            <TextWrap
                                style={styles.description}
                                color={themeVariables.colors.textDefault}
                            >
                                Khuôn:{' '}
                                <TextWrap color={themeVariables.colors.primary}>
                                    {' '}
                                    {productionPlan?.moldCode}
                                </TextWrap>{' '}
                                NVL:{' '}
                                <TextWrap color={themeVariables.colors.primary}>
                                    {' '}
                                    {productionPlan?.materialCode}
                                </TextWrap>
                            </TextWrap>
                            <TextWrap
                                style={styles.description}
                                color={themeVariables.colors.textDefault}
                            >
                                Bắt đầu phiên:{' '}
                                <TextWrap color={themeVariables.colors.primary}>
                                    {Moment(productionPlan?.productionStartTime || '').format(
                                        'MM/DD/YYYY HH:mm'
                                    )}
                                </TextWrap>
                            </TextWrap>
                            <TextWrap
                                style={styles.description}
                                color={themeVariables.colors.textDefault}
                            >
                                kết thúc phiên:{' '}
                                <TextWrap color={themeVariables.colors.primary}>
                                    {Moment(productionPlan?.productionEndTime || '').format(
                                        'MM/DD/YYYY HH:mm'
                                    )}
                                </TextWrap>
                            </TextWrap>
                            <FlexBox
                                direction="row"
                                gap={5}
                                justifyContent="flex-start"
                                alignItems="center"
                            >
                                <TextWrap
                                    style={styles.description}
                                    color={themeVariables.colors.textDefault}
                                >
                                    Mẫu tham khảo các mục đánh giá :
                                </TextWrap>
                                <TouchableOpacity onPress={handlePreviewEvaluationForm}>
                                    <TextWrap
                                        style={{ ...styles.description }}
                                        color={themeVariables.colors.primary}
                                    >
                                        <AntDesign
                                            name="pdffile1"
                                            size={18}
                                            color={themeVariables.colors.primary}
                                        />{' '}
                                        chi tiết
                                    </TextWrap>
                                </TouchableOpacity>
                            </FlexBox>
                        </FlexBox>
                    </FlexBox>
                    <FlexBox direction="column" justifyContent="flex-start" alignItems="flex-start">
                        <FlexBox
                            justifyContent="space-between"
                            alignItems="flex-end"
                            width={'100%'}
                        >
                            <TextWrap
                                style={styles.title}
                                color={themeVariables.colors.textDefault}
                            >
                                Các mục đánh giá ({checkedItems}/{checkItems.length})
                            </TextWrap>
                        </FlexBox>
                        <FlexBox
                            justifyContent="space-between"
                            alignItems="flex-end"
                            width={'100%'}
                        >
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
                                disabled={loadingSubmit || !checkedItems}
                                variant={BUTTON_COMMON_TYPE.PRIMARY}
                            />
                        </FlexBox>
                        <ScrollView
                            contentContainerStyle={{
                                paddingBottom: dimensions.height * 0.2,
                                width: dimensions.width - 2 * containerStyles.paddingHorizontal,
                            }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="always"
                            keyboardDismissMode="interactive"
                            scrollEventThrottle={20}
                        >
                            {checkItems.map((item, index: number) => (
                                <EvaluationItem
                                    key={`evaluation-item-${index}`}
                                    item={item}
                                    index={index}
                                    onUpdateCheckItem={handleUpdateCheckItem}
                                />
                            ))}
                        </ScrollView>
                    </FlexBox>
                </FlexBox>
                {showConfirmModal && (
                    <ConfirmModal
                        title="Trở lại"
                        description="Bạn có chắc muốn quay lại? Các thao tác hiện tại sẽ kết thúc."
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
        </KeyboardAvoidingView>
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
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 20,
        },
        closeButton: {
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 110,
        },
    });

export default ProductScreen;
