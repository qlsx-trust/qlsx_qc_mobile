import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import { IThemeVariables } from '@/shared/theme/themes';
import { Dimensions, StyleSheet, View } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import FlexBox from '../common/FlexBox';
import AppButton from '../common/AppButton';
import { useState } from 'react';
import moment from 'moment';
import { BUTTON_COMMON_TYPE } from '@/constants/common';
import { useThemeContext } from '@/providers/ThemeProvider';

interface IDateRangePickerModalProps {
    modalProps: CommonModalProps;
    onUpdateDaterange: Function;
    filterParams: any;
}

const DateRangePickerModal = ({
    filterParams,
    onUpdateDaterange,
    modalProps,
}: IDateRangePickerModalProps) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    const [startDate, setStarttDate] = useState<Date>(
        filterParams?.productionStartTime
            ? new Date(
                  moment(filterParams?.productionStartTime).add(1, 'days').format('YYYY-MM-DD')
              )
            : new Date()
    );
    const [endDate, setEndtDate] = useState<Date>(
        filterParams?.productionEndTime
            ? new Date(moment(filterParams?.productionEndTime).add(1, 'days').format('YYYY-MM-DD'))
            : new Date(moment(new Date()).add(1, 'days').format('YYYY-MM-DD'))
    );

    const onDateChange = (date: Date, type: string) => {
        if (type === 'END_DATE') {
            setEndtDate(date);
        } else {
            setStarttDate(date);
        }
    };

    return (
        <>
            <CommonModal {...modalProps}>
                <CalendarPicker
                    startFromMonday={true}
                    allowRangeSelection={true}
                    selectedStartDate={startDate}
                    selectedEndDate={endDate}
                    todayBackgroundColor="#f2e6ff"
                    selectedDayColor="#7300e6"
                    selectedDayTextColor="#FFFFFF"
                    width={600}
                    height={500}
                    onDateChange={(date, type) => onDateChange(date, type)}
                />
                <FlexBox justifyContent="space-between" gap={16} style={{ marginTop: 30 }}>
                    <AppButton
                        viewStyle={styles.button}
                        variant={BUTTON_COMMON_TYPE.CANCEL}
                        label="Đóng"
                        onPress={modalProps.onClose}
                    />
                    <AppButton
                        viewStyle={styles.button}
                        disabled={!startDate || !endDate}
                        label="Xác nhận"
                        onPress={() => {
                            onUpdateDaterange(startDate, endDate);
                            setTimeout(() => {
                                modalProps.onClose();
                            }, 300);
                        }}
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
        },
        button: {
            width: '49%',
        },

        cameraWrapper: {
            flex: 1,
            zIndex: 90,
            // position: 'absolute',
            // top: 0,
            // left: 0,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
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
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height * 1,
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
        closeBox: {
            height: 250,
            position: 'absolute',
            top: -250,
            right: 80,
            zIndex: 110,
        },
        dropdownButtonStyle: {
            width: 300,
            marginBottom: 20,
            height: 50,
            backgroundColor: '#E9ECEF',
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 12,
        },
        dropdownButtonTxtStyle: {
            flex: 1,
            fontSize: 18,
            fontWeight: '500',
            color: '#151E26',
        },
        dropdownButtonArrowStyle: {
            fontSize: 28,
        },
        dropdownButtonIconStyle: {
            fontSize: 28,
            marginRight: 8,
        },
        dropdownMenuStyle: {
            backgroundColor: '#E9ECEF',
            borderRadius: 8,
        },
        dropdownItemStyle: {
            width: '100%',
            flexDirection: 'row',
            paddingHorizontal: 12,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 8,
        },
        dropdownItemTxtStyle: {
            flex: 1,
            fontSize: 18,
            fontWeight: '500',
            color: '#151E26',
        },
        dropdownItemIconStyle: {
            fontSize: 28,
            marginRight: 8,
        },
    });

export default DateRangePickerModal;
