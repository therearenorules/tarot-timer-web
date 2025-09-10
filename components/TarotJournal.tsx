// components/TarotJournal.tsx - 타로 저널 컴포넌트
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Icon } from './Icon';
import { GradientButton } from './GradientButton';
import { simpleStorage, STORAGE_KEYS, TarotUtils } from '../utils/tarotData';
import { 
  Colors, 
  GlassStyles, 
  ShadowStyles, 
  TextStyles, 
  CompositeStyles,
  Spacing,
  BorderRadius 
} from './DesignSystem';

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  insights: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalStats {
  totalEntries: number;
  moodDistribution: { [key: string]: number };
  recentTags: string[];
  streakDays: number;
}

const MOOD_OPTIONS = [
  { value: 'positive', label: '긍정적', emoji: '😊', color: '#4ade80' },
  { value: 'neutral', label: '중립적', emoji: '😐', color: '#94a3b8' },
  { value: 'reflective', label: '성찰적', emoji: '🤔', color: '#f59e0b' },
  { value: 'curious', label: '궁금한', emoji: '🧐', color: '#3b82f6' },
  { value: 'worried', label: '걱정스런', emoji: '😟', color: '#ef4444' },
];

const POPULAR_TAGS = [
  '사랑', '관계', '직업', '건강', '가족', '미래', '과거', '현재',
  '성장', '변화', '도전', '기회', '결정', '소통', '내면', '영성',
  '창조', '여행', '학습', '휴식', '치유', '감사', '용서', '희망'
];

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'recent', label: '최근 7일' },
  { value: 'month', label: '이번 달' },
  { value: 'positive', label: '긍정적 기분' },
  { value: 'negative', label: '부정적 기분' },
];

