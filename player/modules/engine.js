import { story, currentNodeId, flags, history, setCurrentNodeId, pushHistory, setFlag } from './state.js';

export function goToNode(nodeId) {
  if (!story || !story.nodes) return false;

  const target = story.nodes.find(n => n.id === nodeId);
  if (!target) return false;

  pushHistory(currentNodeId);
  setCurrentNodeId(nodeId);

  for (const choice of target.choices || []) {
    if (choice.setFlag) {
      setFlag(choice.setFlag, true);
    }
  }

  return true;
}

export function isChoiceAvailable(choice) {
  if (!choice.requireFlag) return true;
  return flags[choice.requireFlag] === true;
}

export function getAvailableChoices(node) {
  if (!node || !node.choices) return [];
  return node.choices.filter(c => isChoiceAvailable(c));
}

export function isEnding(node) {
  if (!node) return true;
  const available = getAvailableChoices(node);
  return available.length === 0;
}

export function getStartNodeId() {
  if (!story) return null;
  const start = story.nodes.find(n => n.isStart);
  if (start) return start.id;
  if (story.startNodeId) return story.startNodeId;
  if (story.nodes.length > 0) return story.nodes[0].id;
  return null;
}

export function startGame() {
  const id = getStartNodeId();
  if (id === null) return false;
  setCurrentNodeId(id);
  return true;
}
