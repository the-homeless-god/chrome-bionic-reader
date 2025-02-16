import { Stats } from '@/types';
import config from '@/config';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';

export const formatSessionTime = (startTime: number): string =>
  pipe(
    startTime,
    O.fromPredicate((time: number) => time > 0 && Date.now() - time > 0),
    O.map((time) => {
      const diff = Date.now() - time;
      const hours = Math.floor(diff / config.time.hour);
      const minutes = Math.floor((diff % config.time.hour) / config.time.minute);
      return config.time.formats.hourMinute
        .replace('%h', hours.toString())
        .replace('%m', minutes.toString());
    }),
    O.getOrElse(() => config.constants.emptyString)
  );

export const updateStats = (stats: Stats): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    () =>
      chrome.runtime.sendMessage({
        type: config.messages.types.updateStats,
        data: stats,
      }),
    (error) => new Error(`${config.errors.stats.update}: ${error}`)
  );

export const resetStats = (): TE.TaskEither<Error, void> =>
  TE.tryCatch(
    () =>
      chrome.storage.local.set({
        [config.storage.keys.stats]: config.storage.defaultStats,
      }),
    (error) => new Error(`${config.errors.stats.reset}: ${error}`)
  );

export const getStats = (tabId: number | undefined, tabStats: Map<number, Stats>): Stats =>
  pipe(
    O.fromNullable(tabId),
    O.chain((id) => O.fromNullable(tabStats.get(id))),
    O.getOrElse(() => config.storage.defaultStats)
  );

export const updateTabStats = (
  tabId: number,
  stats: Stats,
  tabStats: Map<number, Stats>
): TE.TaskEither<Error, void> =>
  pipe(
    TE.of(tabStats.set(tabId, stats)),
    TE.chain(() =>
      TE.tryCatch(
        () =>
          chrome.runtime.sendMessage({
            type: config.messages.types.statsUpdated,
            data: stats,
          }),
        (error) => new Error(`${config.errors.stats.update}: ${error}`)
      )
    )
  );
