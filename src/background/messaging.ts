import config from '@/config';
import { Message, Stats } from '@/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { updateStorage } from './storage';
import { updateIcon } from './icon';
import { executeContentScript, getCurrentTab } from './tabs';

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
  _: chrome.runtime.MessageSender,
  _sendResponse: (response?: any) => void
): boolean => {
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
            _sendResponse(undefined);
            return TE.of(undefined);
          },
          () => {
            _sendResponse(undefined);
            return TE.of(undefined);
          }
        )
      )();
      return true;

    case config.messages.types.resetStats:
      pipe(
        updateStorage(false),
        TE.chain(() => updateIcon(false)),
        TE.fold(
          (error) => {
            console.error(error);
            _sendResponse(undefined);
            return TE.of(undefined);
          },
          () => {
            _sendResponse(undefined);
            return TE.of(undefined);
          }
        )
      )();
      return true;

    default:
      return false;
  }
};
