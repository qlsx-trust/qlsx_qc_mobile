import AppButton from '@/components/common/AppButton';
import FlexBox from '@/components/common/FlexBox';
import TextWrap from '@/components/common/TextWrap';
import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import {
    ACCESS_CAMERA,
    BUTTON_COMMON_TYPE,
    KEY_REQUEST_CAMERA_PERMISSION
} from '@/constants/common';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { FontAwesome6 } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    Keyboard,
    Linking,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';
import ImageSelection from './ImageSelection';
import { getDataStorage, setDataStorage } from '@/utils/KeychainHelper';
import { Camera } from 'expo-camera';
import { toast } from '@/utils/ToastMessage';

interface ICreateProductItemFormProps {
    modalProps: CommonModalProps;
}

const CreateProductItemForm = ({
    modalProps,
}: ICreateProductItemFormProps) => {
    const dimensions = Dimensions.get('window');

    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [name, setName] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [showCamera, setShowCamera] = useState<boolean>(false);

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

    const handleSubmit = async () => {

    }

    return (
        <>
            <CommonModal {...modalProps} previewImage={showCamera}>
                {showCamera && (
                    <ImageSelection setShowCamera={setShowCamera} setImageUrl={setImageUrl} />
                )}
                <FlexBox direction="column" width={'100%'}>
                    <TextWrap style={styles.header}>
                        Thêm sản phẩm
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
                        source={{ uri: imageUrl }}
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
                        onPress={handleSubmit}
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
            lineHeight: 20,
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

export default CreateProductItemForm;
