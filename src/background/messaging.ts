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
    () =>
      chrome.runtime.sendMessage({
        type: config.messages.types.statsUpdated,
        data: stats,
      }),
    (error) => new Error(`${config.errors.stats.update}: ${error}`)
  );

export const handleMessage = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
): boolean => {
  log.debug('Handling message in background', { message, sender });

  switch (message.type) {
    case config.messages.types.updateStats:
      pipe(
        handleStatsUpdate(message.data as Stats),
        TE.fold(
          (error) => {
            console.error(error);
            return TE.of(undefined);
          },
          () => TE.of(undefined)
        )
      )();
      return false;

    case config.messages.types.getStats:
      pipe(
        getCurrentTab(),
        TE.chain((tab) => executeContentScript(tab.id!)),
        TE.fold(
          (error) => {
            console.error(error);
            sendResponse(undefined);
            return TE.of(undefined);
          },
          () => {
            sendResponse(undefined);
            return TE.of(undefined);
          }
        )
      )();
      return true;

    case config.messages.types.resetStats:
      log.debug('Resetting stats');
      pipe(
        updateStorage(false),
        TE.chain(() => updateIcon(false)),
        TE.fold(
          (error) => {
            console.error(error);
            sendResponse(undefined);
            return TE.of(undefined);
          },
          () => {
            sendResponse(undefined);
            return TE.of(undefined);
          }
        )
      )();
      return true;

    case config.messages.types.getState:
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
