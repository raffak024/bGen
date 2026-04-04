/**
 * bGen Browser Extension - Background Service Worker
 * Handles AI API requests and Pro features
 */

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AI_REQUEST') {
    handleAIRequest(message, sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.type === 'SYNC_TASK') {
    handleTaskSync(message, sendResponse);
    return true;
  }

  if (message.type === 'GET_SETTINGS') {
    handleGetSettings(sendResponse);
    return true;
  }

  if (message.type === 'SAVE_SETTINGS') {
    handleSaveSettings(message.settings, sendResponse);
    return true;
  }
});

// Handle AI improvement request
async function handleAIRequest(message, sendResponse) {
  try {
    const settings = await getSettings();

    if (!settings.apiKey && !settings.bgenToken) {
      sendResponse({
        success: false,
        error: 'Bitte API-Key oder bGen Token konfigurieren'
      });
      return;
    }

    // Use bGen backend if Pro mode is enabled
    if (settings.proMode && settings.bgenToken) {
      const result = await callBGenBackend(message, settings);
      sendResponse(result);
    } else {
      // Use direct AI API (OpenAI or Claude)
      const result = await callAIProvider(message, settings);
      sendResponse(result);
    }
  } catch (error) {
    console.error('[bGen Extension] AI request failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'AI-Request fehlgeschlagen'
    });
  }
}

// Call bGen backend (Pro mode)
async function callBGenBackend(message, settings) {
  const instruction = getInstructionForAction(message.action);
  const prompt = `${instruction}\n\nOriginaltext:\n"${message.text}"\n\nAntworte NUR mit dem verbesserten Text, ohne Erklärungen.`;

  const response = await fetch(`${settings.bgenUrl || 'http://localhost:3001'}/ai/quick-improve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.bgenToken}`
    },
    body: JSON.stringify({
      prompt: prompt,
      originalText: message.text
    })
  });

  if (!response.ok) {
    throw new Error(`Backend-Fehler: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !data.improvedText) {
    throw new Error(data.error || 'Keine Verbesserung erhalten');
  }

  return {
    success: true,
    improvedText: data.improvedText.trim()
  };
}

// Call AI provider directly (OpenAI or Claude)
async function callAIProvider(message, settings) {
  const provider = settings.provider || 'openai';
  const instruction = getInstructionForAction(message.action);
  const prompt = `${instruction}\n\nOriginaltext:\n"${message.text}"\n\nAntworte NUR mit dem verbesserten Text, ohne Erklärungen.`;

  if (provider === 'openai') {
    return await callOpenAI(prompt, settings);
  } else if (provider === 'claude') {
    return await callClaude(prompt, settings);
  } else {
    throw new Error(`Unbekannter Provider: ${provider}`);
  }
}

// Call OpenAI API
async function callOpenAI(prompt, settings) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher Assistent für Textverbesserung.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `OpenAI-Fehler: ${response.status}`);
  }

  const data = await response.json();
  const improvedText = data.choices[0]?.message?.content?.trim();

  if (!improvedText) {
    throw new Error('Keine Antwort von OpenAI erhalten');
  }

  return {
    success: true,
    improvedText
  };
}

// Call Claude API
async function callClaude(prompt, settings) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: settings.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Claude-Fehler: ${response.status}`);
  }

  const data = await response.json();
  const improvedText = data.content[0]?.text?.trim();

  if (!improvedText) {
    throw new Error('Keine Antwort von Claude erhalten');
  }

  return {
    success: true,
    improvedText
  };
}

// Get instruction text for action
function getInstructionForAction(action) {
  const instructions = {
    shorten: 'Kürze diesen Text auf das Wesentliche, behalte aber alle wichtigen Informationen.',
    extend: 'Erweitere diesen Text mit zusätzlichen Details und Erklärungen.',
    professional: 'Formuliere diesen Text professioneller und formeller.',
    simplify: 'Vereinfache diesen Text und mache ihn leichter verständlich.',
    rewrite: 'Schreibe diesen Text komplett um, behalte aber den gleichen Sinn.',
    magic: 'Verbessere diesen Text automatisch (Grammatik, Stil, Klarheit).'
  };

  return instructions[action] || instructions.magic;
}

// Handle task sync (Pro feature)
async function handleTaskSync(message, sendResponse) {
  try {
    const settings = await getSettings();

    if (!settings.proMode || !settings.bgenToken) {
      sendResponse({
        success: false,
        error: 'Pro-Modus nicht aktiviert'
      });
      return;
    }

    // Fetch task output from bGen backend
    const response = await fetch(`${settings.bgenUrl || 'http://localhost:3001'}/tasks/${message.taskId}`, {
      headers: {
        'Authorization': `Bearer ${settings.bgenToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Backend-Fehler: ${response.status}`);
    }

    const task = await response.json();

    // Send output to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SYNC_TASK_OUTPUT',
          content: task.output || ''
        });
      }
    });

    sendResponse({
      success: true
    });
  } catch (error) {
    console.error('[bGen Extension] Task sync failed:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Get settings from storage
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['settings'], (result) => {
      const defaultSettings = {
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: '',
        proMode: false,
        bgenToken: '',
        bgenUrl: 'http://localhost:3001'
      };

      resolve(result.settings || defaultSettings);
    });
  });
}

// Handle get settings request
function handleGetSettings(sendResponse) {
  getSettings().then(settings => {
    sendResponse({ success: true, settings });
  });
}

// Handle save settings request
function handleSaveSettings(newSettings, sendResponse) {
  chrome.storage.sync.set({ settings: newSettings }, () => {
    sendResponse({ success: true });
  });
}

// Extension installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[bGen Extension] Installed');

    // Set default settings
    const defaultSettings = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: '',
      proMode: false,
      bgenToken: '',
      bgenUrl: 'http://localhost:3001'
    };

    chrome.storage.sync.set({ settings: defaultSettings });

    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup/popup.html')
    });
  } else if (details.reason === 'update') {
    console.log('[bGen Extension] Updated to', chrome.runtime.getManifest().version);
  }
});

console.log('[bGen Extension] Background service worker started');
