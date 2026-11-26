"""Capture authentic public-site screenshots for a portfolio case study.

Does not authenticate, read Studio, call private endpoints, or access local secrets.
Run this script on a machine with internet access and visually review the output.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

PUBLIC_URL = "https://canariascerca.es/"
APPROVED_HOST = "canariascerca.es"
OUTPUT = Path(__file__).resolve().parents[1] / "screenshots"


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    captures = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for name, width, height, mobile in (
                ("desktop", 1440, 900, False),
                ("mobile", 390, 844, True),
            ):
                context = browser.new_context(
                    viewport={"width": width, "height": height},
                    device_scale_factor=1,
                    is_mobile=mobile,
                    has_touch=mobile,
                    locale="es-ES",
                )
                page = context.new_page()
                response = page.goto(PUBLIC_URL, wait_until="domcontentloaded", timeout=45000)
                resolved_host = (urlsplit(page.url).hostname or "").lower()
                if resolved_host not in (APPROVED_HOST, "www." + APPROVED_HOST):
                    raise RuntimeError(f"Unexpected redirect to {resolved_host!r}")
                if response is None or response.status >= 400:
                    raise RuntimeError(f"Site unavailable: HTTP {response.status if response else 'no response'}")
                page.wait_for_timeout(3000)
                content = (page.locator("body").inner_text(timeout=10000) or "").lower()
                if len(content) < 80 or any(marker in content[:400] for marker in (
                    "access denied", "captcha", "just a moment", "error 1015"
                )):
                    raise RuntimeError("Page does not look like the public portal; no screenshot saved")
                target = OUTPUT / f"production-{name}.png"
                page.screenshot(path=str(target), full_page=False, animations="disabled")
                captures.append({"viewport": name, "width": width, "height": height, "file": target.name})
                context.close()
        finally:
            browser.close()

    (OUTPUT / "capture-metadata.json").write_text(
        json.dumps({"url": PUBLIC_URL, "captured_at_utc": datetime.now(timezone.utc).isoformat(),
                    "method": "Playwright Chromium, public pages only", "captures": captures}, indent=2),
        encoding="utf-8",
    )
    gallery = OUTPUT.parent / "docs" / "production-screenshots.md"
    gallery.write_text(
        "# Production website — verified browser captures\n\n"
        f"Captured from [{PUBLIC_URL}]({PUBLIC_URL}) on "
        f"{datetime.now(timezone.utc).strftime('%Y-%m-%d')} UTC. "
        "Public pages only, no authentication. Review before publishing.\n\n"
        "## Desktop\n\n![Real production desktop](../screenshots/production-desktop.png)\n\n"
        "## Mobile\n\n![Real production mobile](../screenshots/production-mobile.png)\n",
        encoding="utf-8",
    )
    print("Captured public portal images. Review before committing:", OUTPUT)


if __name__ == "__main__":
    main()
