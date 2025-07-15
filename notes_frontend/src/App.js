import React, { useState, useEffect } from 'react';
import './App.css';

// Helper to persist notes to localStorage
const STORAGE_KEY = 'simple_notes_app_v1';

// PUBLIC_INTERFACE
function loadNotes() {
  /** Load notes from localStorage. */
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // Ignore errors and return empty array
  }
  return [];
}

// PUBLIC_INTERFACE
function saveNotes(notes) {
  /** Save notes to localStorage. */
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Minimalistic Notes App container component.
   * Features:
   *  - Sidebar with notes list
   *  - Main area for editing/viewing a note
   *  - Top bar for quick actions (new note, delete)
   */
  const [notes, setNotes] = useState(loadNotes());
  const [selectedId, setSelectedId] = useState(notes[0]?.id || null);
  const [editingNote, setEditingNote] = useState(null); // {id, title, content}

  // Effect: persist notes to localStorage on change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Effect: when notes change, ensure selectedId is valid
  useEffect(() => {
    if (!notes.find((n) => n.id === selectedId) && notes.length > 0) {
      setSelectedId(notes[0].id);
    }
    if (notes.length === 0) setSelectedId(null);
  }, [notes, selectedId]);

  // PUBLIC_INTERFACE
  function createNote() {
    /**
     * Create a new note and switch to it in editing mode.
     */
    const newNote = {
      id: String(Date.now()),
      title: '',
      content: '',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
    setEditingNote({ ...newNote });
  }

  // PUBLIC_INTERFACE
  function selectNote(id) {
    /**
     * Select a note by id, exit editing mode.
     */
    setSelectedId(id);
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function deleteNote(id) {
    /**
     * Delete a note by id.
     */
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (filtered.length > 0) {
      setSelectedId(filtered[0].id);
    } else {
      setSelectedId(null);
    }
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function startEditing() {
    /**
     * Begin editing selected note.
     */
    const note = notes.find((n) => n.id === selectedId);
    if (!note) return;
    setEditingNote({ ...note });
  }

  // PUBLIC_INTERFACE
  function cancelEdit() {
    /**
     * Cancel editing mode (revert changes).
     */
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function saveEdit() {
    /**
     * Save the editing note to the list.
     */
    if (!editingNote) return;
    setNotes(notes.map((n) =>
      n.id === editingNote.id
        ? { ...editingNote, updated: new Date().toISOString() }
        : n
    ));
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function handleEditField(field, value) {
    /**
     * Edit in-progress note field.
     */
    setEditingNote(editingNote => editingNote ? { ...editingNote, [field]: value } : null);
  }

  // Find currently selected note
  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <div className="notes-app__outer" data-theme="light">
      {/* Top Bar */}
      <div className="notes-topbar">
        <div className="notes-topbar-title">📝 Minimal Notes</div>
        <div className="notes-topbar-actions">
          <button className="nt-btn nt-btn-primary"
            onClick={createNote}
            title="Create new note"
            aria-label="Create new note"
          >+ New Note</button>
          {selectedNote && (
            <button className="nt-btn nt-btn-danger"
              onClick={() => { if (window.confirm('Delete this note?')) deleteNote(selectedNote.id); }}
              title="Delete note"
              aria-label="Delete note"
            >🗑️</button>
          )}
        </div>
      </div>
      {/* Layout */}
      <div className="notes-app__layout">
        {/* Sidebar */}
        <nav className="notes-sidebar">
          <div className="notes-sidebar-title">Notes</div>
          <ul className="notes-list" aria-label="Notes list">
            {notes.length === 0 && (
              <li className="notes-list-empty">No notes yet.</li>
            )}
            {notes.map((note) => (
              <li
                key={note.id}
                className={
                  'notes-list-item' +
                  (note.id === selectedId ? ' notes-list-item--selected' : '')
                }
                onClick={() => selectNote(note.id)}
                tabIndex={0}
                aria-selected={note.id === selectedId}
              >
                <div className="notes-list-title">
                  {note.title.trim() ? note.title : <span className="notes-list-untitled">Untitled</span>}
                </div>
                <div className="notes-list-snippet">
                  {(note.content || '').slice(0, 40)}
                </div>
              </li>
            ))}
          </ul>
        </nav>
        {/* Main Area */}
        <main className="notes-mainarea" aria-label="Main note area">
          {/* Show empty if nothing selected */}
          {!selectedNote && (
            <div className="notes-placeholder">Select or create a note to begin.</div>
          )}
          {/* Editing mode */}
          {selectedNote && editingNote && editingNote.id === selectedNote.id && (
            <div className="notes-editform">
              <input
                className="notes-edit-title"
                type="text"
                placeholder="Untitled"
                autoFocus
                value={editingNote.title}
                onChange={e => handleEditField('title', e.target.value)}
                aria-label="Note title"
              />
              <textarea
                className="notes-edit-content"
                rows={12}
                placeholder="Write your note here..."
                value={editingNote.content}
                onChange={e => handleEditField('content', e.target.value)}
                aria-label="Note content"
              />
              <div className="notes-edit-actions">
                <button className="nt-btn nt-btn-secondary" onClick={cancelEdit}>Cancel</button>
                <button className="nt-btn nt-btn-primary" onClick={saveEdit}>Save</button>
              </div>
            </div>
          )}
          {/* Viewing mode */}
          {selectedNote && (!editingNote || editingNote.id !== selectedNote.id) && (
            <div className="notes-view">
              <div className="notes-view-title">
                {selectedNote.title.trim() || <span className="notes-list-untitled">Untitled</span>}
                <button className="nt-btn nt-btn-small nt-btn-secondary notes-edit-btn" onClick={startEditing}>Edit</button>
              </div>
              <div className="notes-view-content">
                {selectedNote.content.trim() || <em className="notes-content-empty">No content yet.</em>}
              </div>
              <div className="notes-view-meta">
                <span>Created: {new Date(selectedNote.created).toLocaleString()}</span>
                {selectedNote.updated && selectedNote.updated !== selectedNote.created &&
                  <span> · Updated: {new Date(selectedNote.updated).toLocaleString()}</span>}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Footer */}
      <footer className="notes-footer-light">
        <span>
          Minimal Notes App · React ·{' '}
          <a href="https://kavia.ai/" target="_blank" rel="noopener noreferrer">powered by KAVIA</a>
        </span>
      </footer>
    </div>
  );
}

export default App;
