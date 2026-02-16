// ============================================
// INPUT SANITIZATION & VALIDATION
// ============================================

/**
 * Sanitize user input to prevent XSS attacks
 * - Removes HTML tags and dangerous characters
 * - Limits string length
 * - Escapes special characters
 */
export const sanitizeString = (input: unknown, maxLength = 500): string => {
  if (typeof input !== 'string') return '';

  let clean = input.trim().slice(0, maxLength);

  // Remove control characters (Ctrl+A, etc.)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove HTML/script tags
  clean = clean.replace(/<[^>]*>/g, '');

  // Escape HTML entities to prevent rendering as HTML
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return clean;
};

/**
 * Validate and sanitize username
 * - Alphanumeric, underscore, hyphen only
 * - 3-30 characters
 */
export const sanitizeUsername = (input: unknown): string => {
  if (typeof input !== 'string') throw new Error('Username must be text');

  const username = input.toLowerCase().trim().slice(0, 30);

  // Only allow a-z, 0-9, underscore, hyphen
  const isValid = /^[a-z0-9_-]{3,30}$/.test(username);
  if (!isValid) {
    throw new Error('Username must be 3-30 chars, alphanumeric + underscore/hyphen only');
  }

  return username;
};

/**
 * Validate and sanitize display name
 * - Allows unicode letters and spaces
 * - 1-100 characters
 * - No HTML tags
 */
export const sanitizeName = (input: unknown): string => {
  const name = sanitizeString(input, 100).trim();

  if (!name || name.length < 1) {
    throw new Error('Name cannot be empty');
  }

  // Check for at least one letter
  if (!/[a-zA-Z\p{L}]/u.test(name)) {
    throw new Error('Name must contain at least one letter');
  }

  return name;
};

/**
 * Validate email format
 */
export const validateEmail = (email: unknown): string => {
  if (typeof email !== 'string') throw new Error('Email must be text');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  return email.toLowerCase().trim();
};

/**
 * Sanitize task title/description
 */
export const sanitizeTaskText = (input: unknown, maxLength = 500): string => {
  return sanitizeString(input, maxLength);
};

/**
 * Sanitize journal entry content
 */
export const sanitizeJournalContent = (input: unknown): string => {
  return sanitizeString(input, 5000);
};

/**
 * Dedicated sanitizer for AI-generated content
 * Removes dangerous tags and control characters but avoids 
 * double-escaping entities (like ' to &#x27;) so React can 
 * render it naturally.
 */
export const sanitizeAIContent = (input: unknown, maxLength = 5000): string => {
  if (typeof input !== 'string') return '';
  let clean = input.trim().slice(0, maxLength);
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Control chars
  clean = clean.replace(/<[^>]*>/g, ''); // Tags
  return clean;
};

/**
 * Sanitize AI message prompt
 * - Limits length to prevent token overflow
 * - Removes injection attempts
 */
export const sanitizeAIPrompt = (input: unknown): string => {
  const prompt = sanitizeString(input, 2000);

  if (prompt.length < 2) {
    throw new Error('Message must be at least 2 characters');
  }

  return prompt;
};

/**
 * Validate priority value
 */
export const validatePriority = (priority: unknown): 'low' | 'medium' | 'high' | 'critical' => {
  const valid = ['low', 'medium', 'high', 'critical'];

  if (!valid.includes(priority as string)) {
    throw new Error(`Invalid priority. Must be one of: ${valid.join(', ')}`);
  }

  return priority as any;
};

/**
 * Validate horizon value
 */
export const validateHorizon = (horizon: unknown): 'daily' | 'monthly' | 'yearly' => {
  const valid = ['daily', 'monthly', 'yearly'];

  if (!valid.includes(horizon as string)) {
    throw new Error(`Invalid horizon. Must be one of: ${valid.join(', ')}`);
  }

  return horizon as any;
};

/**
 * Validate energy level
 */
export const validateEnergyLevel = (energy: unknown): 'low' | 'medium' | 'high' => {
  const valid = ['low', 'medium', 'high'];

  if (!valid.includes(energy as string)) {
    throw new Error(`Invalid energy level. Must be one of: ${valid.join(', ')}`);
  }

  return energy as any;
};

/**
 * Validate and cap XP value
 */
export const validateXPValue = (xp: unknown): number => {
  const value = Number(xp);

  if (isNaN(value)) {
    throw new Error('XP must be a number');
  }

  // Cap at 10000 XP per task (prevent overflow)
  const capped = Math.max(0, Math.min(value, 10000));

  return Math.round(capped);
};

/**
 * Validate category
 */
export const validateCategory = (category: unknown): string => {
  const cat = sanitizeString(category, 100).trim();

  if (!cat) {
    throw new Error('Category cannot be empty');
  }

  return cat;
};

/**
 * Prevent multiple-day journal entries
 * Validate date format is YYYY-MM-DD
 */
export const validateJournalDate = (date: unknown): string => {
  if (typeof date !== 'string') {
    throw new Error('Date must be a date string');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }

  // Verify it's a valid date
  const parsed = new Date(date + 'T00:00:00Z');
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date');
  }

  return date;
};

/**
 * Sanitize conversation title
 */
export const sanitizeConversationTitle = (input: unknown): string => {
  return sanitizeString(input, 200);
};
