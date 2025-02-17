const config = require('./config');
const { pipe } = require('./utils');

const toggleState = state => !state;

const updateStorage = state =>
  new Promise(resolve =>
    chrome.storage.local.set({ 
      [config.storage.keys.enabled]: state 
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
      }
      resolve();
    })
  );

const getStorageState = () =>
  new Promise(resolve =>
    chrome.storage.local.get(
      [config.storage.keys.enabled],
      result => {
        if (chrome.runtime.lastError) {
          console.error('Get storage error:', chrome.runtime.lastError);
          resolve(config.storage.defaultState);
          return;
        }
        resolve(result[config.storage.keys.enabled] || config.storage.defaultState);
      }
    )
  );

const getIconConfig = isEnabled => {
  const { prefix, sizes } = isEnabled 
    ? config.icons.enabled 
    : config.icons.disabled;

  return Object.entries(sizes).reduce((acc, [size, suffix]) => ({
    ...acc,
    [size]: `icons/${prefix}${suffix}`
  }), {});
};

const updateIcon = isEnabled => {
  chrome.action.setIcon({
    path: getIconConfig(isEnabled)
  });
  return isEnabled;
};

const executeContentScript = tabId =>
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.location.reload()
  });

const handleClick = async tab => {
  const currentState = await getStorageState();
  const newState = toggleState(currentState);
  
  await pipe(
    updateStorage,
    updateIcon
  )(newState);
  
  await executeContentScript(tab.id);
};

const initialize = () => {
  chrome.action.onClicked.addListener(handleClick);
  getStorageState().then(updateIcon);
  return true;
};

initialize();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toggleState,
    updateStorage,
    getStorageState,
    getIconConfig,
    updateIcon,
    executeContentScript,
    handleClick,
    initialize
  };
}
