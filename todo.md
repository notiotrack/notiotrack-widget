# TODO - ApiNotioTrack Development Tasks

## Authentication Implementation

- [ ] **Implement domain-based authentication with API key**
  - [ ] Read API key from `data-api-key` attribute of the `<script>` tag that loads the script
  - [ ] Store API key in a variable accessible throughout the script
  - [ ] Include API key in the request payload when submitting reports
  - [ ] Ensure the API key is passed to the API endpoint in the `api_key` field
  - [ ] Handle authentication errors (401, DOMAIN_NOT_AUTHORIZED, DOMAIN_MISMATCH)
  - [ ] Display appropriate error messages to users when authentication fails

## Context Data Collection

- [ ] **Implement context data collection for API requests**
  - [ ] Collect `page_title` - Use `document.title` or Readability parser result (`article.title`)
  - [ ] Collect `element_type` - Track which badge was clicked (`title`, `comment`, or `footer`)
    - [ ] Store element type when badge is created/clicked
    - [ ] Pass element type to modal/form submission
  - [ ] Collect `element_text` - Extract text content from the element where badge was clicked
    - [ ] Get text content from the target element (titleElement, commentElement, or footer)
    - [ ] Truncate to 500 characters if longer
    - [ ] Handle edge cases (empty text, special characters)
  - [ ] Collect `user_language` - Use current language from i18n system (`currentLanguage` variable)
  - [ ] Store context data when badge is clicked and pass it to form submission

## Screenshot Capture

- [ ] **Implement screenshot capture functionality**
  - [ ] Add ability to capture screenshot of the current page when submitting a report
  - [ ] Use HTML5 Canvas API or similar to capture page content
  - [ ] Convert screenshot to Base64 format
  - [ ] Include screenshot in the API request payload as `context.screenshot` field
  - [ ] Handle screenshot capture errors gracefully
  - [ ] Consider performance impact of screenshot capture
  - [ ] Optionally: Allow user to choose whether to include screenshot
  - [ ] Optionally: Capture full page or just viewport

### Implementation Details

The API key should be extracted from the script tag like this:

```html
<script src="build/script.js" data-api-key="550e8400-e29b-41d4-a716-446655440000"></script>
```

The script should:
1. Find the current script element using `document.currentScript` or by searching for script tags
2. Extract the `data-api-key` attribute value
3. Store it in a variable (e.g., `apiKey`)
4. Include it in all API requests in the payload as `api_key` field

### Error Handling

When authentication fails, the script should:
- Display user-friendly error messages
- Log errors to console for debugging
- Handle different error codes appropriately:
  - `UNAUTHORIZED` - Invalid API key
  - `DOMAIN_NOT_AUTHORIZED` - Domain not registered
  - `DOMAIN_MISMATCH` - API key doesn't match domain
