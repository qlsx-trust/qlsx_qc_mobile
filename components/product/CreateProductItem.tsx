import IconCreateFolderLight from '@/assets/icon-create-folder-home.svg';
import DragDropElement from '@/components/common/DragDropElement';
import { SCREEN_KEY } from '@/constants/common';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IThemeVariables } from '@/shared/theme/themes';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

const CreateProductItem = ({
   
}: {
   
}) => {
    const { themeVariables, theme } = useThemeContext();
    const styles = styling(themeVariables);

    const handleCreateProductItem = () => {
        router.push(SCREEN_KEY.createProduct)
    };
    return (
        <>
            {/* create folder button */}
            <DragDropElement bottom={70}>
                <TouchableOpacity
                    onPress={handleCreateProductItem}
                    style={{ left: -15, position: 'absolute', top: -8 }}
                >
                     <IconCreateFolderLight width={90} height={90} />
                </TouchableOpacity>
            </DragDropElement>
        </>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        buttonWrap: {
            width: 60,
            height: 60,
            shadowOffset: { width: 0, height: 4 },
            shadowColor: themeVariables.colors.black50,
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
            zIndex: 99,
            position: 'absolute',
            bottom: 150,
            left: Dimensions.get('window').width - 80,
        },
    });

export default CreateProductItem;
