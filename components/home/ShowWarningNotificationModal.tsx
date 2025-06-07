import { StyleSheet, View } from 'react-native';
import CommonModal, { CommonModalProps } from '../modals/CommonModal';
import { IThemeVariables } from '@/shared/theme/themes';
import { INotification } from '@/types/notification';
import { useThemeContext } from '@/providers/ThemeProvider';
import FlexBox from '../common/FlexBox';
import TextWrap from '../common/TextWrap';
import AppButton from '../common/AppButton';
import { BUTTON_COMMON_TYPE } from '@/constants/common';

interface IConfirmScanCodeModalProps {
    notifications: INotification[];
    modalProps: CommonModalProps;
    onReadNotifications: Function;
}

const ShowWarningNotificationModal = ({
    notifications,
    onReadNotifications,
    modalProps,
}: IConfirmScanCodeModalProps) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    return (
        <CommonModal {...modalProps}>
            <FlexBox gap={16} direction="column" width={'100%'} style={{paddingHorizontal: 20}}>
                <TextWrap style={styles.header} color={themeVariables.colors.textDefault}>
                    Thông báo hệ thống
                </TextWrap>
                {notifications.map((notification) => (
                    <View style={styles.listItem}>
                        <View style={styles.bullet} />
                        <TextWrap style={styles.itemText}>{notification.content}</TextWrap>
                    </View>
                ))}
            </FlexBox>
            <FlexBox justifyContent="space-between" gap={16} style={{ marginTop: 16 }}>
                <AppButton
                    viewStyle={styles.button}
                    variant={BUTTON_COMMON_TYPE.PRIMARY}
                    label="Đã xem"
                    onPress={() => {
                        onReadNotifications();
                        modalProps.onClose();
                    }}
                />
            </FlexBox>
        </CommonModal>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
        },
        bullet: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#000',
            marginRight: 12,
        },
        itemText: {
            fontSize: 16,
            color: '#333',
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 26,
        },
        header: {
            fontSize: 26,
            fontWeight: '600',
        },
        description: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
            textAlign: 'left',
        },
        textButton: {
            fontSize: 16,
            fontWeight: '500',
            lineHeight: 24,
            textAlign: 'center',
            width: '100%',
        },
        button: {
            width: '49%',
        },
        noteTitle: {
            paddingHorizontal: 16,
            width: '100%',
            height: 48,
            fontSize: 16,
            fontWeight: '400',
            borderRadius: 6,
            color: themeVariables.colors.textDefault,
            backgroundColor: 'transparent',
        },
    });

export default ShowWarningNotificationModal;
