import { escapeHTML } from '../../shared/utils.js';

export function renderNodeList(nodes, activeId) {
  if (nodes.length === 0) {
    return `<div class="node-list-empty">No nodes yet. Click [+ Add Node] to begin.</div>`;
  }

  return nodes.map(n => {
    const isActive = n.id === activeId;
    const hasUnlinked = n.choices.some(c => c.nextNodeId === null);
    const cls = [
      'node-list-item',
      isActive ? 'node-list-item--active' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${cls}" data-node-id="${n.id}">
        <div class="node-list-item-header">
          <span class="node-list-item-id">${n.id}.</span>
          <span class="node-list-item-title">${escapeHTML(n.title || 'Untitled Node')}</span>
        </div>
        <div class="node-list-item-badges">
          ${n.isStart ? '<span class="badge badge-start" title="Start Node">&#x2605;</span>' : ''}
          ${hasUnlinked ? '<span class="badge badge-warn" title="Has unlinked choices">!</span>' : ''}
        </div>
      </div>`;
  }).join('');
}

export function renderEditPanel(node, allNodes) {
  if (!node) {
    return `<div class="edit-panel-empty">Select a node from the list to edit.</div>`;
  }

  const choicesHTML = node.choices.map((choice, i) => {
    const isUnlinked = choice.nextNodeId === null || choice.nextNodeId === undefined;
    const destOptions = [{ id: null, title: '-- unlinked --' }, ...allNodes]
      .map(n => {
        const selected = n.id === choice.nextNodeId ? ' selected' : '';
        return `<option value="${n.id !== null ? n.id : ''}"${selected}>${escapeHTML(n.id !== null ? `${n.id}. ${n.title || 'Untitled Node'}` : n.title)}</option>`;
      }).join('');

    return `
      <div class="choice-row ${isUnlinked ? 'choice-row--unlinked' : ''}" data-choice-index="${i}">
        <div class="choice-fields">
          <input type="text" class="input choice-label-input" value="${escapeHTML(choice.label)}" placeholder="Choice label..." data-choice-field="label">
          <select class="select choice-dest-select" data-choice-field="nextNodeId">
            ${destOptions}
          </select>
        </div>
        <button class="btn btn-ghost btn-sm btn-icon choice-delete-btn" data-choice-action="delete" title="Delete choice">&times;</button>
      </div>`;
  }).join('');

  const isStartChecked = node.isStart ? ' checked' : '';
  const textContent = node.text || '';
  const title = node.title || '';

  return `
    <div class="edit-panel-content" data-node-id="${node.id}">
      <div class="edit-field">
        <label class="label" for="edit-title">Title</label>
        <input type="text" id="edit-title" class="input" value="${escapeHTML(title)}" placeholder="Node title..." data-edit-field="title">
      </div>

      <div class="edit-field">
        <label class="checkbox-container">
          <input type="checkbox" id="edit-isStart" data-edit-field="isStart"${isStartChecked}>
          <span>&#x2605; Mark as start node</span>
        </label>
      </div>

      <div class="edit-field">
        <label class="label" for="edit-text">Story Text</label>
        <textarea id="edit-text" class="textarea" placeholder="Write the story text for this scene..." data-edit-field="text">${escapeHTML(textContent)}</textarea>
      </div>

      <div class="edit-field">
        <div class="choices-header">
          <label class="label" style="margin-bottom:0">Choices</label>
          <span class="choices-count">${node.choices.length} choice${node.choices.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="choices-list" data-choices-container>
          ${choicesHTML || '<div class="no-choices">No choices yet. Add one below.</div>'}
        </div>
        <button class="btn btn-secondary btn-sm" data-choice-action="add" style="margin-top:var(--space-sm)">+ Add Choice</button>
      </div>

      <hr class="divider">

      <div class="edit-footer">
        <button class="btn btn-secondary btn-sm" data-node-action="duplicate">Duplicate Node</button>
        <button class="btn btn-danger btn-sm" data-node-action="delete">Delete Node</button>
      </div>
    </div>`;
}
