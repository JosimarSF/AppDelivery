import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Dimensions
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';


const COLORS = {
    primary: '#F97316',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    white: '#FFFFFF',
    gray: '#E2E8F0',
};

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Campos Incompletos', 'Por favor, completa todos los campos para continuar.');
            return;
        }
        setIsLoading(true);
        try {
            await signUp(name, email, password);
            Alert.alert(
                '¡Registro Exitoso!',
                'Tu cuenta ha sido creada. Ahora serás redirigido para iniciar sesión.',
                [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
            );
        } catch (error: any) {
            Alert.alert('Error de Registro', error.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Ionicons name="person-add-outline" size={height * 0.1} color={COLORS.primary} />
                        <Text style={styles.title}>Crea tu Cuenta</Text>
                        <Text style={styles.subtitle}>Comienza tu aventura culinaria con nosotros</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Campo de Nombre */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={22} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre Completo"
                                placeholderTextColor={COLORS.textSecondary}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                accessibilityLabel="Campo de nombre completo"
                            />
                        </View>
                        
                        {/* Campo de Correo Electrónico */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={22} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Correo Electrónico"
                                placeholderTextColor={COLORS.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                accessibilityLabel="Campo de correo electrónico"
                            />
                        </View>

                        {/* Campo de Contraseña */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={22} color={COLORS.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                placeholderTextColor={COLORS.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                accessibilityLabel="Campo de contraseña"
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading} accessibilityRole="button" accessibilityLabel="Crear cuenta">
                            {isLoading
                                ? <ActivityIndicator color={COLORS.white} />
                                : <Text style={styles.buttonText}>Crear Cuenta</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Inicia sesión</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 16 : 12,
        fontSize: 16,
        color: COLORS.text,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: Platform.OS === 'ios' ? 18 : 14,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    link: {
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
