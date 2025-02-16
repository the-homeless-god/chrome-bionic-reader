const path = require("path");
const config = require(path.resolve(__dirname, "../../extension/config"));
const { pipe } = require(path.resolve(__dirname, "../../extension/utils"));

const chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({ [config.storage.keys.enabled]: true });
      }),
      set: jest.fn((data, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
    },
    keys: {
      enabled: "enabled",
    },
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
    setIcon: jest.fn(),
  },
  scripting: {
    executeScript: jest.fn().mockResolvedValue([]),
  },
  tabs: {
    query: jest.fn(),
  },
};

// Fix the mock for chrome.storage.local.set
chrome.storage.local.set = jest.fn().mockImplementation((data, callback) => {
  if (callback) callback();
  return Promise.resolve();
});

// Fix the mock for chrome.storage.local.get
chrome.storage.local.get = jest.fn().mockImplementation((keys, callback) => {
  callback({ [config.storage.keys.enabled]: true });
  return Promise.resolve();
});

global.chrome = chrome;
global.window = {
  config,
  utils: { pipe }
};
global.NodeFilter = {
  SHOW_ELEMENT: 1, // NodeFilter.SHOW_ELEMENT
  FILTER_ACCEPT: 1, // NodeFilter.FILTER_ACCEPT
  FILTER_REJECT: 2, // NodeFilter.FILTER_REJECT
};

module.exports = chrome;
