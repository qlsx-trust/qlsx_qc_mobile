import FlexBox from '@/components/common/FlexBox';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables, THEME_WS, themeValues } from '@/shared/theme/themes';
import React, { useState } from 'react';
import { ModalProps, Pressable, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';

export interface CommonModalProps extends ModalProps {
    children?: React.ReactNode;
    previewImage?: boolean;
    onClose: () => void;
    onLayoutProps?: Function;
    closeOnClickOutside?: boolean;
}

const CommonModal = ({
    children,
    previewImage,
    transparent = true,
    onClose,
    onLayoutProps,
    closeOnClickOutside = false,
    ...props
}: CommonModalProps) => {
    const { themeVariables, theme } = useThemeContext();
    const styles = styling(themeVariables);

    // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        onLayoutProps?.(event)
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    return (
        <Modal
            isVisible={props.visible}
            onModalHide={onClose}
            avoidKeyboard
            onBackButtonPress={onClose}
            style={{ margin: 0}}
            onLayout={onLayout}
            hasBackdrop
        >
            <Pressable style={styles.overlay} onPressOut={() => closeOnClickOutside && onClose()}>
                {previewImage ? (
                    <>{children}</>
                ) : (
                    <FlexBox
                        direction="column"
                        width={'100%'}
                        height={'auto'}
                        backgroundColor={
                            theme === THEME_WS.DARK
                                ? themeVariables.colors.black50
                                : themeVariables.colors.white
                        }
                        borderRadius={16}
                        style={{ ...styles.modal, maxWidth: (layout.width * 4) / 5 }}
                    >
                        {children}
                    </FlexBox>
                )}
            </Pressable>
        </Modal>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: themeVariables.colors.overlayModal
        },
        modal: {
            padding: 16,
        },
    });

export default CommonModal;
