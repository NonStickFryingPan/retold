import { nodes, storyMeta, setNodes, setStoryMeta } from './state.js';
import { resetIdCounter } from '../../shared/utils.js';

const STORAGE_KEY = 'retold-editor';

export function saveToLocalStorage() {
  const data = {
    nodes: nodes,
    storyMeta: storyMeta
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data;
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
    return null;
  }
}

export function restoreFromLocalStorage() {
  const data = loadFromLocalStorage();
  if (!data || !data.nodes || data.nodes.length === 0) return false;

  setNodes(data.nodes);
  setStoryMeta(data.storyMeta || { title: 'Untitled Story', version: '1.0', author: '' });

  const maxId = data.nodes.reduce((max, n) => Math.max(max, n.id), 0);
  resetIdCounter(maxId + 1);

  return true;
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasSavedData() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
