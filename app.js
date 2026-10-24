/* NoteNest — a local-first notebook.
   Notes live in localStorage under the "notes" key (same key the app always used). */

const NOTES_KEY = "notes";

const btnBack = document.querySelector("#btnBack");
const sidebar = document.querySelector(".sidebar");
const btnNew = document.querySelector("#btnNew");
const searchInput = document.querySelector("#searchInput");
const notesCount = document.querySelector("#notesCount");
const notesList = document.querySelector("#notesList");
const emptyState = document.querySelector("#emptyState");
const editorForm = document.querySelector("#editorForm");
const noteTitle = document.querySelector("#noteTitle");
const noteDate = document.querySelector("#noteDate");
const noteWords = document.querySelector("#noteWords");
const noteBody = document.querySelector("#noteBody");
const btnSave = document.querySelector("#btnSave");
const btnDelete = document.querySelector("#btnDelete");
const toastEl = document.querySelector("#toast");
const btnPin = document.querySelector("#btnPin");
const btnExport = document.querySelector("#btnExport");
const btnImport = document.querySelector("#btnImport");
const importFile = document.querySelector("#importFile");

let notes = [];
let activeId = null;
let searchTerm = "";
let toastTimer = null;

/* ── storage ── */
function saveNotes() {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    showToast("Storage is full — this note was not saved.");
  }
}

function seedNotes() {
  const today = new Date().toISOString();
  return [
    {
      id: 1,
      title: "Welcome to NoteNest",
      body:
        "A clean, responsive notebook for your ideas, study notes and code snippets.\n\n" +
        "Everything is saved in your browser — no account, no server. Press Ctrl/⌘ + S while writing to save.",
      date: today
    },
    {
      id: 2,
      title: "Frontend Engineering Goals",
      body:
        "1. Build fluid WebGL and Canvas animations\n" +
        "2. Master high-performance React component patterns\n" +
        "3. Deliver production-ready apps with zero friction",
      date: today
    }
  ];
}

function loadNotes() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(NOTES_KEY) || "null");
  } catch {
    saved = null;
  }

  if (Array.isArray(saved)) {
    // keep only well-formed entries
    notes = saved
      .filter((n) => n && typeof n === "object" && n.id != null)
      .map((n) => ({
        id: n.id,
        title: String(n.title ?? ""),
        body: String(n.body ?? ""),
        date: n.date || new Date().toISOString(),
        pinned: Boolean(n.pinned)
      }));
  } else {
    notes = seedNotes();
    saveNotes();
  }
}

/* ── helpers ── */
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  return sameDay
    ? "Today, " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function preview(body) {
  const flat = body.replace(/\s+/g, " ").trim();
  if (!flat) return "No content yet";
  return flat.length > 60 ? flat.slice(0, 60) + "…" : flat;
}

function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

/* ── rendering ── */
function visibleNotes() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = term
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(term) || note.body.toLowerCase().includes(term)
      )
    : notes.slice();

  // pinned notes first, then newest first
  return filtered.sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return Number(b.id) - Number(a.id);
  });
}

function renderNotes() {
  const list = visibleNotes();

  notesCount.textContent = searchTerm.trim()
    ? `${list.length} of ${notes.length}`
    : `${notes.length}`;

  if (list.length === 0) {
    notesList.innerHTML = searchTerm.trim()
      ? '<li class="notes-empty">No notes match that search.</li>'
      : '<li class="notes-empty">Nothing here yet — create your first note.</li>';
    return;
  }

  notesList.innerHTML = list
    .map(
      (note) => `
      <li class="note-card${String(note.id) === String(activeId) ? " active" : ""}${note.pinned ? " is-pinned" : ""}" data-id="${escapeHtml(note.id)}">
        <div class="note-card-top">
          <div class="note-card-title">${escapeHtml(note.title.trim() || "Untitled note")}</div>
          <button class="pin-toggle" type="button" data-pin-id="${escapeHtml(note.id)}"
            aria-pressed="${note.pinned ? "true" : "false"}"
            aria-label="${note.pinned ? "Unpin note" : "Pin note"}"
            title="${note.pinned ? "Unpin note" : "Pin note"}">${note.pinned ? "★" : "☆"}</button>
        </div>
        <div class="note-card-preview">${escapeHtml(preview(note.body))}</div>
        <div class="note-card-date">${escapeHtml(formatDate(note.date))}</div>
      </li>`
    )
    .join("");
}

function renderEditorWords() {
  const count = countWords(noteBody.value);
  noteWords.textContent = count === 1 ? "1 word" : `${count} words`;
}

/* ── editor ── */
function openEditor() {
  emptyState.classList.add("hidden");
  editorForm.classList.remove("hidden");
  sidebar.classList.add("hidden-mobile");
  renderEditorWords();
}

function closeEditor() {
  emptyState.classList.remove("hidden");
  editorForm.classList.add("hidden");
  sidebar.classList.remove("hidden-mobile");
  activeId = null;
  renderNotes();
}

function syncPinButton() {
  const note = notes.find((n) => String(n.id) === String(activeId));
  const pinned = Boolean(note && note.pinned);

  btnPin.hidden = activeId === null;
  btnPin.setAttribute("aria-pressed", String(pinned));
  btnPin.classList.toggle("is-pinned", pinned);
  btnPin.textContent = pinned ? "★ Pinned" : "☆ Pin note";
}

