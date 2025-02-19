import { Message, Stats } from '@/types';
import config from '@/config';
import { log } from '@/services/logger';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { resetStats as resetStatsService } from '@/services/stats';
import { updateLanguageSettings, getSettings } from '@/services/settings';
import * as T from 'fp-ts/Task';

const updateStats = (stats: Stats): void => {
  log.debug('Updating stats in popup', stats);
  const processedWords = document.getElementById(config.dom.selectors.processedWords);
  const averageTime = document.getElementById(config.dom.selectors.averageTime);
  const sessionInfo = document.getElementById(config.dom.selectors.sessionInfo);

  if (processedWords) {
    log.debug('Updating processed words count', stats.totalProcessed);
    processedWords.textContent = stats.totalProcessed.toString();
  } else {
    log.warn('Processed words element not found');
  }

  if (averageTime) {
    log.debug('Updating average processing time', stats.averageProcessingTime);
    averageTime.textContent = stats.averageProcessingTime.toString();
  } else {
    log.warn('Average time element not found');
  }

  if (sessionInfo) {
    const duration = Date.now() - stats.sessionStartTime;
    const hours = Math.floor(duration / config.time.hour);
    const minutes = Math.floor((duration % config.time.hour) / config.time.minute);
    const timeString = config.time.formats.hourMinute
      .replace('%h', hours.toString())
      .replace('%m', minutes.toString());
    log.debug('Updating session duration', { hours, minutes, timeString });
    sessionInfo.textContent = timeString;
  } else {
    log.warn('Session info element not found');
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

const initializeSettings = async (): Promise<void> => {
  const settings = await getSettings()();
  if ('right' in settings) {
    const ruInput = document.getElementById(config.dom.selectors.inputs.ruLength) as HTMLInputElement;
    const enInput = document.getElementById(config.dom.selectors.inputs.enLength) as HTMLInputElement;

    if (ruInput && settings.right.ru) {
      ruInput.value = settings.right.ru.boldLength.toString();
    }
    if (enInput && settings.right.en) {
      enInput.value = settings.right.en.boldLength.toString();
    }

    // Add change event handlers
    ruInput?.addEventListener('change', async () => {
      const value = parseInt(ruInput.value, 10);
      if (value >= config.languages.ru.minBoldLength && value <= config.languages.ru.maxBoldLength) {
        await updateLanguageSettings(config.languages.ru.code, value)();
      }
    });

    enInput?.addEventListener('change', async () => {
      const value = parseInt(enInput.value, 10);
      if (value >= config.languages.en.minBoldLength && value <= config.languages.en.maxBoldLength) {
        await updateLanguageSettings(config.languages.en.code, value)();
      }
    });
  }
};

const handleReprocess = async (): Promise<void> => {
  log.debug('Reprocess button clicked');
  // Send message to content script for reprocessing
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.id) {
    await chrome.tabs.sendMessage(tab.id, { type: config.messages.types.getStats });
  }
};

export const handleMessage = (message: Message): void => {
  log.debug('Handling message in popup', message);
  switch (message.type) {
    case config.messages.types.updateStats:
      if ('data' in message) {
        updateStats(message.data as Stats);
      } else {
        log.warn('No data in updateStats message');
      }
      break;
    default:
      log.debug('Ignoring message of type', message.type);
  }
};

export const initialize = (): void => {
  log.info('Initializing popup');
  chrome.runtime.onMessage.addListener(handleMessage);

  const resetButton = document.getElementById(config.dom.selectors.resetButton);
  const reprocessButton = document.getElementById(config.dom.selectors.reprocessButton);

  if (resetButton) {
    log.debug('Adding reset button click handler');
    resetButton.addEventListener('click', () => void handleResetStats());
  } else {
    log.warn('Reset button not found');
  }

  if (reprocessButton) {
    log.debug('Adding reprocess button click handler');
    reprocessButton.addEventListener('click', () => void handleReprocess());
  } else {
    log.warn('Reprocess button not found');
  }

  // Initialize settings
  void initializeSettings();

  // Request initial stats
  log.debug('Requesting initial stats');
  chrome.runtime.sendMessage({ type: config.messages.types.getStats }).catch((error) => {
    log.error('Failed to request initial stats', error);
  });
};

document.addEventListener('DOMContentLoaded', initialize);
