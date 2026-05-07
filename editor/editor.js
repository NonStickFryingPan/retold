import { nodes, activeNodeId, storyMeta, getActiveNode, subscribe, setActiveNodeId, setStoryMeta } from './modules/state.js';
import { addNode, deleteNode, duplicateNode, setStartNode, updateNode } from './modules/nodeManager.js';
import { addChoice, deleteChoice, updateChoice } from './modules/choiceManager.js';
import { renderNodeList, renderEditPanel } from './modules/renderer.js';
import { saveToLocalStorage, restoreFromLocalStorage, clearStorage, hasSavedData } from './modules/storage.js';
import { exportJSON, importJSON, newStory } from './modules/io.js';
import { validate } from './modules/validate.js';

const el = {
  nodeList: document.getElementById('node-list'),
  editPanel: document.getElementById('edit-panel'),
  storyTitle: document.getElementById('story-title'),
  statusText: document.getElementById('status-text'),
  statusWarnings: document.getElementById('status-warnings'),
  importFile: document.getElementById('import-file')
};

let confirmCallback = null;
let _lastActiveNodeId = null;
let _lastChoiceCount = -1;

function render() {
  el.nodeList.innerHTML = renderNodeList(nodes, activeNodeId);

  const activeNode = getActiveNode();
  const choiceCount = activeNode ? activeNode.choices.length : 0;
  const structuralChange = activeNodeId !== _lastActiveNodeId || choiceCount !== _lastChoiceCount;

  if (structuralChange) {
    el.editPanel.innerHTML = renderEditPanel(activeNode, nodes);
    _lastActiveNodeId = activeNodeId;
    _lastChoiceCount = choiceCount;
  }

  el.storyTitle.value = storyMeta.title || '';

  const result = validate(nodes);
  const warningCount = result.warnings.length;

  if (!result.valid) {
    el.statusText.textContent = result.issues[0];
  } else if (warningCount > 0) {
    el.statusText.textContent = `${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
  } else {
    el.statusText.textContent = `${nodes.length} node${nodes.length !== 1 ? 's' : ''}`;
  }

  el.statusWarnings.textContent = warningCount > 0 ? `\u26A0 ${warningCount}` : '';
}

function autoSave() {
  saveToLocalStorage();
}

subscribe(() => {
  render();
  autoSave();
});

function setupEventDelegation() {
  el.nodeList.addEventListener('click', (e) => {
    const item = e.target.closest('.node-list-item');
    if (!item) return;
    const nodeId = parseInt(item.dataset.nodeId);
    if (!isNaN(nodeId)) {
      setActiveNodeId(nodeId);
    }
  });

  el.editPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-node-action]');
    if (btn) {
      const action = btn.dataset.nodeAction;
      const content = btn.closest('.edit-panel-content');
      if (!content) return;
      const nodeId = parseInt(content.dataset.nodeId);

      if (action === 'delete') {
        showConfirm('Delete this node? Choices pointing to it will become unlinked.', () => {
          deleteNode(nodeId);
        });
      } else if (action === 'duplicate') {
        duplicateNode(nodeId);
      }
      return;
    }

    const choiceBtn = e.target.closest('[data-choice-action]');
    if (choiceBtn) {
      const action = choiceBtn.dataset.choiceAction;
      const contentEl = choiceBtn.closest('.edit-panel-content');
      if (!contentEl) return;
      const nodeId = parseInt(contentEl.dataset.nodeId);

      if (action === 'add') {
        addChoice(nodeId);
      } else if (action === 'delete') {
        const row = choiceBtn.closest('.choice-row');
        if (row) {
          const idx = parseInt(row.dataset.choiceIndex);
          deleteChoice(nodeId, idx);
        }
      }
      return;
    }
  });

  el.editPanel.addEventListener('input', (e) => {
    const field = e.target.closest('[data-edit-field]');
    if (!field) return;
    const content = field.closest('.edit-panel-content');
    if (!content) return;
    const nodeId = parseInt(content.dataset.nodeId);

    if (field.type === 'checkbox') {
      if (field.dataset.editField === 'isStart') {
        setStartNode(nodeId);
      }
    } else {
      const key = field.dataset.editField;
      const value = field.value;
      updateNode(nodeId, { [key]: value });
    }
  });

  el.editPanel.addEventListener('change', (e) => {
    const field = e.target.closest('[data-choice-field]');
    if (!field) return;
    const row = field.closest('.choice-row');
    if (!row) return;
    const content = row.closest('.edit-panel-content');
    if (!content) return;
    const nodeId = parseInt(content.dataset.nodeId);
    const idx = parseInt(row.dataset.choiceIndex);

    const key = field.dataset.choiceField;
    let value = field.value;

    if (key === 'nextNodeId') {
      value = value === '' ? null : parseInt(value);
    }

    updateChoice(nodeId, idx, { [key]: value });
  });

  el.editPanel.addEventListener('input', (e) => {
    const field = e.target.closest('[data-choice-field]');
    if (!field) return;
    if (field.tagName === 'SELECT') return;
    const row = field.closest('.choice-row');
    if (!row) return;
    const content = row.closest('.edit-panel-content');
    if (!content) return;
    const nodeId = parseInt(content.dataset.nodeId);
    const idx = parseInt(row.dataset.choiceIndex);

    const key = field.dataset.choiceField;
    updateChoice(nodeId, idx, { [key]: field.value });
  });

  el.storyTitle.addEventListener('input', () => {
    setStoryMeta({ title: el.storyTitle.value });
  });
}

function showConfirm(message, onConfirm) {
  const existing = document.querySelector('.confirm-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-dialog">
      <p>${message}</p>
      <div class="confirm-dialog-actions">
        <button class="btn btn-secondary" data-confirm="cancel">Cancel</button>
        <button class="btn btn-danger" data-confirm="ok">Confirm</button>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (e) => {
    const action = e.target.dataset.confirm;
    if (action === 'ok' && onConfirm) onConfirm();
    overlay.remove();
  });

  document.body.appendChild(overlay);
}

function setupButtons() {
  document.getElementById('btn-add-node').addEventListener('click', () => addNode());

  document.getElementById('btn-export').addEventListener('click', () => {
    const result = validate(nodes);
    if (!result.valid && result.issues.length > 0 && result.issues[0].includes('No nodes')) {
      alert('Cannot export: Story has no nodes.');
      return;
    }
    if (result.issues.length > 0) {
      showConfirm(
        'Export blocked: ' + result.issues.join(' ') + '\n\nFix these issues before exporting.',
        null
      );
      return;
    }
    if (result.warnings.length > 0) {
      showConfirm(
        `There are ${result.warnings.length} warning(s).\n\n` +
        result.warnings.slice(0, 3).join('\n') +
        (result.warnings.length > 3 ? '\n...and more.' : '') +
        '\n\nExport anyway?',
        () => exportJSON()
      );
    } else {
      exportJSON();
    }
  });

  document.getElementById('btn-import').addEventListener('click', () => {
    if (hasSavedData() && nodes.length > 0) {
      showConfirm('Importing will replace your current story. Continue?', () => {
        el.importFile.click();
      });
    } else {
      el.importFile.click();
    }
  });

  el.importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importJSON(file);
      el.statusText.textContent = 'Story imported successfully.';
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
    el.importFile.value = '';
  });

  document.getElementById('btn-new').addEventListener('click', () => {
    if (nodes.length > 0) {
      showConfirm('Create a new story? All unsaved changes will be lost.', () => {
        newStory();
        clearStorage();
        render();
      });
    } else {
      newStory();
      clearStorage();
      render();
    }
  });
}

function init() {
  const restored = restoreFromLocalStorage();
  setupEventDelegation();
  setupButtons();
  render();

  if (restored) {
    el.statusText.textContent = 'Previous session restored.';
    setTimeout(() => {
      const result = validate(nodes);
      el.statusText.textContent = `${nodes.length} node${nodes.length !== 1 ? 's' : ''}`;
    }, 2000);
  }
}

init();
