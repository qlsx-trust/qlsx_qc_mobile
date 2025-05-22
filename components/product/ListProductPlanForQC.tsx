import { PAGE_SIZE, SCREEN_KEY } from '@/constants/common';
import { IProductionPlan, useProductionPlanContext } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { IThemeVariables } from '@/shared/theme/themes';
import Moment from 'moment';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import SearchBar from '../SearchBar';
import EmptyFolder from '../common/EmptyList/EmptyFolder';
import FlatListCustom from '../common/FlatListCustom';
import FlexBox from '../common/FlexBox';
import TextWrapper from '../common/TextWrap';
import { router } from 'expo-router';
import { toast } from '@/utils/ToastMessage';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import DateRangePickerModal from './DateRangePickerModal';

interface IListProductPlanForQCProps {}

const ListProductPlanForQC = ({}: IListProductPlanForQCProps) => {
    const dimensions = Dimensions.get('window');

    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    const { updateProductionPlan } = useProductionPlanContext();

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
    const [showDateRangeFilter, setShowDateRangeFilter] = useState<boolean>(false);

    const [numOfItemLine, setNumOfItemLine] = useState<number>(2);
    const isGridView = numOfItemLine == 2;

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

            const res = await CommonRepository.getListProductionPlanQC(params);
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

    const handleConfirmCode = async (planId: string) => {
        try {
            const response = await CommonRepository.getMostRecentProductionPlanById(planId);
            updateProductionPlan(response.data);
            router.push(`${SCREEN_KEY.product}`);
        } catch (error) {
            toast.error('Mã máy không hợp lệ, vui lòng thử lại');
        } finally {
        }
    };

    return (
        <>
            <FlexBox
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                gap={15}
                style={styles.header}
            >
                <SearchBar handleSearchText={debouncedSearch}  placeHolder="Tìm kiếm mã máy, mã sản phẩm, tên sản phẩm ..." />
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
                                        'MM/DD/YYYY'
                                    )}{' '}
                                    đến{' '}
                                    {Moment(filterParams.productionEndTime || '').format(
                                        'MM/DD/YYYY'
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
                styleMore={{ height: '100%', paddingHorizontal: 20, width: '100%' }}
                onRefreshing={() => {
                    handleRefreshProduct();
                }}
                onLoadMore={handleLoadMoreProduct}
                listData={productPlans}
                numColumns={numOfItemLine}
                key={`grid-view-${numOfItemLine}`}
                renderItemComponent={(item: IProductionPlan) => {
                    return (
                        <TouchableOpacity
                            onPress={() => handleConfirmCode(item.id)}
                            key={`product-item-${item.id}`}
                           style={{width: isGridView ? '50%' : '100%'}}
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
                                <TextWrapper fontSize={16}>Mã máy: {item.machineCode}</TextWrapper>
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
                                            'MM/DD/YYYY HH:mm'
                                        )}{' '}
                                        -{' '}
                                        {Moment(item?.productionEndTime || '').format(
                                            'MM/DD/YYYY HH:mm'
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
            <DateRangePickerModal
                filterParams={filterParams}
                modalProps={{
                    visible: showDateRangeFilter,
                    onClose: () => setShowDateRangeFilter(false),
                }}
                onUpdateDaterange={handleUpdateDateRangeFilter}
            />
        </>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 26,
        },
        header: {
            width: '100%',
            paddingHorizontal: 20,
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
        productCardItem: {
            paddingVertical: 15,
            borderWidth: 0.5,
            paddingHorizontal: 10,
            marginBottom: 1,
            marginRight:1,
            borderColor: themeVariables.colors.borderLightColor,
            gap: 10,
        },
    });

export default ListProductPlanForQC;
