import { readFileAsJSON } from '../../shared/utils.js';
import { setStory } from './state.js';

export function validateStory(data) {
  if (!data) return { valid: false, error: 'No data provided.' };

  if (!Array.isArray(data.nodes)) {
    return { valid: false, error: 'Invalid story format: missing nodes array.' };
  }

  if (data.nodes.length === 0) {
    return { valid: false, error: 'Story has no nodes.' };
  }

  const ids = new Set(data.nodes.map(n => n.id));

  for (const node of data.nodes) {
    if (!node.choices) continue;
    for (const choice of node.choices) {
      if (choice.nextNodeId !== null && choice.nextNodeId !== undefined) {
        if (!ids.has(choice.nextNodeId)) {
          return {
            valid: false,
            error: `Node ${node.id} has a choice pointing to non-existent node ${choice.nextNodeId}.`
          };
        }
      }
    }
  }

  const hasStart = data.startNodeId || data.nodes.some(n => n.isStart);
  if (!hasStart) {
    return { valid: false, error: 'Story has no start node defined.' };
  }

  return { valid: true };
}

export function normalizeStory(data) {
  return {
    title: data.title || 'Untitled Story',
    version: data.version || '1.0',
    author: data.author || '',
    startNodeId: data.startNodeId || null,
    nodes: data.nodes.map(n => ({
      id: n.id,
      title: n.title || '',
      text: n.text || '',
      isStart: n.isStart === true || (n.id === data.startNodeId),
      choices: (n.choices || []).map(c => ({
        label: c.label || '',
        nextNodeId: typeof c.nextNodeId === 'number' ? c.nextNodeId : null,
        setFlag: c.setFlag || null,
        unsetFlag: c.unsetFlag || null,
        requireFlag: c.requireFlag || null
      }))
    }))
  };
}

export async function loadFromFile(file) {
  const data = await readFileAsJSON(file);
  const validation = validateStory(data);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const story = normalizeStory(data);
  setStory(story);
  return story;
}

export function loadFromObject(data) {
  const validation = validateStory(data);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const story = normalizeStory(data);
  setStory(story);
  return story;
}

export function getStartNodeId(story) {
  if (story.startNodeId) return story.startNodeId;
  const start = story.nodes.find(n => n.isStart);
  if (start) return start.id;
  return story.nodes.length > 0 ? story.nodes[0].id : null;
}
