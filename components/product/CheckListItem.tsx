import FlexBox from '@/components/common/FlexBox';
import PreviewImageModal from '@/components/common/PreviewImageModal';
import TextWrap from '@/components/common/TextWrap';
import { ACCESS_CAMERA, KEY_REQUEST_CAMERA_PERMISSION } from '@/constants/common';
import Config from '@/constants/config';
import { ICheckItem } from '@/providers/ProductionPlanProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { getDataStorage, setDataStorage } from '@/utils/KeychainHelper';
import { toast } from '@/utils/ToastMessage';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Keyboard,
    Linking,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
    sessionCheckItem: ICheckItem;
    index: number;
    onUpdateCheckItem: Function;
}
const CheckListItem = ({ sessionCheckItem, index, onUpdateCheckItem }: Props) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [showPreviewImageModal, setShowPreviewImageModal] = useState<boolean>(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

    const [imageUrl, setImageUrl] = useState<string>(sessionCheckItem.reportFileUri);
    const [feedback, setFeedback] = useState<string>(sessionCheckItem.note);

    const productImageModel = sessionCheckItem?.productImagePrototype
        ? `${Config.EXPO_PUBLIC_BACKEND_URL}${sessionCheckItem.productImagePrototype[0]}`
        : null;

    const isOK = sessionCheckItem.status == 'ok';
    const isNG = sessionCheckItem.status == 'ng';

    useEffect(() => {
        PubSub.subscribe('TAKE_PHOTO_CHECK_ITEM', (_, url: string) => {
            setImageUrl(url);
            updateChangeReportImage(url);
        });

        return () => {
            PubSub.unsubscribe('TAKE_PHOTO_CHECK_ITEM');
        };
    }, [sessionCheckItem]);

    const handleShowCamera = (isShowCamera: boolean) => {
        PubSub.publish('HANDLE_CAMERA_CHECK_ITEM', isShowCamera);
    };

    useEffect(() => {
        if (!sessionCheckItem) return;
        handleShowCamera(false);
        setImageUrl(sessionCheckItem.reportFileUri);
        setFeedback(sessionCheckItem.note);
    }, [sessionCheckItem]);

    const handleConfirmOk = async () => {
        if (sessionCheckItem.status == 'ok') return;
        onUpdateCheckItem(index, {
            ...sessionCheckItem,
            note: '',
            status: 'ok',
            reportFileUri: '',
        } as ICheckItem);
    };

    const handleConfirmNG = async () => {
        if (sessionCheckItem.status == 'ng') return;
        onUpdateCheckItem(index, {
            ...sessionCheckItem,
            status: 'ng',
        } as ICheckItem);
    };

    const getColorText = () => {
        return isOK
            ? themeVariables.colors.primary
            : isNG
              ? themeVariables.colors.danger
              : themeVariables.colors.textDefault;
    };

    const handlePermissionCamera = async () => {
        Keyboard.dismiss();
        const requestPermission = await getDataStorage(KEY_REQUEST_CAMERA_PERMISSION);
        // here is how you can get the camera permission
        const cameraPermission = await Camera.requestCameraPermissionsAsync();

        if (cameraPermission.status !== ACCESS_CAMERA.granted) {
            toast.error('Permission for media access needed.');
            if (!requestPermission || requestPermission == 'fasle') {
                setDataStorage(KEY_REQUEST_CAMERA_PERMISSION, 'true');
            } else {
                setTimeout(() => {
                    Linking.openSettings();
                }, 800);
            }
            return;
        }
        handleShowCamera(true);
    };

    const updateTextChangeFeedback = (value: string) => {
        onUpdateCheckItem(index, {
            ...sessionCheckItem,
            note: value,
        } as ICheckItem);
    };
    const updateChangeReportImage = (value: string) => {
        console.log(sessionCheckItem);
        onUpdateCheckItem(index, {
            ...sessionCheckItem,
            reportFileUri: value,
        } as ICheckItem);
    };

    return (
        <FlexBox
            style={{ width: '100%', marginVertical: 50, minHeight: 500 }}
            gap={5}
            direction="row"
            alignItems="flex-start"
        >
            <FlexBox
                direction="column"
                gap={20}
                style={{
                    width: '50%',
                }}
            >
                <TextWrap
                    style={{ ...styles.description }}
                    color={getColorText()}
                    numberOfLines={2}
                    textAlign="left"
                    fontSize={18}
                >
                    {sessionCheckItem.name}
                </TextWrap>
                {productImageModel ? (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.preventDefault();
                            setShowPreviewImageModal(true);
                            setPreviewImageUrl(productImageModel);
                        }}
                    >
                        <Image
                            source={{ uri: productImageModel }}
                            style={{ width: 300, height: 300, objectFit: 'cover' }}
                        />
                    </TouchableOpacity>
                ) : (
                    <Image
                        source={{
                            uri: 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg',
                        }}
                        style={{ width: 300, height: 300, objectFit: 'cover' }}
                    />
                )}
            </FlexBox>
            <FlexBox
                style={{
                    width: '50%',
                    borderLeftWidth: 1,
                    borderLeftColor: themeVariables.colors.borderLightColor,
                    paddingLeft: 10,
                    minHeight: 400
                }}
                justifyContent="flex-start"
                alignItems="flex-start"
                direction="column"
            >
                <FlexBox
                    direction="row"
                    gap={1}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TouchableOpacity
                        style={{
                            borderWidth: 1,
                            padding: 10,
                            minWidth: 40,
                            width: '50%',
                            borderColor: themeVariables.colors.borderColor,
                            backgroundColor: isOK
                                ? themeVariables.colors.primary200
                                : themeVariables.colors.bgDefault,
                            opacity: isNG ? 0.4 : 1,
                        }}
                        onPress={handleConfirmOk}
                    >
                        <TextWrap
                            fontSize={18}
                            textAlign="center"
                            color={
                                isOK
                                    ? themeVariables.colors.white
                                    : themeVariables.colors.textDefault
                            }
                        >
                            OK
                        </TextWrap>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleConfirmNG}
                        style={{
                            minWidth: 40,
                            padding: 10,
                            width: '50%',
                            opacity: isOK ? 0.4 : 1,
                            borderColor: themeVariables.colors.borderColor,
                            backgroundColor: isNG
                                ? themeVariables.colors.danger
                                : themeVariables.colors.bgDefault,
                            borderWidth: 1,
                        }}
                    >
                        <TextWrap
                            fontSize={18}
                            textAlign="center"
                            color={
                                isNG
                                    ? themeVariables.colors.white
                                    : themeVariables.colors.textDefault
                            }
                        >
                            NG
                        </TextWrap>
                    </TouchableOpacity>
                </FlexBox>
                <FlexBox style={{ width: '100%', minHeight: 200 }}>
                    {isOK ? (
                        <TextWrap fontSize={20}>Đã xác nhận đạt yêu cầu</TextWrap>
                    ) : (
                        <View></View>
                    )}
                    {isNG ? (
                        <FlexBox style={{ width: '100%' }}>
                            <FlexBox
                                direction="column"
                                justifyContent="flex-start"
                                alignItems="flex-start"
                                style={{ width: '100%' }}
                            >
                                <FlexBox
                                    direction="column"
                                    style={{ marginTop: 30 }}
                                    width={'100%'}
                                    justifyContent="flex-start"
                                    alignItems="flex-start"
                                >
                                    <TextWrap style={styles.description}>Ghi chú:</TextWrap>
                                    <TextInput
                                        style={[
                                            styles.textArea,
                                            {
                                                borderWidth: 1,
                                                borderColor: themeVariables.colors.borderColor,
                                            },
                                        ]}
                                        multiline={true}
                                        value={feedback}
                                        onChangeText={(value) => {
                                            setFeedback(value);
                                            updateTextChangeFeedback(value);
                                        }}
                                        placeholderTextColor={themeVariables.colors.bgGrey}
                                        numberOfLines={2}
                                        placeholder="Phản ánh lỗi"
                                        onBlur={Keyboard.dismiss}
                                        onEndEditing={Keyboard.dismiss}
                                        onSubmitEditing={Keyboard.dismiss}
                                    />
                                </FlexBox>
                                <FlexBox
                                    direction="row"
                                    width={'100%'}
                                    justifyContent="flex-start"
                                    alignItems="center"
                                    gap={10}
                                    style={{ marginTop: 20, marginBottom: 10 }}
                                >
                                    <TextWrap style={styles.description}>Ảnh lỗi:</TextWrap>
                                    {imageUrl && (
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={handlePermissionCamera}
                                        >
                                            <Ionicons
                                                name="camera-reverse-outline"
                                                size={24}
                                                color={themeVariables.colors.primary}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </FlexBox>
                                {imageUrl ? (
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={{ width: '100%', height: 180, objectFit: 'contain' }}
                                    />
                                ) : (
                                    <FlexBox style={{ width: '100%' }}>
                                        <TouchableOpacity
                                            style={{ width: 180, height: 180 }}
                                            onPress={handlePermissionCamera}
                                        >
                                            <FontAwesome6
                                                name="camera"
                                                size={180}
                                                color={themeVariables.colors.primary}
                                            />
                                        </TouchableOpacity>
                                    </FlexBox>
                                )}
                            </FlexBox>
                        </FlexBox>
                    ) : (
                        <View></View>
                    )}
                </FlexBox>
            </FlexBox>
            {previewImageUrl && showPreviewImageModal && (
                <PreviewImageModal
                    source={previewImageUrl}
                    modalProps={{
                        visible: showPreviewImageModal,
                        onClose: () => {
                            setShowPreviewImageModal(false);
                            setPreviewImageUrl('');
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
        checkbox: {
            marginRight: 4,
        },
        button: {
            width: '49%',
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

export default CheckListItem;
