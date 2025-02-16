import { Message, Stats } from '@/types';
import config from '@/config';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import { formatSessionTime, resetStats as resetStatsService } from '@/services/stats';
import * as T from 'fp-ts/Task';

type ElementUpdate = readonly [string, string];

const updateElement = (id: string, value: string): O.Option<Element> =>
  pipe(
    O.fromNullable(document.getElementById(id)),
    O.map((element) => {
      element.textContent = value;
      return element;
    })
  );

export const updateStats = (stats: Stats): void => {
  const updates: ElementUpdate[] = [
    [config.dom.selectors.processedWords, stats.totalProcessed.toString()],
    [config.dom.selectors.averageTime, stats.averageProcessingTime.toString()],
    [config.dom.selectors.sessionInfo, formatSessionTime(stats.sessionStartTime)],
  ];

  pipe(
    updates,
    A.map(([id, value]) => updateElement(id, value))
  );
};

export const resetStats = (): void => {
  void pipe(
    resetStatsService(),
    TE.fold(
      (error) => T.of(console.error(error)),
      () => T.of(undefined)
    )
  )();
};

export const handleMessage = (message: Message): void => {
  pipe(
    message,
    O.fromPredicate(
      (msg): msg is Message & { data: Stats } =>
        msg.type === config.messages.types.updateStats && !!msg.data
    ),
    O.map((msg) => updateStats(msg.data))
  );
};

const setupEventListeners = (): void => {
  pipe(
    O.fromNullable(document.getElementById(config.dom.selectors.resetButton)),
    O.map((button) => button.addEventListener('click', resetStats))
  );
};

export const initialize = (): void => {
  chrome.runtime.onMessage.addListener(handleMessage);
  void chrome.runtime.sendMessage({ type: config.messages.types.getStats });
  setupEventListeners();
};

document.addEventListener('DOMContentLoaded', initialize);
