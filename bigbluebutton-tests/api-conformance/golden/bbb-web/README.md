# Recorded bbb-web behaviour

These files are `bbb-conform record` output: one per case, holding the
normalized response of each step (see the main README, "Recording what a
server answers"). `bbb-conform run --golden` compares against them.

## Provenance

These recordings are **provisional**. They were recorded from a developer
server, not the hermetic stack CI will use, so they only pin the mechanism,
not that stack's exact configuration. They are re-recorded from it once it
exists, and the re-recording's diff is reviewed like any other.

- **Server:** the `bbb40` dev container (`imdt/bigbluebutton:4.0.x-develop`),
  serving `bbb40.test`.
- **bbb-web:** built from this branch and deployed to that container, so the
  recordings match the merged tree (`bbb-common-web` 0.0.5-SNAPSHOT).
- **Settings:** the repository defaults, except where a case names a profile
  (`env/bbb-web/profiles/`). The salt is the repository default and is never
  recorded.
- **Recorded:** 2026-10-22.

## Reviewing

A recording becomes an expectation only after a person reviews it against the
case's intent. Re-recording needs the same review as a new recording. Never
edit a recording by hand except to add a mask. See the "Public-repo rule" in
the main README: no recording may contain the salt or an unmasked token.
