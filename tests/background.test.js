require("./mocks/chrome");

const {
  toggleState,
  updateStorage,
  getStorageState,
  getIconConfig,
  updateIcon,
  executeContentScript,
  handleClick,
  initialize,
} = require("../extension/background");

describe("State Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("toggles state correctly", () => {
    expect(toggleState(true)).toBe(false);
    expect(toggleState(false)).toBe(true);
  });

  test("updates storage with new state", async () => {
    const data = { isEnabled: true };
    await updateStorage(true);
    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      data,
      expect.any(Function)
    );
  });

  test("gets storage state", async () => {
    const state = await getStorageState();
    expect(state).toBe(true);
  });

  test("gets icon config for enabled state", () => {
    const config = getIconConfig(true);
    expect(config).toEqual({
      16: "icons/button/smartReader-16.png",
      32: "icons/button/smartReader-32.png",
      48: "icons/smartReader-48.png",
      128: "icons/smartReader-128.png",
    });
  });

  test("gets icon config for disabled state", () => {
    const config = getIconConfig(false);
    expect(config).toEqual({
      16: "icons/button/smartReader-disabled-16.png",
      32: "icons/button/smartReader-disabled-32.png",
      48: "icons/smartReader-48.png",
      128: "icons/smartReader-128.png",
    });
  });

  test("updates icon based on state", () => {
    const result = updateIcon(true);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "icons/button/smartReader-16.png",
        32: "icons/button/smartReader-32.png",
        48: "icons/smartReader-48.png",
        128: "icons/smartReader-128.png",
      },
    });
    expect(result).toBe(true);
  });

  test("handles storage errors", async () => {
    chrome.storage.local.set.mockImplementationOnce((data, callback) => {
      chrome.runtime.lastError = new Error("Storage error");
      callback();
      chrome.runtime.lastError = null;
    });

    await updateStorage(true);
  });

  test("handles get storage errors", async () => {
    chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
      chrome.runtime.lastError = new Error("Get storage error");
      callback({});
      chrome.runtime.lastError = null;
    });

    const state = await getStorageState();
    expect(state).toBe(false);
  });
});

describe("Content Script Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("executes content script", async () => {
    await executeContentScript(1);
    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 1 },
      func: expect.any(Function),
    });
  });
});

describe("Extension Initialization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initializes correctly", () => {
    initialize();
    expect(chrome.action.onClicked.addListener).toHaveBeenCalled();
  });

  test("handles click events", async () => {
    const tab = { id: 1 };
    await handleClick(tab);
    expect(chrome.storage.local.get).toHaveBeenCalled();
    expect(chrome.storage.local.set).toHaveBeenCalled();
    expect(chrome.action.setIcon).toHaveBeenCalled();
    expect(chrome.scripting.executeScript).toHaveBeenCalled();
  });
});
