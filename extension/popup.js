document.addEventListener('DOMContentLoaded', () => {
  const enableSwitch = document.getElementById('enableSwitch');
  const totalProcessed = document.getElementById('totalProcessed');
  const lastProcessingTime = document.getElementById('lastProcessingTime');
  const averageProcessingTime = document.getElementById('averageProcessingTime');

  // Загрузка начального состояния
  chrome.storage.local.get(
    [config.storage.keys.enabled, config.storage.keys.stats],
    result => {
      enableSwitch.checked = result[config.storage.keys.enabled] || false;
      
      const stats = result[config.storage.keys.stats] || config.storage.defaultStats;
      updateStats(stats);
    }
  );

  // Обработка изменения состояния переключателя
  enableSwitch.addEventListener('change', () => {
    const newState = enableSwitch.checked;
    chrome.storage.local.set({ [config.storage.keys.enabled]: newState }, () => {
      // Обновляем иконку
      chrome.action.setIcon({
        path: newState ? config.icons.enabled.paths : config.icons.disabled.paths
      });
      
      // Перезагружаем активную вкладку
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });

  // Обновление статистики при получении новых данных
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[config.storage.keys.stats]) {
      updateStats(changes[config.storage.keys.stats].newValue);
    }
  });

  function updateStats(stats) {
    totalProcessed.textContent = stats.totalProcessed.toLocaleString();
    lastProcessingTime.textContent = `${stats.lastProcessingTime.toFixed(2)} мс`;
    averageProcessingTime.textContent = `${stats.averageProcessingTime.toFixed(2)} мс`;
  }
}); 
