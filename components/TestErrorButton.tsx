/**
 * 테스트용 에러 발생 컴포넌트
 * 이메일 전송 기능을 테스트하기 위한 컴포넌트
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TestErrorButtonProps {
  onTriggerError?: () => void;
}

const BuggyComponent: React.FC = () => {
  // 의도적으로 오류 발생
  throw new Error('테스트용 오류입니다! 이메일 전송 기능을 테스트하고 있습니다.');
};

export const TestErrorButton: React.FC<TestErrorButtonProps> = () => {
  const [showBuggy, setShowBuggy] = useState(false);

  if (showBuggy) {
    return <BuggyComponent />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowBuggy(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>🧪 에러 발생 테스트</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        이 버튼을 누르면 의도적으로 오류가 발생합니다
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});
