import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { IThemeVariables } from '@/shared/theme/themes';
import { IProduct } from '@/types/product';
import { toast } from '@/utils/ToastMessage';
import { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface IUpdateCavityCodeModalProps {
    productCavities: IProduct[];
    modalProps: CommonModalProps;
    onRecallListCavityProduct: Function;
}

const UpdateCavityCodeModal = ({
    productCavities,
    modalProps,
    onRecallListCavityProduct,
}: IUpdateCavityCodeModalProps) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    const [products, setProducts] = useState<IProduct[]>(productCavities);
    const [isLoading, setIsLoading] = useState<string>('');

    const handleUpdateNameCavity = async (newCode: string, product: IProduct) => {
        setProducts((current) =>
            current.map((item) => {
                return {
                    ...item,
                    cavityCode: item.id == product.id ? newCode : item.cavityCode,
                };
            })
        );
    };

    const handlSubmitNameCavity = async (product: IProduct) => {
        try {
            setIsLoading(product.id);
            const formdata = new FormData();
            formdata.append('CavityCode', product.cavityCode);
            formdata.append('ProductCode', product.productCode);
            formdata.append('ProductName', product.productName);
            const res = await CommonRepository.updateProductCavityCode(product.id, formdata);
            if (!res.error) {
                toast.success('Chỉnh sửa thành công');
                onRecallListCavityProduct?.();
            } else {
                toast.error('Chỉnh sửa thất bại');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading('');
        }
    };

    return (
        <KeyboardAvoidingView>
            <CommonModal {...modalProps} onLayoutProps={onLayout}>
                <FlexBox direction="column" width={'100%'}>
                    <TextWrap style={styles.header}>Chỉnh sửa danh sách tên cavity</TextWrap>
                </FlexBox>
                <ScrollView style={{ maxHeight: layout.height * 0.6, marginTop: 20 }}>
                    {products?.length &&
                        products.map((product: IProduct) => (
                            <FlexBox
                                direction="row"
                                style={{ marginTop: 15 }}
                                width={'100%'}
                                justifyContent="flex-start"
                                alignItems="center"
                                gap={20}
                                key={`product-cavity-${product.id}`}
                            >
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            borderWidth: 1,
                                            borderColor: themeVariables.colors.borderColor,
                                        },
                                    ]}
                                    value={product.cavityCode}
                                    onChangeText={(newCode) =>
                                        handleUpdateNameCavity(newCode, product)
                                    }
                                    placeholderTextColor={themeVariables.colors.bgGrey}
                                    placeholder="Tên cavity"
                                />

                                <AppButton
                                    isLoading={isLoading == product.id}
                                    disabled={!product.cavityCode || !!isLoading}
                                    variant={BUTTON_COMMON_TYPE.PRIMARY}
                                    label="Lưu"
                                    onPress={() => handlSubmitNameCavity(product)}
                                />
                            </FlexBox>
                        ))}
                </ScrollView>

                <FlexBox justifyContent="space-between" gap={16} style={{ marginTop: 20 }}>
                    <AppButton
                        viewStyle={styles.button}
                        variant={BUTTON_COMMON_TYPE.PRIMARY}
                        label="Đóng"
                        onPress={modalProps.onClose}
                    />
                </FlexBox>
            </CommonModal>
        </KeyboardAvoidingView>
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
            fontSize: 24,
            fontWeight: '600',
        },
        description: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 20,
        },
        button: {
            width: '50%',
        },
        textInput: {
            width: '70%',
            padding: 12,
            overflow: 'scroll',
            borderRadius: 12,
            borderStyle: 'solid',
            borderColor: themeVariables.colors.borderColor,
            borderWidth: 1,
            backgroundColor: themeVariables.colors.BackgroundInputArea,
            fontSize: 14,
            fontWeight: '400',
            color: themeVariables.colors.textDefault,
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

export default UpdateCavityCodeModal;
