import CameraRotateIcon from '@/assets/screens/camera/cameraRotate.svg';
import ReloadImageIcon from '@/assets/screens/camera/reloadImage.svg';
import SendImageIcon from '@/assets/screens/camera/sendImage.svg';
import TakePictureIcon from '@/assets/screens/camera/takePicture.svg';
import FlexBox from '@/components/common/FlexBox';
import { KEY_CAMERA_FLASH_MODE, ZOOM_CONFIG, ZOOM_SELECTS } from '@/constants/common';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { getDataStorage, setDataStorage } from '@/utils/KeychainHelper';
import { isIOS } from '@/utils/Mixed';
import { AntDesign, Entypo, MaterialIcons } from '@expo/vector-icons';
import { CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

interface Props {
    setShowCamera: Function;
    setImageUrl: Function;
}

interface IFlashMode {
    icon: string;
    config: any;
}

const flashModes: any = {
    on: {
        icon: 'flash-on',
        config: 'on',
    },
    off: {
        icon: 'flash-off',
        config: 'off',
    },
    auto: {
        icon: 'flash-auto',
        config: 'auto',
    },
};

const ImageSelection = ({ setShowCamera, setImageUrl }: Props) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [camera, setCamera] = useState<any>(null);
    const [imageUri, setImageUri] = useState<any>(null);
    const [type, setType] = useState<CameraType>('back');
    const [flashMode, setFlashMode] = useState<IFlashMode>(flashModes.off);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [zoomConfig, setZoomConfig] = useState<number>(0);

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    const cancelCamera = () => {
        setShowCamera(false);
    };

    const takePicture = async () => {
        if (camera) {
            const data = await camera.takePictureAsync({
                quality: 1, // Adjust this value (0.0 - 1.0) for picture quality
                skipProcessing: true, // Set to true to skip processing
            });
            setImageUri(data.uri);
        }
    };

    const pickImage = async () => {
        console.log('go');
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        console.log(pickerResult);
        if (pickerResult.canceled) {
            return;
        }
        setImageUri(pickerResult?.assets[0]?.uri);
    };

    const changeTypeCamera = () => {
        setType((current) => (current === 'back' ? 'front' : 'back'));
    };

    const reSelectImage = () => {
        setImageUri(null);
    };

    const formatFileTypeSubmit = () => {
        const localUri = imageUri;
        let filename = localUri.split('/').pop();

        const date = new Date()
            .toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' })
            .split('/')
            .reverse()
            .join('-');
        const time = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const filenameFormat = `IMG_${date}_${time}.${filename.split('.').pop()}`;

        filename = encodeURIComponent(filenameFormat);
        // Infer the type of the image
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        // Assume "photo" is the name of the form field the server expects
        return { uri: localUri, name: filename, type };
    };

    const uploadAttachment = async () => {
        const file = formatFileTypeSubmit();
        setImageUrl(file.uri);
        cancelCamera();
    };

    useEffect(() => {
        // auto focus camera
        const intervalAutoFocus = setInterval(() => {
            if (isRefreshing) {
                setIsRefreshing(false);
            } else {
                setIsRefreshing(true);
            }
        }, 600);
        return () => clearInterval(intervalAutoFocus);
    });

    const updateFlashmode = () => {
        const nextFlashMode = (
            {
                off: flashModes.on,
                on: flashModes.auto,
                auto: flashModes.off,
            } as any
        )[flashMode.config];

        setFlashMode(nextFlashMode);
        setDataStorage(KEY_CAMERA_FLASH_MODE, nextFlashMode.config);
    };

    useEffect(() => {
        const getFlashMode = async () => {
            const flashMode = await getDataStorage(KEY_CAMERA_FLASH_MODE);
            if (flashMode && flashModes[flashMode]) {
                setFlashMode(flashModes[flashMode]);
            }
        };
        getFlashMode();
    }, []);

    const zoomSelect = (config: number, text: string) => {
        return `${ZOOM_CONFIG[config] == zoomConfig ? `${text}x` : text}`;
    };

    const handleChangeZoom = (zoomNumber: number) => {
        setZoomConfig(ZOOM_CONFIG[zoomNumber]);
    };

    const handlePinch = (nativeEvent: any) => {
        const { scale, velocity } = nativeEvent;
        let newZoom =
            velocity > 0
                ? zoomConfig + scale * velocity * (isIOS ? 0.0005 : 0.25)
                : zoomConfig - scale * Math.abs(velocity) * (isIOS ? 0.0005 : 0.5);
        if (newZoom < 0) newZoom = 0;
        else if (newZoom > 0.1 && isIOS) newZoom = 0.1;

        setZoomConfig(newZoom);
    };

    const onGestureEvent = ({ nativeEvent }: any) => {
        if (nativeEvent.state === State.ACTIVE) {
            handlePinch(nativeEvent);
        }
    };

    const mappingZoomConfigPlatform = () => {
        return isIOS ? zoomConfig : zoomConfig * 100;
    };

    return (
        <View style={[styles.cameraContainer]}>
            <View style={styles.closeBox}>
                {!imageUri && (
                    <>
                        <TouchableOpacity onPress={updateFlashmode} style={styles.flashButton}>
                            <MaterialIcons name={flashMode.icon as any} size={26} color={'#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={changeTypeCamera} style={styles.buttonTakePhoto}>
                            <CameraRotateIcon
                                width={35}
                                height={35}
                                color={themeVariables.colors.textOnImageStrong}
                            />
                        </TouchableOpacity>
                    </>
                )}
                <TouchableOpacity onPress={cancelCamera} style={styles.closeButton}>
                    <AntDesign
                        name="close"
                        size={30}
                        color={themeVariables.colors.textOnImageStrong}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                {imageUri ? (
                    <View style={{ position: 'relative' }}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.imagePreview}
                            resizeMode="contain"
                        />
                    </View>
                ) : (
                    <PinchGestureHandler onGestureEvent={onGestureEvent}>
                        <View style={styles.container}>
                            <CameraView
                                ref={(ref) => setCamera(ref)}
                                style={styles.fixedRatio}
                                facing={type}
                                zoom={mappingZoomConfigPlatform()}
                                flash={flashMode.config}
                            />
                            <FlexBox
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                style={styles.zoomConfig}
                                width={120}
                            >
                                {ZOOM_SELECTS.map((zoom: number, index: number) => (
                                    <TouchableOpacity
                                        key={`button-selected-zoom-${index}`}
                                        onPress={() => handleChangeZoom(zoom)}
                                        style={[
                                            styles.buttonZoom,
                                            zoomConfig == ZOOM_CONFIG[zoom] && styles.selectedZoom,
                                        ]}
                                    >
                                        <Text
                                            style={
                                                zoomConfig == ZOOM_CONFIG[zoom]
                                                    ? styles.selectedTextZoom
                                                    : styles.selectOtherTextZoom
                                            }
                                        >
                                            {zoomSelect(zoom, `${zoom}`)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </FlexBox>
                        </View>
                    </PinchGestureHandler>
                )}
            </View>
            {imageUri ? (
                <FlexBox
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{ height: 120, paddingHorizontal: 20 }}
                >
                    <TouchableOpacity onPress={reSelectImage}>
                        <FlexBox direction="column" justifyContent="center" alignItems="center">
                            <ReloadImageIcon
                                width={30}
                                height={30}
                                color={themeVariables.colors.textOnImageStrong}
                            />
                            <Text style={{ color: 'white' }}>Chụp lại</Text>
                        </FlexBox>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={uploadAttachment}>
                        <SendImageIcon width={50} height={50} />
                    </TouchableOpacity>
                </FlexBox>
            ) : (
                <FlexBox
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    style={{ height: 120, paddingHorizontal: 20 }}
                >
                    <TouchableOpacity onPress={takePicture} style={{}}>
                        <TakePictureIcon
                            width={80}
                            height={80}
                            color={themeVariables.colors.textOnImageStrong}
                        />
                    </TouchableOpacity>
                </FlexBox>
            )}
        </View>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        cameraContainer: {
            flex: 1,
            zIndex: 9999,
            position: 'absolute',
            top: 0,
            left: 0,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            backgroundColor: themeVariables.colors.black50,
        },
        fixedRatio: {
            flex: 1,
        },
        container: {
            flex: 1,
            justifyContent: 'center',
        },
        imagePreview: {
            height: '100%',
            alignSelf: 'stretch',
        },
        buttonAction: {
            fontSize: 18,
        },
        buttonTakePhoto: {
            position: 'absolute',
            top: 55,
            left: 60,
            zIndex: 110,
        },
        closeBox: {
            height: 100,
            backgroundColor: themeVariables.colors.black50,
        },
        closeButton: {
            position: 'absolute',
            top: 60,
            right: 20,
            zIndex: 110,
        },

        flashButton: {
            position: 'absolute',
            top: 60,
            left: 20,
            zIndex: 110,
        },
        cropButton: {
            position: 'absolute',
            top: 60,
            left: 20,
            zIndex: 110,
        },

        focusSquare: {
            position: 'absolute',
            width: 100,
            height: 100,
            borderWidth: 2,
            borderColor: 'white',
            backgroundColor: 'transparent',
        },
        zoomConfig: {
            position: 'absolute',
            bottom: 10,
            flex: 1,
            backgroundColor: '#80808057',
            left: Dimensions.get('window').width / 2 - 60,
            paddingVertical: 5,
            borderRadius: 20,
            paddingHorizontal: 7,
        },
        selectedZoom: {
            width: 35,
            height: 35,
            borderRadius: 35 / 2,
        },
        selectedTextZoom: {
            color: 'white',
            fontSize: 13,
        },
        selectOtherTextZoom: {
            color: '#c1c1c1',
            fontSize: 10,
        },
        buttonZoom: {
            width: 26,
            height: 26,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 26 / 2,
            backgroundColor: '#808080a8',
        },
    });

export default ImageSelection;
