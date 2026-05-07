import { story, currentNodeId, flags } from './state.js';

const SAVE_PREFIX = 'retold-save-';

export function saveProgress() {
  if (!story || currentNodeId === null) return;

  const key = SAVE_PREFIX + (story.title || 'unknown');
  const data = {
    currentTitle: story.title,
    currentNodeId: currentNodeId,
    flags: flags,
    savedAt: Date.now()
  };

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

export function loadProgress(storyTitle) {
  const key = SAVE_PREFIX + storyTitle;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function hasSave(storyTitle) {
  return localStorage.getItem(SAVE_PREFIX + storyTitle) !== null;
}

export function clearSave(storyTitle) {
  localStorage.removeItem(SAVE_PREFIX + storyTitle);
}