export const TarotJournal: React.FC = () => {
  // 듀얼 탭 상태 - 명세서 기준
  const [activeTab, setActiveTab] = useState<'daily' | 'spreads'>('daily');
  const [dailyReadings, setDailyReadings] = useState<any[]>([]);
  const [spreadReadings, setSpreadReadings] = useState<any[]>([]);
  const [selectedReading, setSelectedReading] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 기존 저널 기능 상태들 (legacy support)
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: 'neutral',
    insights: '',
    tags: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [stats, setStats] = useState<JournalStats>({
    totalEntries: 0,
    moodDistribution: {},
    recentTags: [],
    streakDays: 0,
  });

  useEffect(() => {
    loadJournalEntries();
    loadDailyReadings();
    loadSpreadReadings();
  }, []);

  // 일일 타로 리딩 로드
  const loadDailyReadings = async () => {
    try {
      setIsLoading(true);
      const readings: any[] = [];
      
      // 최근 30일간의 일일 타로 데이터 로드
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const storageKey = STORAGE_KEYS.DAILY_TAROT + dateString;
        
        try {
          const savedData = await simpleStorage.getItem(storageKey);
          if (savedData) {
            const dailySave = JSON.parse(savedData);
            readings.push({
              ...dailySave,
              type: 'daily',
              displayDate: date.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })
            });
          }
        } catch (error) {
          // 개별 날짜 로드 실패는 무시
        }
      }
      
      setDailyReadings(readings.sort((a, b) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      ));
    } catch (error) {
      console.error('일일 리딩 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 스프레드 리딩 로드
  const loadSpreadReadings = async () => {
    try {
      // 스프레드 데이터는 현재 TarotSpread 컴포넌트에서 저장하지 않고 있으므로
      // 추후 스프레드 저장 기능 구현 시 연동 예정
      setSpreadReadings([]);
    } catch (error) {
      console.error('스프레드 리딩 로드 실패:', error);
    }
  };

  // 검색 및 필터링 useEffect
  useEffect(() => {
    applyFilters();
  }, [entries, searchQuery, selectedFilter, selectedTags]);

  useEffect(() => {
    calculateStats();
  }, [entries]);

  // 검색 및 필터링 적용
  const applyFilters = () => {
    let filtered = [...entries];

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.insights.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 태그 필터링
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        selectedTags.some(tag => entry.tags.includes(tag))
      );
    }

    // 날짜/기분 필터링
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.filter(entry => new Date(entry.updatedAt) >= sevenDaysAgo);
        break;
      case 'month':
        filtered = filtered.filter(entry => new Date(entry.updatedAt) >= monthStart);
        break;
      case 'positive':
        filtered = filtered.filter(entry => ['positive', 'curious'].includes(entry.mood));
        break;
      case 'negative':
        filtered = filtered.filter(entry => ['worried', 'reflective'].includes(entry.mood));
        break;
    }

    setFilteredEntries(filtered);
  };

  // 통계 계산
  const calculateStats = () => {
    if (entries.length === 0) {
      setStats({
        totalEntries: 0,
        moodDistribution: {},
        recentTags: [],
        streakDays: 0,
      });
      return;
    }

    // 기분 분포 계산
    const moodDistribution: { [key: string]: number } = {};
    entries.forEach(entry => {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    });

    // 최근 태그 수집
    const allTags: string[] = [];
    entries.forEach(entry => allTags.push(...entry.tags));
    const tagCounts: { [key: string]: number } = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const recentTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([tag]) => tag);

    // 연속 작성일 계산
    const sortedDates = entries
      .map(entry => new Date(entry.date).getTime())
      .sort((a, b) => b - a);
    
    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streakDays++;
      } else {
        break;
      }
    }

    setStats({
      totalEntries: entries.length,
      moodDistribution,
      recentTags,
      streakDays,
    });
  };

  // 태그 관리
  const addTag = (tag: string) => {
    if (tag.trim() && !currentEntry.tags?.includes(tag.trim())) {
      setCurrentEntry(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 저널 엔트리 로드
  const loadJournalEntries = async () => {
    try {
      const today = TarotUtils.getTodayDateString();
      const storageKey = STORAGE_KEYS.TAROT_JOURNAL + today;
      const savedData = await simpleStorage.getItem(storageKey);
      
      if (savedData) {
        const journalData: JournalEntry[] = JSON.parse(savedData);
        setEntries(journalData.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ));
      }
    } catch (error) {
      console.error('저널 로드 실패:', error);
    }
  };

  // 저널 엔트리 저장
  const saveJournalEntries = async (updatedEntries: JournalEntry[]) => {
    try {
      const today = TarotUtils.getTodayDateString();
      const storageKey = STORAGE_KEYS.TAROT_JOURNAL + today;
      await simpleStorage.setItem(storageKey, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('저널 저장 실패:', error);
      throw error;
    }
  };

  // 새 엔트리 저장
  const saveEntry = async () => {
    if (!currentEntry.title?.trim() || !currentEntry.content?.trim()) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const today = TarotUtils.getTodayDateString();
      
      if (editingId) {
        // 기존 엔트리 수정
        const updatedEntries = entries.map(entry =>
          entry.id === editingId
            ? {
                ...entry,
                title: currentEntry.title!,
                content: currentEntry.content!,
                mood: currentEntry.mood!,
                insights: currentEntry.insights!,
                updatedAt: now,
              }
            : entry
        );
        setEntries(updatedEntries);
        await saveJournalEntries(updatedEntries);
        Alert.alert('수정 완료', '저널이 성공적으로 수정되었습니다.');
      } else {
        // 새 엔트리 추가
        const newEntry: JournalEntry = {
          id: `journal_${Date.now()}`,
          date: today,
          title: currentEntry.title!,
          content: currentEntry.content!,
          mood: currentEntry.mood!,
          insights: currentEntry.insights || '',
          tags: currentEntry.tags || [],
          createdAt: now,
          updatedAt: now,
        };
        
        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);
        await saveJournalEntries(updatedEntries);
        Alert.alert('저장 완료', '저널이 성공적으로 저장되었습니다.');
      }
      
      // 폼 초기화
      resetForm();
    } catch (error) {
      console.error('저널 저장/수정 실패:', error);
      Alert.alert('오류', '저널을 저장하는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 엔트리 삭제
  const deleteEntry = async (entryId: string) => {
    Alert.alert(
      '삭제 확인',
      '이 저널 엔트리를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedEntries = entries.filter(entry => entry.id !== entryId);
              setEntries(updatedEntries);
              await saveJournalEntries(updatedEntries);
            } catch (error) {
              console.error('삭제 실패:', error);
              Alert.alert('오류', '엔트리 삭제 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // 엔트리 편집 시작
  const startEditing = (entry: JournalEntry) => {
    setCurrentEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      insights: entry.insights,
      tags: entry.tags || [],
    });
    setEditingId(entry.id);
    setIsEditing(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setCurrentEntry({
      title: '',
      content: '',
      mood: 'neutral',
      insights: '',
      tags: [],
    });
    setIsEditing(false);
    setEditingId(null);
    setNewTag('');
  };

  const selectedMood = MOOD_OPTIONS.find(mood => mood.value === currentEntry.mood) || MOOD_OPTIONS[1];

  // 듀얼 탭 렌더링 - 명세서 기준
  const renderDualTabContent = () => {
    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 듀얼 탭 헤더 */}
        <View style={styles.dualTabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'daily' && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab('daily')}
          >
            <Icon name="clock" size={18} color={activeTab === 'daily' ? '#fff' : '#9b8db8'} />
            <Text style={[
              styles.tabButtonText,
              activeTab === 'daily' && styles.tabButtonTextActive
            ]}>
              ⏰ 일일 리딩
            </Text>
            <Text style={styles.tabCount}>{dailyReadings.length}개 기록</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'spreads' && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab('spreads')}
          >
            <Icon name="tarot-cards" size={18} color={activeTab === 'spreads' ? '#fff' : '#9b8db8'} />
            <Text style={[
              styles.tabButtonText,
              activeTab === 'spreads' && styles.tabButtonTextActive
            ]}>
              🔮 스프레드 기록
            </Text>
            <Text style={styles.tabCount}>{spreadReadings.length}개 기록</Text>
          </TouchableOpacity>
        </View>

        {/* 탭 내용 */}
        {activeTab === 'daily' ? renderDailyReadingsTab() : renderSpreadReadingsTab()}
      </ScrollView>
    );
  };

  // 일일 리딩 탭 렌더링
  const renderDailyReadingsTab = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>📖 일일 리딩을 불러오는 중...</Text>
        </View>
      );
    }

    if (dailyReadings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⏰</Text>
          <Text style={styles.emptyTitle}>저장된 일일 리딩이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            Timer 탭에서 24시간 타로를 저장하면{'\n'}여기에서 다시 볼 수 있습니다
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.readingsContainer}>
        {dailyReadings.map((reading, index) => (
          <TouchableOpacity
            key={reading.id || index}
            style={styles.dailyReadingCard}
            onPress={() => setSelectedReading(reading)}
            activeOpacity={0.8}
          >
            {/* 카드 헤더 */}
            <View style={styles.readingCardHeader}>
              <View style={styles.readingDateContainer}>
                <Text style={styles.readingDate}>{reading.displayDate}</Text>
                <Text style={styles.readingLabel}>24시간 타로 리딩</Text>
              </View>
              <View style={styles.readingStatus}>
                <Text style={styles.readingStatusIcon}>✅</Text>
              </View>
            </View>

            {/* 카드 미리보기 */}
            <View style={styles.cardPreviewContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardPreview}>
                {reading.hourlyCards?.slice(0, 8).map((card: any, cardIndex: number) => (
                  <View key={cardIndex} style={styles.miniCard}>
                    <Text style={styles.miniCardIcon}>🎴</Text>
                  </View>
                ))}
                {reading.hourlyCards?.length > 8 && (
                  <Text style={styles.moreCardsText}>+{reading.hourlyCards.length - 8}더</Text>
                )}
              </ScrollView>
            </View>

            {/* 인사이트 미리보기 */}
            {reading.insights && (
              <View style={styles.insightPreview}>
                <Text style={styles.insightIcon}>💭</Text>
                <Text style={styles.insightText} numberOfLines={2}>
                  "{reading.insights}"
                </Text>
              </View>
            )}

            {/* 메모 카운트 */}
            {reading.memos && Object.keys(reading.memos).length > 0 && (
              <View style={styles.memoCount}>
                <Text style={styles.memoCountText}>
                  ⏰ {Object.keys(reading.memos).length}개 시간대 메모
                </Text>
                <Icon name="chevron-right" size={16} color="#f4d03f" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 스프레드 리딩 탭 렌더링
  const renderSpreadReadingsTab = () => {
    if (spreadReadings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔮</Text>
          <Text style={styles.emptyTitle}>저장된 스프레드 기록이 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            Spreads 탭에서 타로 스프레드를 저장하면{'\n'}여기에서 다시 볼 수 있습니다
          </Text>
        </View>
      );
    }

    // 스프레드 리딩 구현은 추후 스프레드 저장 기능과 함께 구현 예정
    return (
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonIcon}>🔮</Text>
        <Text style={styles.comingSoonTitle}>스프레드 기록 기능</Text>
        <Text style={styles.comingSoonText}>
          곧 업데이트 예정입니다{'\n'}스프레드 저장 기능과 함께 제공됩니다
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderDualTabContent()}
      
      {/* 상세보기 모달 (일일 타로 뷰어) */}
      {selectedReading && selectedReading.type === 'daily' && (
        <View style={styles.modalOverlay}>
          <View style={styles.dailyTarotViewer}>
            <View style={styles.viewerHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedReading(null)}
              >
                <Icon name="arrow-left" size={20} color="#f4d03f" />
                <Text style={styles.backButtonText}>돌아가기</Text>
              </TouchableOpacity>
              <Text style={styles.viewerTitle}>{selectedReading.displayDate} 일일 타로</Text>
            </View>
            
            <Text style={styles.comingSoonText}>
              🚧 일일 타로 상세 뷰어는 곧 구현 예정입니다
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );

  // 기존 저널 폼 (legacy) - 추후 제거 예정
  const renderLegacyJournalForm = () => (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 통계 및 상태 표시 */}
        <View style={styles.statsContainer}>
          <Text style={styles.statusText}>
            {entries.length > 0 ? (
              `✨ ${stats.totalEntries}개의 저널 | 🔥 ${stats.streakDays}일 연속`
            ) : (
              '🌟 첫 번째 저널을 작성해보세요'
            )}
          </Text>
          {stats.recentTags.length > 0 && (
            <View style={styles.recentTagsContainer}>
              <Text style={styles.recentTagsLabel}>최근 태그:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {stats.recentTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.recentTag,
                      selectedTags.includes(tag) && styles.recentTagSelected
                    ]}
                    onPress={() => toggleTagFilter(tag)}
                  >
                    <Text style={[
                      styles.recentTagText,
                      selectedTags.includes(tag) && styles.recentTagTextSelected
                    ]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 검색 및 필터 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={16} color="#9b8db8" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="제목, 내용, 태그로 검색..."
              placeholderTextColor="#9b8db8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="x" size={16} color="#9b8db8" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="filter" size={16} color="#f4d03f" />
          </TouchableOpacity>
        </View>

        {/* 필터 옵션 */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {FILTER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    selectedFilter === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedFilter(option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 메인 저널 폼 */}
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Icon name="book-open" size={20} color="#f4d03f" />
            <Text style={styles.formTitle}>
              {isEditing ? '저널 수정하기' : '새로운 저널 작성'}
            </Text>
          </View>
          
          {/* 제목 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>제목</Text>
            <TextInput
              style={styles.titleInput}
              value={currentEntry.title}
              onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, title: text }))}
              placeholder="저널 제목을 입력하세요"
              placeholderTextColor="#9b8db8"
              maxLength={50}
            />
          </View>

          {/* 기분/상태 선택 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>현재 기분</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.moodSelector}
            >
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodOption,
                    currentEntry.mood === mood.value && styles.moodOptionSelected
                  ]}
                  onPress={() => setCurrentEntry(prev => ({ ...prev, mood: mood.value }))}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    currentEntry.mood === mood.value && styles.moodLabelSelected
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 내용 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>타로 리딩 내용</Text>
            <TextInput
              style={styles.contentInput}
              value={currentEntry.content}
              onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, content: text }))}
              placeholder="오늘의 타로 리딩에 대해 자세히 기록해보세요..."
              placeholderTextColor="#9b8db8"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* 통찰/깨달음 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>통찰과 깨달음</Text>
            <TextInput
              style={styles.insightsInput}
              value={currentEntry.insights}
              onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, insights: text }))}
              placeholder="이 리딩을 통해 얻은 깨달음이나 앞으로의 다짐을 적어보세요..."
              placeholderTextColor="#9b8db8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* 태그 관리 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>태그 (주제별 분류)</Text>
            
            {/* 현재 선택된 태그들 */}
            {currentEntry.tags && currentEntry.tags.length > 0 && (
              <View style={styles.selectedTagsContainer}>
                {currentEntry.tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.selectedTag}
                    onPress={() => removeTag(tag)}
                  >
                    <Text style={styles.selectedTagText}>{tag}</Text>
                    <Icon name="x" size={12} color="#f4d03f" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 새 태그 입력 */}
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="새 태그 입력..."
                placeholderTextColor="#9b8db8"
                onSubmitEditing={() => addTag(newTag)}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={() => addTag(newTag)}
                disabled={!newTag.trim()}
              >
                <Icon name="plus" size={16} color="#f4d03f" />
              </TouchableOpacity>
            </View>

            {/* 인기 태그들 */}
            <View style={styles.popularTagsContainer}>
              <Text style={styles.popularTagsLabel}>인기 태그:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {POPULAR_TAGS.filter(tag => !currentEntry.tags?.includes(tag)).slice(0, 10).map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.popularTag}
                    onPress={() => addTag(tag)}
                  >
                    <Text style={styles.popularTagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 액션 버튼들 */}
          <View style={styles.actionButtons}>
            <GradientButton
              onPress={saveEntry}
              title={isLoading ? '저장 중...' : isEditing ? '수정 완료' : '저널 저장'}
              icon={isLoading ? 'rotate-ccw' : 'save'}
              disabled={isLoading}
              size="large"
            />
            
            {isEditing && (
              <View style={styles.cancelButtonContainer}>
                <GradientButton
                  onPress={resetForm}
                  title="취소"
                  icon="x"
                  variant="secondary"
                  size="medium"
                />
              </View>
            )}
          </View>
        </View>

        {/* 확장 가능한 저장된 엔트리 목록 */}
        {entries.length > 0 && (
          <ScrollView style={styles.entriesContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.entriesHeader}>
              <Icon name="book" size={20} color="#f4d03f" />
              <Text style={styles.entriesTitle}>
                저장된 저널 ({filteredEntries.length}/{entries.length})
              </Text>
              {(searchQuery || selectedFilter !== 'all' || selectedTags.length > 0) && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                    setSelectedTags([]);
                  }}
                >
                  <Text style={styles.clearFiltersText}>전체 보기</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {filteredEntries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <View style={styles.entryMood}>
                      <Text style={styles.entryMoodEmoji}>
                        {MOOD_OPTIONS.find(m => m.value === entry.mood)?.emoji || '😐'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.entryDate}>
                    {new Date(entry.updatedAt).toLocaleString('ko-KR')}
                  </Text>
                </View>
                
                <Text style={styles.entryContent} numberOfLines={3}>
                  {entry.content}
                </Text>

                {/* 태그 표시 */}
                {entry.tags && entry.tags.length > 0 && (
                  <View style={styles.entryTagsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {entry.tags.map((tag, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.entryTag}
                          onPress={() => toggleTagFilter(tag)}
                        >
                          <Text style={styles.entryTagText}>#{tag}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                {entry.insights && (
                  <View style={styles.entryInsights}>
                    <Text style={styles.entryInsightsLabel}>💡 통찰</Text>
                    <Text style={styles.entryInsightsText} numberOfLines={2}>
                      {entry.insights}
                    </Text>
                  </View>
                )}
                
                <View style={styles.entryActions}>
                  <TouchableOpacity
                    style={styles.entryActionButton}
                    onPress={() => startEditing(entry)}
                  >
                    <Icon name="edit" size={16} color="#f4d03f" />
                    <Text style={styles.entryActionText}>수정</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.entryActionButton}
                    onPress={() => deleteEntry(entry.id)}
                  >
                    <Icon name="trash" size={16} color="#ef4444" />
                    <Text style={[styles.entryActionText, { color: '#ef4444' }]}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  
  // Status and form styles
  statusText: {
    ...TextStyles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.brand.accent + '1A',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.focus,
  },
  formTitle: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    marginLeft: Spacing.sm,
  },
  formContainer: {
    ...GlassStyles.cardElevated,
    ...ShadowStyles.brandGlow,
    marginBottom: Spacing.xxl,
  },
  
  // Input styles
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    marginBottom: Spacing.sm,
  },
  titleInput: {
    ...GlassStyles.cardSecondary,
    backgroundColor: Colors.glass.secondary,
    borderColor: Colors.border.soft,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  contentInput: {
    ...GlassStyles.cardSecondary,
    backgroundColor: Colors.glass.secondary,
    borderColor: Colors.border.soft,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text.primary,
    minHeight: 120,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  insightsInput: {
    ...GlassStyles.cardSecondary,
    backgroundColor: Colors.glass.secondary,
    borderColor: Colors.border.soft,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    color: Colors.text.primary,
    minHeight: 80,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  
  // Mood selection styles
  moodSelector: {
    flexDirection: 'row',
  },
  moodOption: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.glass.tertiary,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: BorderRadius.md,
    minWidth: 70,
  },
  moodOptionSelected: {
    backgroundColor: Colors.brand.secondary + '80',
    borderColor: Colors.border.focus,
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  moodLabel: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  
  // Action buttons
  actionButtons: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  cancelButtonContainer: {
    alignItems: 'center',
  },
  
  // Entry list styles
  entriesContainer: {
    marginTop: Spacing.sm,
    maxHeight: 300,
    ...GlassStyles.cardSecondary,
    ...ShadowStyles.soft,
  },
  entriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  entriesTitle: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    marginLeft: Spacing.sm,
  },
  entryCard: {
    ...GlassStyles.cardElevated,
    ...ShadowStyles.brandGlow,
    marginBottom: Spacing.lg,
  },
  entryHeader: {
    marginBottom: Spacing.md,
  },
  entryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  entryTitle: {
    ...TextStyles.headline,
    color: Colors.text.primary,
    flex: 1,
  },
  entryMood: {
    marginLeft: Spacing.sm,
  },
  entryMoodEmoji: {
    fontSize: 20,
  },
  entryDate: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
  },
  entryContent: {
    ...TextStyles.body,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  entryInsights: {
    backgroundColor: Colors.brand.secondary + '1A',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.soft,
  },
  entryInsightsLabel: {
    ...TextStyles.caption,
    color: Colors.brand.accent,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  entryInsightsText: {
    ...TextStyles.body,
    color: Colors.text.tertiary,
    fontSize: 13,
  },
  entryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border.soft,
    paddingTop: Spacing.md,
  },
  entryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.glass.tertiary,
  },
  entryActionText: {
    ...TextStyles.body,
    color: Colors.brand.accent,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  
  // Search and filter styles
  statsContainer: {
    ...GlassStyles.cardSecondary,
    marginBottom: Spacing.lg,
  },
  recentTagsContainer: {
    marginTop: Spacing.sm,
  },
  recentTagsLabel: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  recentTag: {
    backgroundColor: Colors.brand.secondary + '4D',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.soft,
  },
  recentTagSelected: {
    backgroundColor: Colors.brand.secondary + '80',
    borderColor: Colors.border.focus,
  },
  recentTagText: {
    ...TextStyles.caption,
    color: Colors.text.tertiary,
  },
  recentTagTextSelected: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    ...GlassStyles.cardSecondary,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    ...TextStyles.body,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  filterButton: {
    backgroundColor: Colors.brand.secondary + '80',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.focus,
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filterOption: {
    ...GlassStyles.cardCompact,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
  },
  filterOptionSelected: {
    backgroundColor: Colors.brand.secondary + '80',
    borderColor: Colors.border.focus,
  },
  filterOptionText: {
    ...TextStyles.caption,
    color: Colors.text.tertiary,
  },
  filterOptionTextSelected: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  
  // Tag management styles
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.secondary + '80',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.focus,
    gap: Spacing.xs,
  },
  selectedTagText: {
    ...TextStyles.caption,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tagInput: {
    flex: 1,
    ...GlassStyles.cardSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text.primary,
  },
  addTagButton: {
    backgroundColor: Colors.brand.secondary + '80',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.focus,
  },
  popularTagsContainer: {
    marginTop: Spacing.xs,
  },
  popularTagsLabel: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  popularTag: {
    backgroundColor: Colors.glass.tertiary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  popularTagText: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    fontSize: 11,
  },
  entryTagsContainer: {
    marginBottom: Spacing.sm,
  },
  entryTag: {
    backgroundColor: Colors.brand.secondary + '4D',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.soft,
  },
  entryTagText: {
    ...TextStyles.caption,
    color: Colors.text.tertiary,
    fontWeight: '500',
    fontSize: 11,
  },
  clearFiltersButton: {
    backgroundColor: Colors.brand.secondary + '80',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.focus,
  },
  clearFiltersText: {
    ...TextStyles.caption,
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontSize: 11,
  },
  
  // Dual tab styles
  dualTabContainer: {
    flexDirection: 'row',
    ...GlassStyles.cardSecondary,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.glass.tertiary,
    marginHorizontal: Spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: Colors.brand.secondary + '80',
    borderWidth: 1,
    borderColor: Colors.border.focus,
    ...ShadowStyles.soft,
  },
  tabButtonText: {
    ...TextStyles.body,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tabButtonTextActive: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  tabCount: {
    ...TextStyles.caption,
    color: Colors.text.tertiary,
    opacity: 0.8,
  },
  
  // Loading and empty states
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
  },
  loadingText: {
    ...TextStyles.headline,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.section,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...TextStyles.title,
    color: Colors.brand.accent,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TextStyles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.section,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  comingSoonTitle: {
    ...TextStyles.title,
    color: Colors.brand.accent,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  comingSoonText: {
    ...TextStyles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Reading card styles
  readingsContainer: {
    paddingBottom: Spacing.lg,
  },
  dailyReadingCard: {
    ...GlassStyles.cardInteractive,
    ...ShadowStyles.soft,
    marginBottom: Spacing.md,
  },
  readingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  readingDateContainer: {
    flex: 1,
  },
  readingDate: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    marginBottom: Spacing.xs,
  },
  readingLabel: {
    ...TextStyles.caption,
    color: Colors.text.tertiary,
  },
  readingStatus: {
    marginLeft: Spacing.sm,
  },
  readingStatusIcon: {
    fontSize: 20,
  },
  
  // Card preview styles
  cardPreviewContainer: {
    marginBottom: Spacing.md,
  },
  cardPreview: {
    flexGrow: 0,
  },
  miniCard: {
    width: 24,
    height: 36,
    backgroundColor: Colors.glass.tertiary,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  miniCardIcon: {
    fontSize: 12,
  },
  moreCardsText: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    alignSelf: 'center',
    marginLeft: Spacing.sm,
  },
  
  // Insight preview styles
  insightPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.brand.secondary + '1A',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.soft,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    ...TextStyles.body,
    color: Colors.text.tertiary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  memoCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.soft,
  },
  memoCountText: {
    ...TextStyles.caption,
    color: Colors.brand.accent,
    fontWeight: '600',
  },
  
  // Modal and viewer styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dailyTarotViewer: {
    ...GlassStyles.cardElevated,
    ...ShadowStyles.extreme,
    margin: Spacing.lg,
    maxHeight: '80%',
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.soft,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  backButtonText: {
    ...TextStyles.body,
    color: Colors.brand.accent,
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  viewerTitle: {
    ...TextStyles.title,
    color: Colors.text.primary,
  },
});

export default TarotJournal;