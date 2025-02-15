const config = require("./config");
const { pipe } = require("./utils");

const initializeStorage = () =>
  chrome.storage.local.set({
    [config.storage.keys.enabled]: config.storage.defaultState,
  });

const setupMessageHandlers = () =>
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getState") {
      chrome.storage.local.get([config.storage.keys.enabled], (result) =>
        sendResponse(
          result[config.storage.keys.enabled] || config.storage.defaultState
        )
      );
      return true;
    }
  });

const initialize = () =>
  pipe(() => {
    initializeStorage();
    setupMessageHandlers();
    return true;
  })();

// Export before initialization
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeStorage,
    setupMessageHandlers,
    initialize,
  };
}

// Initialize only if not in test environment
if (typeof process === "undefined" || process.env.NODE_ENV !== "test") {
  initialize();
}
