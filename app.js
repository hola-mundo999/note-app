// ── STATE ──
let Notes = [];
let activeNoteId = null;

// ── ELEMENTS ──
const btnBack    = document.querySelector('#btnBack');
const sidebar    = document.querySelector('.sidebar');
const btnNew     = document.querySelector('#btnNew');
const searchInput= document.querySelector('#searchInput');
const notesCount = document.querySelector('#notesCount');
const notesList  = document.querySelector('#notesList');
const emptyState = document.querySelector('#emptyState');
const editorForm = document.querySelector('#editorForm');
const noteTitle  = document.querySelector('#noteTitle');
const noteDate   = document.querySelector('#noteDate');
const noteBody   = document.querySelector('#noteBody');
const btnSave    = document.querySelector('#btnSave');
const btnDelete  = document.querySelector('#btnDelete');

// ── LOCALSTORAGE ──
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(Notes));
}

function loadNotes() {
    Notes = JSON.parse(localStorage.getItem('notes')) || [];
}

// ── RENDER ──
function renderNotes(notesToRender) {
    notesCount.textContent = notesToRender.length;
    notesList.innerHTML = notesToRender.map(note => `
        <li class="note-card" data-id="${note.id}">
            <div class="note-card-title">${note.title}</div>
            <div class="note-card-preview">${note.body.substring(0, 50)}...</div>
            <div class="note-card-date">${note.date}</div>
        </li>
    `).join('');
}

// ── HELPERS ──
function openEditor() {
    emptyState.classList.add('hidden');
    editorForm.classList.remove('hidden');
    sidebar.classList.add('hidden-mobile');
}

function closeEditor() {
    emptyState.classList.remove('hidden');
    editorForm.classList.add('hidden');
    sidebar.classList.remove('hidden-mobile');
    activeNoteId = null;
}

// ── NEW NOTE ──
btnNew.addEventListener('click', () => {
    noteTitle.value = '';
    noteBody.value = '';
    activeNoteId = null;
    openEditor();
});

// ── SAVE ──
btnSave.addEventListener('click', () => {
    const title = noteTitle.value;
    const body  = noteBody.value;

    if (title.trim() === '' && body.trim() === '') return;

    if (activeNoteId === null) {
        const noteObject = {
            id:    Date.now(),
            title: title,
            body:  body,
            date:  new Date().toLocaleDateString()
        };
        Notes.push(noteObject);
    } else {
        const note = Notes.find(n => n.id == activeNoteId);
        note.title = title;
        note.body  = body;
    }

    saveNotes();
    renderNotes(Notes);
    closeEditor();
});

// ── OPEN NOTE ──
notesList.addEventListener('click', (e) => {
    const card = e.target.closest('.note-card');
    if (card) {
        activeNoteId = card.dataset.id;
        const note = Notes.find(n => n.id == activeNoteId);
        noteTitle.value = note.title;
        noteBody.value  = note.body;
        openEditor();
    }
});

// ── DELETE ──
btnDelete.addEventListener('click', () => {
    Notes = Notes.filter(n => n.id != activeNoteId);
    saveNotes();
    renderNotes(Notes);
    closeEditor();
});

// ── SEARCH ──
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = Notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.body.toLowerCase().includes(searchTerm)
    );
    renderNotes(filtered);
});

// ── BACK (mobile) ──
btnBack.addEventListener('click', () => {
    closeEditor();
});

// ── INIT ──
loadNotes();
renderNotes(Notes);