import CommonModal, { CommonModalProps } from '@/components/modals/CommonModal';
import { IThemeVariables } from '@/shared/theme/themes';
import { StyleSheet, View } from 'react-native';
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

       // State to store layout dimensions
    const [layout, setLayout] = useState({ width: 0, height: 0 });
    const onLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

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
            <CommonModal {...modalProps} onLayoutProps={onLayout}>
                <CalendarPicker
                    startFromMonday={true}
                    allowRangeSelection={true}
                    selectedStartDate={startDate}
                    selectedEndDate={endDate}
                    todayBackgroundColor="#f2e6ff"
                    selectedDayColor="#7300e6"
                    selectedDayTextColor="#FFFFFF"
                    width={(layout.width * 4) / 5 - 20 }
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
