import { Message, Stats } from '@/types';
import config from '@/config';
import { log } from '@/services/logger';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { resetStats as resetStatsService } from '@/services/stats';
import * as T from 'fp-ts/Task';

const updateStats = (stats: Stats): void => {
  log.debug('Updating stats in popup', stats);
  const processedWords = document.getElementById(config.dom.selectors.processedWords);
  const averageTime = document.getElementById(config.dom.selectors.averageTime);
  const sessionInfo = document.getElementById(config.dom.selectors.sessionInfo);

  if (processedWords) {
    processedWords.textContent = stats.totalProcessed.toString();
  }
  if (averageTime) {
    averageTime.textContent = stats.averageProcessingTime.toString();
  }
  if (sessionInfo) {
    const duration = Date.now() - stats.sessionStartTime;
    const hours = Math.floor(duration / config.time.hour);
    const minutes = Math.floor((duration % config.time.hour) / config.time.minute);
    sessionInfo.textContent = config.time.formats.hourMinute
      .replace('%h', hours.toString())
      .replace('%m', minutes.toString());
  }
};

const handleResetStats = async (): Promise<void> => {
  log.debug('Reset button clicked');
  await pipe(
    resetStatsService(),
    TE.fold(
      (error) => {
        log.error('Failed to reset stats', error);
        return T.of(undefined);
      },
      () => {
        log.debug('Stats reset successfully');
        chrome.runtime.sendMessage({ type: config.messages.types.resetStats });
        return T.of(undefined);
      }
    )
  )();
};

export const handleMessage = (message: Message): void => {
  log.debug('Handling message in popup', message);
  switch (message.type) {
    case config.messages.types.updateStats:
      if ('data' in message) {
        updateStats(message.data as Stats);
      }
      break;
  }
};

export const initialize = (): void => {
  log.info('Initializing popup');
  chrome.runtime.onMessage.addListener(handleMessage);

  const resetButton = document.getElementById(config.dom.selectors.resetButton);
  if (resetButton) {
    resetButton.addEventListener('click', () => void handleResetStats());
  }

  // Request initial stats
  log.debug('Requesting initial stats');
  chrome.runtime.sendMessage({ type: config.messages.types.getStats }).catch(() => {});
};

document.addEventListener('DOMContentLoaded', initialize);
