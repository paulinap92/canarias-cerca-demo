# Selected source excerpts — CanariasCerca

These are short, carefully reviewed excerpts from the actual private application, not the JavaScript simulation running on GitHub Pages. Only generic, non-secret application boundaries are shown. The repository's source remains private.

## app/api/places.py

```python
@router.get("")
async def get_places(
    limit: int = Query(100, ge=1, le=500),
    island: str | None = Query(None),
) -> dict[str, Any]:
    return trim(source.read(island=island), limit)
```

## Scheduled data refresh

```python
async def _loop(paths, interval, delay, between=1.0):
    await asyncio.sleep(delay)
    async with httpx.AsyncClient(timeout=90) as client:
        while True:
            for path in paths:
                await _get(client, path)
                await asyncio.sleep(between)
            await asyncio.sleep(interval)
```

**Disclosure:** The original snippets may have been formatted for legibility, and the background-loop example is shortened. No private prompt, credential, URL for a private service, database schema, user information, or full service implementation is disclosed.

The demo UI and its simulated state machine are independent, newly written code. They do not execute the server snippets above.
