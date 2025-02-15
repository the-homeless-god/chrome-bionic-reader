const path = require('path');
const config = require(path.resolve(__dirname, '../../extension/config'));

const chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({ [config.storage.keys.enabled]: true });
      }),
      set: jest.fn((data, callback) => {
        if (callback) callback();
        return Promise.resolve();
      })
    },
  },
  runtime: {
    onMessage: {
      addListener: jest.fn()
    }
  },
  action: {
    onClicked: {
      addListener: jest.fn()
    },
    setIcon: jest.fn()
  },
  scripting: {
    executeScript: jest.fn().mockResolvedValue([])
  },
  tabs: {
    query: jest.fn()
  }
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
global.NodeFilter = {
  SHOW_ELEMENT: config.dom.treeWalker.type,
  FILTER_ACCEPT: config.dom.treeWalker.filter.accept,
  FILTER_REJECT: config.dom.treeWalker.filter.reject
};

module.exports = chrome;
