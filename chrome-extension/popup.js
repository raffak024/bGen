const API_URL = 'http://localhost:3001';

// DOM Elements
const loginView = document.getElementById('loginView');
const reportsView = document.getElementById('reportsView');
const loginButton = document.getElementById('loginButton');
const fillButton = document.getElementById('fillButton');
const logoutLink = document.getElementById('logoutLink');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginStatus = document.getElementById('loginStatus');
const fillStatus = document.getElementById('fillStatus');
const reportsList = document.getElementById('reportsList');

let selectedReport = null;

// Initialize
init();

async function init() {
  const auth = await getAuth();
  if (auth && auth.token) {
    showReportsView();
    loadReports();
  } else {
    showLoginView();
  }
}

function showLoginView() {
  loginView.classList.remove('hidden');
  reportsView.classList.add('hidden');
}

function showReportsView() {
  loginView.classList.add('hidden');
  reportsView.classList.remove('hidden');
}

async function getAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['auth'], (result) => {
      resolve(result.auth || null);
    });
  });
}

async function setAuth(auth) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ auth }, () => {
      resolve();
    });
  });
}

async function clearAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['auth'], () => {
      resolve();
    });
  });
}

// Login
loginButton.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showStatus(loginStatus, 'Bitte Benutzername und Passwort eingeben', 'error');
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = 'Anmeldung...';

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success && data.token) {
      await setAuth({
        token: data.token,
        user: data.user
      });
      showStatus(loginStatus, 'Erfolgreich angemeldet!', 'success');
      setTimeout(() => {
        showReportsView();
        loadReports();
      }, 500);
    } else {
      showStatus(loginStatus, data.message || 'Anmeldung fehlgeschlagen', 'error');
      loginButton.disabled = false;
      loginButton.textContent = 'Anmelden';
    }
  } catch (error) {
    console.error('Login error:', error);
    showStatus(loginStatus, 'Verbindungsfehler. Server läuft?', 'error');
    loginButton.disabled = false;
    loginButton.textContent = 'Anmelden';
  }
});

// Logout
logoutLink.addEventListener('click', async (e) => {
  e.preventDefault();
  await clearAuth();
  selectedReport = null;
  showLoginView();
  loginStatus.innerHTML = '';
  usernameInput.value = '';
  passwordInput.value = '';
});

// Load Reports
async function loadReports() {
  const auth = await getAuth();
  if (!auth) return;

  try {
    const response = await fetch(`${API_URL}/reports`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    });

    const data = await response.json();

    if (data.success) {
      displayReports(data.data);
    } else {
      showStatus(fillStatus, 'Fehler beim Laden der Berichte', 'error');
    }
  } catch (error) {
    console.error('Load reports error:', error);
    showStatus(fillStatus, 'Fehler beim Laden der Berichte', 'error');
  }
}

// Display Reports
function displayReports(reports) {
  if (reports.length === 0) {
    reportsList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Keine Berichte vorhanden</p>';
    return;
  }

  reportsList.innerHTML = reports.map(report => `
    <div class="report-item" data-id="${report._id}">
      <div class="report-title">${report.title}</div>
      <div class="report-meta">
        ${report.sections?.length || 0} Abschnitte
        ${report.customer ? `• ${report.customer.displayName || 'Kunde'}` : ''}
      </div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.report-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.report-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      selectedReport = reports.find(r => r._id === item.dataset.id);
      fillButton.disabled = false;
    });
  });
}

// Fill Form
fillButton.addEventListener('click', async () => {
  if (!selectedReport) return;

  fillButton.disabled = true;
  fillButton.textContent = 'Fülle Formular...';

  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'fillForm',
      report: selectedReport
    });

    if (response && response.success) {
      showStatus(fillStatus, `✓ ${response.fieldsF illed || 0} Felder ausgefüllt`, 'success');
    } else {
      showStatus(fillStatus, 'Keine passenden Felder gefunden', 'info');
    }
  } catch (error) {
    console.error('Fill form error:', error);
    showStatus(fillStatus, 'Fehler beim Ausfüllen. Seite neu laden?', 'error');
  } finally {
    fillButton.disabled = false;
    fillButton.textContent = 'In Formular einfüllen';
  }
});

// Helper function
function showStatus(element, message, type) {
  element.innerHTML = `<div class="status ${type}">${message}</div>`;
}
