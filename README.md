# 🪶 NoteNest

A clean, local-first notes app built with vanilla HTML, CSS and JavaScript. Notes are saved to
`localStorage`, so they survive refreshes without an account or a server.

## ✨ Features

- **Create** notes with a title and body
- **Edit** existing notes — the timestamp updates, the note keeps its place
- **Delete** with a confirmation step that names the note
- **Search** title and body in real time, with a "2 of 7" result count
- **Newest first** ordering so the latest thought is always at the top
- **Active highlight** in the list for the note you have open
- **Word count** as you type, plus inline feedback when a save has nothing to store
- **Pin** a note (★ on the card or in the editor) to keep it at the top of the list, on screen and
  in storage
- **Export** every note as a dated JSON backup; **Import** merges a backup back in, with validation
  and a confirm step that names how many notes will be added
- **Keyboard shortcuts**: `Ctrl/⌘ + S` saves, `Esc` closes the editor, `Enter` in the title jumps
  to the body
- **Safe rendering** — titles and bodies are escaped, so markup in a note is shown as text, never run
- Responsive: the sidebar becomes a slide-over on phones with a Back button

## 🛠️ Built With

- HTML5
- CSS3 (custom properties, flexbox, animations)
- JavaScript (ES6+)
- `localStorage`

## 💡 JavaScript Concepts Used

- CRUD over a single source of truth, persisted with `JSON.stringify` / `JSON.parse`
- Array methods — `filter`, `find`, `sort`, `map`
- Event delegation for dynamically created list items
- HTML escaping before injecting user text into the DOM
- Debounce-free live search over an in-memory list
- Keyboard event handling (`keydown`, modifier keys)

## 📁 Project Structure

```text
note-app/
├── index.html
├── style.css
├── app.js
└── README.md
```

## 🚀 How to Run

Open `index.html` in any browser — no install and no build step.
