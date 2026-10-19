# API smoke test

`api-smoke.sh` checks a running stack through the BBB API: create, join
(`redirect=false`), getMeetings, end, isMeetingRunning. `test-api-smoke.sh` and `mock/` are the
protected interface tests: the mock implements just enough of the API and verifies checksums the
way bbb-web does.

## Running the tests

```sh
docker/tests/smoke/run.sh            # docker if installed, else podman
CONTAINER_ENGINE=podman docker/tests/smoke/run.sh
```

`run.sh` builds a small runner image (digest-pinned `ubuntu:24.04` plus `curl` and `python3`,
versions printed before the tests) and runs `test-api-smoke.sh`, then
`test-api-smoke-extra.sh`, inside it. Both run against the mock on `127.0.0.1` in the
container. The extra tests replace `curl` and `sha1sum` with logging shims to check that the
secret never appears in a child's arguments or environment, and cover URL encoding, random
meeting IDs, cleanup after a failed step, HTTP errors and option validation.

## Running against a real stack

```sh
read -rs BBB_SHARED_SECRET && export BBB_SHARED_SECRET   # not on the command line or in history
docker/tests/smoke/api-smoke.sh --api-url https://bbb.example.com/bigbluebutton/api
```

The secret is the `securitySalt` bbb-web uses. Pass it through the environment only;
`api-smoke.sh` has no option for it. Output:

```
STEP create: OK
STEP join: OK
STEP getMeetings: OK
STEP end: OK
STEP isMeetingRunning: OK
SMOKE PASS
```

Exit 0 on PASS, 1 on FAIL, 2 on usage errors. The script stops at the first failing step; if
the meeting was created, it sends a best-effort `end` before exiting.

- `--insecure`: skip certificate verification, for stacks with a self-signed or private-CA
  certificate. Prefer trusting the CA instead (e.g. `CURL_CA_BUNDLE=/path/ca.pem`); never use
  `--insecure` against a production host.
- `--timeout SECONDS` (default 30): per-request limit, and how long `isMeetingRunning` is
  retried after `end`.
- The script does not follow redirects. Point `--api-url` at the final URL (an `http://` URL
  that nginx redirects to `https://` fails with `HTTP 301`).

### What each step proves

| Step | Request | Passes when | Proves |
|---|---|---|---|
| create | `create?meetingID=smoke-<random>&name=...` | `returncode` SUCCESS and the echoed `meetingID` matches | nginx routes `/bigbluebutton/api` to bbb-web; the secret matches; bbb-web accepts the meeting. Whether akka-apps actually started it is not checked |
| join | `join?fullName=...&meetingID=...&role=MODERATOR&redirect=false` | SUCCESS and an `http(s)` `<url>` | bbb-web issues a session for the meeting. The URL is **not** opened, so the HTML5 client and media are not tested |
| getMeetings | `getMeetings` | the meeting ID is listed | bbb-web's meeting registry holds the meeting |
| end | `end?meetingID=...` | SUCCESS | the end request is accepted |
| isMeetingRunning | `isMeetingRunning?meetingID=...`, retried | `<running>false</running>` within `--timeout` | the call answers for the meeting after end |

On a real stack `isMeetingRunning` is weak evidence: bbb-web reports a meeting as running only
while users are in it (`Meeting.isRunning()` returns `!users.isEmpty()`), and the script never
opens the join URL, so the meeting is not running before `end` either. The step catches a
broken API after `end`, not a meeting that failed to end. Browser-level checks belong to the
Playwright suite.

### Limits

- Checksums are sha1, which bbb-web accepts while `supportedChecksumAlgorithms` contains `sha1`
  (the default). A stack that disables sha1 rejects every call with `checksumError`.
- XML is read with bash string matching: the first `<tag>value</tag>` (every `<meetingID>` in
  getMeetings), an optional CDATA wrapper and the five predefined entities. Attributes on the
  tags it reads, namespaces, comments, numeric character references and nested elements of
  the same name are not supported. This is enough for bbb-web's flat responses.
- Dependencies: bash, curl and coreutils only.
