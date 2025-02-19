import config from '@/config';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

export const getCurrentTab = (): TE.TaskEither<Error, chrome.tabs.Tab> =>
  TE.tryCatch(
    async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error(config.errors.tabs.query);
      }
      return tab;
    },
    (error) => new Error(`${config.errors.tabs.query}: ${error}`)
  );

export const executeContentScript = (tabId: number): TE.TaskEither<Error, void> =>
  pipe(
    TE.tryCatch(
      async () => {
        await chrome.tabs.sendMessage(tabId, { type: config.messages.types.getStats });
      },
      (error) => new Error(`${config.errors.tabs.execute}: ${error}`)
    )
  );
