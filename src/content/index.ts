import config from '@/config';
import { pipe } from 'fp-ts/function';
import { removeFormattingFromElements } from './dom';
import { processNode } from './processor';
import { updateStats } from './stats';
import { createObserver, cleanupObserver } from './observer';
import { getStorageState } from '@/background/storage';

export * from './processor';
export * from './stats';
export * from './observer';

export const updatePage = async (): Promise<void> => {
  const isEnabled = await getStorageState();

  if (!isEnabled) {
    pipe(
      document.querySelectorAll(config.dom.selectors.boldElements),
      removeFormattingFromElements
    );
    return;
  }

  const startTime = performance.now();
  let processedCount = 0;

  const processNodes = (walker: TreeWalker): void => {
    pipe(
      Array.from({ length: config.processing.batchSize }, () => walker.nextNode()),
      (nodes) => nodes.filter((node): node is Node => node !== null),
      (nodes) => {
        nodes.forEach((node) => {
          processNode(node);
          processedCount++;
        });
      }
    );
  };

  const walker = document.createTreeWalker(document.body, config.dom.treeWalker.type, {
    acceptNode: (node: Node) => {
      if (node.nodeType === config.dom.nodeTypes.text) {
        return config.dom.treeWalker.filter.accept;
      }
      return config.dom.treeWalker.filter.skip;
    },
  });

  while (walker.nextNode()) {
    processNodes(walker);
  }

  const processingTime = performance.now() - startTime;
  updateStats(processedCount, processingTime);
};

export const initializeExtension = (): void => {
  const observer = createObserver();
  observer.observe(document.body, config.dom.observer.config);

  document.addEventListener('DOMContentLoaded', async () => {
    const result = await chrome.storage.local.get([config.storage.keys.enabled]);
    if (result[config.storage.keys.enabled]) {
      await updatePage();
    }
  });

  window.addEventListener('unload', cleanupObserver);
};
