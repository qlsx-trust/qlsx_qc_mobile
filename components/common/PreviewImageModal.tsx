import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View, Image } from 'react-native';
import RotatingIcon from '../AnimationIcon/RotatingIcon';
import { Feather } from '@expo/vector-icons';
import { toast } from '@/utils/ToastMessage';

interface IPreviewImageModalProps {
    modalProps: CommonModalProps;
    source: string;
}

const PreviewImageModal = ({ modalProps, source }: IPreviewImageModalProps) => {
    const [loading, setLoading] = useState(false);
    const translateY = useRef(new Animated.Value(0)).current;

    return (
        <CommonModal {...modalProps} previewImage={true} closeOnClickOutside={true}>
            <View style={{}}>
                {loading && (
                    <Animated.View
                        style={[
                            styles.main,
                            {
                                transform: [
                                    {
                                        translateY: translateY.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [300, 0], // Adjust the starting and ending position
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <RotatingIcon>
                            <Feather
                                name="loader"
                                size={46}
                                color="white"
                                style={{ transform: [{ rotateY: '180deg' }] }}
                            />
                        </RotatingIcon>
                    </Animated.View>
                )}
                <Image
                    source={{ uri: source }}
                    style={styles.imagePreview}
                    
                    onError={() => {
                        modalProps.onClose();
                        toast.error('An error has occurred, please try again later');
                    }}
                    onLoadStart={() => {
                        setLoading(true);
                    }}
                    onLoadEnd={() => {
                        setLoading(false);
                    }}
                />
            </View>
        </CommonModal>
    );
};

const styles = StyleSheet.create({
    imagePreview: {
        flex: 1,
        maxHeight: 600,
        width: Dimensions.get('window').width,
        height: 'auto',
        objectFit: 'contain'
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 30,
        width: 30,
        height: 30,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    main: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'column',
        paddingTop: 12,
        gap: 24,
    },
});

export default PreviewImageModal;
