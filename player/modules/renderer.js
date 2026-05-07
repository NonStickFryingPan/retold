import { escapeHTML } from '../../shared/utils.js';
import { isChoiceAvailable, isEnding } from './engine.js';

export function renderTitleScreen(story) {
  const title = escapeHTML(story.title || 'Untitled Story');
  const author = escapeHTML(story.author || 'Unknown');
  const nodeCount = story.nodes ? story.nodes.length : 0;

  return `
    <div class="title-screen">
      <div class="title-screen-card">
        <div class="title-screen-logo">
          <img src="../assets/logo.svg" alt="Retold" width="48" height="48">
        </div>
        <h1 class="title-screen-title">${title}</h1>
        <p class="title-screen-author">by ${author}</p>
        <p class="title-screen-meta">${nodeCount} scenes</p>

        <div class="title-screen-actions">
          <button class="btn btn-primary btn-lg" data-action="new-game">New Game</button>
          <button class="btn btn-secondary btn-lg" data-action="continue" id="btn-continue" style="display:none">Continue</button>
          <button class="btn btn-secondary btn-lg" data-action="load-story">Load Story</button>
        </div>
      </div>
    </div>
  `;
}

export function renderGameScreen(node, allNodes, flags) {
  const nodeTitle = escapeHTML(node.title || 'Scene ' + node.id);
  const text = escapeHTML(node.text || '');
  const availableChoices = (node.choices || []).filter(c => isChoiceAvailable(c));
  const isEnd = availableChoices.length === 0;

  const choicesHTML = availableChoices.map((choice, i) => {
    const dest = choice.nextNodeId !== null && choice.nextNodeId !== undefined
      ? allNodes.find(n => n.id === choice.nextNodeId)
      : null;
    const destLabel = dest ? `${dest.id}. ${dest.title}` : '';

    return `
      <button class="choice-btn" data-choice-index="${i}" data-next-id="${choice.nextNodeId ?? ''}">
        <span class="choice-label">${escapeHTML(choice.label)}</span>
        ${dest ? `<span class="choice-dest">\u2192 ${escapeHTML(destLabel)}</span>` : ''}
      </button>`;
  }).join('');

  const endContent = isEnd
    ? `<div class="end-marker">\u2014 THE END \u2014</div>`
    : '';

  return `
    <div class="game-screen">
      <div class="game-scene">
        <div class="game-scene-title">${nodeTitle}</div>
        <div class="game-scene-text">${text}</div>
      </div>

      <div class="game-choices">
        ${choicesHTML}
        ${endContent}
      </div>

      ${isEnd ? '' : ''}
    </div>
  `;
}

export function renderEndScreen(lastNode) {
  return `
    <div class="title-screen">
      <div class="title-screen-card">
        <h1 class="title-screen-title" style="font-size:28px;color:var(--color-primary)">\u2014 THE END \u2014</h1>
        <p class="title-screen-meta" style="margin-top:var(--space-md)">${escapeHTML(lastNode.text || '')}</p>

        <div class="title-screen-actions" style="margin-top:var(--space-xl)">
          <button class="btn btn-primary btn-lg" data-action="play-again">Play Again</button>
          <button class="btn btn-secondary btn-lg" data-action="load-story">Load New Story</button>
        </div>
      </div>
    </div>
  `;
}
