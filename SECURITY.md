# Demonstration security boundary

## Safe by design

- This repository is authored independently for a public portfolio.
- Content is fabricated and locally bundled; it was **not** exported from a production database.
- No full private modules, API credentials, secrets, connection strings, proprietary prompts, provider keys or authentication bypasses are included. Only two short, carefully reviewed source excerpts (with simplified formatting) are intentionally shown to illustrate framework use.
- The Pages website is static; nothing on this demo can call production APIs, modify CMS state or publish to external services.
- Third-party CDN assets (such as Google Fonts and, for CanariasCerca, MapLibre/demo tiles) are public rendering resources and not production integrations.
- Public client-side source is inherently visible to visitors. All runnable showcase code is independent; short server-side excerpts are documentation only and never executed by GitHub Pages.
- Only publicly accessible homepage screenshots are allowed. Never capture or publish an authenticated Studio, browser session, private user data, analytics dashboards behind login, or browser developer tools showing credentials.

Before publication, audit new content and any future pull requests for hardcoded secrets and production URLs.
