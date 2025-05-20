import NoteIcon from '@/assets/note.svg';
import EmptyFolder from '@/components/common/EmptyList/EmptyFolder';
import FlatListCustom from '@/components/common/FlatListCustom';
import FlexBox from '@/components/common/FlexBox';
import TextWrapper from '@/components/common/TextWrap';
import CreateProductItem from '@/components/product/CreateProductItem';
import SearchBar from '@/components/SearchBar';
import { PAGE_SIZE, SCREEN_KEY } from '@/constants/common';
import { PUB_TOPIC } from '@/constants/pubTopic';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { containerStyles, IThemeVariables } from '@/shared/theme/themes';
import { IProduct } from '@/types/product';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

const productionManagementScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    // const { logout, user } = useAuthContext();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [retryCall, setRetryCall] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(1);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();
    const [filterParams, setFilterParams] = useState<{ name: string }>({ name: '' });

    /**
     * get list product
     */
    const getListProduct = async () => {
        const firstCall = pageNumber == 1;
        try {
            firstCall ? setIsLoading(true) : setIsLoadMore(true);
            const params = {
                Skip: (pageNumber - 1) * PAGE_SIZE.DEFAULT,
                Take: PAGE_SIZE.DEFAULT,
                Keyword: filterParams.name,
            };
            const res = await CommonRepository.getListProduct(params);
            if (!res.error) {
                const data = res.data;
                if (data?.items) {
                    const listProduct = firstCall ? data.items : products.concat(data.items);
                    setProducts(listProduct);
                    setTotalCount(data.count);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            firstCall ? setIsLoading(false) : setIsLoadMore(false);
        }
    };

    /**
     * Refresh product
     */
    const handleRefreshProduct = () => {
        setPageNumber(1);
        setRetryCall(new Date().getTime());
    };

    const handleLoadMoreProduct = () => {
        if (totalCount <= products.length) return;
        setPageNumber((pageNumber) => pageNumber + 1);
        setRetryCall(new Date().getTime());
    };

    /**
     * Debounce search
     */
    const debouncedSearch = (text: string) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        setDebounceTimer(
            setTimeout(() => {
                setPageNumber(1);
                setFilterParams({ ...filterParams, name: text });
                setRetryCall(new Date().getTime());
            }, 500)
        );
    };

    useEffect(() => {
        getListProduct();
    }, [retryCall]);

    useEffect(() => {
        PubSub.subscribe(PUB_TOPIC.RECALL_PRODUCT, () => {
            getListProduct();
        });
    }, []);

    const handleGoDetailProduct = (product: IProduct) => {
        const productId = product.id;
        router.push(`${SCREEN_KEY.manageProduct}/${productId}`);
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
                            style={{marginRight: 5}}
                        />

                        <TextWrapper fontSize={20} fontWeight="bold">
                            Danh sách sản phẩm
                        </TextWrapper>
                    </FlexBox>
                </TouchableOpacity>
                <SearchBar handleSearchText={debouncedSearch} placeHolder="Tìm kiếm ..." />
            </FlexBox>
            {/* List of folder */}
            <FlatListCustom
                isLoading={isLoading}
                isLoadMore={isLoadMore}
                styleMore={{ height: '100%', paddingHorizontal: 10 }}
                onRefreshing={() => {
                    handleRefreshProduct();
                }}
                numColumns={2}
                onLoadMore={handleLoadMoreProduct}
                listData={products}
                renderItemComponent={(item: IProduct) => {
                    return (
                        <TouchableOpacity
                            key={`product-item-${item.id}`}
                            onPress={() => handleGoDetailProduct(item)}
                            style={{width: '49.5%'}}
                        >
                            <FlexBox
                                direction="column"
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                style={styles.productCardItem}
                            >
                                <TextWrapper fontSize={16} numberOfLines={1}>{item.productName}</TextWrapper>
                                <FlexBox
                                    style={{ width: '100%' }}
                                    justifyContent="flex-start"
                                    gap={5}
                                >
                                    <TextWrapper
                                        fontSize={12}
                                        color={themeVariables.colors.subTextDefault}
                                        fontWeight="bold"
                                        numberOfLines={1}
                                    >
                                        Mã SP: {item.productCode}
                                    </TextWrapper>
                                    <FlexBox direction="row" gap={10} justifyContent="flex-start">
                                        {item?.checkItems !== undefined &&
                                        Number.isInteger(item?.checkItems?.length) ? (
                                            <FlexBox
                                                gap={2}
                                                style={{ minWidth: 100 }}
                                                justifyContent="flex-start"
                                            >
                                                <NoteIcon width={16} height={16} />
                                                <TextWrapper
                                                    fontSize={12}
                                                    numberOfLines={1}
                                                    color={themeVariables.colors.subTextDefault}
                                                >
                                                    {item.checkItems?.length} tiêu chí
                                                </TextWrapper>
                                            </FlexBox>
                                        ) : null}
                                    </FlexBox>
                                </FlexBox>
                            </FlexBox>
                        </TouchableOpacity>
                    );
                }}
                renderEmptyComponent={() => (
                    <EmptyFolder title="Không có sản phẩm nào" description="" />
                )}
            />
            <CreateProductItem />
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
            marginBottom: 10,
        },
        productCardItem: {
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderWidth: 0.5,
            marginBottom: 1,
            marginRight: 1,
            borderColor: themeVariables.colors.borderLightColor,
            gap: 10,
        },
    });

export default productionManagementScreen;
