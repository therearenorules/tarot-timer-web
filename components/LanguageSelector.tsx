// LanguageSelector.tsx - Language selection component with beautiful UI
// Integrated with i18n system for multi-language support

import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from './Icon';
import { LANGUAGES, LanguageUtils } from '../i18n/index';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography
} from './DesignSystem';

interface LanguageSelectorProps {
  style?: any;
  compact?: boolean;
  showLabel?: boolean;
}

interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LanguageSelector = memo(({
  style,
  compact = false,
  showLabel = true
}: LanguageSelectorProps) => {
  const { t, i18n } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentLanguage = LanguageUtils.getCurrentLanguageInfo();
  const availableLanguages = Object.values(LANGUAGES);

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === i18n.language) {
      setIsModalVisible(false);
      return;
    }

    setIsLoading(true);

    try {
      // i18n 언어 직접 변경 (실시간 텍스트 변경)
      await i18n.changeLanguage(languageCode);
      
      // 로컬 스토리지에 저장 (웹 환경)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('i18nextLng', languageCode);
      }
      
      console.log(`Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
      setIsModalVisible(false);
    }
  };

  const renderLanguageItem = ({ item }: { item: LanguageItem }) => {
    const isSelected = item.code === i18n.language;

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem
        ]}
        onPress={() => handleLanguageChange(item.code)}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.languageFlag}>{item.flag}</Text>
          <View style={styles.languageText}>
            <Text style={[
              styles.languageName,
              isSelected && styles.selectedLanguageName
            ]}>
              {item.name}
            </Text>
            <Text style={[
              styles.languageNative,
              isSelected && styles.selectedLanguageNative
            ]}>
              {item.nativeName}
            </Text>
          </View>
        </View>

        {isSelected && (
          <Icon
            name="check"
            size={20}
            color={Colors.brand.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderCompactSelector = () => (
    <TouchableOpacity
      style={[styles.compactButton, style]}
      onPress={() => setIsModalVisible(true)}
      activeOpacity={0.7}
    >
      <Text style={styles.compactFlag}>{currentLanguage.flag}</Text>
      <Icon name="chevron-down" size={16} color={Colors.text.secondary} />
    </TouchableOpacity>
  );

  const renderFullSelector = () => (
    <TouchableOpacity
      style={[styles.selectorButton, style]}
      onPress={() => setIsModalVisible(true)}
      activeOpacity={0.7}
    >
      <View style={styles.currentLanguage}>
        <Text style={styles.currentFlag}>{currentLanguage.flag}</Text>
        <View style={styles.currentLanguageText}>
          {showLabel && (
            <Text style={styles.selectorLabel}>
              {t('settings.general.language')}
            </Text>
          )}
          <Text style={styles.currentLanguageName}>
            {currentLanguage.nativeName}
          </Text>
        </View>
      </View>
      <Icon
        name="chevron-down"
        size={20}
        color={Colors.text.secondary}
      />
    </TouchableOpacity>
  );

  return (
    <>
      {compact ? renderCompactSelector() : renderFullSelector()}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('settings.general.language')}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Icon name="x" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Language List */}
            <FlatList
              data={availableLanguages}
              keyExtractor={(item) => item.code}
              renderItem={renderLanguageItem}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>
                  {t('common.loading')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  // Compact selector styles
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.2)',
    gap: Spacing.xs,
  },
  compactFlag: {
    fontSize: 18,
  },

  // Full selector styles
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.glass.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.2)',
  },
  currentLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currentFlag: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  currentLanguageText: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  currentLanguageName: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text.primary,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 37, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.glass.primary,
    width: '90%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.3)',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 184, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },

  // Language list styles
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: 'transparent',
  },
  selectedLanguageItem: {
    backgroundColor: 'rgba(123, 44, 191, 0.1)',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: Colors.brand.primary,
  },
  languageNative: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text.secondary,
  },
  selectedLanguageNative: {
    color: Colors.brand.secondary,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: 'rgba(212, 184, 255, 0.1)',
    marginHorizontal: Spacing.lg,
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 22, 37, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text.primary,
    marginTop: Spacing.sm,
  },
});

LanguageSelector.displayName = 'LanguageSelector';

export default LanguageSelector;