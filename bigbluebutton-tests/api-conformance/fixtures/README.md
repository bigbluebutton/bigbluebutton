# Fixtures

Files cases refer to, or have the server fetch. The sink (`bbb-conform
sink`, see the main README) serves this directory: on Tier 1,
`${fixtureUrl}/<path>` is `<path>` here, and `${sinkUrl}/<key>/fixtures/<path>`
is the same file, with the request recorded under `<key>`.

- `bodies/`: request bodies, e.g. create's XML.
- `presentations/`: documents to upload or have fetched, beyond what the
  presentation conversion suite's fixtures cover.
- `plugins/`: plugin manifests for create to fetch (create.plugins.*):
  - `basic.json`, `second.json`: plain manifests;
  - `breakout.json`: one that sets `enabledForBreakoutRooms`;
  - `settings.json`: one with a `${meta_...}` and a `${plugin_...}`
    placeholder, each with a default; `required.json`: one whose
    `${meta_...}` placeholder has none;
  - `no-name.json`, `invalid.json`: a manifest without a name, and one
    that isn't JSON;
  - `list.json`: a list for `pluginManifestsFetchUrl`, naming `basic.json`
    and `second.json` under `%%MEETING_ID%%`. Fetch it with `?_expand=1`,
    so `{{origin}}` becomes the sink as the server reached it.
  A case that gives a checksum writes the file's SHA-256: changing a
  manifest means changing it there too.
- `client-settings/`: client settings overrides for
  `clientSettingsOverrideJsonUrl` (create.client-settings.*,
  create.fetch.*): `override.json` names a setting the client has,
  `unknown-key.json` one it doesn't, and `invalid.json` isn't JSON.
- `shared-notes/`: initial content for the shared notes
  (create.shared-notes.*): `initial.json` (an array) and `initial.md`,
  `not-array.json` and `invalid.json`.
- `recordings/`: recordings in every state, laid out like
  `/var/bigbluebutton`, which the tap installs and restores (see its
  README). The sink serves them too, which nothing uses.

`generated/` is the sink's: `fixtures/generated/<name>?_size=N` is a file
of N bytes made for the request, never a file here. Use it for anything
large, such as a file over an upload limit.

Fixtures are public: nothing here may hold a secret or a real person's
data.
