<div align="center">

# &#x2699;&#xFE0F; Retold
**A retro-futuristic text adventure platform that runs entirely in your browser**

[![Vanilla JS](https://img.shields.io/badge/vanilla-js-yellow?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square)]()
[![ES Modules](https://img.shields.io/badge/modules-ES6-blue?style=flat-square)]()
[![Storage](https://img.shields.io/badge/storage-localStorage-orange?style=flat-square)]()

[Editor](#story-editor) · [Player](#story-player) · [Run It](#run-it) · [JSON Format](#story-json)

<img width="800" alt="image" src="https://github.com/user-attachments/assets/48dd603a-d730-4e9a-8608-c269c86d453b" />

</div>

---

## What is Retold?

Retold is a browser-based platform for creating and playing branching text adventures. Two modules, one JSON contract, zero external dependencies.

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
