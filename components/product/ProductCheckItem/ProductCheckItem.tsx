import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { IProductCheckItem } from '@/types/product';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, StyleSheet, TouchableOpacity } from 'react-native';
import ManageProductDetailModal from '../ManageProductDetailModal';
import PreviewImageModal from '@/components/common/PreviewImageModal';
import { Feather } from '@expo/vector-icons';
import { PATH_SERVER_MEDIA } from '@/constants/common';
import Config from '@/constants/config';
import ConfirmModal from '@/components/ConfirmModal';

interface Props {
    item: IProductCheckItem;
    index: number;
    isMobilePhoneScreen: boolean;
    onUpdateCheckItem: Function;
    onRemoveCheckItem: Function;
}
const ProductCheckItem = ({ item, index, isMobilePhoneScreen, onUpdateCheckItem, onRemoveCheckItem }: Props) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    const [evaluationItem, setEvaluationItem] = useState<IProductCheckItem>(item);
    const [showCheckItemEdit, setShowCheckItemEdit] = useState<boolean>(false);
    const [showPreviewImageModal, setShowPreviewImageModal] = useState<boolean>(false);
    const [showConfirmDeleteItem, setShowConfirmDeleteItem] = useState<boolean>(false);

    useEffect(() => {
        setEvaluationItem(item);
    }, [item]);

    const handleEdit = () => {
        setShowCheckItemEdit(true);
    };

    const urlImage = useMemo(() => {
        if (!item.productImagePrototype?.length) return '';
        const url = item.productImagePrototype[0];
        if (url.includes(PATH_SERVER_MEDIA)) {
            return `${Config.EXPO_PUBLIC_BACKEND_URL}${url}`;
        }

        return url;
    }, [item.productImagePrototype]);

    return (
        <FlexBox direction="column" style={styles.wrapItem} justifyContent='flex-start' alignItems='flex-start'>
            <TouchableOpacity onPress={handleEdit}>
                <FlexBox
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    gap={5}
                    style={{ paddingBottom: 10, paddingTop: 10 }}
                    >
                    {urlImage ? (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.preventDefault();
                                setShowPreviewImageModal(true);
                            }}
                        >
                            <Image
                                source={{ uri: urlImage }}
                                style={{ width: 100, height: 100, objectFit: 'cover' }}
                            />
                        </TouchableOpacity>
                    ) : (
                        <Image
                            source={{
                                uri: 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg',
                            }}
                            style={{ width: 100, height: 100, objectFit: 'cover' }}
                        />
                    )}
                    <FlexBox
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        style={{ width: isMobilePhoneScreen ? '70%' : '80%' }}
                        gap={5}
                    >
                        <TextWrap style={{ ...styles.title }} numberOfLines={1} textAlign="left">
                            {evaluationItem.name}
                        </TextWrap>
                        <TextWrap
                            style={{ ...styles.description }}
                            numberOfLines={3}
                            color={themeVariables.colors.subTextDefault}
                            textAlign="left"
                        >
                            {evaluationItem.note}
                        </TextWrap>
                    </FlexBox>
                    <TouchableOpacity
                        style={{ position: 'absolute', right: isMobilePhoneScreen ? 20 : 0, bottom: 0 }}
                        onPress={(e) => {
                            e.preventDefault();
                            setShowConfirmDeleteItem(true);
                        }}
                    >
                        <Feather name="trash-2" size={20} color={themeVariables.colors.danger} />
                    </TouchableOpacity>
                </FlexBox>
            </TouchableOpacity>
            
            {showCheckItemEdit && (
                <ManageProductDetailModal
                    checkItem={item}
                    onEditCheckItem={(data: any) => {
                        onUpdateCheckItem(index, {
                            ...item,
                            name: data.name,
                            note: data.note,
                            productImagePrototype: [data.imageUrl],
                        } as IProductCheckItem);
                        setShowCheckItemEdit(false);
                    }}
                    modalProps={{
                        visible: showCheckItemEdit,
                        onClose: () => setShowCheckItemEdit(false),
                    }}
                />
            )}

            {showConfirmDeleteItem && (
                <ConfirmModal
                    title="Xóa tiêu chí đánh giá ngoại quan"
                    description="Bạn có chắc muốn xóa tiêu chí đánh giá ngoại quan này?"
                    onConfirm={() => onRemoveCheckItem?.(item.categoryCode)}
                    modalProps={{
                        visible: showConfirmDeleteItem,
                        onClose: () => setShowConfirmDeleteItem(false),
                    }}
                />
            )}

            {urlImage && showPreviewImageModal && (
                <PreviewImageModal
                    source={urlImage}
                    modalProps={{
                        visible: showPreviewImageModal,
                        onClose: () => {
                            setShowPreviewImageModal(false);
                        },
                    }}
                />
            )}
        </FlexBox>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        wrapItem: {
            width: '100%',
            borderTopWidth: 1,
            borderTopColor: themeVariables.colors.borderColor,
            padding: 4,
            marginTop: 10,
            position: 'relative'
        },

        header: {
            fontSize: 24,
            fontWeight: '600',
        },
        title: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 20,
            width: '100%',
        },
        description: {
            fontSize: 13,
            width: '100%',
            color: themeVariables.colors.borderColor,
        },
        checkbox: {
            marginRight: 4,
        },
    });

export default ProductCheckItem;
