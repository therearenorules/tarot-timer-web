import React, { memo } from 'react';
import { TarotSpread } from '../TarotSpread';

// ✅ Android 성능: 불필요한 리렌더링 방지
const SpreadTab: React.FC = memo(() => {
  return <TarotSpread />;
});

SpreadTab.displayName = 'SpreadTab';

export default SpreadTab;