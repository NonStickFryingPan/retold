export let story = null;
export let currentNodeId = null;
export let flags = {};
export let history = [];

const listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
}

function notify() {
  listeners.forEach(fn => fn());
}

export function setStory(s) {
  story = s;
  notify();
}

export function setCurrentNodeId(id) {
  currentNodeId = id;
  notify();
}

export function pushHistory(nodeId) {
  history.push(nodeId);
  notify();
}

export function clearHistory() {
  history = [];
  notify();
}

export function setFlag(key, value) {
  flags[key] = value;
  notify();
}

export function setFlags(newFlags) {
  flags = { ...newFlags };
  notify();
}

export function resetState() {
  story = null;
  currentNodeId = null;
  flags = {};
  history = [];
  notify();
}

export function getCurrentNode() {
  if (!story || !story.nodes || currentNodeId === null) return null;
  return story.nodes.find(n => n.id === currentNodeId) || null;
}
