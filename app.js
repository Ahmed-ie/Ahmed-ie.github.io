// ── Journal ───────────────────────────────────────────
// Only runs on journal.html
if (document.getElementById('gate')) {

  // ── Config ──────────────────────────────────────────
  // Change this to your own password before deploying.
  // The password is stored only in this file (client-side),
  // so don't use a password you rely on for anything else.
  const PASSWORD = 'ahmedjournal2026';
  const SESSION_KEY = 'journal_auth';
  const ENTRIES_KEY = 'journal_entries';

  // ── Elements ─────────────────────────────────────────
  const gate        = document.getElementById('gate');
  const gateForm    = document.getElementById('gateForm');
  const gateInput   = document.getElementById('gateInput');
  const gateError   = document.getElementById('gateError');
  const journalMain = document.getElementById('journalMain');
  const lockBtn     = document.getElementById('lockBtn');
  const entryText   = document.getElementById('entryText');
  const saveBtn     = document.getElementById('saveBtn');
  const saveMsg     = document.getElementById('saveMsg');
  const entriesList = document.getElementById('entriesList');
  const todayDate   = document.getElementById('todayDate');

  // ── Auth ─────────────────────────────────────────────
  function unlock() {
    gate.hidden = true;
    journalMain.hidden = false;
    sessionStorage.setItem(SESSION_KEY, '1');
    renderEntries();
  }

  function lock() {
    sessionStorage.removeItem(SESSION_KEY);
    gate.hidden = false;
    journalMain.hidden = true;
    gateInput.value = '';
    gateError.hidden = true;
    gateInput.focus();
  }

  // Auto-unlock if session is still active (same browser tab session)
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    unlock();
  }

  gateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (gateInput.value === PASSWORD) {
      gateError.hidden = true;
      unlock();
    } else {
      gateError.hidden = false;
      gateInput.value = '';
      gateInput.focus();
    }
  });

  gateInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') gateForm.dispatchEvent(new Event('submit'));
  });

  lockBtn.addEventListener('click', lock);

  // ── Date formatting ───────────────────────────────────
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  todayDate.textContent = formatDate(todayISO + 'T12:00:00');

  // ── Storage ───────────────────────────────────────────
  function loadEntries() {
    try {
      return JSON.parse(localStorage.getItem(ENTRIES_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  // ── Save new entry ────────────────────────────────────
  saveBtn.addEventListener('click', () => {
    const text = entryText.value.trim();
    if (!text) return;

    const entries = loadEntries();
    entries.unshift({
      id:   Date.now(),
      date: new Date().toISOString(),
      body: text,
    });
    saveEntries(entries);

    entryText.value = '';
    saveMsg.hidden = false;
    setTimeout(() => { saveMsg.hidden = true; }, 2000);
    renderEntries();
  });

  // Cmd/Ctrl+Enter to save
  entryText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveBtn.click();
  });

  // ── Render entries ────────────────────────────────────
  function renderEntries() {
    const entries = loadEntries();
    entriesList.innerHTML = '';

    if (entries.length === 0) {
      entriesList.innerHTML =
        '<p style="font-size:0.875rem;color:var(--muted)">No entries yet.</p>';
      return;
    }

    entries.forEach((entry) => {
      const div = document.createElement('div');
      div.className = 'journal-entry';

      div.innerHTML = `
        <p class="journal-entry-date">${formatDate(entry.date)}</p>
        <p class="journal-entry-body">${escapeHtml(entry.body)}</p>
        <div class="entry-actions">
          <button class="entry-action-btn delete" data-id="${entry.id}">Delete</button>
        </div>
      `;

      entriesList.appendChild(div);
    });

    entriesList.querySelectorAll('.delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!confirm('Delete this entry?')) return;
        const id = Number(btn.dataset.id);
        saveEntries(loadEntries().filter((e) => e.id !== id));
        renderEntries();
      });
    });
  }

  // Prevent XSS when rendering entry text
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

}
