import { chrome, createMockStorageWithCallback } from '../mocks/chrome';
import config from '@/config';

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockTakeRecords = jest.fn().mockReturnValue([]);

const mockObserver = {
  observe: mockObserve,
  disconnect: mockDisconnect,
  takeRecords: mockTakeRecords,
};

const mockUpdatePage = jest.fn().mockResolvedValue(undefined);
const mockCreateObserver = jest.fn().mockReturnValue(mockObserver);
const mockCleanupObserver = jest.fn();
const mockGetStorageState = jest.fn().mockResolvedValue(true);

jest.mock('@/background/storage', () => ({
  getStorageState: mockGetStorageState,
}));

jest.mock('@/content/observer', () => ({
  createObserver: mockCreateObserver,
  cleanupObserver: mockCleanupObserver,
}));

jest.mock('@/content', () => {
  const actualContent = jest.requireActual('@/content');
  return {
    ...actualContent,
    updatePage: mockUpdatePage,
    initializeExtension: actualContent.initializeExtension,
  };
});

describe('Content Initialization', () => {
  let initializeExtension: typeof import('@/content').initializeExtension;

  beforeEach(async () => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    config.state.observer = null;

    jest.isolateModules(() => {
      const content = require('@/content');
      initializeExtension = content.initializeExtension;
    });
  });

  test('initializes extension on DOMContentLoaded', async () => {
    initializeExtension();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockCreateObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(document.body, config.dom.observer.config);
    expect(mockGetStorageState).toHaveBeenCalled();
  });

  test('sets up observer correctly', async () => {
    initializeExtension();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockCreateObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(document.body, config.dom.observer.config);
  });

  test('cleans up resources on unload', async () => {
    initializeExtension();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 100));

    window.dispatchEvent(new Event('unload'));
    expect(mockCleanupObserver).toHaveBeenCalled();
  });

  test.skip('handles storage state correctly', async () => {
    mockGetStorageState.mockResolvedValueOnce(true);

    initializeExtension();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(mockGetStorageState).toHaveBeenCalled();
    expect(mockUpdatePage).toHaveBeenCalled();
  });

  test('skips page update when disabled', async () => {
    mockGetStorageState.mockResolvedValueOnce(false);
    chrome.storage.local.get.mockImplementationOnce(createMockStorageWithCallback(false));

    initializeExtension();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockGetStorageState).toHaveBeenCalled();
    expect(mockUpdatePage).not.toHaveBeenCalled();
  });
});
