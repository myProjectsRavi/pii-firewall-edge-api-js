/**
 * PII Firewall Edge - JavaScript/Node.js SDK
 * 
 * Enterprise-grade PII detection with zero AI and zero data retention.
 * Detects 152 PII types across 50+ countries in 5ms.
 * 
 * @version 2.4.0
 * @see https://rapidapi.com/image-zero-trust-security-labs/api/pii-firewall-edge
 */

const BASE_URL = 'https://pii-firewall-edge.p.rapidapi.com';
const API_HOST = 'pii-firewall-edge.p.rapidapi.com';

/**
 * Create a PII Firewall client.
 * @param {string} apiKey - Your RapidAPI key
 * @param {Object} [options] - Configuration options
 * @param {number} [options.timeout=10000] - Request timeout in ms
 * @returns {Object} Client with redact methods
 */
function createClient(apiKey, options = {}) {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('API key is required');
  }

  const timeout = options.timeout || 10000;

  /**
   * Make API request
   */
  async function request(endpoint, text, mode = 'label') {
    // Input validation
    if (text === null || text === undefined) {
      throw new PIIFirewallError('Text cannot be null', 400);
    }
    if (typeof text !== 'string') {
      throw new PIIFirewallError('Text must be a string', 400);
    }
    if (text.trim() === '') {
      throw new PIIFirewallError('Text cannot be empty', 400);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': API_HOST,
        },
        body: JSON.stringify({ text, mode }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw mapHttpError(response.status, data);
      }

      return {
        redacted: data.redacted,
        detections: data.detections,
        warning: data.warning || null,
        hasPII: data.detections > 0,
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new PIIFirewallError('Request timeout', 0, true);
      }
      if (error instanceof PIIFirewallError) {
        throw error;
      }
      throw new PIIFirewallError(`Network error: ${error.message}`, 0, true);
    }
  }

  return {
    /**
     * Redact PII using fast mode (2-5ms latency).
     * Detects: emails, phones, SSN, credit cards, API keys, etc.
     * Does NOT detect: human names, addresses.
     */
    redactFast: (text) => request('/v1/redact/fast', text, 'label'),

    /**
     * Redact PII using fast mode with masking (asterisks).
     */
    redactFastMasked: (text) => request('/v1/redact/fast', text, 'mask'),

    /**
     * Redact PII using deep mode (5-15ms latency).
     * Detects everything in fast mode + human names + addresses.
     */
    redactDeep: (text) => request('/v1/redact/deep', text, 'label'),

    /**
     * Redact PII using deep mode with masking (asterisks).
     */
    redactDeepMasked: (text) => request('/v1/redact/deep', text, 'mask'),
  };
}

/**
 * Map HTTP status code to descriptive error
 */
function mapHttpError(status, data) {
  const message = data?.error || 'Unknown error';

  switch (status) {
    case 400:
      return new PIIFirewallError(`Bad Request: ${message}`, status);
    case 401:
      return new PIIFirewallError('Unauthorized: Invalid or missing API key', status);
    case 403:
      return new PIIFirewallError('Forbidden: API key does not have access', status);
    case 413:
      return new PIIFirewallError(`Payload Too Large: ${message}`, status);
    case 429:
      return new PIIFirewallError('Rate Limit Exceeded: Upgrade your plan or wait', status, true);
    case 500:
      return new PIIFirewallError('Server Error: Please try again later', status, true);
    default:
      return new PIIFirewallError(`HTTP Error ${status}: ${message}`, status);
  }
}

/**
 * Custom error class for PII Firewall errors
 */
class PIIFirewallError extends Error {
  constructor(message, statusCode, retryable = false) {
    super(message);
    this.name = 'PIIFirewallError';
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

// CommonJS exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createClient, PIIFirewallError };
}

// ES Module exports
if (typeof exports !== 'undefined') {
  exports.createClient = createClient;
  exports.PIIFirewallError = PIIFirewallError;
}
