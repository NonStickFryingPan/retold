<div align="center">

# &#x2699;&#xFE0F; Retold
**A retro-futuristic text adventure platform that runs entirely in your browser**

[![Vanilla JS](https://img.shields.io/badge/vanilla-js-yellow?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square)]()
[![ES Modules](https://img.shields.io/badge/modules-ES6-blue?style=flat-square)]()
[![Storage](https://img.shields.io/badge/storage-localStorage-orange?style=flat-square)]()

[Editor](#story-editor) · [Player](#story-player) · [Run It](#run-it) · [JSON Format](#story-json)

</div>

---

## What is Retold?

Retold is a browser-based platform for creating and playing branching text adventures. Two modules, one JSON contract, zero external dependencies.

- **Story Editor** — author branching stories with nodes, prose, and choices. Export as JSON.
- **Story Player** — load a story and play through it. Progress saves automatically.

Think Twine, but with a brass-and-amber steampunk aesthetic.

---

## Story Editor

> `editor/editor.html`

Build stories visually:

- **Add, delete, duplicate** story nodes
- **Write prose** for each scene
- **Link choices** to other nodes with a dropdown
- **Mark a start node** — the player begins here
- **Auto-save** to localStorage on every change
- **Export / Import** story JSON
- **Validation** — warns about unlinked choices, missing start nodes

```
┌─────────────────────────────────────────────────────┐
│  [R] RETOLD — Editor    [Story Title]    [Export]   │
├──────────────┬──────────────────────────────────────┤
│ NODES        │ EDIT PANEL                           │
│ [+ Add Node] │ Title: [_______________]             │
│ ──────────── │ [★] Mark as start node              │
│ 1. Start  ★  │ Story Text: [_______________]       │
│ 2. Cave      │ Choices:                            │
│ 3. Mill   !  │ [Go left] → [2. Cave]               │
│              │ [+ Add Choice]                       │
└──────────────┴──────────────────────────────────────┘
```

---

## Story Player

> `player/player.html`

Play through any story:

- **Load** a story JSON file
- **Read** scene text rendered in a warm serif typeface
- **Choose** from available choices — click to advance
- **Endings** are detected automatically (nodes with no choices)
- **Auto-save** — close the tab, reopen, resume exactly where you left off

```
┌────────────────────────────────┐
│  [R] Forest of Echoes  [Menu]  │
│  ───────────────────────────   │
│  You stand at a fork in the    │
│  road. Rain drips through the  │
│  canopy above.                 │
│                                │
│  ┌──────────────────────────┐  │
│  │  > Go left               │  │
│  ├──────────────────────────┤  │
│  │  > Go right              │  │
│  ├──────────────────────────┤  │
│  │  > Turn back             │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

---

## Run It

ES modules require a local server. Any static file server works:

```bash
# With Node.js
npx serve .

# With Python
python -m http.server 8000

# With Deno
deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts
```

Then open `http://localhost:3000` (or whichever port your server uses).

---

## Story JSON

Stories are plain JSON. Editor exports it, player loads it.

```json
{
  "title": "Forest of Echoes",
  "version": "1.0",
  "author": "Luqman",
  "startNodeId": 1,
  "nodes": [
    {
      "id": 1,
      "title": "Forest Path",
      "text": "You stand at a fork in the road...",
      "isStart": true,
      "choices": [
        { "label": "Go left", "nextNodeId": 2 },
        { "label": "Go right", "nextNodeId": 3 },
        { "label": "Turn back", "nextNodeId": null }
      ]
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `id` | Unique node identifier |
| `title` | Short label shown in editor |
| `text` | Story prose displayed to the player |
| `isStart` | One node must be `true` — the entry point |
| `choices[].label` | Button text the player sees |
| `choices[].nextNodeId` | Target node ID, or `null` for unlinked |

A node with no choices (or all choices unlinked) is treated as an **ending**.

---

## Tech

| Layer | Stack |
|-------|-------|
| Framework | Vanilla JS (ES6 modules) |
| Styling | Custom CSS (CSS variables, no preprocessor) |
| Storage | localStorage (auto-save + save slots) |
| Build | None — open in browser via local server |
| Dependencies | Zero |

---

## Structure

```
retold/
├── index.html              ← App shell, links to editor + player
├── editor/
│   ├── editor.html / css / js
│   └── modules/
│       ├── state.js         ← Centralized data store
│       ├── nodeManager.js   ← Add, delete, duplicate nodes
│       ├── choiceManager.js ← Add, delete, update choices
│       ├── renderer.js      ← Pure render functions
│       ├── storage.js       ← localStorage save/load
│       ├── io.js            ← Export/import JSON
│       └── validate.js      ← Story validation
├── player/
│   ├── player.html / css / js
│   └── modules/
│       ├── state.js         ← Player state (current node, flags, history)
│       ├── engine.js        ← goToNode, handleChoice, applyFlags
│       ├── renderer.js      ← renderScene, renderChoices
│       ├── saves.js         ← Save slots, localStorage
│       └── loader.js        ← Load/validate story JSON
├── shared/
│   ├── theme.css            ← CSS variables + base styles
│   ├── components.css       ← Reusable UI (buttons, inputs, panels)
│   └── utils.js             ← Shared helpers
├── stories/
│   └── example-story.json   ← "Forest of Echoes" — 15 nodes, 3 endings
└── assets/
    └── logo.svg             ← Pixelated R
```
