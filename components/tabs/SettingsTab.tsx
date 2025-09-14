import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Colors,
  TextStyles,
  GlassStyles,
  ShadowStyles,
  Spacing,
  BorderRadius
} from '../DesignSystem';
import LanguageSelector from '../LanguageSelector';

const SettingsTab: React.FC = () => {
  const { t } = useTranslation();

  // 프리미엄 관련 상태
  const [isPremium, setIsPremium] = useState(false);

  // 화면 및 테마 설정
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  // 알림 설정
  const [spreadNotification, setSpreadNotification] = useState(true);

  // 타로 카드 설정
  const [cardStyle, setCardStyle] = useState('classic');
  const [cardAnimation, setCardAnimation] = useState(true);

  // 데이터 관리 설정
  const [autoBackup, setAutoBackup] = useState(true);

  const handleUpgradePremium = () => {
    Alert.alert(
      '프리미엄 업그레이드',
      '프리미엄 기능을 이용하시겠습니까?\n• 모든 스프레드 잠금 해제\n• 고급 분석 기능\n• 무제한 저장\n• 광고 제거',
      [
        { text: '취소', style: 'cancel' },
        { text: '업그레이드', onPress: () => setIsPremium(true) }
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert('데이터 내보내기', '모든 데이터를 내보내시겠습니까?');
  };

  const handleDataImport = () => {
    Alert.alert('데이터 가져오기', '백업 파일을 선택해주세요.');
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      '모든 데이터 삭제',
      '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => {
          Alert.alert('삭제 완료', '모든 데이터가 삭제되었습니다.');
        }}
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>⚙️</Text>
        </View>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
      </View>

      {/* 프리미엄 멤버십 섹션 */}
      <View style={styles.premiumSection}>
        <View style={styles.premiumHeader}>
          <View style={styles.crownIcon}>
            <Text style={styles.crownText}>👑</Text>
          </View>
          <Text style={styles.premiumTitle}>프리미엄 멤버십</Text>
          {isPremium ? (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>활성화</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.upgradeBadge}
              onPress={handleUpgradePremium}
            >
              <Text style={styles.upgradeBadgeText}>업그레이드</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.premiumFeatures}>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>프리미엄 스프레드 잠금 해제</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>광고 없는 경험</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>무제한 저장소</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={handleUpgradePremium}
        >
          <Text style={styles.premiumButtonText}>
            {isPremium ? '프리미엄 관리' : '프리미엄 업그레이드'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 화면 및 테마 설정 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>🎨</Text>
          </View>
          <Text style={styles.sectionTitle}>화면 및 테마</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>다크 모드</Text>
            <Text style={styles.settingSubtitle}>Always on for mystical experience</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleButton, darkModeEnabled && styles.toggleButtonActive]}
            onPress={() => setDarkModeEnabled(!darkModeEnabled)}
          >
            <View style={[styles.toggleThumb, darkModeEnabled && styles.toggleThumbActive]}>
              <Text style={styles.toggleIcon}>{darkModeEnabled ? '🌙' : '☀️'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <LanguageSelector
            compact={false}
            showLabel={false}
            style={styles.languageSelector}
          />
        </View>
      </View>

      {/* 알림 설정 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>⚠️</Text>
          </View>
          <Text style={styles.sectionTitle}>알림</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>스프레드 완료</Text>
            <Text style={styles.settingSubtitle}>타로 리딩이 완료되면 알림</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleButton, spreadNotification && styles.toggleButtonActive]}
            onPress={() => setSpreadNotification(!spreadNotification)}
          >
            <View style={[styles.toggleThumb, spreadNotification && styles.toggleThumbActive]}>
              <Text style={styles.toggleIcon}>{spreadNotification ? '🔔' : '🔕'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 타로 카드 설정 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>🃏</Text>
          </View>
          <Text style={styles.sectionTitle}>타로 카드</Text>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>카드 스타일</Text>
            <Text style={styles.settingSubtitle}>클래식 라이더-웨이트</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>카드 애니메이션</Text>
            <Text style={styles.settingSubtitle}>카드 뒤집기 효과</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleButton, cardAnimation && styles.toggleButtonActive]}
            onPress={() => setCardAnimation(!cardAnimation)}
          >
            <View style={[styles.toggleThumb, cardAnimation && styles.toggleThumbActive]}>
              <Text style={styles.toggleIcon}>{cardAnimation ? '🃏' : '🎴'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>카드 의미 언어</Text>
            <Text style={styles.settingSubtitle}>한국어 + 영어</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 데이터 관리 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>💾</Text>
          </View>
          <Text style={styles.sectionTitle}>데이터 관리</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>자동 백업</Text>
            <Text style={styles.settingSubtitle}>클라우드 자동 저장</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleButton, autoBackup && styles.toggleButtonActive]}
            onPress={() => setAutoBackup(!autoBackup)}
          >
            <View style={[styles.toggleThumb, autoBackup && styles.toggleThumbActive]}>
              <Text style={styles.toggleIcon}>{autoBackup ? '☁️' : '💾'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={handleDataExport}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>데이터 내보내기</Text>
            <Text style={styles.settingSubtitle}>모든 리딩과 저널 백업</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleDataImport}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>데이터 가져오기</Text>
            <Text style={styles.settingSubtitle}>백업 파일에서 복원</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAllData}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, styles.dangerText]}>모든 데이터 삭제</Text>
            <Text style={styles.settingSubtitle}>되돌릴 수 없습니다</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 앱 정보 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>ℹ️</Text>
          </View>
          <Text style={styles.sectionTitle}>앱 정보</Text>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>버전 정보</Text>
            <Text style={styles.settingSubtitle}>v2.1.0 - Mystic Edition</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>개발자</Text>
            <Text style={styles.settingSubtitle}>Tarot Timer Team</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>개인정보 처리방침</Text>
            <Text style={styles.settingSubtitle}>데이터 보호 정책</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>오픈소스 라이센스</Text>
            <Text style={styles.settingSubtitle}>사용된 라이브러리</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.glass.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: Colors.brand.accent,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headerIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: 'NotoSansKR_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'NotoSansKR_400Regular',
  },
  
  // 프리미엄 섹션
  premiumSection: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.brand.accent,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  crownIcon: {
    marginRight: Spacing.sm,
  },
  crownText: {
    fontSize: 20,
  },
  premiumTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.accent,
    fontFamily: 'NotoSansKR_700Bold',
  },
  activeBadge: {
    backgroundColor: '#4ade80',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'NotoSansKR_700Bold',
  },
  upgradeBadge: {
    backgroundColor: Colors.brand.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  upgradeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'NotoSansKR_700Bold',
  },
  premiumFeatures: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  featureBullet: {
    color: Colors.brand.accent,
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  premiumButton: {
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    borderWidth: 1,
    borderColor: Colors.brand.accent,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brand.accent,
    fontFamily: 'NotoSansKR_700Bold',
  },
  
  // 설정 섹션
  settingsSection: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionIcon: {
    marginRight: Spacing.sm,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    fontFamily: 'NotoSansKR_700Bold',
  },
  
  // 설정 항목
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.1)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
    fontFamily: 'NotoSansKR_500Medium',
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  chevron: {
    fontSize: 20,
    color: Colors.text.muted,
    marginLeft: Spacing.sm,
  },
  languageButton: {
    backgroundColor: Colors.brand.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'NotoSansKR_700Bold',
  },
  languageSelector: {
    flex: 1,
  },
  dangerText: {
    color: '#ef4444',
  },
  bottomSpace: {
    height: 100,
  },
  
  // 커스텀 토글 버튼
  toggleButton: {
    width: 60,
    height: 32,
    backgroundColor: 'rgba(74, 68, 88, 0.8)',
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(155, 141, 184, 0.3)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(244, 208, 63, 0.3)',
    borderColor: Colors.brand.accent,
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    backgroundColor: 'rgba(155, 141, 184, 0.8)',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbActive: {
    backgroundColor: Colors.brand.accent,
    shadowColor: Colors.brand.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleIcon: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SettingsTab;