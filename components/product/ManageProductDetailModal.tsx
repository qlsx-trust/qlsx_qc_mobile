import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import {
    ACCESS_CAMERA,
    BUTTON_COMMON_TYPE,
    KEY_REQUEST_CAMERA_PERMISSION,
    PATH_SERVER_MEDIA,
} from '@/constants/common';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { IProductCheckItem } from '@/types/product';
import { getDataStorage, setDataStorage } from '@/utils/KeychainHelper';
import { toast } from '@/utils/ToastMessage';
import { FontAwesome6 } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Keyboard,
    Linking,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import ImageSelection from './ImageSelection';
import Config from '@/constants/config';

interface IManageProductDetailModalProps {
    checkItem?: IProductCheckItem;
    modalProps: CommonModalProps;
    onAddProductCheckItem?: Function;
    onEditCheckItem?: Function;
}

const ManageProductDetailModal = ({
    checkItem,
    modalProps,
    onAddProductCheckItem,
    onEditCheckItem,
}: IManageProductDetailModalProps) => {
    const dimensions = Dimensions.get('window');

    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const isEditMode = !!checkItem;

    const [name, setName] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [showCamera, setShowCamera] = useState<boolean>(false);

    const convertSourceMediaServer = (source: string) => {
        if (source.includes(PATH_SERVER_MEDIA)) {
            return `${Config.EXPO_PUBLIC_BACKEND_URL}${source}`;
        }

        return source;
    }

    useEffect(() => {
        if (checkItem) {
            setName(checkItem.name);
            setNote(checkItem.note);
            if (checkItem.productImagePrototype?.length)
                setImageUrl(checkItem.productImagePrototype[0]);
        }
    }, [checkItem]);

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
        setShowCamera(true);
    };

    const handleSubmitFeedback = () => {
        if (!imageUrl || !name) return;
        if (isEditMode) {
            onEditCheckItem?.({
                name,
                note,
                imageUrl,
            });
        } else {
            onAddProductCheckItem?.({
                name,
                note,
                imageUrl,
            });
        }
    };

    return (
        <>
            <CommonModal {...modalProps} previewImage={showCamera}>
                {showCamera && (
                    <ImageSelection setShowCamera={setShowCamera} setImageUrl={setImageUrl} />
                )}
                <FlexBox direction="column" width={'100%'}>
                    <TextWrap style={styles.header}>
                        {isEditMode ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí'}
                    </TextWrap>
                </FlexBox>
                <FlexBox
                    direction="column"
                    style={{ marginTop: 30 }}
                    width={'100%'}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TextWrap style={styles.description}>Tiêu chí đánh giá:</TextWrap>
                    <TextInput
                        style={[
                            styles.textInput,
                            { borderWidth: 1, borderColor: themeVariables.colors.borderColor },
                        ]}
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor={themeVariables.colors.bgGrey}
                        placeholder="Tiêu chí"
                    />
                </FlexBox>
                <FlexBox
                    direction="column"
                    style={{ marginTop: 10 }}
                    width={'100%'}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <TextWrap style={styles.description}>Ghi chú:</TextWrap>
                    <TextInput
                        style={[
                            styles.textArea,
                            { borderWidth: 1, borderColor: themeVariables.colors.borderColor },
                        ]}
                        multiline={true}
                        value={note}
                        onChangeText={setNote}
                        placeholderTextColor={themeVariables.colors.bgGrey}
                        numberOfLines={3}
                        placeholder="Ghi chú"
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
                    <TextWrap style={styles.description}>Ảnh đính kèm</TextWrap>
                    <TouchableOpacity style={styles.button} onPress={handlePermissionCamera}>
                        <FontAwesome6
                            name="camera"
                            size={24}
                            color={themeVariables.colors.primary}
                        />
                    </TouchableOpacity>
                </FlexBox>
                {imageUrl && (
                    <Image
                        source={{ uri: convertSourceMediaServer(imageUrl) }}
                        style={{ width: '100%', height: 180, objectFit: 'contain' }}
                    />
                )}
                <FlexBox justifyContent="space-between" gap={16} style={{ marginTop: 20 }}>
                    <AppButton
                        viewStyle={styles.button}
                        variant={BUTTON_COMMON_TYPE.CANCEL}
                        label="Đóng"
                        onPress={modalProps.onClose}
                    />
                    <AppButton
                        disabled={!imageUrl || !name}
                        viewStyle={styles.button}
                        label="Xác nhận"
                        onPress={handleSubmitFeedback}
                    />
                </FlexBox>
            </CommonModal>
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
            fontSize: 24,
            fontWeight: '600',
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
    });

export default ManageProductDetailModal;
