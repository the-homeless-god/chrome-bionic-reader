require("./mocks/chrome");
const config = require("../extension/config");
const {
  initializeStorage,
  setupMessageHandlers,
  initialize,
} = require("../extension/main");

describe("Extension Initialization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initializes storage with default state", () => {
    initializeStorage();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [config.storage.keys.enabled]: config.storage.defaultState,
    });
  });

  test("sets up message handlers", () => {
    setupMessageHandlers();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  test("handles getState message", () => {
    const sendResponse = jest.fn();
    setupMessageHandlers();

    const listener = chrome.runtime.onMessage.addListener.mock.calls[0][0];

    // Тестируем обработку сообщения getState
    const result = listener({ type: "getState" }, {}, sendResponse);
    expect(result).toBe(true);
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      [config.storage.keys.enabled],
      expect.any(Function)
    );

    // Проверяем callback
    const getCallback = chrome.storage.local.get.mock.calls[0][1];
    getCallback({ [config.storage.keys.enabled]: true });
    expect(sendResponse).toHaveBeenCalledWith(true);

    // Проверяем случай с отсутствующим значением
    getCallback({});
    expect(sendResponse).toHaveBeenCalledWith(config.storage.defaultState);
  });

  test("ignores unknown message types", () => {
    const sendResponse = jest.fn();
    setupMessageHandlers();

    const listener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const result = listener({ type: "unknown" }, {}, sendResponse);

    expect(result).toBeUndefined();
    expect(chrome.storage.local.get).not.toHaveBeenCalled();
    expect(sendResponse).not.toHaveBeenCalled();
  });

  test("initializes extension", () => {
    const result = initialize();
    expect(result).toBe(true);
    expect(chrome.storage.local.set).toHaveBeenCalled();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  test("pipe function works correctly", () => {
    const add = (x) => x + 1;
    const multiply = (x) => x * 2;
    const pipe =
      (...fns) =>
      (x) =>
        fns.reduce((v, f) => f(v), x);

    const result = pipe(add, multiply)(1);
    expect(result).toBe(4);
  });

  test('initializes in non-test environment', () => {
    const originalProcess = global.process;
    global.process = undefined;
    
    // Re-require main.js to trigger initialization
    jest.isolateModules(() => {
      require('../extension/main');
    });
    
    expect(chrome.storage.local.set).toHaveBeenCalled();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    
    global.process = originalProcess;
  });
});
