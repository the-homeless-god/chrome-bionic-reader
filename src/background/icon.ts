import config from '@/config';
import * as TE from 'fp-ts/TaskEither';

export const updateIcon = (enabled: boolean): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    () =>
      chrome.action.setIcon({
        path: enabled ? config.icons.enabled.paths : config.icons.disabled.paths,
      }),
    (error) => new Error(`${config.errors.icon.update}: ${error as string}`)
  );
