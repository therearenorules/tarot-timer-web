import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface HelpItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

interface HelpSystemProps {
  visible: boolean;
  onClose: () => void;
  initialCategory?: string;
}

const HelpSystem: React.FC<HelpSystemProps> = ({
  visible,
  onClose,
  initialCategory = 'general'
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // 도움말 데이터
  const helpData: HelpItem[] = [
    // 일반 사용법
    {
      id: 'how-to-draw',
      category: 'general',
      question: '타로 카드는 어떻게 뽑나요?',
      answer: '홈 화면의 "카드 뽑기" 버튼을 눌러주세요. 현재 시간대에 맞는 카드가 랜덤으로 선택됩니다. 하루에 여러 번 뽑을 수 있으며, 각 시간대마다 다른 카드의 상징적 의미를 학습해보세요.',
      keywords: ['카드', '뽑기', '선택', '시간대']
    },
    {
      id: 'journal-writing',
      category: 'general',
      question: '저널은 어떻게 작성하나요?',
      answer: '카드를 뽑은 후 나타나는 "저널 작성" 버튼을 누르거나, 저널 탭에서 직접 작성할 수 있습니다. 뽑은 카드의 의미를 일상과 연결하여 자유롭게 기록해보세요.',
      keywords: ['저널', '작성', '기록', '일상']
    },
    {
      id: 'card-meanings',
      category: 'general',
      question: '카드의 의미를 더 자세히 알고 싶어요',
      answer: '카드를 뽑으면 기본적인 의미가 표시됩니다. 더 자세한 해석을 원하시면 카드 상세 페이지에서 확인하거나, 프리미엄 기능을 이용해 개인화된 해석을 받아보세요.',
      keywords: ['의미', '해석', '카드', '상세']
    },

    // 기능 설명
    {
      id: 'spread-function',
      category: 'features',
      question: '스프레드 기능은 무엇인가요?',
      answer: '3장의 카드를 뽑아 시간선 분석을 하는 기능입니다. 스프레드 탭에서 이용할 수 있으며, 과거 경험, 현재 상황, 미래 목표에 대한 체계적인 학습을 할 수 있습니다.',
      keywords: ['스프레드', '3장', '과거', '현재', '미래']
    },
    {
      id: 'timer-system',
      category: 'features',
      question: '24시간 타이머는 어떻게 작동하나요?',
      answer: '하루를 24개 시간대로 나누어, 각 시간대마다 고유한 에너지를 가진 카드를 뽑을 수 있습니다. 시간이 지날수록 다른 카드가 나올 확률이 높아집니다.',
      keywords: ['24시간', '타이머', '시간대', '에너지']
    },
    {
      id: 'backup-sync',
      category: 'features',
      question: '데이터는 어떻게 백업되나요?',
      answer: '프리미엄 계정에서 클라우드 백업을 이용할 수 있습니다. 설정 > 계정에서 백업을 활성화하면 모든 카드 기록과 저널이 안전하게 저장됩니다.',
      keywords: ['백업', '클라우드', '동기화', '프리미엄']
    },

    // 계정 및 결제
    {
      id: 'premium-benefits',
      category: 'account',
      question: '프리미엄 계정의 혜택은 무엇인가요?',
      answer: '무제한 카드 뽑기, 개인화된 해석, 클라우드 백업, 고급 스프레드, 테마 변경 등의 기능을 이용할 수 있습니다. 또한 광고 없이 깔끔한 환경에서 사용 가능합니다.',
      keywords: ['프리미엄', '혜택', '무제한', '백업', '테마']
    },
    {
      id: 'subscription-cancel',
      category: 'account',
      question: '구독을 취소하고 싶어요',
      answer: '설정 > 구독 관리에서 언제든지 취소할 수 있습니다. 취소 후에도 현재 결제 기간이 끝날 때까지는 프리미엄 기능을 계속 이용하실 수 있습니다.',
      keywords: ['구독', '취소', '관리', '설정']
    },
    {
      id: 'account-recovery',
      category: 'account',
      question: '계정을 복구하고 싶어요',
      answer: '이메일 로그인을 통해 계정을 복구할 수 있습니다. 백업된 데이터가 있다면 자동으로 복원됩니다. 문제가 지속되면 고객지원으로 연락해주세요.',
      keywords: ['계정', '복구', '로그인', '이메일']
    },

    // 문제 해결
    {
      id: 'app-slow',
      category: 'troubleshooting',
      question: '앱이 느려요',
      answer: '앱을 완전히 종료 후 재시작해보세요. 저장 공간이 부족하거나 너무 많은 데이터가 쌓인 경우일 수 있습니다. 설정에서 캐시를 정리해보세요.',
      keywords: ['느림', '속도', '재시작', '캐시']
    },
    {
      id: 'card-not-loading',
      category: 'troubleshooting',
      question: '카드가 표시되지 않아요',
      answer: '인터넷 연결을 확인해보세요. 오프라인 모드에서도 기본 카드는 표시됩니다. 문제가 계속되면 앱을 재시작하거나 업데이트를 확인해보세요.',
      keywords: ['카드', '표시', '로딩', '인터넷']
    },
    {
      id: 'data-lost',
      category: 'troubleshooting',
      question: '저장한 데이터가 사라졌어요',
      answer: '프리미엄 계정이라면 설정에서 클라우드 복원을 시도해보세요. 로컬 데이터는 앱 삭제 시 함께 삭제됩니다. 정기적인 백업을 권장합니다.',
      keywords: ['데이터', '사라짐', '복원', '백업']
    }
  ];

  const categories = [
    { id: 'general', name: '일반 사용법', icon: 'help' },
    { id: 'features', name: '기능 설명', icon: 'features' },
    { id: 'account', name: '계정 및 결제', icon: 'account' },
    { id: 'troubleshooting', name: '문제 해결', icon: 'troubleshooting' }
  ];

  // 아이콘 렌더링
  const renderIcon = (iconType: string, size: number = 24) => {
    const color = '#f4d03f';

    switch (iconType) {
      case 'help':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="17" r="1" fill={color} />
          </Svg>
        );
      case 'features':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M12 8v8" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'account':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'troubleshooting':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'search':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none" />
            <Path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'close':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'expand':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      default:
        return null;
    }
  };

  // 검색 필터링
  const filteredHelp = helpData.filter(item => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      statusBarTranslucent
    >
      <LinearGradient
        colors={['#1a1625', '#2d1b47']}
        style={styles.container}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>도움말</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            {renderIcon('close', 24)}
          </TouchableOpacity>
        </View>

        {/* 검색 바 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            {renderIcon('search', 20)}
            <TextInput
              style={styles.searchInput}
              placeholder="궁금한 것을 검색해보세요..."
              placeholderTextColor="#7b2cbf"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* 카테고리 탭 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive
              ]}
            >
              <View style={styles.categoryIcon}>
                {renderIcon(category.icon, 18)}
              </View>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 도움말 목록 */}
        <ScrollView style={styles.helpList} showsVerticalScrollIndicator={false}>
          {filteredHelp.length > 0 ? (
            filteredHelp.map(item => (
              <View key={item.id} style={styles.helpItem}>
                <TouchableOpacity
                  onPress={() => toggleExpanded(item.id)}
                  style={styles.helpQuestion}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <View style={[
                    styles.expandIcon,
                    expandedItem === item.id && styles.expandIconRotated
                  ]}>
                    {renderIcon('expand', 20)}
                  </View>
                </TouchableOpacity>

                {expandedItem === item.id && (
                  <View style={styles.helpAnswer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                    <View style={styles.keywordContainer}>
                      {item.keywords.map(keyword => (
                        <View key={keyword} style={styles.keyword}>
                          <Text style={styles.keywordText}>{keyword}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                검색 결과가 없습니다.
              </Text>
              <Text style={styles.noResultsSubtext}>
                다른 키워드로 검색해보세요.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* 하단 고객지원 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            더 궁금한 것이 있으시면
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <LinearGradient
              colors={['#7b2cbf', '#f4d03f']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contactButtonGradient}
            >
              <Text style={styles.contactButtonText}>고객지원 문의</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 184, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 184, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.3)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  categoryContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 184, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.3)',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    borderColor: '#f4d03f',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#d4b8ff',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#f4d03f',
    fontWeight: '600',
  },
  helpList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  helpItem: {
    marginBottom: 15,
    backgroundColor: 'rgba(212, 184, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.2)',
    overflow: 'hidden',
  },
  helpQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 10,
  },
  expandIcon: {
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  helpAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  answerText: {
    fontSize: 15,
    color: '#d4b8ff',
    lineHeight: 22,
    marginBottom: 15,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keyword: {
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  keywordText: {
    fontSize: 12,
    color: '#f4d03f',
    fontWeight: '500',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#d4b8ff',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 184, 255, 0.2)',
  },
  footerText: {
    fontSize: 14,
    color: '#d4b8ff',
    marginBottom: 10,
  },
  contactButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HelpSystem;