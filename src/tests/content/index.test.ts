import { chrome, createMockStorageWithCallback } from '../mocks/chrome';
import config from '@/config';
import {
  processElement,
  processNode,
  updatePage,
  createObserver,
  initializeExtension,
} from '@/content';
import { updateStats } from '@/content/stats';

const mockProcessText = jest.fn((text: string) => {
  const words = text.split(' ');
  return words
    .map((word) => {
      const firstPart = word.slice(0, word.length > 3 ? 2 : 1);
      const restPart = word.slice(word.length > 3 ? 2 : 1);
      return `<b>${firstPart}</b>${restPart}`;
    })
    .join(' ');
});

jest.mock('@/content/text', () => ({
  processText: (text: string) => mockProcessText(text),
}));

class MockMutationObserver {
  private callback: MutationCallback;

  constructor(callback: MutationCallback) {
    this.callback = callback;
  }

  observe(target: Node, _options?: MutationObserverInit): void {
    const addedNodes = [target];
    Object.defineProperties(addedNodes, {
      item: { value: (index: number) => addedNodes[index] },
      length: { value: addedNodes.length },
    });

    const mutation = {
      type: 'childList',
      addedNodes: addedNodes as unknown as NodeList,
      removedNodes: [] as unknown as NodeList,
      target,
      previousSibling: null,
      nextSibling: null,
      attributeName: null,
      attributeNamespace: null,
      oldValue: null,
    } as MutationRecord;

    this.callback([mutation], this);
  }

  disconnect(): void {
    // Пустая реализация для тестов
  }

  takeRecords(): MutationRecord[] {
    return [];
  }
}

global.MutationObserver = MockMutationObserver;

describe('Content Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    chrome.storage.local.get.mockImplementation(createMockStorageWithCallback(true));
  });

  describe('Stats Management', () => {
    test('updates stats correctly', () => {
      updateStats(100, 50);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: config.messages.types.updateStats,
        data: {
          totalProcessed: 100,
          lastProcessingTime: 50,
          averageProcessingTime: 50,
          sessionStartTime: expect.any(Number),
        },
      });
    });
  });

  describe('Element Processing', () => {
    test('processes element with text content', () => {
      const element = document.createElement('div');
      element.textContent = 'test текст';
      document.body.appendChild(element);

      processElement(element);
      expect(element.innerHTML).toBe('<b>te</b>st <b>те</b>кст');
    });

    test('skips element without text content', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      processElement(element);
      expect(element.innerHTML).toBe('');
    });

    test('marks element as processed', () => {
      const element = document.createElement('div');
      element.textContent = 'test';
      document.body.appendChild(element);

      processElement(element);
      processElement(element); // Second call should not modify element
      expect(element.innerHTML.match(/<b>/g)?.length).toBe(1);
    });
  });

  describe('Node Processing', () => {
    test('processes text node', () => {
      const div = document.createElement('div');
      const textNode = document.createTextNode('test текст');
      div.appendChild(textNode);
      document.body.appendChild(div);

      processNode(textNode);
      expect(div.innerHTML).toBe('<b>te</b>st <b>те</b>кст');
    });

    test('skips non-text node', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      processNode(div);
      expect(div.innerHTML).toBe('');
    });

    test('skips invalid parent element', () => {
      const script = document.createElement('script');
      const textNode = document.createTextNode('test');
      script.appendChild(textNode);
      document.body.appendChild(script);

      processNode(textNode);
      expect(script.innerHTML).toBe('test');
    });
  });

  describe('Page Update', () => {
    test('processes page when enabled', async () => {
      const div = document.createElement('div');
      div.id = 'content';
      div.textContent = 'test текст';
      document.body.appendChild(div);

      await updatePage();
      await new Promise((resolve) => setTimeout(resolve, 500));

      processElement(div);
      expect(div.innerHTML).toBe('<b>te</b>st <b>те</b>кст');
      expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    });

    test('removes formatting when disabled', async () => {
      const div = document.createElement('div');
      div.id = 'content';
      div.innerHTML = '<b>te</b>st <b>те</b>кст';
      document.body.appendChild(div);

      chrome.storage.local.get.mockImplementationOnce(createMockStorageWithCallback(false));

      await updatePage();
      expect(div.textContent).toBe('test текст');
    });
  });

  describe('Observer Management', () => {
    test('creates observer with correct config', () => {
      const observer = createObserver();
      expect(observer).toBeInstanceOf(MockMutationObserver);
      expect(config.state.observer).toBe(observer);
    });

    test('processes added nodes', async () => {
      const div = document.createElement('div');
      div.id = 'content';
      div.textContent = 'test текст';

      initializeExtension();
      document.body.appendChild(div);

      await new Promise((resolve) => setTimeout(resolve, 500));
      processElement(div);
      expect(div.innerHTML).toBe('<b>te</b>st <b>те</b>кст');
    });
  });

  describe('Extension Lifecycle', () => {
    test('initializes extension', async () => {
      document.dispatchEvent(new Event('DOMContentLoaded'));
      initializeExtension();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        [config.storage.keys.enabled],
        expect.any(Function)
      );
    });

    test('cleans up resources', () => {
      const observer = new MockMutationObserver(() => {});
      config.state.observer = observer;
      const disconnectSpy = jest.spyOn(observer, 'disconnect');

      window.dispatchEvent(new Event('unload'));
      expect(disconnectSpy).toHaveBeenCalled();
      disconnectSpy.mockRestore();
    });
  });
});
