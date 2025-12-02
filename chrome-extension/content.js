// Content Script - Runs on all pages
console.log('aiGen Form Filler loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    const result = fillFormWithReport(request.report);
    sendResponse(result);
  }
  return true; // Keep channel open for async response
});

/**
 * Main function to fill form with report data
 */
function fillFormWithReport(report) {
  console.log('Filling form with report:', report.title);

  let fieldsFilled = 0;
  const filledFields = [];

  try {
    // Strategy 1: Fill by section title matching
    if (report.sections && Array.isArray(report.sections)) {
      report.sections.forEach((section, sectionIndex) => {
        const sectionResult = fillSection(section, section Index);
        fieldsFilled += sectionResult.count;
        filledFields.push(...sectionResult.fields);
      });
    }

    // Strategy 2: Fill metadata fields (title, customer, etc.)
    const metadataResult = fillMetadata(report);
    fieldsFilled += metadataResult.count;
    filledFields.push(...metadataResult.fields);

    console.log(`Form filling complete: ${fieldsFilled} fields filled`);

    return {
      success: true,
      fieldsFilled,
      filledFields
    };
  } catch (error) {
    console.error('Error filling form:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fill a single section
 */
function fillSection(section, sectionIndex) {
  const filled = [];
  let count = 0;

  // Try to find fields by section title
  const sectionTitle = section.title;
  const sectionContent = section.generatedContent || section.description || '';

  // Strategy A: Find by label matching
  const matchingFields = findFieldsByLabel(sectionTitle);
  matchingFields.forEach(field => {
    if (fillField(field, sectionContent)) {
      filled.push({ type: 'section', title: sectionTitle, element: field.tagName });
      count++;
    }
  });

  // Strategy B: Find by section index (e.g., field_1, section_1)
  const indexFields = findFieldsByIndex(sectionIndex);
  indexFields.forEach(field => {
    if (fillField(field, sectionContent)) {
      filled.push({ type: 'section-index', index: sectionIndex, element: field.tagName });
      count++;
    }
  });

  // Fill subsections
  if (section.subsections && Array.isArray(section.subsections)) {
    section.subsections.forEach((subsection, subIndex) => {
      const subsectionContent = subsection.generatedContent || subsection.description || '';
      const subsectionTitle = subsection.title;

      const subFields = findFieldsByLabel(subsectionTitle);
      subFields.forEach(field => {
        if (fillField(field, subsectionContent)) {
          filled.push({ type: 'subsection', title: subsectionTitle, element: field.tagName });
          count++;
        }
      });

      // Also try by combined index
      const combinedFields = findFieldsByIndex(`${sectionIndex}-${subIndex}`);
      combinedFields.forEach(field => {
        if (fillField(field, subsectionContent)) {
          filled.push({ type: 'subsection-index', index: `${sectionIndex}-${subIndex}`, element: field.tagName });
          count++;
        }
      });
    });
  }

  return { count, fields: filled };
}

/**
 * Fill metadata fields
 */
function fillMetadata(report) {
  const filled = [];
  let count = 0;

  const metadataMap = {
    'title': report.title,
    'report-title': report.title,
    'berichtstitel': report.title,
    'customer': report.customer?.displayName || '',
    'kunde': report.customer?.displayName || '',
    'project': report.customer?.projectName || '',
    'projekt': report.customer?.projectName || '',
    'customer-name': report.customer?.displayName || '',
    'kundenname': report.customer?.displayName || '',
  };

  Object.entries(metadataMap).forEach(([key, value]) => {
    if (!value) return;

    // Find by name, id, or data-attribute
    const fields = findFieldsByKey(key);
    fields.forEach(field => {
      if (fillField(field, value)) {
        filled.push({ type: 'metadata', key, element: field.tagName });
        count++;
      }
    });
  });

  return { count, fields: filled };
}

/**
 * Find fields by label text
 */
function findFieldsByLabel(labelText) {
  const fields = [];
  const normalizedLabel = normalizeText(labelText);

  // Find all labels
  document.querySelectorAll('label').forEach(label => {
    if (normalizeText(label.textContent).includes(normalizedLabel) ||
        normalizedLabel.includes(normalizeText(label.textContent))) {
      // Find associated input
      const forAttr = label.getAttribute('for');
      if (forAttr) {
        const input = document.getElementById(forAttr);
        if (input) fields.push(input);
      } else {
        const input = label.querySelector('input, textarea, select');
        if (input) fields.push(input);
      }
    }
  });

  // Also search in placeholders
  document.querySelectorAll('input, textarea').forEach(field => {
    const placeholder = field.getAttribute('placeholder') || '';
    if (normalizeText(placeholder).includes(normalizedLabel) ||
        normalizedLabel.includes(normalizeText(placeholder))) {
      fields.push(field);
    }
  });

  return fields;
}

/**
 * Find fields by index (name or id contains index)
 */
function findFieldsByIndex(index) {
  const indexStr = String(index);
  const fields = [];

  const selectors = [
    `[name*="section-${indexStr}"]`,
    `[name*="section_${indexStr}"]`,
    `[id*="section-${indexStr}"]`,
    `[id*="section_${indexStr}"]`,
    `[data-section="${indexStr}"]`,
    `[name*="field-${indexStr}"]`,
    `[name*="field_${indexStr}"]`,
    `[id*="field-${indexStr}"]`,
    `[id*="field_${indexStr}"]`
  ];

  selectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          fields.push(el);
        }
      });
    } catch (e) {
      // Invalid selector, skip
    }
  });

  return fields;
}

/**
 * Find fields by key (name, id, data-attribute)
 */
function findFieldsByKey(key) {
  const fields = [];
  const selectors = [
    `[name="${key}"]`,
    `[id="${key}"]`,
    `[data-field="${key}"]`,
    `[name*="${key}"]`,
    `[id*="${key}"]`
  ];

  selectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          fields.push(el);
        }
      });
    } catch (e) {
      // Invalid selector, skip
    }
  });

  return fields;
}

/**
 * Fill a single field with value
 */
function fillField(field, value) {
  if (!field || !value) return false;

  try {
    // Skip if already filled (unless empty)
    if (field.value && field.value.trim().length > 0) {
      return false;
    }

    // Set value based on field type
    if (field.tagName === 'SELECT') {
      // Find matching option
      const options = Array.from(field.options);
      const match = options.find(opt =>
        normalizeText(opt.textContent) === normalizeText(value) ||
        opt.value === value
      );
      if (match) {
        field.value = match.value;
        triggerChange(field);
        return true;
      }
    } else if (field.type === 'checkbox' || field.type === 'radio') {
      // Check if value indicates should be checked
      const shouldCheck = ['yes', 'ja', 'true', '1', 'x'].includes(normalizeText(value));
      if (shouldCheck) {
        field.checked = true;
        triggerChange(field);
        return true;
      }
    } else {
      // Text input or textarea
      field.value = value;
      triggerChange(field);
      return true;
    }
  } catch (error) {
    console.error('Error filling field:', error);
  }

  return false;
}

/**
 * Trigger change events (for React/Vue/Angular)
 */
function triggerChange(element) {
  // Native events
  const events = ['input', 'change', 'blur'];
  events.forEach(eventType => {
    const event = new Event(eventType, { bubbles: true });
    element.dispatchEvent(event);
  });

  // React specific
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, element.value);
    const ev = new Event('input', { bubbles: true });
    element.dispatchEvent(ev);
  }
}

/**
 * Normalize text for comparison
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9äöüß]/g, '')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss');
}
