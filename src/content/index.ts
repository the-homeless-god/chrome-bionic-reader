import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import config from '@/config';
import { getStorageState } from '@/background/storage';
import { processElement } from './processor';
import { createObserver, cleanupObserver } from './observer';
import { log } from '@/services/logger';
import { Message } from '@/types';

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
  let processedWords = config.constants.zero;

  // Find only main text elements
  const elements = document.querySelectorAll(config.dom.selectors.textElements);
  log.debug('Found text elements', { count: elements.length });

  for (const element of elements) {
    // Skip elements that are already processed or contain special elements
    if (!config.state.processedElements.has(element) && 
        !element.querySelector(config.dom.excludedTags.join(config.constants.punctuation.comma)) &&
        element.textContent?.trim()) {
      processElement(element);
      processedWords += element.textContent?.split(config.dom.wordSeparator).length || config.constants.zero;
    }
  }

  const processingTime = Math.round(performance.now() - startTime);
  log.debug('Page update completed', { processedWords, processingTime });
  sendStatsUpdate(processedWords, processingTime);
};

const handleMessage = (message: Message): void => {
  log.info('Content script received message', message);
  
  let processedElements: NodeListOf<Element>;
  
  switch (message.type) {
    case config.messages.types.getStats:
      log.debug('Processing getStats message');
      // Check if there are already processed elements
      processedElements = document.querySelectorAll(config.dom.boldTag);
      if (processedElements.length > config.constants.zero) {
        // If there are, remove formatting more carefully
        processedElements.forEach(element => {
          if (element.parentNode) {
            // Replace <b> with its text content
            element.parentNode.replaceChild(
              document.createTextNode(element.textContent || config.constants.emptyString),
              element
            );
          }
        });
        // Reset state
        config.state.processedElements = new WeakSet();
      }
      // Update page
      void updatePage();
      break;
    default:
      log.debug('Ignoring unknown message type', message);
  }
};

export const resetState = (): void => {
  log.info('Resetting extension state');
  config.state.processedElements = new WeakSet();
};

// Set up message handler
chrome.runtime.onMessage.addListener(handleMessage);

// Make functions and config globally available
window.updatePage = updatePage;
window.resetState = resetState;

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
