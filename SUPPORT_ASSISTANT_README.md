# Braxton Support Assistant

This package replaces the redundant floating **Quote** bubble with a rule-based, AI-style **Help / Support** assistant named **Braxton**.

It is designed for the static Tridico Design website and works on GitHub Pages without a backend.

## What changed

- Removed the old floating quote bubble from every HTML page.
- Added `assets/css/support-assistant.css`.
- Added `assets/js/support-assistant.js`.
- Added the CSS include to every page:

```html
<link rel="stylesheet" href="assets/css/support-assistant.css">
```

- Added the JS include to every page:

```html
<script src="assets/js/support-assistant.js" defer></script>
```

## Assistant paths included

- Website navigation
- Quote help
- Artwork upload help
- Services questions
- Product/customer support
- Billing issues
- Quality issues such as vinyl peeling, bubbling, lifting, damage, mismatches, or defects
- Feedback
- Website/form issues
- General company questions
- Artwork preparation guidance
- Care and maintenance
- Installation planning
- Rush/deadline support
- General support tickets

## Ticket behavior

Braxton generates a local ticket ID such as:

```text
TD-20260512-A1B2
```

Because GitHub Pages is static, the default ticket handoff uses `mailto:`. Braxton prepares a support email addressed to:

```text
ben@tridicodesign.com
```

It also stores the most recent ticket summaries in the browser's local storage for convenience.

## Optional backend integration

If Tridico later connects a real ticket system or form backend, update this value in `assets/js/support-assistant.js`:

```js
ticketEndpoint: ''
```

Change it to an HTTPS endpoint that accepts JSON POST requests.

Braxton will then attempt to post:

```json
{
  "ticket": {},
  "body": "ticket summary text",
  "source": "tridico-support-assistant"
}
```

The mailto fallback still remains available.

## Accessibility and usability details

- Uses a real `<button>` for the support launcher.
- Uses `role="dialog"` and `role="log"` for the chat panel.
- Supports keyboard close with `Escape`.
- Traps keyboard focus while the panel is open.
- Returns focus to the launcher after closing.
- Uses `aria-live="polite"` for newly added messages.
- Includes reduced-motion fallbacks.
- Uses hover scale animation on the bubble and animated typing dots.
- Uses scoped `.tdsa-*` class names to avoid collisions with existing site CSS.

## Recommended production note

When a real support/ticket backend is connected, change the final message copy to say the ticket has been submitted automatically. Until then, the assistant correctly prepares the ticket and asks the user to send it through email.
