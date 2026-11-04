# Recorded bbb-web behaviour

These files are `bbb-conform record` output: one per case, holding the
normalized response of each step (see the main README, "Recording what a
server answers"). `bbb-conform run --golden` compares against them.

## Provenance

These recordings come from the Tier 1 stack (`make -C env up`; see the
main README, "Tier 1"), the server CI runs the suite against, so a run
there compares like with like.

- **Server:** Tier 1, with bbb-web, akka-apps and the GraphQL side built
  from this tree's debs (`make -C env debs`).
- **Settings:** Tier 1's: a packaged server's, with the host, a test salt
  and a TURN server set as bbb-install sets them, except where a case names
  a profile (`env/bbb-web/profiles/`). The salt is never recorded.
- **Recorded:** 2026-10-23, from a reset stack, two passes per case with no
  unstable field. A developer server (the bbb40 container, bbb-web from the
  same tree) recorded the same files before. The join cases (`join/`, apart
  from the checksum and method ones) were added on 2026-10-28 the same way,
  from a stack built from this tree then. So were the cases of
  isMeetingRunning, getMeetingInfo, getMeetings, getSessions and end, from
  the same stack, apart from those endpoints' checksum and method ones.
  On 2026-10-30, after merging 4.0.2's v4.0.x-develop, a reset stack built
  from this tree answered every case as recorded except insertDocument's
  not-found answer, which #25786 gave a `messageKey`; those three cases
  (`insertDocument.checksum.accepted-*`, `insertDocument.method.allowed-post`)
  were re-recorded from it. The create cases (`create/`, apart from the
  checksum and method ones) were added the same day from that stack, some
  under the alt-defaults profile. So were the end callback cases
  (`end/end.callbacks.*`), from the same packages once the stack had its
  sink. On 2026-11-02 the rest of the end callback cases and the first
  expiry cases (`create/create.expiry.not-joined-*`,
  `create/create.expiry.duration`) were added the same way, from a stack
  built from this tree that day. On 2026-11-03 so were the expiry cases
  that need users in the meeting (`create/create.expiry.no-moderator*`,
  `create/create.expiry.last-user-left*`) and the usersTimeout ones
  (`join/join.max-participants.left-user*`, one of them under the
  short-users-timeout profile), from the same packages. So, later that
  day, were the cases that need users in the meeting: the join ones
  (`join/join.user-state.*`, one of them under the alt-defaults profile,
  `join.customdata.*`, `join.user-id.*`, `join.request-metadata.*`,
  `join.guest.policy-change` and the rest of `join.max-participants.*`)
  and the `*.users.*` ones of getMeetingInfo, isMeetingRunning,
  getMeetings and getSessions. On 2026-11-04 the removed-call cases
  (`enter/`, `feedback/`), `getMeetings.checksum.missing-message` and
  `end/end.callbacks.expired` were added, and `create.expiry.not-joined-*`
  and `end.callbacks.http-*`, whose steps changed, were re-recorded, from a
  stack started that day from packages whose build key still matched this
  tree.

## Reviewing

A recording becomes an expectation only after a person reviews it against the
case's intent. Re-recording needs the same review as a new recording. Never
edit a recording by hand except to add a mask. See the "Public-repo rule" in
the main README: no recording may contain the salt or an unmasked token.
