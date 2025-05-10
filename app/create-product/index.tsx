import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import TextWrapper from '@/components/common/TextWrap';
import ManageProductDetailModal from '@/components/product/ManageProductDetailModal';
import ProductCheckItem from '@/components/product/ProductCheckItem';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import { PUB_TOPIC } from '@/constants/pubTopic';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { containerStyles, IThemeVariables } from '@/shared/theme/themes';
import { IProductCheckItem } from '@/types/product';
import { toast } from '@/utils/ToastMessage';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';

const productionCreateManagementScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    const dimensions = Dimensions.get('window');

    const [productCode, setProductCode] = useState<string>('');
    const [productName, setProductName] = useState<string>('');
    const [productCheckItems, setProductCheckItems] = useState<IProductCheckItem[]>([]);

    const [iSubmitLoading, setISubmitLoading] = useState<boolean>(false);
    const [showAddEvaluationItemModal, setShowAddEvaluationItemModal] = useState<boolean>(false);

    const isNotValidForm = useMemo(() => {
        return !productCode || !productName || !productCheckItems?.length;
    }, [productCode, productName, productCheckItems]);

    const handleSubmit = async () => {
        if (isNotValidForm) return;
        try {
            const formdata = new FormData();
            formdata.append('ProductCode', productCode);
            formdata.append('ProductName', productName);
            const checkItems = productCheckItems.map((item) => {
                return {
                    CategoryCode: item.categoryCode,
                    Name: item.name,
                    Note: item.note,
                    ProductImagePrototype: item.productImagePrototype?.length
                        ? [item.productImagePrototype[0]]
                        : [],
                };
            });
            formdata.append('CheckItems', JSON.stringify(checkItems));
            productCheckItems.forEach((item) => {
                if (item.productImagePrototype?.length) {
                    formdata.append(`category:${item.categoryCode}`, {
                        name: item.productImagePrototype[0].split('/').pop(),
                        type: 'image/jpeg',
                        uri: item.productImagePrototype[0],
                    });
                }
            });
            setISubmitLoading(true);
            const res = await CommonRepository.createProductDetail(formdata);
            if (!res.error) {
                PubSub.publish(PUB_TOPIC.RECALL_PRODUCT);
                router.back();
                toast.success('Thêm thành công');
            } else {
                toast.error('Thêm thất bại');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setISubmitLoading(false);
        }
    };

    const handleAddproductCheckItem = (newItem: any) => {
        const newItemFormat: IProductCheckItem = {
            categoryCode: `CAT-${new Date().getTime()}`,
            name: newItem.name,
            note: newItem.note,
            productImagePrototype: [newItem.imageUrl],
        };
        const checkItemsTmp = [...productCheckItems];
        checkItemsTmp.push(newItemFormat);
        setProductCheckItems(checkItemsTmp);
        setShowAddEvaluationItemModal(false);
    };

    const handleUpdateCheckItem = (index: number, updatedItem: any) => {
        const checkItemsTmp = [...productCheckItems];
        checkItemsTmp[index] = { ...updatedItem };
        setProductCheckItems([...checkItemsTmp]);
    };
    const handleRemoveCheckItem = (categoryCode: string) => {
        const checkItemsTmp = [...productCheckItems];
        setProductCheckItems(checkItemsTmp.filter((item) => item.categoryCode != categoryCode));
    };

    return (
        // <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container}>
            <FlexBox
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                gap={15}
                style={styles.header}
            >
                <FlexBox justifyContent="space-between" style={{ width: '100%' }}>
                    <TouchableOpacity
                        onPress={() => {
                            router.back();
                        }}
                        style={{ padding: 4 }}
                    >
                        <FlexBox>
                            <AntDesign
                                name="arrowleft"
                                size={20}
                                color={themeVariables.colors.bgRevert}
                            />

                            <TextWrapper fontSize={20} fontWeight="bold">
                                Tạo sản phẩm
                            </TextWrapper>
                        </FlexBox>
                    </TouchableOpacity>
                    <AppButton
                        disabled={isNotValidForm || iSubmitLoading}
                        isLoading={iSubmitLoading}
                        label="Tạo mới"
                        onPress={handleSubmit}
                    />
                </FlexBox>
            </FlexBox>
            <FlexBox
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                gap={10}
                style={{ paddingHorizontal: 20, marginTop: 10 }}
            >
                <FlexBox
                    direction="column"
                    width={'100%'}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TextWrap style={styles.description}>Mã sản phẩm:</TextWrap>
                    <TextInput
                        style={[
                            styles.textInput,
                            { borderWidth: 1, borderColor: themeVariables.colors.borderColor },
                        ]}
                        value={productCode}
                        onChangeText={setProductCode}
                        placeholderTextColor={themeVariables.colors.bgGrey}
                        placeholder="Mã SP"
                    />
                </FlexBox>
                <FlexBox
                    direction="column"
                    width={'100%'}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TextWrap style={styles.description}>Tên sản phẩm:</TextWrap>
                    <TextInput
                        style={[
                            styles.textInput,
                            { borderWidth: 1, borderColor: themeVariables.colors.borderColor },
                        ]}
                        value={productName}
                        onChangeText={setProductName}
                        placeholderTextColor={themeVariables.colors.bgGrey}
                        placeholder="Tên SP"
                    />
                </FlexBox>
                <FlexBox
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    style={{ marginTop: 0 }}
                >
                    <TextWrapper
                        fontSize={16}
                        color={themeVariables.colors.textDefault}
                        style={{ marginTop: 10 }}
                    >
                        Tiêu chí đánh giá ({productCheckItems.length} tiêu chí)
                    </TextWrapper>
                </FlexBox>
                <FlexBox
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    style={{ marginTop: 5 }}
                >
                    <FlexBox justifyContent="space-between" alignItems="flex-end" width={'100%'}>
                        <FlexBox
                            justifyContent="space-between"
                            alignItems="flex-end"
                            width={'100%'}
                        >
                            <AppButton
                                label="Thêm tiêu chí"
                                onPress={() => setShowAddEvaluationItemModal(true)}
                                viewStyle={{}}
                                variant={BUTTON_COMMON_TYPE.CANCEL}
                            />
                        </FlexBox>
                    </FlexBox>
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
                    {productCheckItems.map((item, index: number) => (
                        <ProductCheckItem
                            key={`product-item-${index}`}
                            item={item}
                            index={index}
                            onUpdateCheckItem={handleUpdateCheckItem}
                            onRemoveCheckItem={handleRemoveCheckItem}
                        />
                    ))}
                </ScrollView>
            </FlexBox>
            {showAddEvaluationItemModal && (
                <ManageProductDetailModal
                    modalProps={{
                        visible: showAddEvaluationItemModal,
                        onClose: () => setShowAddEvaluationItemModal(false),
                    }}
                    onAddProductCheckItem={handleAddproductCheckItem}
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
            paddingVertical: 50,
            width: '100%',
            height: '100%',
            position: 'relative',
        },
        main: {
            width: '100%',
            height: '100%',
        },
        camera: {
            flex: 1,
        },
        buttonContainer: {
            flex: 1,
            flexDirection: 'row',
            backgroundColor: 'transparent',
            margin: 64,
        },
        header: {
            width: '100%',
            paddingHorizontal: containerStyles.paddingHorizontal,
        },
        productCardItem: {
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBottomColor: themeVariables.colors.borderLightColor,
            gap: 10,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 26,
        },
        description: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 20,
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
    });

export default productionCreateManagementScreen;
