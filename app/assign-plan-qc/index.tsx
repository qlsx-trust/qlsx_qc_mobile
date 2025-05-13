import EmptyFolder from '@/components/common/EmptyList/EmptyFolder';
import FlatListCustom from '@/components/common/FlatListCustom';
import FlexBox from '@/components/common/FlexBox';
import TextWrapper from '@/components/common/TextWrap';
import AssignQCModal from '@/components/product/AssignQCModal';
import SearchBar from '@/components/SearchBar';
import { PAGE_SIZE } from '@/constants/common';
import { PUB_TOPIC } from '@/constants/pubTopic';
import { IProductionPlan } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { IThemeVariables } from '@/shared/theme/themes';
import { IEmployee } from '@/types/employee';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import Moment from 'moment';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';

const PlanAssignmentScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    // const { logout, user } = useAuthContext();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
    const [productPlans, setProductPlans] = useState<IProductionPlan[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [retryCall, setRetryCall] = useState<number>(0);
    const [totalCount, setTotalCount] = useState<number>(1);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();
    const [filterParams, setFilterParams] = useState<{ name: string }>({ name: '' });
    const [selectedProductPlan, setSelectedProductPlan] = useState<IProductionPlan | null>(null);
    const [showAssignQcModal, setShowAssignQcModal] = useState<boolean>(false);

    const [employees, setEmployees] = useState<IEmployee[]>([]);

    useEffect(() => {
        const getQCEmployees = async () => {
            try {
                const response = await CommonRepository.getQCEmployees();
                if (response.data) {
                    setEmployees(response.data || []);
                }
            } catch (error) {}
        };
        getQCEmployees();
    }, []);

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

    useEffect(() => {
        PubSub.subscribe(PUB_TOPIC.RECALL_PRODUCTION_PLAN, () => {
            getListProduct();
        });
    }, []);

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
                            style={{marginRight: 10}}
                        />

                        <TextWrapper fontSize={20} fontWeight="bold">
                            Danh sách kế hoạch
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
                                        numberOfLines={1}
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
                                <FlexBox
                                    style={{ width: '100%' }}
                                    justifyContent="flex-start"
                                    gap={10}
                                >
                                    <TextWrapper
                                        fontSize={12}
                                        color={
                                            item?.assignedToQC?.length
                                                ? themeVariables.colors.primary
                                                : themeVariables.colors.danger
                                        }
                                        numberOfLines={1}
                                    >
                                        Giám sát:{' '}
                                        {item?.assignedToQC?.length
                                            ? item?.assignedToQC.join(', ')
                                            : 'Trống'}
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
                    employees={employees}
                    productPlan={selectedProductPlan}
                    modalProps={{
                        visible: showAssignQcModal,
                        onClose: () => setShowAssignQcModal(false),
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
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBottomColor: themeVariables.colors.borderLightColor,
            gap: 10,
        },
    });

export default PlanAssignmentScreen;
