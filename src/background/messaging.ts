import config from '@/config';
import { Message, Stats } from '@/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { updateStorage, getStorageState } from './storage';
import { updateIcon } from './icon';
import { executeContentScript, getCurrentTab } from './tabs';
import { log } from '@/services/logger';

export const handleStatsUpdate = (stats: Stats): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    () => {
      log.debug('Sending stats update message', stats);
      return chrome.runtime.sendMessage({
        type: config.messages.types.statsUpdated,
        data: stats,
      });
    },
    (error) => {
      log.error('Failed to send stats update', error);
      return new Error(`${config.errors.stats.update}: ${error}`);
    }
  );

export const handleMessage = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
): boolean => {
  log.info('Received message', { type: message.type, sender });

  switch (message.type) {
    case config.messages.types.updateStats:
      log.debug('Processing updateStats message', message.data);
      pipe(
        handleStatsUpdate(message.data as Stats),
        TE.fold(
          (error) => {
            log.error('Failed to handle stats update', error);
            return TE.of(undefined);
          },
          () => {
            log.debug('Stats update handled successfully');
            return TE.of(undefined);
          }
        )
      )();
      return false;

    case config.messages.types.getStats:
      log.debug('Processing getStats message');
      pipe(
        getCurrentTab(),
        TE.chain((tab) => {
          log.debug('Got current tab', { tabId: tab.id });
          return executeContentScript(tab.id!);
        }),
        TE.fold(
          (error) => {
            log.error('Failed to get stats', error);
            sendResponse(undefined);
            return TE.of(undefined);
          },
          () => {
            log.debug('Stats request handled successfully');
            sendResponse(undefined);
            return TE.of(undefined);
          }
        )
      )();
      return true;

    case config.messages.types.resetStats:
      log.debug('Processing resetStats message');
      pipe(
        updateStorage(false),
        TE.chain(() => updateIcon(false)),
        TE.fold(
          (error) => {
            log.error('Failed to reset stats', error);
            sendResponse(undefined);
            return TE.of(undefined);
          },
          () => {
            log.debug('Stats reset successfully');
            sendResponse(undefined);
            return TE.of(undefined);
          }
        )
      )();
      return true;

    case config.messages.types.getState:
      log.debug('Processing getState message');
      pipe(
        getStorageState(),
        TE.fold(
          (error) => {
            log.error('Failed to get storage state', error);
            sendResponse(false);
            return TE.right(undefined);
          },
          (state) => {
            log.debug('Got storage state', { state });
            sendResponse(state);
            return TE.right(undefined);
          }
        )
      )();
      return true;

    default:
      log.warn('Unknown message type', { type: message.type });
      return false;
  }
};
