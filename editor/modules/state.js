export let nodes = [];
export let activeNodeId = null;
export let storyMeta = { title: 'Untitled Story', version: '1.0', author: '' };

const listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
}

export function notify() {
  listeners.forEach(fn => fn());
}

export function setNodes(newNodes) {
  nodes = newNodes;
  notify();
}

export function setActiveNodeId(id) {
  activeNodeId = id;
  notify();
}

export function setStoryMeta(patch) {
  Object.assign(storyMeta, patch);
  notify();
}

export function getNodeById(id) {
  return nodes.find(n => n.id === id);
}

export function getActiveNode() {
  return nodes.find(n => n.id === activeNodeId) || null;
}

export function getStartNode() {
  return nodes.find(n => n.isStart) || null;
}
