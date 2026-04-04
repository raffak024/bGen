/**
 * bGen Extension - Login
 */

const API_URL = 'http://localhost:3001';

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const useWithoutLoginBtn = document.getElementById('useWithoutLoginBtn');
const errorMessage = document.getElementById('errorMessage');

// Check if already logged in
chrome.storage.sync.get(['auth'], (result) => {
  if (result.auth && result.auth.token) {
    // Already logged in, redirect to main popup
    window.location.href = 'popup.html';
  }
});

// Handle login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showError('Bitte alle Felder ausfüllen');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Anmeldung läuft...';
  hideError();

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Anmeldung fehlgeschlagen');
    }

    // Save auth data
    await chrome.storage.sync.set({
      auth: {
        token: data.token,
        user: data.user,
        loginTime: Date.now()
      },
      settings: {
        proMode: true,
        bgenUrl: API_URL,
        bgenToken: data.token,
        provider: 'bgen',
        model: ''
      }
    });

    // Redirect to main popup
    window.location.href = 'popup.html';

  } catch (error) {
    console.error('Login error:', error);
    showError(error.message);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Anmelden';
  }
});

// Use without login (API key mode)
useWithoutLoginBtn.addEventListener('click', () => {
  window.location.href = 'popup.html';
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

function hideError() {
  errorMessage.style.display = 'none';
}
