import { nodes, storyMeta, setNodes, setStoryMeta, setActiveNodeId, notify } from './state.js';
import { resetIdCounter } from '../../shared/utils.js';
import { downloadJSON, readFileAsJSON } from '../../shared/utils.js';

export function buildStoryJSON() {
  return {
    title: storyMeta.title || 'Untitled Story',
    version: storyMeta.version || '1.0',
    author: storyMeta.author || '',
    startNodeId: getStartNodeId(),
    nodes: nodes.map(n => ({
      id: n.id,
      title: n.title,
      text: n.text,
      isStart: n.isStart,
      choices: n.choices.map(c => ({
        label: c.label,
        nextNodeId: c.nextNodeId,
        setFlag: c.setFlag || null,
        unsetFlag: c.unsetFlag || null,
        requireFlag: c.requireFlag || null
      }))
    }))
  };
}

function getStartNodeId() {
  const start = nodes.find(n => n.isStart);
  return start ? start.id : null;
}

export function exportJSON() {
  const story = buildStoryJSON();
  const filename = (story.title || 'story').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json';
  downloadJSON(story, filename);
}

export async function importJSON(file) {
  const data = await readFileAsJSON(file);
  return loadFromData(data);
}

export function loadFromData(data) {
  if (!data || !Array.isArray(data.nodes)) {
    throw new Error('Invalid story format: missing nodes array');
  }

  const importedNodes = data.nodes.map(n => ({
    id: n.id,
    title: n.title || '',
    text: n.text || '',
    isStart: n.isStart === true || (n.id === data.startNodeId),
    choices: Array.isArray(n.choices) ? n.choices.map(c => ({
      label: c.label || '',
      nextNodeId: typeof c.nextNodeId === 'number' ? c.nextNodeId : null,
      setFlag: c.setFlag || null,
      unsetFlag: c.unsetFlag || null,
      requireFlag: c.requireFlag || null
    })) : []
  }));

  setNodes(importedNodes);
  setStoryMeta({
    title: data.title || 'Untitled Story',
    version: data.version || '1.0',
    author: data.author || ''
  });

  const maxId = importedNodes.reduce((max, n) => Math.max(max, n.id), 0);
  resetIdCounter(maxId + 1);

  if (importedNodes.length > 0) {
    setActiveNodeId(importedNodes[0].id);
  }

  return importedNodes;
}

export function newStory() {
  setNodes([]);
  setActiveNodeId(null);
  setStoryMeta({ title: 'Untitled Story', version: '1.0', author: '' });
  resetIdCounter(1);
}
