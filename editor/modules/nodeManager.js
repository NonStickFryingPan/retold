import { nodes, activeNodeId, setNodes, setActiveNodeId, getNodeById, notify } from './state.js';
import { generateId } from '../../shared/utils.js';

export function addNode() {
  const maxId = nodes.reduce((max, n) => Math.max(max, n.id), 0);
  const node = {
    id: maxId + 1,
    title: '',
    text: '',
    isStart: nodes.length === 0,
    choices: []
  };
  setNodes([...nodes, node]);
  setActiveNodeId(node.id);
}

export function deleteNode(id) {
  const updated = nodes.filter(n => n.id !== id);

  let changed = false;
  for (const node of updated) {
    for (const choice of node.choices) {
      if (choice.nextNodeId === id) {
        choice.nextNodeId = null;
        changed = true;
      }
    }
  }

  setNodes(updated);

  if (activeNodeId === id) {
    setActiveNodeId(updated.length > 0 ? updated[0].id : null);
  }
}

export function duplicateNode(id) {
  const source = getNodeById(id);
  if (!source) return;

  const maxId = nodes.reduce((max, n) => Math.max(max, n.id), 0);
  const clone = {
    ...source,
    id: maxId + 1,
    title: source.title + ' (copy)',
    isStart: false,
    choices: source.choices.map(c => ({ ...c }))
  };

  setNodes([...nodes, clone]);
  setActiveNodeId(clone.id);
}

export function setStartNode(id) {
  const updated = nodes.map(n => ({
    ...n,
    isStart: n.id === id
  }));
  setNodes(updated);
}

export function updateNode(id, patch) {
  const updated = nodes.map(n =>
    n.id === id ? { ...n, ...patch } : n
  );
  setNodes(updated);
}
