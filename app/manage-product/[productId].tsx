import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrapper from '@/components/common/TextWrap';
import LoadingScreen from '@/components/LoadingScreem';
import ManageProductDetailModal from '@/components/product/ManageProductDetailModal';
import ProductCheckItem from '@/components/product/ProductCheckItem';
import { BUTTON_COMMON_TYPE, PATH_SERVER_MEDIA } from '@/constants/common';
import { PUB_TOPIC } from '@/constants/pubTopic';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { containerStyles, IThemeVariables } from '@/shared/theme/themes';
import { IProduct, IProductCheckItem } from '@/types/product';
import { toast } from '@/utils/ToastMessage';
import { AntDesign } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { isBoolean } from 'lodash';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const ProductDetailManagementScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    const dimensions = Dimensions.get('window');

    const { productId } = useLocalSearchParams<{
        productId: string;
    }>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [productDetail, setProductDetail] = useState<IProduct | null>(null);

    const [productCheckItems, setProductCheckItems] = useState<IProductCheckItem[]>([]);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [showAddEvaluationItemModal, setShowAddEvaluationItemModal] = useState<boolean>(false);

    useEffect(() => {
        getProductDetail();
    }, []);

    const getProductDetail = async () => {
        try {
            setIsLoading(true);
            const res = await CommonRepository.getProductDetail(productId);
            if (!res.error) {
                const data = res.data;
                setProductDetail(data);
                setProductCheckItems(data.checkItems || []);
                            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const formdata = new FormData();
            formdata.append('ProductCode', productDetail?.productCode);
            formdata.append('ProductName', productDetail?.productName);
            const checkItems = productCheckItems.map((item) => {
                const isNewFileUpload =
                    isBoolean(item.productImagePrototype?.length &&
                    item.productImagePrototype[0] &&
                    !item.productImagePrototype[0].includes(PATH_SERVER_MEDIA));

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
            const res = await CommonRepository.updateProductDetail(productId, formdata);
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

    const handleUpdateCheckItem = (index: number, updatedItem: any) => {
        const checkItemsTmp = [...productCheckItems];
        checkItemsTmp[index] = { ...updatedItem };
        setProductCheckItems([...checkItemsTmp]);
    };
    const handleRemoveCheckItem = (categoryCode: string) => {
        const checkItemsTmp = [...productCheckItems];
        setProductCheckItems(checkItemsTmp.filter((item) => item.categoryCode != categoryCode));
    };

    if (isLoading) return <LoadingScreen />;

    return (
        // <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container}>
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
                            Tiêu chí đánh giá ({productCheckItems.length} tiêu chí)
                        </TextWrapper>
                    </FlexBox>
                    <FlexBox
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        style={{ marginTop: 5 }}
                    >
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
                                    label="Lưu đánh giá"
                                    onPress={handleSubmit}
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
            </View>
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
