import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  targetElement?: string;
}

interface OnboardingTutorialProps {
  visible: boolean;
  onComplete: () => void;
  currentTab?: string;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  visible,
  onComplete,
  currentTab = 'timer'
}) => {
  const [currentStep, setCurrentStep] = useSafeState(0);
  const [isFirstTime, setIsFirstTime] = useSafeState(true);

  // 온보딩 단계 정의 (탭별로 다른 내용)
  const getStepsForTab = (tab: string): OnboardingStep[] => {
    switch (tab) {
      case 'timer':
        return [
          {
            id: 1,
            title: "🔮 타로 타이머에 오신 것을 환영합니다!",
            description: "24시간 타로 카드로 하루를 더 의미있게 만들어보세요.",
            icon: "welcome"
          },
          {
            id: 2,
            title: "⏰ 시간대별 카드 뽑기",
            description: "각 시간대마다 새로운 타로 카드를 뽑아 그 카드의 상징적 의미를 학습해보세요.",
            icon: "timer",
            targetElement: "draw-card-button"
          },
          {
            id: 3,
            title: "📝 일상 저널 작성",
            description: "뽑은 카드의 의미를 일상과 연결하여 기록해보세요.",
            icon: "journal"
          },
          {
            id: 4,
            title: "💫 나만의 타로 여정",
            description: "매일의 기록이 쌓여 나만의 특별한 타로 스토리가 됩니다.",
            icon: "journey"
          }
        ];
      case 'spread':
        return [
          {
            id: 1,
            title: "🃏 스프레드 기능",
            description: "3장 카드로 과거-현재-미래를 확인해보세요.",
            icon: "spread"
          }
        ];
      case 'journal':
        return [
          {
            id: 1,
            title: "📖 저널 관리",
            description: "작성한 모든 저널을 한 곳에서 관리하고 되돌아보세요.",
            icon: "journal"
          }
        ];
      default:
        return [];
    }
  };

  const steps = getStepsForTab(currentTab);

  // 아이콘 컴포넌트
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'welcome':
        return (
          <Svg width={80} height={80} viewBox="0 0 100 100">
            <Defs>
              <SvgRadialGradient id="welcomeGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#f4d03f" stopOpacity="1" />
                <Stop offset="100%" stopColor="#7b2cbf" stopOpacity="1" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="45" fill="url(#welcomeGradient)" />
            <Path
              d="M30 40 L50 25 L70 40 L50 55 Z"
              fill="white"
              opacity="0.9"
            />
            <Circle cx="50" cy="45" r="8" fill="white" opacity="0.8" />
          </Svg>
        );
      case 'timer':
        return (
          <Svg width={80} height={80} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="40" stroke="#f4d03f" strokeWidth="3" fill="none" />
            <Path d="M50 20 L50 50 L70 70" stroke="#7b2cbf" strokeWidth="3" strokeLinecap="round" />
            <Circle cx="50" cy="50" r="4" fill="#f4d03f" />
          </Svg>
        );
      case 'journal':
        return (
          <Svg width={80} height={80} viewBox="0 0 100 100">
            <Path
              d="M25 15 L75 15 C77 15 79 17 79 19 L79 81 C79 83 77 85 75 85 L25 85 C23 85 21 83 21 81 L21 19 C21 17 23 15 25 15 Z"
              stroke="#f4d03f"
              strokeWidth="2"
              fill="rgba(123, 44, 191, 0.2)"
            />
            <Path d="M30 30 L70 30" stroke="#f4d03f" strokeWidth="2" />
            <Path d="M30 40 L65 40" stroke="#d4b8ff" strokeWidth="2" />
            <Path d="M30 50 L60 50" stroke="#d4b8ff" strokeWidth="2" />
          </Svg>
        );
      case 'journey':
        return (
          <Svg width={80} height={80} viewBox="0 0 100 100">
            <Path
              d="M20 80 Q30 60 40 70 Q50 50 60 60 Q70 40 80 50"
              stroke="#f4d03f"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="20" cy="80" r="4" fill="#7b2cbf" />
            <Circle cx="40" cy="70" r="4" fill="#d4b8ff" />
            <Circle cx="60" cy="60" r="4" fill="#f4d03f" />
            <Circle cx="80" cy="50" r="4" fill="#7b2cbf" />
          </Svg>
        );
      case 'spread':
        return (
          <Svg width={80} height={80} viewBox="0 0 100 100">
            <Path
              d="M20 30 L35 25 L35 65 L20 70 Z"
              fill="#7b2cbf"
              stroke="#f4d03f"
              strokeWidth="1"
            />
            <Path
              d="M42.5 20 L57.5 20 L57.5 80 L42.5 80 Z"
              fill="#d4b8ff"
              stroke="#f4d03f"
              strokeWidth="1"
            />
            <Path
              d="M65 25 L80 30 L80 70 L65 65 Z"
              fill="#7b2cbf"
              stroke="#f4d03f"
              strokeWidth="1"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipTutorial = () => {
    onComplete();
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!visible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* 배경 블러 효과 */}
        <View style={styles.backdrop} />

        {/* 온보딩 컨텐츠 */}
        <View style={styles.container}>
          <LinearGradient
            colors={['#1a1625', '#2d1b47', '#1a1625']}
            style={styles.gradientBackground}
          >
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.stepCounter}>
                {currentStep + 1} / {steps.length}
              </Text>
              <TouchableOpacity onPress={skipTutorial} style={styles.skipButton}>
                <Text style={styles.skipText}>건너뛰기</Text>
              </TouchableOpacity>
            </View>

            {/* 메인 컨텐츠 */}
            <View style={styles.content}>
              {/* 아이콘 */}
              <View style={styles.iconContainer}>
                {renderIcon(currentStepData.icon)}
              </View>

              {/* 제목 */}
              <Text style={styles.title}>{currentStepData.title}</Text>

              {/* 설명 */}
              <Text style={styles.description}>{currentStepData.description}</Text>

              {/* 진행 표시기 */}
              <View style={styles.progressContainer}>
                {steps.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => goToStep(index)}
                    style={[
                      styles.progressDot,
                      index === currentStep && styles.progressDotActive
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* 하단 버튼 */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={nextStep}
                style={styles.nextButton}
              >
                <LinearGradient
                  colors={['#7b2cbf', '#f4d03f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {currentStep === steps.length - 1 ? '시작하기' : '다음'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#7b2cbf',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradientBackground: {
    padding: 30,
    minHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  stepCounter: {
    fontSize: 16,
    color: '#d4b8ff',
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d4b8ff',
  },
  skipText: {
    color: '#d4b8ff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 184, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  description: {
    fontSize: 16,
    color: '#d4b8ff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(212, 184, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#f4d03f',
    width: 20,
    borderRadius: 10,
  },
  footer: {
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#7b2cbf',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingTutorial;