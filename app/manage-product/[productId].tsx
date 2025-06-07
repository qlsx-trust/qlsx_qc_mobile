import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import { default as TextWrap, default as TextWrapper } from '@/components/common/TextWrap';
import LoadingScreen from '@/components/LoadingScreem';
import ManageProductDetailModal from '@/components/product/ManageProductDetailModal';
import ProductCheckItem from '@/components/product/ProductCheckItem';
import { BUTTON_COMMON_TYPE, PATH_SERVER_MEDIA } from '@/constants/common';
import { PUB_TOPIC } from '@/constants/pubTopic';
import { ICheckItem } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { containerStyles, IThemeVariables } from '@/shared/theme/themes';
import { IProduct, IProductCheckItem } from '@/types/product';
import { toast } from '@/utils/ToastMessage';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const ProductDetailManagementScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };
    const isMobilePhoneScreen = layout.width < 500;

    const { productId } = useLocalSearchParams<{
        productId: string;
    }>();

    const [isCavityProduct, setIsCavityProduct] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [productDetail, setProductDetail] = useState<IProduct | null>(null);

    const [productCheckItems, setProductCheckItems] = useState<IProductCheckItem[]>([]);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [showAddEvaluationItemModal, setShowAddEvaluationItemModal] = useState<boolean>(false);

    const [currentSelectedProductCavity, setCurrentSelectedProductCavity] = useState<
        IProduct | undefined
    >(undefined);
    const [productCavities, setproductCavities] = useState<IProduct[]>([]);

    useEffect(() => {
        getProductDetail();
    }, []);

    const getProductCavity = async (productDetail: IProduct) => {
        try {
            if (!productDetail?.productCode) {
                return;
            }
            const response = await CommonRepository.getProductCavities(productDetail?.productCode);
            if (response.data) {
                const checkItemsProductCavity: IProduct[] = (response.data || [])
                    .sort((a: IProduct, b: IProduct) => a.productCode.localeCompare(b.productCode))
                    .map((productCheckItem: IProduct) => {
                        return {
                            ...productCheckItem,
                            isSubmitted: false,
                        };
                    });
                setproductCavities(checkItemsProductCavity);
                if (checkItemsProductCavity?.length && !currentSelectedProductCavity) {
                    setCurrentSelectedProductCavity(checkItemsProductCavity[0]);
                    setProductCheckItems(
                        checkItemsProductCavity[0].checkItems as IProductCheckItem[]
                    );
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getProductDetail = async () => {
        try {
            setIsLoading(true);
            const res = await CommonRepository.getProductDetail(productId);
            if (!res.error) {
                const data = res.data;
                setProductDetail(data);
                setIsCavityProduct(data.isHasCavity);
                if (data.isHasCavity) {
                    await getProductCavity(data);
                } else {
                    setProductCheckItems(data.checkItems || []);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (isFromCavity: boolean) => {
        try {
            const productSubmit = isCavityProduct ? currentSelectedProductCavity : productDetail;
            if (!productSubmit?.id) {
                return;
            }
            const formdata = new FormData();
            formdata.append('ProductCode', productSubmit?.productCode);
            formdata.append('ProductName', productSubmit?.productName);
            const checkItems = productCheckItems.map((item) => {
                const isNewFileUpload =
                    item.productImagePrototype?.length &&
                    item.productImagePrototype[0] &&
                    !item.productImagePrototype[0].includes(PATH_SERVER_MEDIA);
                return {
                    CategoryCode: item.categoryCode,
                    Name: item.name,
                    Note: item.note,
                    ProductImagePrototype: isNewFileUpload ? [] : item.productImagePrototype,
                };
            });

            formdata.append('CheckItems', JSON.stringify(checkItems));
            formdata.append('RemoveDocument', JSON.stringify([]));

            productCheckItems.forEach((item) => {
                if (
                    item.productImagePrototype?.length &&
                    item.productImagePrototype[0] &&
                    !item.productImagePrototype[0].includes(PATH_SERVER_MEDIA)
                ) {
                    formdata.append(`category:${item.categoryCode}`, {
                        name: item.productImagePrototype[0].split('/').pop(),
                        type: 'image/jpeg',
                        uri: item.productImagePrototype[0],
                    });
                }
            });
            setLoadingSubmit(true);
            const res = await CommonRepository.updateProductDetail(productSubmit?.id, formdata);
            if (!res.error) {
                getProductDetail();
                PubSub.publish(PUB_TOPIC.RECALL_PRODUCT);
                toast.success('Chỉnh sửa thành công');
            } else {
                toast.error('Chỉnh sửa thất bại');
            }
        } catch (err) {
            console.error(err);
            setLoadingSubmit(false);
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleAddproductCheckItem = (newItem: any) => {
        const newItemFormat: IProductCheckItem = {
            categoryCode: `CAT-${new Date().getTime()}`,
            name: newItem.name,
            note: newItem.note,
            productImagePrototype: [newItem.imageUrl],
        };

        setProductCheckItems((data) => {
            data.push(newItemFormat);
            return data;
        });
        setShowAddEvaluationItemModal(false);
    };

    const handleAddproductCheckItemCavity = (newItem: any) => {
        const productCheckItemsTmp = [...productCheckItems];
        const newItemFormat: IProductCheckItem = {
            categoryCode: `CAT-${new Date().getTime()}`,
            name: newItem.name,
            note: newItem.note,
            productImagePrototype: [newItem.imageUrl],
        };
        productCheckItemsTmp.push(newItemFormat);
        setProductCheckItems([...productCheckItemsTmp]);
        const productCavitiesUpdate = [...productCavities].map((item) => {
            if (currentSelectedProductCavity?.id == item.id) {
                return {
                    ...item,
                    checkItems: [...productCheckItemsTmp],
                };
            }
            return item;
        });
        setproductCavities(productCavitiesUpdate);
        const productCavity = productCavitiesUpdate.find(
            (item) => currentSelectedProductCavity?.id == item.id
        );
        if (productCavity) setCurrentSelectedProductCavity(productCavity);
        setShowAddEvaluationItemModal(false);
    };

    const handleUpdateCheckItem = (index: number, updatedItem: any) => {
        const checkItemsTmp = [...productCheckItems];
        checkItemsTmp[index] = { ...updatedItem };
        setProductCheckItems([...checkItemsTmp]);
    };

    const handleUpdateCheckItemCavity = (index: number, updatedItem: ICheckItem) => {
        const checkItemsTmp = [...productCheckItems];
        checkItemsTmp[index] = { ...updatedItem };
        setProductCheckItems([...checkItemsTmp]);
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

    const handleRemoveCheckItem = (categoryCode: string) => {
        const checkItemsTmp = [...productCheckItems];
        setProductCheckItems(checkItemsTmp.filter((item) => item.categoryCode != categoryCode));
    };

    const handleRemoveCheckItemCavity = (categoryCode: string) => {
        const checkItemsTmp = [...productCheckItems].filter(
            (item) => item.categoryCode != categoryCode
        );
        setProductCheckItems([...checkItemsTmp]);
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

    const handleChangeProductCavity = (productCavity: IProduct) => {
        setCurrentSelectedProductCavity(productCavity);
        setProductCheckItems(productCavity.checkItems as IProductCheckItem[]);
    };

    if (isLoading) return <LoadingScreen />;

    return (
        <SafeAreaView style={styles.container} onLayout={onLayout}>
            <KeyboardAvoidingView>
                <View
                    style={{
                        paddingHorizontal: containerStyles.paddingHorizontal,
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            router.back();
                        }}
                        style={{ padding: 4 }}
                    >
                        <FlexBox justifyContent="flex-start">
                            <AntDesign
                                name="arrowleft"
                                size={20}
                                color={themeVariables.colors.bgRevert}
                                style={{ marginRight: 5 }}
                            />

                            <TextWrapper fontSize={16} fontWeight="bold">
                                {productDetail?.productName}
                            </TextWrapper>
                        </FlexBox>
                    </TouchableOpacity>

                    <FlexBox
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        style={{ marginTop: 10 }}
                    >
                        <TextWrapper
                            fontSize={18}
                            fontWeight="bold"
                            color={themeVariables.colors.primary}
                        >
                            Mã SP: {productDetail?.productCode}
                        </TextWrapper>
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
                                {isCavityProduct
                                    ? `Cavity: ${productCavities?.length}`
                                    : `Tiêu chí đánh giá (${productCheckItems.length} tiêu chí)`}
                            </TextWrapper>
                        </FlexBox>
                        <FlexBox
                            direction="column"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                            style={{ marginTop: 5 }}
                        >
                            <FlexBox
                                style={{ flexWrap: 'wrap', marginVertical: 10 }}
                                justifyContent="flex-start"
                                alignItems="flex-start"
                            >
                                {productCavities.map((productCavity: IProduct) => (
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
                                                productCavity.productCode
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
                                                {productCavity.productCode}
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
                            <FlexBox
                                justifyContent="space-between"
                                alignItems="flex-end"
                                width={'100%'}
                            >
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
                                    <AppButton
                                        label="Lưu"
                                        onPress={() => handleSubmit(isCavityProduct)}
                                        viewStyle={{}}
                                        isLoading={loadingSubmit}
                                        disabled={loadingSubmit || !productCheckItems}
                                        variant={BUTTON_COMMON_TYPE.PRIMARY}
                                    />
                                </FlexBox>
                            </FlexBox>
                        </FlexBox>
                        <ScrollView
                            contentContainerStyle={{
                                paddingBottom: isCavityProduct
                                    ? layout.height * 0.3
                                    : layout.height * 0.2,
                                width: layout.width - containerStyles.paddingHorizontal,
                            }}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps="always"
                            keyboardDismissMode="interactive"
                            scrollEventThrottle={20}
                        >
                            {productCheckItems.map((item, index: number) => (
                                <ProductCheckItem
                                    isMobilePhoneScreen={isMobilePhoneScreen}
                                    key={`product-item-${index}`}
                                    item={item}
                                    index={index}
                                    onUpdateCheckItem={(index: number, updatedItem: ICheckItem) =>
                                        isCavityProduct
                                            ? handleUpdateCheckItemCavity(index, updatedItem)
                                            : handleUpdateCheckItem(index, updatedItem)
                                    }
                                    onRemoveCheckItem={(categoryCode: string) =>
                                        isCavityProduct
                                            ? handleRemoveCheckItemCavity(categoryCode)
                                            : handleRemoveCheckItem(categoryCode)
                                    }
                                />
                            ))}
                        </ScrollView>
                    </FlexBox>
                </View>
                {showAddEvaluationItemModal && (
                    <ManageProductDetailModal
                        modalProps={{
                            visible: showAddEvaluationItemModal,
                            onClose: () => setShowAddEvaluationItemModal(false),
                        }}
                        onAddProductCheckItem={(data: any) =>
                            isCavityProduct
                                ? handleAddproductCheckItemCavity(data)
                                : handleAddproductCheckItem(data)
                        }
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
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
            marginBottom: 10,
        },
        productCardItem: {
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBottomColor: themeVariables.colors.borderLightColor,
            gap: 10,
        },
    });

export default ProductDetailManagementScreen;
