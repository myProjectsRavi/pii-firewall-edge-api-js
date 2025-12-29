# PII Firewall Edge - JavaScript/Node.js SDK

Enterprise-grade PII detection for Node.js and browser applications. Zero AI. Zero Logs. 5ms latency.

## Installation

```bash
# Copy the file to your project
cp pii-firewall.js your-project/lib/
```

## Quick Start

### 1. Get Your API Key

Sign up at [RapidAPI](https://rapidapi.com/image-zero-trust-security-labs/api/pii-firewall-edge) to get your free API key (500 requests/month).

### 2. Basic Usage

```javascript
const { createClient } = require('./pii-firewall.js');

const client = createClient('YOUR_RAPIDAPI_KEY');

// Fast mode (emails, phones, SSNs, credit cards, etc.)
const result = await client.redactFast(
  'Contact john@company.com at 555-123-4567. SSN: 123-45-6789'
);

console.log(result.redacted);
// Output: Contact [EMAIL] at [PHONE_US]. SSN: [SSN]

console.log(result.detections);
// Output: 3

console.log(result.hasPII);
// Output: true
```


## Integration with OpenAI

Sanitize user input before sending to ChatGPT:

```javascript
const { createClient } = require('./pii-firewall.js');
const OpenAI = require('openai');

const pii = createClient(process.env.RAPIDAPI_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function safeChat(userMessage) {
  // Step 1: Redact PII before sending to LLM
  const { redacted } = await pii.redactFast(userMessage);
  
  // Step 2: Send sanitized text to OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: redacted }],
  });
  
  return response.choices[0].message.content;
}
```

## Error Handling

```javascript
const { createClient, PIIFirewallError } = require('./pii-firewall.js');

const client = createClient('YOUR_KEY');

try {
  const result = await client.redactFast(userInput);
  console.log(result.redacted);
} catch (error) {
  if (error instanceof PIIFirewallError) {
    console.error(`Error ${error.statusCode}: ${error.message}`);
    
    if (error.retryable) {
      console.log('Retrying in 1 second...');
    }
  }
}
```

## Pricing

| Plan | Price | Requests/Month |
|------|-------|----------------|
| Basic | $0 | 500 |
| Pro | $5 | 5,000 |
| Ultra | $10 | 20,000 |
| Mega | $25 | 75,000 |

## PII Types Detected

152 types across 50+ countries including:

- **Contact**: Email, Phone (US/UK/IN/Intl)
- **Government**: SSN, Passport, Driver's License, Tax IDs
- **Financial**: Credit Card, IBAN, SWIFT, Crypto addresses
- **Healthcare**: NPI, DEA, Medicare, MRN
- **Developer**: AWS, GitHub, Stripe, OpenAI, Slack API keys

## Support

- **Documentation**: [RapidAPI Docs](https://rapidapi.com/image-zero-trust-security-labs/api/pii-firewall-edge)
- **SDK Examples**: [GitHub](https://github.com/myProjectsRavi/pii-firewall-edge-api-examples)
- **Email**: [Contact Support](mailto:piifirewalledge@gmail.com)

## License

MIT License
