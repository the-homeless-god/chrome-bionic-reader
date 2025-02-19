import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import config from '@/config';
import { getStorageState } from '@/background/storage';
import { processElement } from './processor';
import { createObserver, cleanupObserver } from './observer';
import { log } from '@/services/logger';

export * from './processor';
export * from './observer';

const sendStatsUpdate = (totalProcessed: number, processingTime: number): void => {
  log.info('Updating stats', { totalProcessed, processingTime });
  chrome.runtime.sendMessage({
    type: config.messages.types.updateStats,
    data: {
      totalProcessed,
      lastProcessingTime: processingTime,
      averageProcessingTime: processingTime,
      sessionStartTime: Date.now(),
    },
  });
};

export const updatePage = async (): Promise<void> => {
  log.info('Starting page update');
  const startTime = performance.now();
  let processedWords = 0;

  const elements = document.querySelectorAll(config.dom.selectors.textElements);
  log.debug('Found text elements', { count: elements.length });

  for (const element of elements) {
    if (!config.state.processedElements.has(element)) {
      processElement(element);
      processedWords += element.textContent?.split(config.dom.wordSeparator).length || 0;
    }
  }

  const processingTime = Math.round(performance.now() - startTime);
  log.debug('Page update completed', { processedWords, processingTime });
  sendStatsUpdate(processedWords, processingTime);
};

export const initializeExtension = (): void => {
  log.info('Initializing content script');
  
  const handleDOMContentLoaded = async (): Promise<void> => {
    log.debug('DOM content loaded');
    
    const state = await pipe(
      getStorageState(),
      TE.fold(
        (error) => {
          log.error('Failed to get storage state', error);
          return T.of(false);
        },
        (state) => {
          log.debug('Got storage state', { state });
          return T.of(state);
        }
      )
    )();

    if (state) {
      log.debug('Extension enabled, updating page');
      await pipe(
        TE.tryCatch(
          () => updatePage(),
          (error) => {
            log.error('Failed to update page', error);
            return new Error(`${config.errors.tabs.execute}: ${error}`);
          }
        ),
        TE.fold(
          () => T.of(undefined),
          () => T.of(undefined)
        )
      )();

      const observer = createObserver();
      log.debug('Created observer');
      observer.observe(document.body, config.dom.observer.config);
      config.state.observer = observer;
    } else {
      log.debug('Extension disabled, skipping page update');
    }
  };

  const handleUnload = (): void => {
    log.debug('Page unloading, cleaning up');
    cleanupObserver();
  };

  document.addEventListener('DOMContentLoaded', () => void handleDOMContentLoaded());
  window.addEventListener('unload', handleUnload);
};
