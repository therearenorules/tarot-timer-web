import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Colors, Spacing, BorderRadius } from './DesignSystem';
import { PromoService } from '../services/promoService';

interface Props {
    onApplySuccess: () => void;
}

const PromoCodeSection: React.FC<Props> = ({ onApplySuccess }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        if (!code.trim()) {
            Alert.alert('알림', '코드를 입력해주세요.');
            return;
        }

        setLoading(true);
        // 키보드 내리기 등 UX 개선 가능

        const result = await PromoService.applyPromoCode(code);
        setLoading(false);

        Alert.alert(result.success ? '성공' : '알림', result.message);

        if (result.success) {
            setCode('');
            onApplySuccess();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.icon}>🎁</Text>
                <Text style={styles.title}>프로모션 코드</Text>
            </View>

            <Text style={styles.description}>
                코드를 입력하면 프리미엄 혜택을 무료로 이용할 수 있습니다.
            </Text>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="코드 입력"
                    placeholderTextColor="#666"
                    value={code}
                    onChangeText={setCode}
                    autoCorrect={false}
                    autoCapitalize="none"
                    editable={!loading}
                />
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleApply}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>등록</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginTop: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    icon: {
        fontSize: 18,
        marginRight: Spacing.xs,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    description: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: Spacing.md,
        lineHeight: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        color: Colors.text.primary,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginRight: Spacing.sm,
    },
    button: {
        height: 44,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.brand.primary,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default PromoCodeSection;
