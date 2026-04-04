/**
 * bGen Extension - Popup JavaScript
 */

// Check auth status first
chrome.storage.sync.get(['auth'], (result) => {
  if (!result.auth || !result.auth.token) {
    // Not logged in, redirect to login page
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('skipLogin')) {
      window.location.href = 'login.html';
    }
  }
});

// Model presets
const models = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o (Empfohlen)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Schneller, günstiger)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ],
  claude: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Empfohlen)' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Schneller)' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' }
  ]
};

// DOM Elements
const providerSelect = document.getElementById('provider');
const modelSelect = document.getElementById('model');
const apiKeyInput = document.getElementById('apiKey');
const proModeCheckbox = document.getElementById('proMode');
const proSettings = document.getElementById('proSettings');
const bgenUrlInput = document.getElementById('bgenUrl');
const bgenTokenInput = document.getElementById('bgenToken');
const testConnectionBtn = document.getElementById('testConnection');
const saveSettingsBtn = document.getElementById('saveSettings');
const statusMessage = document.getElementById('statusMessage');

// Tab elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Load settings
  await loadSettings();

  // Setup event listeners
  providerSelect.addEventListener('change', handleProviderChange);
  proModeCheckbox.addEventListener('change', handleProModeChange);
  testConnectionBtn.addEventListener('click', handleTestConnection);
  saveSettingsBtn.addEventListener('click', handleSaveSettings);

  // Setup tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
}

// Load settings from storage
async function loadSettings() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });

  if (response.success) {
    const settings = response.settings;

    // Set provider and model
    providerSelect.value = settings.provider || 'openai';
    updateModelOptions();
    modelSelect.value = settings.model || '';

    // Set API key
    apiKeyInput.value = settings.apiKey || '';

    // Set pro settings
    proModeCheckbox.checked = settings.proMode || false;
    bgenUrlInput.value = settings.bgenUrl || 'http://localhost:3001';
    bgenTokenInput.value = settings.bgenToken || '';

    // Update pro settings visibility
    proSettings.style.display = settings.proMode ? 'block' : 'none';
  }
}

// Handle provider change
function handleProviderChange() {
  updateModelOptions();
}

// Update model dropdown based on provider
function updateModelOptions() {
  const provider = providerSelect.value;
  const availableModels = models[provider] || [];

  modelSelect.innerHTML = '';

  availableModels.forEach(model => {
    const option = document.createElement('option');
    option.value = model.value;
    option.textContent = model.label;
    modelSelect.appendChild(option);
  });

  // Select first option by default
  if (availableModels.length > 0) {
    modelSelect.value = availableModels[0].value;
  }
}

// Handle pro mode toggle
function handleProModeChange() {
  const isProMode = proModeCheckbox.checked;
  proSettings.style.display = isProMode ? 'block' : 'none';
}

// Handle test connection
async function handleTestConnection() {
  const url = bgenUrlInput.value.trim();
  const token = bgenTokenInput.value.trim();

  if (!url || !token) {
    showStatus('Bitte URL und Token eingeben', 'error');
    return;
  }

  testConnectionBtn.disabled = true;
  testConnectionBtn.textContent = 'Verbinde...';

  try {
    const response = await fetch(`${url}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const user = await response.json();
      showStatus(`✓ Verbindung erfolgreich! Angemeldet als: ${user.email || 'Benutzer'}`, 'success');
    } else {
      throw new Error(`Verbindung fehlgeschlagen: ${response.status}`);
    }
  } catch (error) {
    showStatus(`Verbindung fehlgeschlagen: ${error.message}`, 'error');
  } finally {
    testConnectionBtn.disabled = false;
    testConnectionBtn.textContent = 'Verbindung testen';
  }
}

// Handle save settings
async function handleSaveSettings() {
  const settings = {
    provider: providerSelect.value,
    model: modelSelect.value,
    apiKey: apiKeyInput.value.trim(),
    proMode: proModeCheckbox.checked,
    bgenUrl: bgenUrlInput.value.trim(),
    bgenToken: bgenTokenInput.value.trim()
  };

  // Validate
  if (!settings.proMode && !settings.apiKey) {
    showStatus('Bitte API-Key eingeben oder Pro-Modus aktivieren', 'error');
    return;
  }

  if (settings.proMode && (!settings.bgenUrl || !settings.bgenToken)) {
    showStatus('Bitte bGen URL und Token eingeben', 'error');
    return;
  }

  saveSettingsBtn.disabled = true;
  saveSettingsBtn.textContent = 'Speichere...';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      settings: settings
    });

    if (response.success) {
      showStatus('✓ Einstellungen gespeichert!', 'success');

      // Close popup after 1.5 seconds
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      throw new Error('Speichern fehlgeschlagen');
    }
  } catch (error) {
    showStatus(`Fehler: ${error.message}`, 'error');
  } finally {
    saveSettingsBtn.disabled = false;
    saveSettingsBtn.textContent = 'Einstellungen speichern';
  }
}

// Switch tabs
function switchTab(tabName) {
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (content.id === `tab-${tabName}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (type !== 'success') {
      statusMessage.className = 'status-message';
    }
  }, 5000);
}
