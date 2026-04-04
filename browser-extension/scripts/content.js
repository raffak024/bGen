/**
 * bGen Browser Extension - Content Script (Performance Optimized)
 * Intelligente Text-Editing Unterstützung mit Intent-Detection
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
  activeElement: null,
  toolbar: null,
  selectionData: null,
  isProcessing: false,
  userIntent: 'none', // 'none', 'reading', 'editing'
  lastInteraction: 0,
  debounceTimer: null,
  isToolbarVisible: false
};

// ============================================
// CONFIGURATION
// ============================================
const config = {
  DEBOUNCE_DELAY: 300,          // ms - Debounce für Events
  INTENT_TIMEOUT: 1500,         // ms - Zeit bis Intent verfällt
  MIN_SELECTION_LENGTH: 3,      // Minimum Zeichen für Toolbar
  TOOLBAR_OFFSET_Y: 65,         // px - Abstand über Element
  EDIT_INTENT_THRESHOLD: 2,     // Anzahl Edit-Aktionen für Intent
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
  console.log('[bGen Extension] Content script loaded (Optimized v2.0)');

  // Passive Event Listeners für bessere Performance
  document.addEventListener('mouseup', debounce(handleMouseUp, config.DEBOUNCE_DELAY), { passive: true });
  document.addEventListener('keyup', debounce(handleKeyUp, config.DEBOUNCE_DELAY), { passive: true });
  document.addEventListener('input', trackEditIntent, { passive: true });
  document.addEventListener('focus', handleFocus, { passive: true, capture: true });

  // Cleanup-Events
  document.addEventListener('mousedown', handleClickOutside, { passive: true });
  document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
  window.addEventListener('resize', handleResize, { passive: true });

  // Background Messages
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);

  // Cleanup bei Page Unload
  window.addEventListener('beforeunload', cleanup);
}

// ============================================
// INTENT DETECTION
// ============================================

let editActionCount = 0;
let lastEditTime = 0;

// Tracke ob User wirklich editieren will
function trackEditIntent(event) {
  const element = event.target;

  if (!isEditableField(element)) return;

  const now = Date.now();

  // Reset counter wenn zu lange keine Interaktion
  if (now - lastEditTime > config.INTENT_TIMEOUT) {
    editActionCount = 0;
  }

  editActionCount++;
  lastEditTime = now;

  // User hat mehrfach editiert → Intent ist "editing"
  if (editActionCount >= config.EDIT_INTENT_THRESHOLD) {
    state.userIntent = 'editing';
  }

  state.lastInteraction = now;
}

// Intelligente Intent-Erkennung bei Selection
function detectSelectionIntent(element, selectionLength) {
  const now = Date.now();
  const timeSinceLastEdit = now - lastEditTime;

  // Zu kurze Selection → kein Intent
  if (selectionLength < config.MIN_SELECTION_LENGTH) {
    return 'none';
  }

  // User hat kürzlich editiert → Intent ist editing
  if (timeSinceLastEdit < config.INTENT_TIMEOUT && editActionCount >= config.EDIT_INTENT_THRESHOLD) {
    return 'editing';
  }

  // Element ist fokussiert UND user hat Text selektiert → wahrscheinlich editing
  if (document.activeElement === element && element.selectionStart !== element.selectionEnd) {
    // Warte kurz ob User weiter editiert
    setTimeout(() => {
      if (state.userIntent === 'editing') {
        handleTextSelection(element);
      }
    }, 200);
    return 'reading'; // Erstmal als "reading" markieren
  }

  return 'reading';
}

// ============================================
// EVENT HANDLERS
// ============================================

function handleMouseUp(event) {
  const element = event.target;

  if (!isEditableField(element)) {
    if (state.isToolbarVisible) removeToolbar();
    return;
  }

  checkSelection(element);
}

function handleKeyUp(event) {
  const element = event.target;

  if (!isEditableField(element)) return;

  // Nur bei Selection-Keys (Shift+Arrow, Ctrl+A, etc.)
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    checkSelection(element);
  }
}

function handleFocus(event) {
  const element = event.target;

  if (!isEditableField(element)) return;

  // Reset Intent bei neuem Fokus
  if (state.activeElement !== element) {
    editActionCount = 0;
    state.userIntent = 'none';
  }
}

function checkSelection(element) {
  const start = element.selectionStart;
  const end = element.selectionEnd;
  const selectionLength = end - start;

  if (selectionLength > 0) {
    const selectedText = element.value.substring(start, end);
    const intent = detectSelectionIntent(element, selectionLength);

    // Nur Toolbar zeigen wenn Intent "editing" ist
    if (intent === 'editing') {
      state.activeElement = element;
      state.selectionData = { start, end, text: selectedText };
      handleTextSelection(element);
    } else if (intent === 'none') {
      removeToolbar();
    }
    // Bei "reading" nichts tun, warten auf weitere Signale
  } else {
    removeToolbar();
  }
}

// ============================================
// TOOLBAR MANAGEMENT
// ============================================

function handleTextSelection(element) {
  if (!state.selectionData || state.isProcessing) return;

  // Prüfe ob Selection noch aktuell ist
  if (element.selectionStart !== state.selectionData.start ||
      element.selectionEnd !== state.selectionData.end) {
    return;
  }

  showToolbar(element);
}

function showToolbar(element) {
  // Wenn Toolbar schon sichtbar, nur Position updaten
  if (state.isToolbarVisible && state.toolbar) {
    updateToolbarPosition(element);
    return;
  }

  // Bestehende Toolbar entfernen
  removeToolbar();

  // Toolbar erstellen
  state.toolbar = createToolbarElement();

  // Position berechnen und setzen
  updateToolbarPosition(element);

  // Zu DOM hinzufügen
  document.body.appendChild(state.toolbar);
  state.isToolbarVisible = true;

  // Smooth Erscheinen
  requestAnimationFrame(() => {
    if (state.toolbar) {
      state.toolbar.classList.add('bgen-toolbar-show');
    }
  });
}

function createToolbarElement() {
  const toolbar = document.createElement('div');
  toolbar.id = 'bgen-ai-toolbar';
  toolbar.className = 'bgen-toolbar';

  const actions = [
    { id: 'shorten', icon: '↓', label: 'Kürzen', title: 'Text auf das Wesentliche kürzen' },
    { id: 'extend', icon: '↑', label: 'Erweitern', title: 'Text mit Details erweitern' },
    { id: 'professional', icon: '⬆', label: 'Professionell', title: 'Professioneller formulieren' },
    { id: 'simplify', icon: '⬇', label: 'Einfach', title: 'Vereinfachen und klarer machen' },
    { id: 'rewrite', icon: '⟲', label: 'Umschreiben', title: 'Komplett neu formulieren' },
    { id: 'magic', icon: '✨', label: 'Magic', title: 'Automatisch verbessern', highlight: true }
  ];

  const fragment = document.createDocumentFragment();

  actions.forEach(action => {
    const button = document.createElement('button');
    button.className = `bgen-btn ${action.highlight ? 'bgen-btn-highlight' : ''}`;
    button.title = action.title;
    button.dataset.action = action.id;
    button.innerHTML = `
      <span class="bgen-icon">${action.icon}</span>
      <span class="bgen-label">${action.label}</span>
    `;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleQuickAction(action.id);
    }, { passive: false });

    fragment.appendChild(button);
  });

  // Loading Indicator
  const loader = document.createElement('div');
  loader.id = 'bgen-loader';
  loader.className = 'bgen-loader';
  loader.innerHTML = '<div class="bgen-spinner"></div>';
  loader.style.display = 'none';
  fragment.appendChild(loader);

  toolbar.appendChild(fragment);
  return toolbar;
}

function updateToolbarPosition(element) {
  if (!state.toolbar) return;

  const rect = element.getBoundingClientRect();
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

  // Position mit Scroll-Offset
  const left = rect.left + scrollX;
  const top = rect.top + scrollY - config.TOOLBAR_OFFSET_Y;

  // Viewport-Grenzen prüfen
  const toolbarWidth = state.toolbar.offsetWidth || 400;
  const viewportWidth = window.innerWidth;

  let finalLeft = left;

  // Toolbar am rechten Rand halten
  if (left + toolbarWidth > viewportWidth + scrollX) {
    finalLeft = viewportWidth + scrollX - toolbarWidth - 10;
  }

  // Toolbar nicht über linken Rand hinaus
  if (finalLeft < scrollX) {
    finalLeft = scrollX + 10;
  }

  state.toolbar.style.position = 'absolute';
  state.toolbar.style.left = `${finalLeft}px`;
  state.toolbar.style.top = `${Math.max(scrollY + 10, top)}px`;
  state.toolbar.style.zIndex = '2147483647'; // Maximum z-index
}

function removeToolbar() {
  if (state.toolbar) {
    state.toolbar.classList.remove('bgen-toolbar-show');
    setTimeout(() => {
      if (state.toolbar) {
        state.toolbar.remove();
        state.toolbar = null;
        state.isToolbarVisible = false;
      }
    }, 200);
  }
}

// ============================================
// SCROLL & RESIZE HANDLING
// ============================================

const handleScroll = throttle(() => {
  if (state.isToolbarVisible && state.activeElement) {
    updateToolbarPosition(state.activeElement);
  }
}, 100);

const handleResize = debounce(() => {
  if (state.isToolbarVisible && state.activeElement) {
    updateToolbarPosition(state.activeElement);
  }
}, 200);

function handleClickOutside(event) {
  if (state.toolbar && !state.toolbar.contains(event.target) && event.target !== state.activeElement) {
    removeToolbar();
    state.activeElement = null;
    state.selectionData = null;
    state.userIntent = 'none';
    editActionCount = 0;
  }
}

// ============================================
// AI PROCESSING
// ============================================

async function handleQuickAction(action) {
  if (!state.activeElement || !state.selectionData || state.isProcessing) return;

  state.isProcessing = true;

  const buttons = state.toolbar.querySelectorAll('.bgen-btn');
  const loader = document.getElementById('bgen-loader');

  buttons.forEach(btn => btn.disabled = true);
  if (loader) loader.style.display = 'flex';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'AI_REQUEST',
      action: action,
      text: state.selectionData.text,
      context: {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname
      }
    });

    if (response.success && response.improvedText) {
      showDiffModal(state.selectionData.text, response.improvedText);
    } else {
      throw new Error(response.error || 'AI-Verbesserung fehlgeschlagen');
    }
  } catch (error) {
    console.error('[bGen Extension] AI request failed:', error);
    showNotification('Fehler: ' + error.message, 'error');
  } finally {
    state.isProcessing = false;
    buttons.forEach(btn => btn.disabled = false);
    if (loader) loader.style.display = 'none';
  }
}

// ============================================
// DIFF MODAL
// ============================================

function showDiffModal(originalText, improvedText) {
  const modal = document.createElement('div');
  modal.id = 'bgen-diff-modal';
  modal.className = 'bgen-modal';

  modal.innerHTML = `
    <div class="bgen-modal-overlay"></div>
    <div class="bgen-modal-content">
      <div class="bgen-modal-header">
        <h3>✨ AI-Verbesserungsvorschlag</h3>
      </div>
      <div class="bgen-modal-body">
        <div class="bgen-diff-section">
          <div class="bgen-diff-label">Original</div>
          <div class="bgen-diff-original">${escapeHtml(originalText)}</div>
        </div>
        <div class="bgen-diff-section">
          <div class="bgen-diff-label bgen-diff-label-improved">✨ Verbessert</div>
          <div class="bgen-diff-improved">${escapeHtml(improvedText)}</div>
        </div>
      </div>
      <div class="bgen-modal-footer">
        <button class="bgen-btn bgen-btn-secondary" data-action="reject">
          ✕ Ablehnen
        </button>
        <button class="bgen-btn bgen-btn-primary" data-action="accept">
          ✓ Übernehmen
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  requestAnimationFrame(() => modal.classList.add('bgen-modal-show'));

  modal.querySelector('[data-action="accept"]').addEventListener('click', () => {
    applyImprovement(improvedText);
    modal.remove();
    removeToolbar();
    showNotification('Änderung übernommen', 'success');
  }, { passive: false });

  modal.querySelector('[data-action="reject"]').addEventListener('click', () => {
    modal.remove();
  }, { passive: false });

  modal.querySelector('.bgen-modal-overlay').addEventListener('click', () => {
    modal.remove();
  }, { passive: false });
}

function applyImprovement(improvedText) {
  if (!state.activeElement || !state.selectionData) return;

  const { start, end } = state.selectionData;
  const before = state.activeElement.value.substring(0, start);
  const after = state.activeElement.value.substring(end);

  state.activeElement.value = before + improvedText + after;

  // Framework-Reaktivität triggern
  const inputEvent = new Event('input', { bubbles: true });
  const changeEvent = new Event('change', { bubbles: true });

  state.activeElement.dispatchEvent(inputEvent);
  state.activeElement.dispatchEvent(changeEvent);

  // Selection auf neuen Text setzen
  state.activeElement.focus();
  state.activeElement.selectionStart = start;
  state.activeElement.selectionEnd = start + improvedText.length;

  // State zurücksetzen
  editActionCount = 0;
  state.userIntent = 'none';
}

// ============================================
// UTILITIES
// ============================================

function isEditableField(element) {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();

  if (tagName === 'textarea') return true;

  if (tagName === 'input') {
    const type = element.type.toLowerCase();
    return ['text', 'email', 'search', 'url', 'tel', 'number'].includes(type);
  }

  if (element.contentEditable === 'true') return true;

  return false;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `bgen-notification bgen-notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  requestAnimationFrame(() => notification.classList.add('bgen-notification-show'));

  setTimeout(() => {
    notification.classList.remove('bgen-notification-show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function handleBackgroundMessage(message, sender, sendResponse) {
  if (message.type === 'SYNC_TASK_OUTPUT') {
    if (state.activeElement && isEditableField(state.activeElement)) {
      state.activeElement.value = message.content;
      state.activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      showNotification('Task-Output eingefügt', 'success');
    }
  }
  return true;
}

function cleanup() {
  removeToolbar();
  state.activeElement = null;
  state.selectionData = null;
  state.userIntent = 'none';
}

// ============================================
// START
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
