import { initializeStorage } from './storage';
import { handleMessage } from './messaging';
import { updateIcon } from './icon';
import { log } from '@/services/logger';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

export const initialize = (): boolean => {
  log.info('Initializing background script');

  // Initialize storage with default state
  pipe(
    initializeStorage(),
    TE.fold(
      (error) => {
        log.error('Failed to initialize storage', error);
        return TE.right(undefined);
      },
      () => {
        log.debug('Storage initialized successfully');
        return TE.right(undefined);
      }
    )
  )();

  // Set up message handling
  chrome.runtime.onMessage.addListener(handleMessage);
  log.debug('Message listener set up');

  // Set up browser action click handler
  chrome.action.onClicked.addListener(async (tab) => {
    log.debug('Browser action clicked', { tabId: tab.id });
    if (tab.id) {
      pipe(
        updateIcon(true),
        TE.fold(
          (error) => {
            log.error('Failed to update icon', error);
            return TE.right(undefined);
          },
          () => {
            log.debug('Icon updated successfully');
            return TE.right(undefined);
          }
        )
      )();
    }
  });

  return true;
};

// Автоматическая инициализация
initialize();