function togglePinned(id) {
  const note = notes.find((n) => String(n.id) === String(id));
  if (!note) return;

  note.pinned = !note.pinned;
  saveNotes();
  renderNotes();
  syncPinButton();
  showToast(note.pinned ? "Pinned to the top." : "Unpinned.");
}

function startNewNote() {
  activeId = null;
  noteTitle.value = "";
  noteBody.value = "";
  noteDate.textContent = "New note";
  btnDelete.hidden = true;
  syncPinButton();
  openEditor();
  renderNotes();
  noteTitle.focus();
}

function openNote(id) {
  const note = notes.find((n) => String(n.id) === String(id));
  if (!note) return;

  activeId = note.id;
  noteTitle.value = note.title;
  noteBody.value = note.body;
  noteDate.textContent = formatDate(note.date);
  btnDelete.hidden = false;
  syncPinButton();
  openEditor();
  renderNotes();
}

function saveActiveNote() {
  const title = noteTitle.value.trim();
  const body = noteBody.value.trim();

  if (!title && !body) {
    showToast("Add a title or some text before saving.");
    noteTitle.focus();
    return;
  }

  if (activeId === null) {
    const note = {
      id: Date.now(),
      title,
      body: noteBody.value,
      date: new Date().toISOString()
    };
    notes.unshift(note);
    activeId = note.id;
    showToast("Note created.");
  } else {
    const note = notes.find((n) => String(n.id) === String(activeId));
    if (!note) return;
    note.title = title;
    note.body = noteBody.value;
    note.date = new Date().toISOString();
    showToast("Note saved.");
  }

  saveNotes();
  closeEditor();
}

/* ── backup: export / import ── */
function exportNotes() {
  if (notes.length === 0) {
    showToast("There are no notes to export.");
    return;
  }

  const payload = {
    app: "NoteNest",
    version: 1,
    exportedAt: new Date().toISOString(),
    notes
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "notenest-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  showToast(`Exported ${notes.length} note${notes.length === 1 ? "" : "s"}.`);
}

function freeId(seed) {
  let id = Number.isFinite(seed) ? seed : Date.now();
  while (notes.some((n) => String(n.id) === String(id))) id += 1;
  return id;
}

function importNotes(file) {
  const reader = new FileReader();

  reader.onload = () => {
    let incoming = null;
    try {
      const parsed = JSON.parse(String(reader.result));
      if (Array.isArray(parsed)) incoming = parsed;
      else if (parsed && Array.isArray(parsed.notes)) incoming = parsed.notes;
    } catch {
      showToast("That file is not valid JSON.");
      return;
    }

    const usable = (incoming || []).filter(
      (n) => n && typeof n === "object" && (typeof n.title === "string" || typeof n.body === "string")
    );

    if (usable.length === 0) {
      showToast("No notes found in that file.");
      return;
    }

    const label = `${usable.length} note${usable.length === 1 ? "" : "s"}`;
    if (!window.confirm(`Import ${label}? They are added alongside your current notes.`)) return;

    usable.forEach((n, index) => {
      notes.unshift({
        id: freeId(Number(n.id) || Date.now() + index),
        title: String(n.title ?? ""),
        body: String(n.body ?? ""),
        date: n.date || new Date().toISOString(),
        pinned: Boolean(n.pinned)
      });
    });

    saveNotes();
    closeEditor();
    showToast(`Imported ${label}.`);
  };

  reader.onerror = () => showToast("Couldn't read that file.");
  reader.readAsText(file);
}

function deleteActiveNote() {
  if (activeId === null) return;
  const note = notes.find((n) => String(n.id) === String(activeId));
  const label = note && note.title.trim() ? `“${note.title.trim()}”` : "this note";

  if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

  notes = notes.filter((n) => String(n.id) !== String(activeId));
  saveNotes();
  closeEditor();
  showToast("Note deleted.");
}

/* ── events ── */
btnNew.addEventListener("click", startNewNote);

btnSave.addEventListener("click", saveActiveNote);

btnDelete.addEventListener("click", deleteActiveNote);

notesList.addEventListener("click", (event) => {
  const pin = event.target.closest(".pin-toggle");
  if (pin) {
    togglePinned(pin.dataset.pinId);
    return;
  }

  const card = event.target.closest(".note-card");
  if (card) openNote(card.dataset.id);
});

btnPin.addEventListener("click", () => {
  if (activeId !== null) togglePinned(activeId);
});

btnExport.addEventListener("click", exportNotes);

btnImport.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", () => {
  const file = importFile.files && importFile.files[0];
  if (file) importNotes(file);
  importFile.value = "";
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value;
  renderNotes();
});

btnBack.addEventListener("click", closeEditor);

noteBody.addEventListener("input", renderEditorWords);

noteTitle.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    noteBody.focus();
  }
});

document.addEventListener("keydown", (event) => {
  const mod = event.metaKey || event.ctrlKey;

  if (mod && event.key.toLowerCase() === "s") {
    event.preventDefault();
    if (!editorForm.classList.contains("hidden")) saveActiveNote();
    return;
  }

  if (event.key === "Escape" && !editorForm.classList.contains("hidden")) {
    closeEditor();
  }
});

/* ── init ── */
loadNotes();
renderNotes();
