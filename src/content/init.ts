import { getState } from '@/background/storage';
import { updatePage } from '@/content';

export const initializeExtension = async (): Promise<void> => {
  const isEnabled = await getState();
  if (isEnabled) {
    await updatePage();
  }
};

// Initialize content script
document.addEventListener('DOMContentLoaded', () => {
  initializeExtension();
});
