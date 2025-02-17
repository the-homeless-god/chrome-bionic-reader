import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { handleMessage } from './messaging';
import { initializeStorage } from './storage';
import { updateIcon } from './icon';

export const initialize = (): boolean => {
  pipe(
    initializeStorage(),
    TE.chain(() => updateIcon(true)),
    TE.fold(
      (error) => {
        console.error(error);
        return TE.of(undefined);
      },
      () => TE.of(undefined)
    )
  )();

  chrome.runtime.onMessage.addListener(handleMessage);
  chrome.action.onClicked.addListener(() => {
    pipe(
      updateIcon(false),
      TE.fold(
        (error) => {
          console.error(error);
          return TE.of(undefined);
        },
        () => TE.of(undefined)
      )
    )();
  });

  return true;
};

initialize();
