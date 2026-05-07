export function validate(nodes) {
  const issues = [];
  const warnings = [];

  if (nodes.length === 0) {
    issues.push('Story has no nodes.');
    return { valid: false, issues, warnings };
  }

  const hasStart = nodes.some(n => n.isStart);
  if (!hasStart) {
    issues.push('No start node defined. Mark one node as the starting point.');
  }

  const nodeIds = new Set(nodes.map(n => n.id));

  for (const node of nodes) {
    for (const choice of node.choices) {
      if (choice.nextNodeId === null || choice.nextNodeId === undefined) {
        warnings.push(`Node ${node.id} ("${node.title || 'Untitled'}") has an unlinked choice "${choice.label || '(no label)'}".`);
      } else if (!nodeIds.has(choice.nextNodeId)) {
        warnings.push(`Node ${node.id} ("${node.title || 'Untitled'}") has a choice "${choice.label}" pointing to deleted node ${choice.nextNodeId}.`);
      }
    }
  }

  const unreachable = findUnreachableNodes(nodes);
  for (const n of unreachable) {
    if (!n.isStart) {
      warnings.push(`Node ${n.id} ("${n.title || 'Untitled'}") is not reachable from the start node.`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings
  };
}

function findUnreachableNodes(nodes) {
  const start = nodes.find(n => n.isStart);
  if (!start) return nodes;

  const reachable = new Set();
  const queue = [start.id];

  while (queue.length > 0) {
    const id = queue.shift();
    if (reachable.has(id)) continue;
    reachable.add(id);

    const node = nodes.find(n => n.id === id);
    if (!node) continue;

    for (const choice of node.choices) {
      if (choice.nextNodeId !== null && choice.nextNodeId !== undefined) {
        queue.push(choice.nextNodeId);
      }
    }
  }

  return nodes.filter(n => !reachable.has(n.id));
}

export function getWarningCount(nodes) {
  const { warnings } = validate(nodes);
  return warnings.length;
}
