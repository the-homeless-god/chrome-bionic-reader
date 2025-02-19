import { chrome, createMockStorageWithCallback } from '../mocks/chrome';
import config from '@/config';
import { initializeExtension } from '@/content/index';

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

jest.mock('@/content', () => ({
  updatePage: () => mockUpdatePage(),
  initializeExtension,
}));

jest.mock('@/background/storage', () => ({
  getStorageState: () => mockGetStorageState(),
}));

jest.mock('@/content/observer', () => ({
  createObserver: mockCreateObserver,
  cleanupObserver: mockCleanupObserver,
}));

describe('Content Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('initializes extension on DOMContentLoaded', () => {
    initializeExtension();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(mockUpdatePage).toHaveBeenCalled();
  });

  test('handles initialization errors', async () => {
    const error = new Error('Update error');
    mockUpdatePage.mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    initializeExtension();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Chrome Bionic Reader] [ERROR] Failed to update page',
      error
    );
    consoleSpy.mockRestore();
  });

  test('cleans up on unload', () => {
    initializeExtension();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    window.dispatchEvent(new Event('unload'));
    expect(config.state.observer).toBeNull();
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
