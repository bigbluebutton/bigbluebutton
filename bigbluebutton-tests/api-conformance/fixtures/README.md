# Fixtures

Files cases refer to, or have the server fetch. The sink (`bbb-conform
sink`, see the main README) serves this directory: on Tier 1,
`${fixtureUrl}/<path>` is `<path>` here, and `${sinkUrl}/<key>/fixtures/<path>`
is the same file, with the request recorded under `<key>`.

- `bodies/`: request bodies, e.g. create's XML.
- `presentations/`: documents to upload or have fetched, beyond what the
  presentation conversion suite's fixtures cover.
- `plugins/`: plugin manifests for create to fetch.

`generated/` is the sink's: `fixtures/generated/<name>?_size=N` is a file
of N bytes made for the request, never a file here. Use it for anything
large, such as a file over an upload limit.

Fixtures are public: nothing here may hold a secret or a real person's
data.
