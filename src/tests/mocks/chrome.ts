import config from '@/config';
import { pipe } from 'fp-ts/function';
import { Mock } from 'jest-mock';

type StorageCallback = (items: { [key: string]: any }) => void;

type ChromeMock = {
  storage: {
    local: {
      get: Mock<(_keys: string[], callback?: StorageCallback) => Promise<{ [key: string]: any }>>;
      set: Mock<(_items: { [key: string]: any }) => Promise<void>>;
    };
  };
  runtime: {
    onMessage: {
      addListener: Mock;
    };
    sendMessage: Mock;
  };
  action: {
    onClicked: {
      addListener: Mock;
    };
    setIcon: Mock;
  };
  scripting: {
    executeScript: Mock;
  };
  tabs: {
    query: Mock;
    onRemoved: {
      addListener: Mock;
    };
    sendMessage: Mock;
  };
  cast: Record<string, unknown>;
  accessibilityFeatures: Record<string, unknown>;
  alarms: Record<string, unknown>;
  browser: Record<string, unknown>;
};

declare global {
  // eslint-disable-next-line no-var
  var messageListener: ((message: any, sender: any, sendResponse: any) => void) | undefined;
}

export const createMockStorage = () => ({
  local: {
    get: jest.fn((_keys: string[], callback?: StorageCallback) => {
      const result = { [config.storage.keys.enabled]: true };
      if (callback) {
        callback(result);
      }
      return Promise.resolve(result);
    }),
    set: jest.fn((_items: { [key: string]: any }) => {
      return Promise.resolve();
    }),
  },
});

export const createMockStorageWithCallback =
  (enabled: boolean) => (_keys: string[], callback?: (result: any) => void) => {
    const result = { [config.storage.keys.enabled]: enabled };
    if (callback) {
      callback(result);
    }
    return Promise.resolve(result);
  };

const createMockRuntime = () => ({
  sendMessage: jest.fn((_message: any) => Promise.resolve()),
  onMessage: {
    addListener: jest.fn((listener: (message: any, sender: any, sendResponse: any) => void) => {
      global.messageListener = listener;
    }),
  },
});

const createMockTabs = () => ({
  query: jest.fn(() => Promise.resolve([{ id: 1, url: 'https://example.com' }])),
  onRemoved: {
    addListener: jest.fn(),
  },
  sendMessage: jest.fn((_tabId: number, _message: any) => Promise.resolve()),
});

const createMockAction = () => ({
  setIcon: jest.fn(),
  onClicked: {
    addListener: jest.fn(),
  },
});

const createMockScripting = () => ({
  executeScript: jest.fn(() => Promise.resolve([{ result: undefined }])),
});

export const chrome = {
  storage: createMockStorage(),
  runtime: createMockRuntime(),
  tabs: createMockTabs(),
  action: createMockAction(),
  scripting: createMockScripting(),
  cast: {},
  accessibilityFeatures: {},
  alarms: {},
  browser: {},
} as unknown as ChromeMock;

// @ts-expect-error - Chrome mock is not fully typed
global.chrome = chrome;

global.window = {
  ...window,
  config,
  utils: { pipe },
} as unknown as Window & typeof globalThis;

global.NodeFilter = {
  FILTER_ACCEPT: 1,
  FILTER_REJECT: 2,
  FILTER_SKIP: 3,
  SHOW_ALL: 4294967295,
  SHOW_ELEMENT: 1,
  SHOW_ATTRIBUTE: 2,
  SHOW_TEXT: 4,
  SHOW_CDATA_SECTION: 8,
  SHOW_ENTITY_REFERENCE: 16,
  SHOW_ENTITY: 32,
  SHOW_PROCESSING_INSTRUCTION: 64,
  SHOW_COMMENT: 128,
  SHOW_DOCUMENT: 256,
  SHOW_DOCUMENT_TYPE: 512,
  SHOW_DOCUMENT_FRAGMENT: 1024,
  SHOW_NOTATION: 2048,
} as unknown as typeof NodeFilter;

export default chrome;
