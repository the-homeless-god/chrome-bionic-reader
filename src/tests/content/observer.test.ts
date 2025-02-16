import config from '@/config';
import { createObserver, cleanupObserver } from '@/content/observer';

class MockMutationObserver implements MutationObserver {
  // @ts-expect-error - callback is not typed
  private callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
  }

  observe(_target: Node, _options?: MutationObserverInit): void {}
  disconnect(): void {}
  takeRecords(): MutationRecord[] {
    return [];
  }
}

global.MutationObserver = MockMutationObserver as any;

describe('Content Observer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    config.state.observer = null;
  });

  describe('Observer Creation', () => {
    test('creates observer with correct config', () => {
      const observer = createObserver();
      expect(observer).toBeInstanceOf(MutationObserver);
      expect(config.state.observer).toBe(observer);
    });

    test('processes mutations correctly', () => {
      const observer = createObserver();
      const div = document.createElement('div');
      div.textContent = 'test текст';

      const mutation = {
        type: 'childList',
        addedNodes: [div],
      } as unknown as MutationRecord;

      // @ts-expect-error - private access
      observer.callback([mutation]);
      expect(div.innerHTML).toContain('<b>');
    });
  });

  describe('Observer Cleanup', () => {
    test('cleans up observer correctly', () => {
      const observer = createObserver();
      const disconnectSpy = jest.spyOn(observer, 'disconnect');

      cleanupObserver();

      expect(disconnectSpy).toHaveBeenCalled();
      expect(config.state.observer).toBeNull();

      disconnectSpy.mockRestore();
    });

    test('handles cleanup when no observer exists', () => {
      config.state.observer = null;
      expect(() => cleanupObserver()).not.toThrow();
    });
  });
});
