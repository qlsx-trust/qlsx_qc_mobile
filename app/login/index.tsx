import AppButton from '@/components/common/AppButton';
import AppSafeAreaBottom from '@/components/common/AppSafeAreaBottom';
import FlexBox from '@/components/common/FlexBox';
import { default as TextWrap, default as TextWrapper } from '@/components/common/TextWrap';
import { SCREEN_KEY, UserRole } from '@/constants/common';
import { useThemeContext } from '@/providers/ThemeProvider';
import { IUserInfo, useAuthContext } from '@/providers/UserProvider';
import { CommonRepository } from '@/repositories/CommonRepository';
import { IThemeVariables } from '@/shared/theme/themes';
import { setSecretStorage } from '@/utils/KeychainHelper';
import { isIOS } from '@/utils/Mixed';
import { toast } from '@/utils/ToastMessage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface IntroScreenProps {}
const IntroScreen: React.FC<IntroScreenProps> = () => {
    const { themeVariables } = useThemeContext();
    const styles = styling(themeVariables);
    const { loading, session, setSession, setUser } = useAuthContext();

    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const  resolveAfterSeconds = (time: number) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve("resolved");
          }, time);
        });
      }

    const handleLogin = async () => {
        if (!username || !password || loadingSubmit) return;
        try {
            Keyboard.dismiss();
            setLoadingSubmit(true);
            await resolveAfterSeconds(1000);
            const payload = {
                userName: username,
                passWord: password,
            };
            const response = await CommonRepository.login(payload);
            if (response.error) {
                toast.error('Đăng nhập thất bại! Tài khoản hoặc mật khẩu không chính xác');
                return;
            }
            const userData: IUserInfo = response.data;
            if (![UserRole.QC, UserRole.Admin, UserRole.QCManager].includes(userData?.role)) {
                toast.error('Đăng nhập thất bại! Quyền truy cập bị từ chối');
                return;
            }

            setSession(userData);
            setUser(userData);
            await setSecretStorage(userData);

            toast.success('Đăng nhập thành công!');
            router.replace(SCREEN_KEY.home);
        } catch (error) {
            console.log('@@Error: ', error);
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (!loading && session) return <Redirect href={SCREEN_KEY.home} />;

    return (
        <AppSafeAreaBottom style={styles.container}>
            {/* <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'}> */}
                <View style={styles.container}>
                    <TextWrapper h1>Đăng nhập</TextWrapper>
                    <FlexBox
                        direction="column"
                        style={{ marginTop: 30, width: 400 }}
                        gap={10}
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <TextWrap h3>Tài khoản:</TextWrap>
                        <TextInput
                            style={[
                                styles.noteTitle,
                                { borderWidth: 1, borderColor: themeVariables.colors.borderColor },
                            ]}
                            value={username}
                            onChangeText={setUsername}
                            placeholderTextColor={themeVariables.colors.bgGrey}
                            placeholder="Tài khoản"
                        />
                    </FlexBox>
                    <FlexBox
                        direction="column"
                        style={{ marginTop: 30, width: 400 }}
                        gap={10}
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <TextWrap h3>Mật khẩu:</TextWrap>
                        <View style={{ width: '100%' }}>
                            <TextInput
                                style={[
                                    styles.noteTitle,
                                    {
                                        borderWidth: 1,
                                        borderColor: themeVariables.colors.borderColor,
                                        paddingRight: 50,
                                    },
                                ]}
                                secureTextEntry={isPasswordSecure}
                                value={password}
                                onChangeText={setPassword}
                                placeholderTextColor={themeVariables.colors.bgGrey}
                                placeholder="Mật khẩu"
                            />
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    top: 10,
                                }}
                                onPress={() => setIsPasswordSecure(!isPasswordSecure)}
                            >
                                <MaterialCommunityIcons
                                    name={isPasswordSecure ? 'eye-off' : 'eye'}
                                    size={28}
                                    color={themeVariables.colors.black}
                                />
                            </TouchableOpacity>
                        </View>
                    </FlexBox>

                    <FlexBox justifyContent="space-between" gap={16} style={{ marginTop: 30 }}>
                        <AppButton
                            disabled={!username || !password || loadingSubmit}
                            isLoading={loadingSubmit}
                            viewStyle={{}}
                            label="Đăng nhập"
                            onPress={handleLogin}
                        />
                    </FlexBox>
                </View>
            {/* </KeyboardAvoidingView> */}
        </AppSafeAreaBottom>
    );
};

export const styling = (themeVariables: IThemeVariables) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: themeVariables.colors.bgDefault,
            paddingHorizontal: 10,
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
        loginButton: {
            width: 180,
        },
    });

export default IntroScreen;
