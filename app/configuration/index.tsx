import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import { default as TextWrap, default as TextWrapper } from '@/components/common/TextWrap';
import LoadingScreen from '@/components/LoadingScreem';
import Config from '@/constants/config';
import { useThemeContext } from '@/providers/ThemeProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { containerStyles, IThemeVariables } from '@/shared/theme/themes';
import { toast } from '@/utils/ToastMessage';
import { AntDesign } from '@expo/vector-icons';
import axios, { HttpStatusCode } from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const ManageConfigurationScreen = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    const [toleranceTime, setToleranceTime] = useState<string>('0');
    const [isLoadingToleranceSubmit, setIsLoadingToleranceSubmit] = useState<boolean>(false);
    const [isLoadingPrepareDataTolerance, setIsLoadingPrepareDataTolerance] =
        useState<boolean>(true);
    const [isLoadingPrepareDataReview, setIsLoadingPrepareDataReview] = useState<boolean>(true);
    const [timeIntervalBetweenReview, setTimeIntervalBetweenReview] = useState<string>('0');
    const [isLoadingReviewSubmit, setIsLoadingReviewSubmit] = useState<boolean>(false);

    useEffect(() => {
        getToleranceTime();
        getReviewTime();
    }, []);

    const getToleranceTime = async () => {
        const response = await CommonRepository.getToleranceTimeQC();
        setToleranceTime(response?.data?.value);
        setIsLoadingPrepareDataTolerance(false);
    };

    const getReviewTime = async () => {
        const response = await CommonRepository.getConfigReviewTimeQC();
        setTimeIntervalBetweenReview(response?.data?.value);
        setIsLoadingPrepareDataReview(false);
    };

    const checkVaidNumber = (checkNum: string) => {
        return /^\d+$/.test(checkNum);
    };

    const handleConfigTolerance = async () => {
        try {
            setIsLoadingToleranceSubmit(true);
            const headers = {
                Accept: 'text/plain',
                'Content-Type': 'application/json',
            };

            const data = JSON.stringify(toleranceTime);
            const response = await axios.post(
                `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/setting-config/tolerance-time-qc`,
                data,
                {
                    headers,
                }
            );

            if (response.status != HttpStatusCode.Ok) {
                toast.success('Cấu hình không thành công');
            } else {
                toast.success('Cấu hình thành công');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingToleranceSubmit(false);
        }
    };

    const handleConfigReviewTime = async () => {
        try {
            setIsLoadingReviewSubmit(true);
            const headers = {
                Accept: 'text/plain',
                'Content-Type': 'application/json',
            };

            const data = JSON.stringify(timeIntervalBetweenReview);
            const response = await axios.post(
                `${Config.EXPO_PUBLIC_BACKEND_URL}/api/v1/setting-config/time-interval-between-reviews`,
                data,
                {
                    headers,
                }
            );

            if (response.status != HttpStatusCode.Ok) {
                toast.success('Cấu hình không thành công');
            } else {
                toast.success('Cấu hình thành công');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingReviewSubmit(false);
        }
    };

    if (isLoadingPrepareDataTolerance || isLoadingPrepareDataReview) return <LoadingScreen />;

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
                <FlexBox justifyContent="space-between" style={{ width: '100%' }}>
                    <TouchableOpacity
                        onPress={() => {
                            router.back();
                        }}
                        // style={{ padding: 4 }}
                    >
                        <FlexBox>
                            <AntDesign
                                name="arrowleft"
                                size={20}
                                color={themeVariables.colors.bgRevert}
                                style={{ marginRight: 5 }}
                            />

                            <TextWrapper fontSize={20} fontWeight="bold">
                                Cấu hình cài đặt
                            </TextWrapper>
                        </FlexBox>
                    </TouchableOpacity>
                </FlexBox>
            </FlexBox>
            <FlexBox
                direction="column"
                width={'100%'}
                justifyContent="flex-start"
                alignItems="flex-start"
                style={{ ...styles.header }}
            >
                <TextWrap style={styles.title}>1. Dung sai bắt đầu sản xuất (phút):</TextWrap>
                <TextWrap style={styles.description}>
                    *Khoảng thời gian sau khi bắt đầu tiến hành sản xuất nhân viên QC có thể đi đánh
                    giá
                </TextWrap>
                <FlexBox gap={20} style={{ marginTop: 10 }}>
                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                borderWidth: 1,
                                borderColor: themeVariables.colors.borderColor,
                                width: '70%',
                            },
                        ]}
                        value={toleranceTime}
                        onChangeText={setToleranceTime}
                        keyboardType="numbers-and-punctuation"
                        placeholderTextColor={themeVariables.colors.bgGrey}
                        placeholder="Thời gian"
                        maxLength={10}
                    />
                    <AppButton
                        disabled={!checkVaidNumber(toleranceTime) || isLoadingToleranceSubmit}
                        isLoading={isLoadingToleranceSubmit}
                        viewStyle={{}}
                        label="Lưu"
                        onPress={() => handleConfigTolerance()}
                    />
                </FlexBox>
                {!checkVaidNumber(toleranceTime) && (
                    <TextWrap style={styles.description} color={themeVariables.colors.danger}>
                        {toleranceTime
                            ? 'Giá trị phải là dạng số và lớn hơn hoặc bằng 0'
                            : 'Không được để trống'}
                    </TextWrap>
                )}
            </FlexBox>
             <FlexBox
                direction="column"
                width={'100%'}
                justifyContent="flex-start"
                alignItems="flex-start"
                style={{ ...styles.header }}
            >
                <TextWrap style={styles.title}>2. Dung sai đánh giá sản xuất (phút):</TextWrap>
                <TextWrap style={styles.description}>
                    *Khoảng thời gian giữa các lần đi đánh giá của QC
                </TextWrap>
                <FlexBox gap={20} style={{ marginTop: 10 }}>
                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                borderWidth: 1,
                                borderColor: themeVariables.colors.borderColor,
                                width: '70%',
                            },
                        ]}
                        value={timeIntervalBetweenReview}
                        onChangeText={setTimeIntervalBetweenReview}
                        keyboardType="numbers-and-punctuation"
                        placeholderTextColor={themeVariables.colors.bgGrey}
                        placeholder="Thời gian"
                        maxLength={10}
                    />
                    <AppButton
                        disabled={!checkVaidNumber(timeIntervalBetweenReview) || isLoadingReviewSubmit}
                        isLoading={isLoadingReviewSubmit}
                        viewStyle={{}}
                        label="Lưu"
                        onPress={() => handleConfigReviewTime()}
                    />
                </FlexBox>
                {!checkVaidNumber(timeIntervalBetweenReview) && (
                    <TextWrap style={styles.description} color={themeVariables.colors.danger}>
                        {timeIntervalBetweenReview
                            ? 'Giá trị phải là dạng số và lớn hơn hoặc bằng 0'
                            : 'Không được để trống'}
                    </TextWrap>
                )}
            </FlexBox>
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
            marginBottom: 20,
        },
        productCardItem: {
            paddingVertical: 15,
            borderBottomWidth: 1,
            width: '100%',
            borderBottomColor: themeVariables.colors.borderLightColor,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 26,
        },
        description: {
            fontSize: 14,
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
        cameraWrapper: {
            flex: 1,
            zIndex: 90,
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: themeVariables.colors.black50,
        },
        maskOutter: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'space-around',
        },
        cameraContainer: {
            flex: 1,
            zIndex: 100,
            position: 'absolute',
            // top: 0,
            left: 0,
            top: '50%',
            transform: [{ translateY: '-50%' }],
            backgroundColor: themeVariables.colors.black50,
        },
        maskInner: {
            width: 250,
            backgroundColor: 'transparent',
            borderColor: 'white',
            borderWidth: 1,
        },
        maskFrame: {
            backgroundColor: 'rgba(1, 1, 1, 0.628)',
        },
        maskRow: {
            width: '100%',
        },
        maskCenter: { flexDirection: 'row' },
        closeBox: {
            // height: 0,
            position: 'absolute',
            top: 80,
            right: 20,
            zIndex: 110,
        },
    });

export default ManageConfigurationScreen;
