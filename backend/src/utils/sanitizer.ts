/**
 * Sanitizer utility — strips PII, secrets, and credentials from log data
 * before sending to AI or storing externally.
 */

// Patterns to detect and redact
const REDACTION_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // API keys and secrets
  { pattern: /(['"]?(?:api[_-]?key|apikey|api[_-]?secret)['"]\s*[:=]\s*)(['"])[^'"]+\2/gi, replacement: '$1$2[REDACTED]$2' },
  { pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, replacement: 'Bearer [REDACTED]' },
  { pattern: /Authorization:\s*[^\n]+/gi, replacement: 'Authorization: [REDACTED]' },

  // Passwords
  { pattern: /(['"]?password['"]?\s*[:=]\s*)(['"])[^'"]+\2/gi, replacement: '$1$2[REDACTED]$2' },
  { pattern: /password=[^\s&]+/gi, replacement: 'password=[REDACTED]' },

  // JWT tokens (3 base64 segments)
  { pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, replacement: '[JWT_TOKEN_REDACTED]' },

  // Connection strings
  { pattern: /(?:mongodb|postgres|mysql|redis|amqp):\/\/[^@\s]+@[^\s]+/gi, replacement: '[CONNECTION_STRING_REDACTED]' },
  { pattern: /(?:mongodb|postgres|mysql|redis|amqp):\/\/[^\s]+/gi, replacement: '[CONNECTION_STRING_REDACTED]' },

  // Email addresses
  { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL_REDACTED]' },

  // Credit card numbers (simple pattern)
  { pattern: /\b(?:\d[ -]?){13,16}\b/g, replacement: '[CARD_NUMBER_REDACTED]' },

  // AWS keys
  { pattern: /AKIA[0-9A-Z]{16}/g, replacement: '[AWS_KEY_REDACTED]' },
  { pattern: /(?:aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*)[^\s]+/gi, replacement: 'aws_secret=[REDACTED]' },

  // Private key blocks
  { pattern: /-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, replacement: '[PRIVATE_KEY_REDACTED]' },

  // IP addresses (optional, can be left for debugging)
  // { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[IP_REDACTED]' },

  // Phone numbers
  { pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[PHONE_REDACTED]' },

  // Social Security Numbers
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' },

  // Generic secret-looking key=value pairs
  { pattern: /(['"]?(?:secret|token|credential|private[_-]?key|auth[_-]?token)['"]?\s*[:=]\s*)(['"])[^'"]+\2/gi, replacement: '$1$2[REDACTED]$2' },
];

/**
 * Sanitize a string by removing/replacing PII and sensitive data.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return input;

  let sanitized = input;
  for (const { pattern, replacement } of REDACTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

/**
 * Sanitize log content — same as sanitizeText but with additional
 * log-specific cleanup (removes very long lines that might be stack traces
 * with embedded sensitive data beyond a character limit).
 */
export function sanitizeLogs(logs: string): string {
  if (!logs || typeof logs !== 'string') return logs;

  const lines = logs.split('\n');
  const sanitizedLines = lines.map(line => {
    // Redact lines that look like they contain full stack traces with paths
    if (line.length > 2000) {
      return line.substring(0, 500) + ' ... [TRUNCATED_LINE]';
    }
    return sanitizeText(line);
  });

  return sanitizedLines.join('\n');
}

/**
 * Sanitize an incident object before sending to external AI.
 * Returns a cleaned copy without mutating the original.
 */
export function sanitizeIncidentForAI(incident: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(incident)) {
    if (value === null || value === undefined) {
      cleaned[key] = value;
    } else if (key === 'logs' || key === 'log_content') {
      cleaned[key] = sanitizeLogs(String(value));
    } else if (typeof value === 'string') {
      cleaned[key] = sanitizeText(value);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitizeIncidentForAI(value);
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) :
        typeof item === 'object' ? sanitizeIncidentForAI(item) : item
      );
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}
