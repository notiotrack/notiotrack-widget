# NotioTrack API Documentation

API endpoint for reporting illegal content through the NotioTrack reporting system.

**Base URL:** `https://api.notiotrack.com`

---

## Authentication

All API requests require authentication using domain-based authorization combined with an API key. The server validates both the origin domain and the API key to ensure the request is authorized.

### Authentication Method

Authentication is performed using two mechanisms:

1. **Domain-based authorization**: The server checks the `Origin` or `Referer` header to verify that the requesting domain is authorized to submit reports.
2. **API key validation**: An API key must be included in the request payload to authenticate the request.

### Getting an API Key

1. Register an account at [https://notiotrack.com](https://notiotrack.com)
2. Navigate to the API section in your dashboard
3. Register your domain(s) that will be making API requests
4. Generate an API key for each registered domain
5. Store your API key securely - it will only be shown once

### Domain Registration

Before using the API, you must register the domain(s) from which you will be making requests:

- **Allowed domains**: Only requests from registered domains will be accepted
- **Wildcard subdomains**: You can register `*.example.com` to allow all subdomains
- **Multiple domains**: You can register multiple domains for a single account
- **Domain verification**: Domains may require verification (e.g., DNS record or meta tag)

### API Key Format

API keys are UUID v4 format strings, for example:
```
550e8400-e29b-41d4-a716-446655440000
```

### How It Works

1. The client sends a request from an authorized domain (checked via `Origin` or `Referer` header)
2. The API key is included in the request payload
3. The server validates:
   - The domain matches a registered domain for the API key
   - The API key is valid and active
   - The domain has permission to submit reports

### Security Best Practices

- **Register only trusted domains** - Only register domains you control
- **Use HTTPS** - Always make requests over HTTPS to protect your API key
- **Rotate your API key** regularly (at least every 90 days)
- **Use different API keys** for different domains
- **Revoke compromised keys** immediately through your dashboard
- **Monitor API usage** for any suspicious activity

### Authentication Errors

If authentication fails, the API will return a `401 Unauthorized` response:

**Invalid or missing API key:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

**Unauthorized domain:**
```json
{
  "success": false,
  "error": {
    "code": "DOMAIN_NOT_AUTHORIZED",
    "message": "Domain is not authorized to submit reports. Please register your domain at https://notiotrack.com"
  }
}
```

**Domain mismatch:**
```json
{
  "success": false,
  "error": {
    "code": "DOMAIN_MISMATCH",
    "message": "API key does not match the requesting domain"
  }
}
```

**Common causes:**
- Missing or invalid API key in payload
- Domain not registered or not verified
- API key not associated with the requesting domain
- Request sent from unauthorized domain

---

## Endpoints

### Submit Report

Submit a report about illegal content found on a webpage.

**Endpoint:** `POST /api/v1/reports`

**Headers:**
- `Content-Type: application/json` (required)
- `Origin` or `Referer` header is automatically sent by the browser (used for domain validation)

**Note:** The API key is sent in the request body, not in headers.

#### Request Body

```json
{
  "api_key": "string (required)",
  "url": "string (required)",
  "violation_type": "string (required)",
  "email": "string (optional)",
  "additional_info": "string (optional)",
  "context": {
    "page_title": "string (optional)",
    "element_type": "string (optional)",
    "element_text": "string (optional)",
    "user_language": "string (optional)",
    "screenshot": "string (optional)"
  },
  "metadata": {
    "user_agent": "string (optional)",
    "referrer": "string (optional)",
    "timestamp": "string (ISO 8601, optional)"
  }
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `api_key` | string | Yes | API key associated with the requesting domain. Must be a valid UUID v4 format |
| `url` | string | Yes | Full URL of the page where the illegal content was found |
| `violation_type` | string | Yes | Type of violation. Must be one of: `hate_speech`, `disinformation`, `copyright`, `hate_speech_alt`, `cyberbullying`, `illegal_content`, `other` |
| `email` | string | No | Email address of the person submitting the report (for contact purposes, optional) |
| `additional_info` | string | No | Additional information or details about the violation |
| `context.page_title` | string | No | Title of the article/page where the content was found |
| `context.element_type` | string | No | Type of element where badge was clicked: `title`, `comment`, `footer` |
| `context.element_text` | string | No | Text content of the element that was reported (truncated to 500 chars) |
| `context.user_language` | string | No | Language code of the user interface (e.g., `pl`, `en`, `de`, `fr`, `es`) |
| `context.screenshot` | string | No | Base64-encoded screenshot of the current page (optional, for visual evidence) |
| `metadata.user_agent` | string | No | User agent string of the browser |
| `metadata.referrer` | string | No | Referrer URL (if available) |
| `metadata.timestamp` | string | No | ISO 8601 timestamp of when the report was submitted |

#### Violation Types

The `violation_type` field accepts the following values:

- `hate_speech` - Hate speech content / Treści szerzące nienawiść
- `disinformation` - Disinformation/Fake News / Dezinformacja/Fake News
- `copyright` - Copyright infringement / Naruszenie praw autorskich
- `hate_speech_alt` - Hate speech (alternative) / Mowa nienawiść
- `cyberbullying` - Cyberbullying / Cyberprzemoc
- `illegal_content` - Illegal content (e.g., erotic content, content protected by copyright law, etc.) / Nielegalna treść (np. treści erotyczne, chronione prawem autorskim itp.)
- `other` - Other (specify) / Inne (sprecyzuj)

#### Request Example

```json
{
  "api_key": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://example.com/article/123",
  "violation_type": "hate_speech",
  "email": "reporter@example.com",
  "additional_info": "The article contains discriminatory language targeting specific ethnic groups.",
  "context": {
    "page_title": "Example Article Title",
    "element_type": "title",
    "element_text": "Example Article Title",
    "user_language": "en",
    "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "metadata": {
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "referrer": "https://google.com",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Important:** The request must be sent from a registered domain. The server will automatically check the `Origin` or `Referer` header to verify the domain is authorized for the provided API key.

#### Response

**Success Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "report_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "submitted",
    "message": "Report submitted successfully"
  }
}
```

**Error Response (400 Bad Request)**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email address is required"
      },
      {
        "field": "violation_type",
        "message": "Invalid violation type. Must be one of: hate_speech, disinformation, copyright, hate_speech_alt, cyberbullying, illegal_content, other"
      },
      {
        "field": "api_key",
        "message": "API key is required"
      }
    ]
  }
}
```

**Error Response (500 Internal Server Error)**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred"
  }
}
```

#### Response Codes

| Status Code | Description |
|-------------|-------------|
| 201 | Report submitted successfully |
| 400 | Bad request - validation error |
| 401 | Unauthorized - invalid or missing API key |
| 429 | Too many requests - rate limit exceeded |
| 500 | Internal server error |
| 503 | Service unavailable |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit:** 10 requests per IP address per hour
- **Headers:** Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum number of requests allowed
  - `X-RateLimit-Remaining`: Number of requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

**Example Response Headers:**

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1705312200
```

