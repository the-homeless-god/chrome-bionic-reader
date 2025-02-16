import config from '@/config';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import { processElement } from './processor';

export const createObserver = (): MutationObserver => {
  const observer = new MutationObserver((mutations) => {
    pipe(
      mutations,
      A.filter((mutation) => mutation.type === 'childList'),
      A.chain((mutation) => Array.from(mutation.addedNodes)),
      A.filter((node): node is Element => node instanceof Element),
      A.map(processElement)
    );
  });

  config.state.observer = observer;
  return observer;
};

export const cleanupObserver = (): void => {
  if (config.state.observer) {
    config.state.observer.disconnect();
    config.state.observer = null;
  }
};
