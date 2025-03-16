import { useThemeContext } from '@/providers/ThemeProvider';
import { containerStyles, IThemeVariables } from '@/shared/theme/themes';
import { isIOS } from '@/utils/Mixed';
import {
    Dimensions,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import ConfirmModal from '@/components/ConfirmModal';
import { BUTTON_COMMON_TYPE, SCREEN_KEY } from '@/constants/common';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import EvaluationItem from '@/components/product/EvaluationItem';
import AppButton from '@/components/common/AppButton';
import AddEvaluationItemModal from '@/components/product/AddEvaluationItemModal';

const ProductScreen = () => {
    const dimensions = Dimensions.get('window');
    const { themeVariables, theme } = useThemeContext();
    const styles = styling(themeVariables);

    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [showAddEvaluationItemModal, setShowAddEvaluationItemModal] = useState<boolean>(false);

    const backHomeScreen = () => {
        router.replace(SCREEN_KEY.home);
    };

    const handlePreviewEvaluationForm = async () => {
        await WebBrowser.openBrowserAsync(
            'https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf'
        );
    };

    const handleAddEvaluation = (evaluationItem: string) => {};

    return (
        <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}>
            <SafeAreaView style={styles.container}>
                <FlexBox
                    gap={10}
                    height={'100%'}
                    width={'100%'}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TouchableOpacity
                        onPress={() => setShowConfirmModal(true)}
                        style={styles.closeButton}
                    >
                        <TextWrap
                            style={{
                                ...styles.description,
                                textDecorationLine: 'underline',
                                fontSize: 16,
                            }}
                            color={themeVariables.colors.danger}
                        >
                            Quay lại
                        </TextWrap>
                    </TouchableOpacity>
                    <FlexBox
                        gap={15}
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <TextWrap style={styles.header} color={themeVariables.colors.textDefault}>
                            Mã máy ép:{' '}
                            <TextWrap color={themeVariables.colors.primary}>XXXXX</TextWrap>
                        </TextWrap>
                        <FlexBox
                            gap={5}
                            direction="column"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                        >
                            <TextWrap
                                style={styles.description}
                                color={themeVariables.colors.textDefault}
                            >
                                Tên máy:{' '}
                                <TextWrap color={themeVariables.colors.primary}>máy XXX</TextWrap>
                            </TextWrap>
                            <TextWrap
                                style={styles.description}
                                color={themeVariables.colors.textDefault}
                            >
                                Bắt đầu phiên:{' '}
                                <TextWrap color={themeVariables.colors.primary}>
                                    10:00 09/03/2025
                                </TextWrap>
                            </TextWrap>
                            <TextWrap
                                style={styles.description}
                                color={themeVariables.colors.textDefault}
                            >
                                kết thúc phiên:{' '}
                                <TextWrap color={themeVariables.colors.primary}>
                                    16:00 09/03/2025
                                </TextWrap>
                            </TextWrap>
                            <FlexBox
                                direction="row"
                                gap={5}
                                justifyContent="flex-start"
                                alignItems="center"
                            >
                                <TextWrap
                                    style={styles.description}
                                    color={themeVariables.colors.textDefault}
                                >
                                    Mẫu tham khảo các mục đánh giá :
                                </TextWrap>
                                <TouchableOpacity onPress={handlePreviewEvaluationForm}>
                                    <TextWrap
                                        style={{ ...styles.description }}
                                        color={themeVariables.colors.primary}
                                    >
                                        <AntDesign
                                            name="pdffile1"
                                            size={18}
                                            color={themeVariables.colors.primary}
                                        />{' '}
                                        chi tiết
                                    </TextWrap>
                                </TouchableOpacity>
                            </FlexBox>
                        </FlexBox>
                    </FlexBox>
                    <FlexBox
                        gap={15}
                        direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <FlexBox
                            justifyContent="space-between"
                            alignItems="flex-end"
                            width={'100%'}
                        >
                            <TextWrap
                                style={styles.title}
                                color={themeVariables.colors.textDefault}
                            >
                                Các mục đánh giá (3/15)
                            </TextWrap>
                            <AppButton
                                label="Thêm mục"
                                onPress={() => setShowAddEvaluationItemModal(true)}
                                viewStyle={{}}
                                variant={BUTTON_COMMON_TYPE.PRIMARY_OUTLINE}
                            />
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
                            {new Array(20).fill(0).map((_, index: number) => (
                                <EvaluationItem key={`evaluation-item-${index}`} />
                            ))}
                        </ScrollView>
                    </FlexBox>
                </FlexBox>
                {showConfirmModal && (
                    <ConfirmModal
                        title="Trở lại"
                        description="Bạn có chắc muốn quay lại? Các thao tác hiện tại sẽ kết thúc."
                        onConfirm={backHomeScreen}
                        modalProps={{
                            visible: showConfirmModal,
                            onClose: () => setShowConfirmModal(false),
                        }}
                    />
                )}

                {showAddEvaluationItemModal && (
                    <AddEvaluationItemModal
                        onSuccess={handleAddEvaluation}
                        modalProps={{
                            visible: showAddEvaluationItemModal,
                            onClose: () => setShowAddEvaluationItemModal(false),
                        }}
                    />
                )}
            </SafeAreaView>
        </KeyboardAvoidingView>
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
            fontSize: 18,
            fontWeight: '400',
            lineHeight: 20,
            textAlign: 'center',
        },
        closeButton: {
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 110,
        },
    });

export default ProductScreen;