When rate limit is exceeded, the API returns `429 Too Many Requests`:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 3600
  }
}
```

---

## Validation Rules

### API Key
- Must be a valid UUID v4 format string
- Must be associated with a registered domain
- The requesting domain (from `Origin` or `Referer` header) must match the domain registered for this API key
- Required field

### URL
- Must be a valid HTTP/HTTPS URL
- Must not exceed 2048 characters
- Must be properly encoded

### Email
- Optional field
- Must be a valid email address format if provided
- Must not exceed 255 characters


### Violation Type
- Must be one of the allowed values (case-sensitive)
- Required field

### Additional Info
- Optional field
- Maximum length: 5000 characters
- Will be sanitized to prevent XSS

### Context Fields
- All context fields are optional
- `page_title` - Title of the article/page (can be obtained from `document.title` or Readability parser)
- `element_type` - Type of element where badge was clicked: `title`, `comment`, or `footer`
- `element_text` - Text content of the element that was reported (will be truncated to 500 characters if longer)
- `user_language` - Should be a valid ISO 639-1 language code (e.g., `pl`, `en`, `de`, `fr`, `es`)
- `screenshot` - Base64-encoded image data (PNG, JPEG, or WebP format), maximum size: 5MB (before encoding)

### Domain Validation
- The server automatically extracts the domain from the `Origin` or `Referer` HTTP header
- The domain must be registered and associated with the provided API key
- Wildcard domains (e.g., `*.example.com`) are supported
- Subdomains are validated against registered wildcard patterns

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request data validation failed |
| `UNAUTHORIZED` | Invalid or missing API key |
| `DOMAIN_NOT_AUTHORIZED` | Requesting domain is not registered or not authorized |
| `DOMAIN_MISMATCH` | API key does not match the requesting domain |
| `RATE_LIMIT_EXCEEDED` | Too many requests from this IP |
| `INTERNAL_ERROR` | Server-side error occurred |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## Example Usage

### JavaScript/Fetch Example

```javascript
async function submitReport(reportData, apiKey) {
  try {
    // Include API key in the payload
    const payload = {
      ...reportData,
      api_key: apiKey
    };

    const response = await fetch('https://api.notiotrack.com/api/v1/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Origin header is automatically sent by the browser
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Report submitted:', result.data.report_id);
      return result;
    } else {
      console.error('Error:', result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}

// Usage
const reportData = {
  url: window.location.href,
  violation_type: 'hate_speech',
  email: 'user@example.com',
  additional_info: 'Additional details here',
  context: {
    page_title: document.title,
    element_type: 'title',
    element_text: 'Article title text',
    user_language: 'en'
  },
  metadata: {
    user_agent: navigator.userAgent,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  }
};

const API_KEY = 'your-api-key-here'; // Get from https://notiotrack.com

submitReport(reportData, API_KEY)
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Failed:', error);
  });
```

### cURL Example

```bash
curl -X POST https://api.notiotrack.com/api/v1/reports \
  -H "Content-Type: application/json" \
  -H "Origin: https://example.com" \
  -d '{
    "api_key": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://example.com/article/123",
    "violation_type": "hate_speech",
    "email": "reporter@example.com",
    "additional_info": "The article contains discriminatory language.",
    "context": {
      "page_title": "Example Article",
      "element_type": "title",
      "user_language": "en"
    }
  }'
```

**Note:** When using cURL, you must manually set the `Origin` header to match your registered domain. In browser environments, this header is sent automatically.
```

---

## Data Privacy

- Email addresses are stored securely and used only for follow-up communication if needed
- Reports are processed in accordance with applicable data protection regulations
- Personal data is not shared with third parties without consent
- Reports may be anonymized for statistical purposes

---

## Support

For API support or questions, please contact:
- Email: support@notiotrack.com
- Website: https://notiotrack.com

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Support for basic report submission
- Rate limiting implementation
- Multi-language support
