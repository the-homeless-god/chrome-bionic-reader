const fs = require("fs");
const path = require("path");

require("./mocks/chrome");

const {
  toggleState,
  updateStorage,
  getStorageState,
  updateIcon,
  executeContentScript,
  handleClick,
  initialize,
  getIconConfig,
} = require("../extension/background.js");

describe("State Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("toggles state correctly", () => {
    expect(toggleState(true)).toBe(false);
    expect(toggleState(false)).toBe(true);
  });

  test("updates storage with new state", async () => {
    const promise = updateStorage(true);
    expect(chrome.storage.local.set).toHaveBeenCalled();
    const call = chrome.storage.local.set.mock.calls[0];
    expect(call[0]).toEqual({ isEnabled: true });
    await promise;
  });

  test("gets storage state", async () => {
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ isEnabled: true });
    });

    const state = await getStorageState();
    expect(state).toBe(true);
  });

  test("gets icon config for enabled state", () => {
    const config = getIconConfig(true);
    expect(config).toEqual({
      16: "icons/icon16.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    });
  });

  test("gets icon config for disabled state", () => {
    const config = getIconConfig(false);
    expect(config).toEqual({
      16: "icons/icon-disabled16.png",
      48: "icons/icon-disabled48.png",
      128: "icons/icon-disabled128.png",
    });
  });

  test("updates icon based on state", () => {
    const result = updateIcon(true);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "icons/icon16.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      },
    });
    expect(result).toBe(true);

    const result2 = updateIcon(false);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "icons/icon-disabled16.png",
        48: "icons/icon-disabled48.png",
        128: "icons/icon-disabled128.png",
      },
    });
    expect(result2).toBe(false);
  });

  test("handles storage errors", async () => {
    const error = new Error("Storage error");
    chrome.runtime.lastError = error;
    chrome.storage.local.set.mockImplementation((data, callback) => {
      callback();
    });

    await updateStorage(true);
    expect(chrome.storage.local.set).toHaveBeenCalled();
    delete chrome.runtime.lastError;
  });

  test("handles get storage errors", async () => {
    const error = new Error("Get storage error");
    chrome.runtime.lastError = error;
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const state = await getStorageState();
    expect(state).toBe(false); // Should return default state on error
    delete chrome.runtime.lastError;
  });
});

describe("Content Script Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("executes content script", async () => {
    executeContentScript(123);
    const call = chrome.scripting.executeScript.mock.calls[0];
    expect(call[0]).toEqual({
      target: { tabId: 123 },
      func: expect.any(Function),
    });

    // Check that the callback function is a function
    expect(typeof call[0].func).toBe("function");

    // Check error handling
    const error = new Error("Script execution error");
    chrome.runtime.lastError = error;
    chrome.scripting.executeScript.mockImplementation((params, callback) => {
      if (callback) callback();
    });

    await executeContentScript(123);
    expect(chrome.scripting.executeScript).toHaveBeenCalled();
    delete chrome.runtime.lastError;
  });
});

describe("Extension Initialization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initializes correctly", async () => {
    const result = initialize();
    expect(result).toBe(true);
    expect(chrome.action.onClicked.addListener).toHaveBeenCalled();

    // Check callback function
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ isEnabled: false });
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "icons/icon-disabled16.png",
        48: "icons/icon-disabled48.png",
        128: "icons/icon-disabled128.png",
      },
    });
  });

  test("handles click events", async () => {
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ isEnabled: false });
    });

    const tab = { id: 123 };
    await handleClick(tab);

    expect(chrome.storage.local.set).toHaveBeenCalled();
    const calls = chrome.storage.local.set.mock.calls;
    expect(calls[0][0]).toEqual({ isEnabled: true });
    expect(chrome.scripting.executeScript).toHaveBeenCalled();
  });
});
