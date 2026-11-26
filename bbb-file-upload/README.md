# bbb-file-upload

Meeting-scoped file upload service for BigBlueButton. It receives multipart
file uploads over an authenticated side channel, validates them, and stores
them per meeting so nginx can serve them back.

- `POST /upload` (multipart field `file`): validates the byte size, the format
  by magic bytes (`png`/`jpeg`/`gif`/`webp`/`pdf`/`mp4`/`mp3`, never `svg`), for
  images the pixel dimensions (read from the header, no bitmap decode), a per
  user+meeting rate limit and a per-meeting storage quota; stores the file at
  `/var/bigbluebutton/{meetingId}/file-uploads/{uuid}.{ext}` and returns
  `{ "url": "/bigbluebutton/fileUpload/{meetingId}/{uuid}.{ext}", "name": "...",
  "size": 1234, "mime": "..." }`. `mime` is the detected type; `name` is the
  client's file name reduced to a bare name ending in an extension of that type.
- `limits.allowedMimeTypes` can only shrink the supported set: a type the service
  has no signature for is ignored. nginx serves non-image files as downloads
  (`Content-Disposition: attachment`).
- The service does **not** serve files. `GET` on that URL is handled directly by
  nginx (`alias` + `auth_request` to `checkFileUploadAuthorization` in bbb-web),
  so there is no path-traversal surface and no extra hop.
- `meetingId`/`userId` come only from the headers the nginx `auth_request`
  injects; the request body is never trusted for identity.

Configuration lives in `config/default.yml`, overridable at
`/etc/bigbluebutton/bbb-file-upload.yml`. The service listens on
`127.0.0.1:8094`.

## Development

```bash
npm ci
npm run dev        # tsx, watches src
npm run lint
npm run typecheck
npm run build      # bundles to dist/
npm test           # node:test suite (magic bytes, dimensions, path traversal, ...)
```
