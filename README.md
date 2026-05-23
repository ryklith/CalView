# CalView

A lightweight, read-only calendar viewer for a public Radicale CalDAV calendar. Optimised for "what's coming up?" — events grouped by day, lazy expansion of recurring events, mobile-first.

> Continuation of the archived [Eidenz/CalView](https://github.com/Eidenz/CalView), substantially rewritten to be view-only and fast. Original work © Eidenz, MIT-licensed.

## Features

- Anonymous GET against a public Radicale calendar — no credentials in the bundle
- Default view: today − 1 day to today + 30 days
- Lazy expansion: "Frühere/Spätere anzeigen" buttons grow the window by 30 days at a time
- Calendar grid (modal) for jumping to arbitrary dates; navigating months expands the window
- 24h localStorage cache, manual refresh button bypasses cache
- All times pinned to `Europe/Berlin`, UI in German
- Mobile-first single-column layout

## Configuration

The calendar URL defaults to the value in `src/lib/config.js`. Override at build time via:

```
REACT_APP_CALENDAR_URL=https://your-radicale-host/path/to/collection/
```

The Radicale collection must be publicly readable (anonymous `GET` returning `text/calendar`) and serve CORS headers permitting browser access.

## Development

```
npm install
npm start
```

Opens at http://localhost:3000.

## Production build

```
npm run build
```

Static files land in `build/`.

## Docker

```
docker compose up --build
```

Serves on port 80 via nginx. To override the calendar URL:

```
REACT_APP_CALENDAR_URL=https://... docker compose up --build
```

## License

MIT — see [LICENSE](LICENSE).
