import { ICheckItem, ProductCheckItem } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import FlexBox from '../common/FlexBox';
import TextWrap from '../common/TextWrap';
import AppButton from '../common/AppButton';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import CheckListItem from './CheckListItem';
import ManageProductDetailModal from './ManageProductDetailModal';
import { useState } from 'react';
import { IThemeVariables } from '@/shared/theme/themes';
import { StyleSheet } from 'react-native';

interface ProductEvaluationItemProps {
    layout: any;
    currentSelectedProductCavity?: ProductCheckItem;
    stepItem: number;
    setStepItem: (step: number) => void;
    checkedItems: number;
    loadingSubmit: boolean;
    checkItems: ICheckItem[];
    onUpdateCheckItem: Function;
    onSubmit: Function;
    onAddEvaluation: Function;
}

const ProductEvaluationItem = ({
    layout,
    stepItem,
    setStepItem,
    checkedItems,
    currentSelectedProductCavity,
    checkItems,
    loadingSubmit,
    onUpdateCheckItem,
    onSubmit,
    onAddEvaluation,
}: ProductEvaluationItemProps) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [showAddEvaluationItemModal, setShowAddEvaluationItemModal] = useState<boolean>(false);
    const isProductCavity = !!currentSelectedProductCavity;

    const enableSubmitEvaluation =
        checkItems?.length &&
        checkItems?.every((item) => {
            return (
                item.status == 'ok' || (item.status == 'ng' && (item.note || item.reportFileUri))
            );
        });

    return (
        <>
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
                        onPress={() => onSubmit()}
                        viewStyle={{ width: 150 }}
                        isLoading={loadingSubmit}
                        disabled={
                            loadingSubmit ||
                            !checkedItems ||
                            !enableSubmitEvaluation ||
                            (isProductCavity && currentSelectedProductCavity.isSubmitted)
                        }
                        variant={BUTTON_COMMON_TYPE.PRIMARY}
                    />
                </FlexBox>
            </FlexBox>
            {checkItems?.length ? (
                <FlexBox style={{ width: '100%' }}>
                    <FlexBox direction="column" style={{ width: '100%' }}>
                        <CheckListItem
                            layout={layout}
                            isDisableAction={isProductCavity ? !!currentSelectedProductCavity.isSubmitted : false}
                            checkItems={checkItems}
                            sessionCheckItem={checkItems[stepItem]}
                            index={stepItem}
                            onUpdateCheckItem={onUpdateCheckItem}
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

            {showAddEvaluationItemModal && (
                <ManageProductDetailModal
                    modalProps={{
                        visible: showAddEvaluationItemModal,
                        onClose: () => setShowAddEvaluationItemModal(false),
                    }}
                    onAddProductCheckItem={(data: any) => {
                        onAddEvaluation(data);
                        setShowAddEvaluationItemModal(false);
                    }}
                />
            )}
        </>
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

export default ProductEvaluationItem;
