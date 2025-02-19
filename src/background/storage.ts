import config from '@/config';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

export const updateStorage = (enabled: boolean): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    () =>
      chrome.storage.local.set({
        [config.storage.keys.enabled]: enabled,
      }),
    (error) => new Error(`${config.errors.storage.set}: ${error}`)
  );

export const getStorageState = (): TE.TaskEither<Error, boolean> =>
  pipe(
    TE.tryCatch(
      () =>
        new Promise<{ [key: string]: boolean }>((resolve) =>
          chrome.storage.local.get([config.storage.keys.enabled], resolve)
        ),
      (error) => new Error(`${config.errors.storage.get}: ${error}`)
    ),
    TE.map((result) => result[config.storage.keys.enabled] ?? config.storage.defaultState)
  );

export const initializeStorage = (): TE.TaskEither<Error, void> =>
  updateStorage(config.storage.defaultState);

export const getState = async (): Promise<boolean> => {
  const result = await chrome.storage.local.get([config.storage.keys.enabled]);
  return result[config.storage.keys.enabled] ?? true;
};

export const setState = async (enabled: boolean): Promise<void> => {
  await chrome.storage.local.set({ [config.storage.keys.enabled]: enabled });
};
