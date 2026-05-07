import { story, currentNodeId, flags, history, subscribe, resetState, getCurrentNode, setCurrentNodeId, setFlags } from './modules/state.js';
import { goToNode, applyChoiceFlags, getAvailableChoices, isEnding, startGame } from './modules/engine.js';
import { renderTitleScreen, renderGameScreen, renderEndScreen } from './modules/renderer.js';
import { saveProgress, loadProgress, hasSave, clearSave } from './modules/saves.js';
import { loadFromFile, loadFromObject } from './modules/loader.js';

const el = {
  main: document.getElementById('player-main'),
  topbarTitle: document.getElementById('topbar-title'),
  btnMenu: document.getElementById('btn-menu'),
  loadFile: document.getElementById('load-file'),
  storyLoader: document.getElementById('story-loader'),
  btnLoadFirst: document.getElementById('btn-load-first')
};

let currentScreen = 'loader';

function render() {
  if (!story) {
    showLoader();
    return;
  }

  el.topbarTitle.textContent = story.title || '';
  el.btnMenu.style.display = 'inline-flex';

  const node = getCurrentNode();

  if (node === null && currentNodeId !== null) {
    el.main.innerHTML = `<div class="title-screen"><div class="title-screen-card">
      <p style="color:var(--color-text-muted)">Scene not found.</p>
      <div class="title-screen-actions">
        <button class="btn btn-secondary btn-lg" data-action="menu">Return to Menu</button>
      </div>
    </div></div>`;
    currentScreen = 'error';
    return;
  }

  if (!node && currentNodeId === null && currentScreen === 'title') {
    el.main.innerHTML = renderTitleScreen(story);
    setupTitleScreenButtons();
    return;
  }

  if (node && currentNodeId !== null) {
    const available = getAvailableChoices(node);
    if (available.length === 0) {
      el.main.innerHTML = renderEndScreen(node);
      currentScreen = 'end';
      setupEndScreenButtons();
    } else {
      el.main.innerHTML = renderGameScreen(node, story.nodes, flags);
      currentScreen = 'game';
      setupGameButtons();
    }
  } else {
    showTitle();
  }
}

function showLoader() {
  el.topbarTitle.textContent = '';
  el.btnMenu.style.display = 'none';
  el.main.innerHTML = `
    <div class="story-loader">
      <p>No story loaded.</p>
      <button class="btn btn-primary btn-lg" id="btn-load-main">Load Story</button>
    </div>`;
  currentScreen = 'loader';

  const btn = document.getElementById('btn-load-main');
  if (btn) btn.addEventListener('click', () => el.loadFile.click());
}

function showTitle() {
  if (!story) return;

  currentScreen = 'title';
  el.main.innerHTML = renderTitleScreen(story);
  setupTitleScreenButtons();

  const save = loadProgress(story.title);
  const continueBtn = document.getElementById('btn-continue');
  if (continueBtn && save) {
    continueBtn.style.display = '';
    continueBtn.dataset.nodeId = save.currentNodeId;
  }
}

function startNewGame() {
  clearSave(story.title);
  startGame();
  saveProgress();
}

function setupTitleScreenButtons() {
  el.main.querySelector('[data-action="new-game"]')?.addEventListener('click', () => {
    startNewGame();
  });

  el.main.querySelector('[data-action="continue"]')?.addEventListener('click', (e) => {
    const nodeId = parseInt(e.target.dataset.nodeId);
    if (!isNaN(nodeId)) {
      const save = loadProgress(story.title);
      if (save) {
        setFlags(save.flags || {});
        setCurrentNodeId(save.currentNodeId);
      }
    }
  });

  el.main.querySelector('[data-action="load-story"]')?.addEventListener('click', () => {
    el.loadFile.click();
  });
}

function setupGameButtons() {
  el.main.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const nextId = parseInt(btn.dataset.nextId);
      if (!isNaN(nextId)) {
        const setFlag = btn.dataset.setFlag || null;
        const unsetFlag = btn.dataset.unsetFlag || null;
        if (setFlag || unsetFlag) {
          applyChoiceFlags({ setFlag, unsetFlag });
        }
        goToNode(nextId);
        saveProgress();
      }
    });
  });
}

function setupEndScreenButtons() {
  el.main.querySelector('[data-action="play-again"]')?.addEventListener('click', () => {
    startNewGame();
  });

  el.main.querySelector('[data-action="load-story"]')?.addEventListener('click', () => {
    el.loadFile.click();
  });
}

function setupLoadFile() {
  el.loadFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const loadedStory = await loadFromFile(file);
      el.loadFile.value = '';

      const save = hasSave(loadedStory.title);
      if (save) {
        const saveData = loadProgress(loadedStory.title);
        if (saveData) {
          setFlags(saveData.flags || {});
          setCurrentNodeId(saveData.currentNodeId);
          return;
        }
      }
      showTitle();
    } catch (err) {
      alert('Failed to load story: ' + err.message);
    }
    el.loadFile.value = '';
  });

  if (el.btnLoadFirst) {
    el.btnLoadFirst.addEventListener('click', () => el.loadFile.click());
  }
}

function setupMenu() {
  el.btnMenu.addEventListener('click', () => {
    showTitle();
  });
}

subscribe(() => {
  render();
});

function init() {
  setupLoadFile();
  setupMenu();
  showLoader();
}

init();
