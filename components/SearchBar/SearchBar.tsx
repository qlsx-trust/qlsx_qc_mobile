import { StyleSheet, TextInput, View } from 'react-native';
import { EvilIcons } from '@expo/vector-icons';
import { IThemeVariables } from '@/shared/theme/themes';
import { useThemeContext } from '@/providers/ThemeProvider';

interface ISearchBarProps {
    value?: string;
    placeHolder: string;
    handleSearchText: (text: string) => void;
}

const SearchBar = ({ value, placeHolder, handleSearchText }: ISearchBarProps) => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);

    return (
        <View style={styles.container}>
            {/* Search Icon */}
            <EvilIcons name="search" size={22} color={themeVariables.colors.textDefault} />

            {/* Input field */}
            <TextInput
                value={value}
                style={styles.input}
                placeholder={placeHolder}
                onChangeText={handleSearchText}
                placeholderTextColor={themeVariables.colors.placeholder}
            />
        </View>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            width: '100%',
            paddingVertical: 13,
            paddingHorizontal: 13,
            backgroundColor: themeVariables.colors.secondary700,
            borderRadius: 6,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            gap: 8,
        },
        input: {
            fontSize: 15,
            color: themeVariables.colors.textDefault,
            fontWeight: '400',
            width: '90%',
            // backgroundColor: themeVariables.colors.secondary700,
        },
    });

export default SearchBar;
