import { chrome } from '../mocks/chrome';
import config from '@/config';
import { updateIcon } from '@/background/icon';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';

describe('Icon Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.action.setIcon.mockImplementation(() => Promise.resolve());
  });

  test('updates icon when enabled', async () => {
    const result = await pipe(
      updateIcon(true),
      TE.fold(
        () => T.of(false),
        () => T.of(true)
      )
    )();

    expect(result).toBe(true);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: config.icons.enabled,
    });
  });

  test('updates icon when disabled', async () => {
    const result = await pipe(
      updateIcon(false),
      TE.fold(
        () => T.of(false),
        () => T.of(true)
      )
    )();

    expect(result).toBe(true);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: config.icons.disabled,
    });
  });

  test('handles icon update errors', async () => {
    const errorMessage = 'Icon error';
    chrome.action.setIcon.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    const result = await pipe(
      updateIcon(true),
      TE.fold(
        (error) => T.of(error.message),
        () => T.of('success')
      )
    )();

    expect(result).toBe(`${config.errors.icon.update}: Error: ${errorMessage}`);
  });
});
