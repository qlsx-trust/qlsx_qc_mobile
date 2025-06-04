import EmptyFolder from '@/components/common/EmptyList/EmptyFolder';
import FlatListCustom from '@/components/common/FlatListCustom';
import FlexBox from '@/components/common/FlexBox';
import TextWrapper from '@/components/common/TextWrap';
import AssignQCModal from '@/components/product/AssignQCModal';
import DateRangePickerModal from '@/components/product/DateRangePickerModal';
import SearchBar from '@/components/SearchBar';
import { PAGE_SIZE } from '@/constants/common';
import { IProductionPlan } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { IThemeVariables } from '@/shared/theme/themes';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { default as moment, default as Moment } from 'moment';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

const PlanAssignmentScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    // const { logout, user } = useAuthContext();
    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
    const [productPlans, setProductPlans] = useState<IProductionPlan[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [retryCall, setRetryCall] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(1);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();
    const [filterParams, setFilterParams] = useState<{
        name: string;
        productionStartTime: string;
        productionEndTime: string;
    }>({
        name: '',
        productionStartTime: moment(new Date()).format('YYYY-MM-DD'),
        productionEndTime: moment(new Date()).add(1, 'days').format('YYYY-MM-DD'),
    });
    const [selectedProductPlan, setSelectedProductPlan] = useState<IProductionPlan | null>(null);
    const [showAssignQcModal, setShowAssignQcModal] = useState<boolean>(false);
    const [numOfItemLine, setNumOfItemLine] = useState<number>(2);

    const isGridView = numOfItemLine == 2;

    const [showDateRangeFilter, setShowDateRangeFilter] = useState<boolean>(false);

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
                ProductionStartTime: filterParams.productionStartTime,
                ProductionEndTime: filterParams.productionEndTime,
            };

            const res = await CommonRepository.getListProductionPlan(params);
            if (!res.error) {
                const data = res.data;
                if (data?.items) {
                    const listProduct = firstCall ? data.items : productPlans.concat(data.items);
                    setProductPlans(listProduct);
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
        if (totalCount <= productPlans.length) return;
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

    const checkTimeBackground = (product: IProductionPlan) => {
        if (new Date().getTime() < new Date(product.productionStartTime).getTime()) {
            return 'transparent';
        }

        if (
            new Date().getTime() > new Date(product.productionStartTime).getTime() &&
            new Date().getTime() < new Date(product.productionEndTime).getTime()
        ) {
            return '#f5f383';
        }

        return '#e3e2e2';
    };

    const handleUpdateDateRangeFilter = (startDate: Date, endDate: Date) => {
        setFilterParams({
            ...filterParams,
            productionStartTime: moment(startDate).format('YYYY-MM-DD'),
            productionEndTime: moment(endDate).format('YYYY-MM-DD'),
        });
        setRetryCall(new Date().getTime());
    };

    return (
        // <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
        <SafeAreaView style={styles.container} onLayout={onLayout}>
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
                            style={{ marginRight: 10 }}
                        />

                        <TextWrapper fontSize={20} fontWeight="bold">
                            Phân công CTSX
                        </TextWrapper>
                    </FlexBox>
                </TouchableOpacity>
                <SearchBar
                    handleSearchText={debouncedSearch}
                    placeHolder="Tìm kiếm mã máy, mã sản phẩm, tên sản phẩm ..."
                />
                <FlexBox justifyContent="space-between" style={{ width: '100%' }}>
                    <FlexBox
                        style={{
                            width: 'auto',
                            borderRadius: 10,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: themeVariables.colors.primary,
                        }}
                        gap={5}
                    >
                        <MaterialCommunityIcons name="calendar-text" size={24} color="black" />

                        <TouchableOpacity onPress={() => setShowDateRangeFilter(true)}>
                            {filterParams.productionStartTime ? (
                                <TextWrapper>
                                    Từ{' '}
                                    {Moment(filterParams.productionStartTime || '').format(
                                        'DD/MM/YYYY'
                                    )}{' '}
                                    đến{' '}
                                    {Moment(filterParams.productionEndTime || '').format(
                                        'DD/MM/YYYY'
                                    )}
                                </TextWrapper>
                            ) : (
                                <TextWrapper>Chọn thời gian</TextWrapper>
                            )}
                        </TouchableOpacity>
                    </FlexBox>
                    <FlexBox gap={10}>
                        <TouchableOpacity onPress={() => setNumOfItemLine(1)}>
                            <MaterialCommunityIcons
                                name="table-of-contents"
                                size={40}
                                color={
                                    !isGridView
                                        ? themeVariables.colors.primary
                                        : themeVariables.colors.textDefault
                                }
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setNumOfItemLine(2)}>
                            <MaterialIcons
                                name="grid-view"
                                size={30}
                                color={
                                    isGridView
                                        ? themeVariables.colors.primary
                                        : themeVariables.colors.textDefault
                                }
                            />
                        </TouchableOpacity>
                    </FlexBox>
                </FlexBox>
            </FlexBox>
            {/* List of folder */}
            <FlatListCustom
                isLoading={isLoading}
                isLoadMore={isLoadMore}
                styleMore={{ height: '100%', paddingHorizontal: 10 }}
                onRefreshing={() => {
                    handleRefreshProduct();
                }}
                numColumns={numOfItemLine}
                key={`view-mode-${numOfItemLine}`}
                onLoadMore={handleLoadMoreProduct}
                listData={productPlans}
                renderItemComponent={(item: IProductionPlan) => {
                    return (
                        <TouchableOpacity
                            key={`product-item-${item.id}`}
                            onPress={() => {
                                setSelectedProductPlan(item);
                                setShowAssignQcModal(true);
                            }}
                            style={{ width: isGridView ? '50%' : '100%' }}
                        >
                            <FlexBox
                                direction="column"
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                style={{
                                    ...styles.productCardItem,
                                    backgroundColor: checkTimeBackground(item),
                                }}
                            >
                                <TextWrapper fontSize={16}>
                                    {item.machineCode} -{' '}
                                    <TextWrapper
                                        fontSize={16}
                                        color={
                                            item?.assignedToQC?.length
                                                ? themeVariables.colors.primary
                                                : themeVariables.colors.danger
                                        }
                                        numberOfLines={1}
                                    >
                                        {item?.assignedToQC?.length
                                            ? item?.assignedToQC.join(', ')
                                            : 'Trống'}
                                    </TextWrapper>
                                </TextWrapper>
                                <FlexBox
                                    style={{ width: '100%' }}
                                    justifyContent="flex-start"
                                    gap={10}
                                >
                                    <TextWrapper
                                        fontSize={12}
                                        color={themeVariables.colors.primary}
                                    >
                                        {item.productCode}
                                    </TextWrapper>
                                    <TextWrapper
                                        fontSize={12}
                                        color={themeVariables.colors.subTextDefault}
                                        numberOfLines={1}
                                    >
                                        {item.productName}
                                    </TextWrapper>
                                </FlexBox>
                                <FlexBox
                                    style={{ width: '100%' }}
                                    justifyContent="flex-start"
                                    gap={10}
                                >
                                    <TextWrapper
                                        fontSize={12}
                                        color={themeVariables.colors.subTextDefault}
                                        numberOfLines={1}
                                    >
                                        {Moment(item?.productionStartTime || '').format(
                                            'DD/MM/YYYY HH:mm'
                                        )}{' '}
                                        -{' '}
                                        {Moment(item?.productionEndTime || '').format(
                                            'DD/MM/YYYY HH:mm'
                                        )}
                                    </TextWrapper>
                                </FlexBox>
                            </FlexBox>
                        </TouchableOpacity>
                    );
                }}
                renderEmptyComponent={() => (
                    <EmptyFolder title="Không có CTSX nào" description="" />
                )}
            />

            {selectedProductPlan && showAssignQcModal && (
                <AssignQCModal
                    productPlan={selectedProductPlan}
                    modalProps={{
                        visible: showAssignQcModal,
                        onClose: () => setShowAssignQcModal(false),
                    }}
                    onRecallListProductPlan={() => {
                        setIsLoadMore(false);
                        setPageNumber(1)
                        setRetryCall(new Date().getTime());
                    }}
                />
            )}

            <DateRangePickerModal
                filterParams={filterParams}
                modalProps={{
                    visible: showDateRangeFilter,
                    onClose: () => setShowDateRangeFilter(false),
                }}
                onUpdateDaterange={handleUpdateDateRangeFilter}
            />
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
            paddingHorizontal: 10,
            marginBottom: 10,
        },
        productCardItem: {
            paddingVertical: 15,
            marginBottom: 1,
            marginRight: 1,
            paddingHorizontal: 15,
            borderWidth: 0.5,
            borderColor: themeVariables.colors.borderLightColor,
            gap: 10,
        },
    });

export default PlanAssignmentScreen;
