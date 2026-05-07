import { nodes, getActiveNode, notify } from './state.js';
import { setNodes } from './state.js';

export function addChoice(nodeId) {
  const updated = nodes.map(n => {
    if (n.id !== nodeId) return n;
    return {
      ...n,
      choices: [...n.choices, { label: '', nextNodeId: null }]
    };
  });
  setNodes(updated);
}

export function deleteChoice(nodeId, choiceIndex) {
  const updated = nodes.map(n => {
    if (n.id !== nodeId) return n;
    const choices = n.choices.filter((_, i) => i !== choiceIndex);
    return { ...n, choices };
  });
  setNodes(updated);
}

export function updateChoice(nodeId, choiceIndex, patch) {
  const updated = nodes.map(n => {
    if (n.id !== nodeId) return n;
    const choices = n.choices.map((c, i) =>
      i === choiceIndex ? { ...c, ...patch } : c
    );
    return { ...n, choices };
  });
  setNodes(updated);
}
