import config from '@/config';
import { Stats } from '@/types';

export const updateStats = (processedCount: number, processingTime: number): void => {
  const stats: Stats = {
    totalProcessed: processedCount,
    lastProcessingTime: processingTime,
    averageProcessingTime: processingTime,
    sessionStartTime: Date.now(),
  };
  chrome.runtime.sendMessage({
    type: config.messages.types.updateStats,
    data: stats,
  });
};
