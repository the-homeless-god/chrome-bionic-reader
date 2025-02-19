import { chrome } from '../mocks/chrome';
import { updateIcon } from '@/background/icon';
import config from '@/config';
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
      path: config.icons.enabled.paths,
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
      path: config.icons.disabled.paths,
    });
  });

  test('handles errors', async () => {
    const error = new Error('Icon error');
    chrome.action.setIcon.mockImplementationOnce(() => Promise.reject(error));

    const result = await pipe(
      updateIcon(true),
      TE.fold(
        (e) => T.of(e.message),
        () => T.of('success')
      )
    )();

    expect(result).toBe(`${config.errors.icon.update}: Error: ${error.message}`);
  });
});
