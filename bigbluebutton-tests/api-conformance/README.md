# BBB API conformance suite

Black-box tests that pin down how the BigBlueButton HTTP API behaves, so that
bbb-web and its Go replacement, bbb-api, can be checked against the same
cases. Cases are declarative YAML; `bbb-conform` (in `runner/`) runs them.

**Status:** `bbb-conform` validates cases, runs HTTP steps (`call`, `route`,
`url` and `wait`), joins headless users to meetings (`presence`) and runs
GraphQL as them (`graphql`), checks what the server did on the redis bus, in
redis and on disk (`bus`, `redis` and `fs`, through a [tap](#the-tap-tap)),
and records what a server answers. Cases that use the other step types
(`sink`, `env`) or response schemas are skipped until those are implemented.
bbb-api isn't in this tree yet; `targets/bbb-api.yaml` and
`expectations/bbb-api.yaml` are ready for it.

```
runner/                  the bbb-conform Go module
  schema/case.schema.json  the case format, as JSON Schema
  testdata/cases/          worked examples of every feature
  testdata/smoke/          a quick check of a live server
cases/<area>/<group>/    the suite's cases, e.g. cases/common/checksum/
fixtures/                files cases refer to (bodies, presentations, schemas); none yet
golden/<target>/         reviewed recordings of what a server answered
masks.yaml               extra normalization rules for diff and recordings
env/                     the Tier 1 stack (make -C env up) and config profiles
```

## Running cases

```sh
cd runner
go run ./cmd/bbb-conform run --target my-server.yaml --cases ../cases \
    --tags ci --junit ../out/junit.xml --json ../out/results.json
```

| Option | Meaning |
|---|---|
| `--target FILE` | The server to test (required). |
| `--cases DIR` | Default `cases`. `--fixtures DIR` defaults to `fixtures` next to it. |
| `--tags a,b` | Only cases with one of these tags. `--exclude-tags` drops cases with any of them. |
| `--id glob,...` | Only cases whose ID matches, e.g. `--id 'create.*'`. |
| `--parallel N` | Cases at once (default 4). Cases tagged `serial` run alone afterwards. |
| `--golden DIR` | Compare each step with the reviewed recordings in DIR, e.g. `golden/bbb-web` (see [record](#recording-what-a-server-answers-record)). `--masks FILE` as for `diff`. |
| `--junit FILE`, `--json FILE` | Write reports. The JSON report has every request, response and check. |
| `-v` | List every failed check and warning on the console. |

Each case ends as one of:
- **PASS**;
- **FAIL**: the server's behaviour didn't match, which includes a response
  that doesn't parse and a capture that finds nothing;
- **ERROR**: the runner couldn't do what the case asked, e.g. the server is
  unreachable or a template didn't expand;
- **SKIP**, with the reason: a capability the target lacks, a URL the case
  uses that the target doesn't set (`not-configured: sinkUrl` or
  `fixtureUrl`), something the runner can't do yet, or an interrupt before
  the case started.

The exit status is 0 when nothing failed or errored, 1 when something did
or the run was interrupted, and 2 for a bad command line, target or case
file. Ctrl-C stops the run: cases that haven't started are skipped, and
those running stop and run their teardowns. A second Ctrl-C skips the
teardowns too. Restoring the default profile after a switch always
finishes, so the server isn't left on another profile. The salt and secret target
vars are replaced with `[salt]` and `[secret:name]` in everything the runner
writes. Nothing else is: the JSON and JUnit reports hold the live
`JSESSIONID` and session tokens the server handed out, so treat them like
the server's logs on a shared server. Recordings mask those.

### Target files

```yaml
name: bbb-web
baseUrl: https://bbb.example.com     # scheme and host only
apiPrefix: /bigbluebutton/api/       # the default; bbb-api uses /meeting-api/
saltEnv: BBB_SECRET                  # or salt: ...
tls: {caFile: dev-ca.crt}            # relative to this file; or insecureSkipVerify: true
capabilities: [akka, presence]       # names a case can require; a misspelt one is an error
defaultSign: sha256
sinkUrl: https://sink.example.com    # optional, for ${sinkUrl}
fixtureUrl: https://files.example.com
graphqlUrl: wss://bbb.example.com/graphql  # the default: baseUrl's host at /graphql; keep that host, for the join's cookie
tapUrl: http://10.0.0.5:8099         # the server's tap, for bus, fs and redis steps
vars:
  turnSecret: {env: TURN_SECRET, secret: true}   # ${target.turnSecret}
```

Blank fields fall back to the variables the Playwright suite uses: `BBB_URL`
(e.g. `https://bbb-ci.test/bigbluebutton/`) and `BBB_SECRET`, and to
`BBB_TAP_URL` for `tapUrl`. `targets/bbb-web.yaml` and `targets/bbb-api.yaml`
are set up that way.

A target with a tap has the `bus`, `fs` and `redis` capabilities. Listing
them without one is an error.

**Routes** map the route names of `route` steps to this target's paths:

```yaml
routes:
  presentation-download: {path: "/bigbluebutton/presentation/download/{meetingId}/{presId}"}
  connection-authz:      {path: "/bigbluebutton/connection/checkAuthorization", baseEnv: BBB_WEB_DIRECT_URL}
```

- `{name}` is filled from the step's `pathParams`, path-escaped. A missing
  param is an error; params the path doesn't use are ignored.
- `base` (or the variable `baseEnv` names) replaces `baseUrl`, for routes such
  as the nginx-internal hooks that cases call on bbb-web directly.
- A case is skipped as `not-routed` if the target doesn't map one of its
  routes, or if the route's `baseEnv` is unset.
- A route may name a path the server no longer serves, so that a case can
  check it stays gone.

**Profiles** are the config profiles cases can ask for with `profile:`:

```yaml
profiles:
  short-timeouts: {command: "make -C ../env profile NAME=short-timeouts"}
  default:        {command: "make -C ../env profile NAME=default"}
```

- Cases with a profile run after the others, one profile at a time.
- The profile's command (`sh -c`, from the target file's directory) runs
  before its cases.
- `default` runs at the end, even if the run is interrupted.
- A case whose profile the target doesn't list is skipped as `no-profile`, and
  a failing command makes its cases ERROR. A command that exits 77 says it
  can't switch this server, e.g. because it isn't told how to reach it: its
  cases are skipped as `profile-unavailable`.

**Profiles on a full install.** `targets/bbb-web.yaml` lists the suite's
profiles with `env/full-install/profile.sh` as their command. Each profile
is an overlay, `env/bbb-web/profiles/<name>.properties`:

```sh
export BBB_EXEC="docker exec -i bbb40"     # or local, or "ssh root@host"
env/full-install/profile.sh reveal-version # apply one
env/full-install/profile.sh status         # the one in force
env/full-install/profile.sh default        # restore the server's own file
```

- **How it applies a profile:**
  - it keeps the server's `/etc/bigbluebutton/bbb-web.properties` aside;
  - it writes that file plus the overlay (bbb-web takes the last value of a
    key) and restarts bbb-web;
  - it waits until the API answers again, about 15 seconds.
- **Applying the profile already in force** restarts nothing.
- **Safety:** it refuses to touch a profiled file that was edited by hand,
  and it takes a lock, so two switches never overlap.
- **Without `BBB_EXEC`** it exits 77, so the profile's cases are skipped
  rather than failed: a server is never restarted by accident.
- **`disruptive` tag:** a case with a profile must have it (`validate`
  says so), so `--exclude-tags disruptive` leaves the server alone.
- **Another switcher:** set `BBB_PROFILE_CMD` to a command that takes the
  same arguments. The Tier 1 stack's is `env/tier1/profile.sh` (see below).

To smoke-test a server, point a target at it and run `--cases testdata/smoke`.

### Expected failures

`run --expect expectations/<target>.yaml` applies a target's list of known
failures:

```yaml
target: bbb-api
expected:
  - id: "join.*"            # a case ID, the base ID of a case with variants, or a glob
    reason: join isn't implemented
    issue: https://github.com/bigbluebutton/bigbluebutton/issues/NNN
```

| A listed case that... | is reported as | and the run |
|---|---|---|
| fails | XFAIL, with the entry's reason | passes |
| passes, listed by its ID | XPASS | fails, so the stale entry gets removed |
| passes, listed by its base ID | XPASS if every variant ran and passed, else PASS | fails on XPASS, as above |
| passes, covered only by a glob | PASS | passes: a glob stands for a whole missing endpoint, some of whose cases pass anyway |
| errors or is skipped | unchanged | as usual |

The file's `target` must match the target's `name`. An entry that matches no
case is reported as a warning. `expectations/bbb-api.yaml` is the bbb-api gap
backlog; `expectations/bbb-web.yaml` lists the `defect` cases bbb-web fails.

## Tier 1: a stack to run against

`env/` brings up bbb-web and what it needs as a Docker Compose stack, built
from this tree: the server CI runs the suite against, and that recordings
come from.

```sh
make -C env debs              # build the packages (see below)
make -C env up                # build the images, start, wait until healthy
eval "$(make -s -C env env)"  # BBB_URL, BBB_SECRET, BBB_TAP_URL, ...
cd runner
go run ./cmd/bbb-conform run --target ../targets/bbb-web.yaml --cases ../cases --golden ../golden/bbb-web
```

| Target | Does |
|---|---|
| `debs` | Builds the five packages the stack runs (bbb-web, bbb-apps-akka, bbb-graphql-server, bbb-graphql-middleware, bbb-graphql-actions) with their own build scripts, in the image CI builds them in. `PKGS=bbb-web` builds one. About 20 minutes cold. |
| `up` | Renders the configuration, builds what changed and starts the stack, then waits until every service is healthy (about a minute). `CLAMAV=1` adds a ClamAV daemon. |
| `env` | Prints the variables the runner reads: `BBB_URL`, `BBB_SECRET`, `BBB_TAP_URL`, `BBB_WEB_DIRECT_URL`, `BBB_PROFILE_CMD` and `SSL_CERT_FILE`. |
| `profile` | `NAME=reveal-version` switches bbb-web to a profile in `env/bbb-web/profiles/`, `NAME=default` back; without `NAME`, prints the one in force. Cases use it through `BBB_PROFILE_CMD`. |
| `reset` | Starts again from nothing: no meetings, an empty data directory, the default profile. |
| `logs`, `ps`, `down` | `SERVICE=bbb-web` for one service's log; `TAIL=all` for all of it, not the last 200 lines. |

It needs Linux on amd64, Docker with Compose 2.17 or later, and network
access for the first build.

- **The packages.** `make debs` builds from a snapshot of the tree: the
  tracked files, with their uncommitted changes, so nothing gitignored gets
  in. Rebuild after changing bbb-web, akka-apps or the GraphQL side; a
  change to the suite or `env/` needs only `make up`. `DEBS_DIR` points at
  debs built elsewhere, such as CI's.
- **The stack.** Each image unpacks its package rather than installing it,
  and does what the package's install script would have. All the services
  share one network namespace, so they reach each other on 127.0.0.1 as on
  a single-server install:
  - bbb-web and akka-apps; redis; Postgres with the GraphQL schema; Hasura,
    the GraphQL middleware and the actions server; nginx; the tap;
  - nginx serves `https://localhost:8443`, with a certificate from a CA
    `make up` creates in `env/.state/` (`SSL_CERT_FILE` trusts it); bbb-web
    itself answers on `http://localhost:8090` (`BBB_WEB_DIRECT_URL`), and
    the tap on `http://localhost:8099`. All three are bound to the host's
    loopback only.
- **Its configuration** is a packaged server's, with what bbb-install sets:
  the host and a test salt (`env/tier1/tier1.env`, published on purpose),
  and a TURN server (`env/bbb-web/turn-stun-servers.xml`). Timeouts are the
  stock ones.
- **Where it differs from a packaged server:**
  - converters run without systemd's memory limit and sandbox, and
    LibreOffice (the build the packages use) runs in bbb-web's container,
    without its own container's limits;
  - nginx terminates TLS itself, on port 8443;
  - there is no FreeSWITCH, LiveKit, shared notes or recording processing:
    messages for them go unanswered, and recording markers stay where
    bbb-web writes them;
  - bbb-api isn't part of it yet.
- **ClamAV.** `make up CLAMAV=1` runs the daemon where bbb-web looks for
  it; the `clamav-scan` profile turns scanning on.
- **In CI.** `.github/workflows/api-conformance.yml` builds and starts the
  stack, without ClamAV, for every pull request that touches the suite or
  what Tier 1 is built from, and for every such push to a base branch. It
  runs every case Tier 1 can (all but `full-stack` and `slow`; the
  `clamav-scan` ones are skipped) against the recordings. A change to an
  answer fails it until the PR re-records the cases it changes (`record`,
  then review the diff). The debs are cached under `build-debs.sh --key`, a
  hash of what they're built from: the five packages' sources and build
  scripts, the release file, `build-debs.sh` and the build image. A PR that
  changes none of them skips the build. The reports, the gap matrix and, when
  the job fails, the services' logs are uploaded as `api-conformance-bbb-web`,
  and the matrix is the job's summary.

## The tap: `tap`

`bus`, `fs` and `redis` steps see what a server did outside its answers
through a tap: `bbb-conform tap`, running on the server itself. The tap:
- follows the redis channels that bbb-web and akka-apps talk over;
- reads redis keys;
- reads files in the data directory.

It serves all three over HTTP to the runner, which can run anywhere.

```sh
# A static binary for the server:
CGO_ENABLED=0 GOOS=linux go build -o bbb-conform ./cmd/bbb-conform
# On the server, as a user that can read the data directory:
./bbb-conform tap
```

| Option | Default |
|---|---|
| `--listen ADDR` | `127.0.0.1:8099`. |
| `--hosts a,b` | None: host names the runner reaches it by, such as a compose service name. It always answers requests sent to an IP address or `localhost`. |
| `--redis URL` | `redis://127.0.0.1:6379`. `--redis-password-env NAME` names the variable that holds the password. |
| `--data-dir DIR` | `/var/bigbluebutton`. `""` serves no files. |
| `--watch a,b` | `recording/status,learning-dashboard`: directories under the data directory that are watched for files that come and go. |
| `--channels a,b` | The to-akka-apps, from-akka-apps, from-akka-apps-pres and from-bbb-web redis channels. |
| `--redis-keys a,b` | `meeting:*,recording:*,captions:*`: globs of the only keys it reads. |
| `--max-mb N`, `--max-age D` | 128 MiB and 2h: how much of what it saw it keeps. |

- **Test servers only.** The tap has no authentication: anyone who reaches
  its port can read whatever it can read. It never writes to redis or to
  files. It listens on 127.0.0.1 unless told otherwise. To reach it from
  another host, listen on a private interface or use an SSH tunnel
  (`ssh -L 8099:127.0.0.1:8099 server`). Never expose it on a public
  interface. It answers only requests addressed to an IP address,
  `localhost` or one of its `--hosts`; any other host name gets HTTP 421.
- **What it keeps:**
  - every message on its channels, indexed by name and meeting;
  - every file created under the watched directories, even one deleted at
    once. On a full install, record-and-playback's rap-starter removes
    recording markers as soon as they appear.

  Each entry gets a sequence number, and a case looks only at what came
  after its mark.
- **Trouble:**
  - a restarted tap is a new instance, so a case that took its mark before
    the restart ERRORs;
  - when the tap loses redis, it reconnects and notes the gap. A step that
    passes by not seeing something then ERRORs instead;
  - a watched directory that is removed is a gap too. The tap looks for it
    every second and watches it again once it is back, as it does for a
    directory that doesn't exist yet;
  - a directory it can't watch (no permission, or the system's inotify
    watch limit reached) is a gap, and `/info` lists it as a `watchError`.
    It tries a directory asked for with `--watch` again every second. An
    `fs` step that looks there and rests on not finding a file ERRORs
    meanwhile, since a file that came and went would be missed.
- **Files** are read from the data directory, never outside it: up to 1 MiB
  of each, and up to 100 files and 16 MiB in all per query. Watching them
  needs Linux (inotify); elsewhere the tap sees only files that still
  exist.

`GET /info` on the tap shows the channels it follows, whether it is
subscribed, its redis connection, the directories it watches and why it
can't watch any others. Before a run, the runner checks that the tap
answers; if it doesn't, the cases that use it ERROR at once.

## Checking cases

```sh
cd runner
go run ./cmd/bbb-conform validate --cases ../cases            # fixtures: ../fixtures
go run ./cmd/bbb-conform validate --cases testdata/cases      # the examples
```

`validate` prints `file:line: problem` for everything it finds and exits 1
if there is anything. It checks each case against the JSON Schema, then
checks templates, variable references, capture expressions, XPath, JSONPath
and regex syntax, fixture files, known tags and capabilities, and that case
IDs are unique. A fixture a case names must exist in the fixtures
directory, which needn't exist until one does.

With `--golden DIR` (e.g. `--golden ../golden/bbb-web`) it also checks the
recordings: every case with something to record has one, none is stale or
holds a secret, all come from one target, and none records a case that no
longer exists. `go test ./...` runs this on the suite's `cases/` and
`golden/bbb-web/`, and checks that every profile a case asks for is listed
in `targets/bbb-web.yaml`; it skips that test when `cases/` is missing,
unless `BBB_CONFORM_SUITE=1`. CI runs gofmt, `go vet` and these tests on
every pull request that touches the suite
(`.github/workflows/api-conformance-runner.yml`).

Editors with the YAML language server can check against the schema as you
type. Put this first in a case file under `cases/<area>/<group>/`:

```yaml
# yaml-language-server: $schema=../../../runner/schema/case.schema.json
```

The schema describes a case *after* variant expansion. If you put `${var}`
in a field that needs a number or one of a fixed set of values, the editor
may flag it even though `validate` accepts it.

## Comparing two targets: `diff`

```sh
go run ./cmd/bbb-conform diff --a ../targets/bbb-web.yaml --b ../targets/bbb-api.yaml \
    --cases ../cases --md ../out/diff.md --json ../out/diff.json
```

`diff` runs the cases on A, then on B, and compares every response step by
step, after normalizing both. It shows differences no check was written for:
missing or extra elements, tag casing, element order, status codes,
Content-Type, error formats.

- **Running:** each side gets its own `${uid}`s, since both targets may share
  one akka-apps. getMeetings lists every meeting on the server, but
  normalization keeps only the case's own (see below).
- **Checks don't stop a case** in diff mode, so later steps still run;
  captures still feed them. A capture that finds nothing does stop it.
- **What isn't compared:** teardown steps, and any step with `golden: off`.
- **Meeting props:** when both targets have a tap, the props in each
  create's `MeetingCreatedEvtMsg` are compared too, i.e. what akka-apps made
  of the create params. The report shows them as e.g. `step 1 (line 7),
  MeetingCreatedEvtMsg props`. This catches a param that one API drops or
  defaults differently. When only one target has a tap, there is a warning.
- **Errored cases:** a case that ERRORs on a side before anything differs is
  reported as errored, not identical: what came after wasn't compared.
- **Exit status:** 0, unless `--fail-on-diff` is given and a case differs,
  is one-sided or errored, or the run is interrupted.
- **Comparing two releases:** give two bbb-web targets, e.g. 3.0 and 4.0. The
  report lists what an integration written for one would see change on the
  other.

## The gap matrix: `gap`

```sh
go run ./cmd/bbb-conform run --target ../targets/bbb-web.yaml --expect ../expectations/bbb-web.yaml --json ../out/web.json
go run ./cmd/bbb-conform run --target ../targets/bbb-api.yaml --expect ../expectations/bbb-api.yaml --json ../out/api.json
go run ./cmd/bbb-conform gap --results ../out/web.json --results ../out/api.json \
    --md ../out/gap-matrix.md --html ../out/gap-matrix.html
```

Cases tagged `triage` only record what bbb-web answers, so they pass on every
target. Add `--exclude-tags triage` to these runs, or the matrix counts them
as passes.

`gap` combines `run` reports, one per target, into one grid:
- a summary of passes per endpoint and target;
- a table per endpoint with each case's outcome per target, with links to
  expected-failure issues;
- the reasons for every outcome other than PASS.

The HTML is one self-contained page.

### Normalized responses

A response becomes ordered lines: `status`, the headers that matter
(Content-Type, Cache-Control, Access-Control-*, Set-Cookie with its value
masked, plus any listed in `masks.yaml`), `location`, then one
`path "value"` line per XML element, attribute or JSON value. JSON numbers,
booleans and null aren't quoted.

Values that change from run to run are masked:

| Field (any depth, also as a query param inside URLs) | Becomes |
|---|---|
| createTime, startTime, endTime, GraphQL's registeredOn and registeredAt, and the bus's timestamp and createdTime | `<time>`, for digits or an ISO-8601 time; 0 too, since startTime turns from 0 to a time a moment after create |
| createDate, and the bus's createdDate | `<date>` in Java's `Date.toString()` format, otherwise its shape (digits as 9) |
| internalMeetingID, meeting_id, parentMeetingID, recordID, GraphQL's meetingId and parentMeetingId, and the bus's intId, parentId, internalId and breakoutMeetingId | `<sha1(meetingID)>-<time>`, naming the sent param whose SHA-1 it is, or `<sha1(?)>` |
| userID, user_id, internalUserID, existingUserID, and GraphQL's userId and extId | `w_<id>` |
| attendeePW, moderatorPW, voiceBridge, and the bus's moderatorPass, viewerPass, voiceConf and telVoice | `<random>`, unless the case sent that value |
| session and auth tokens, checksum, JSESSIONID, and the token in a learning-dashboard file's path | `<token>` |
| stuns TURN username and password | `<expiry>:…` and `<token>` |
| a redis key's `ttl`, when it has one | `<set>` (-1, no expiry, and -2, missing, stay) |

After masking:
- the case's `${uid}`, the target's base URLs and its API prefix are replaced
  by placeholders, and so is the websocket form of a base URL
  (`wss://host` for `https://host`), as `${wsBaseUrl}`. `record` warns when a
  recording still names the server's host anywhere, since it would then hold
  only on that server;
- internal meeting IDs inside other strings, such as redis key names and
  file paths, become `<sha1(meetingID)>-<time>` too;
- getMeetings entries of other cases are dropped, and a list left with none
  reads like an empty one. getMeetings' `noMeetings` messageKey and message
  are dropped too, since they depend on whether any other case has a meeting:
  check them with `expect`, which sees the raw response;
- lists whose order isn't defined are sorted: meetings, recordings, metadata,
  attendees, STUN and TURN servers.

What a `presence`, `graphql`, `bus`, `fs` or `redis` step returns is a JSON
document, not a response: it becomes the document's lines alone, normalized
the same way.

`masks.yaml`, next to the cases directory, adds rules to the built-in ones:
`masks`, `unordered`, `scope`, `drop` (removes the lines a path names, only
those with `value` if it is given) and `headers`. Only a mask can override a
built-in rule, for the same field; the others only add, so the built-in
`noMeetings` drop can't be turned off. The suite's `masks.yaml` masks the
missing-checksum message bbb-web picks at random, and the version
endpoint's `bbbVersion` and `html5PluginSdkVersion`, which change with each
release.

## Recording what a server answers: `record`

Most cases need no hand-written `expect`: each step is compared with a
reviewed recording of what bbb-web answered. `record` makes the recordings.

```sh
go run ./cmd/bbb-conform record --target ../targets/bbb-web.yaml --cases ../cases
```

- **Where:** `--out DIR`, by default `golden/<target name>` next to the cases
  directory, one file per case: `<endpoint>/<case ID>.txt`. Cases are chosen
  with `run`'s options.
- **Twice:** every case runs `--passes` times (default 2), each time with its
  own `${uid}`. A step whose normalized answer differs between passes is
  UNSTABLE and isn't written: add a mask to `masks.yaml` and record again.
  Copies of a case may run at the same time, so a case that other cases
  disturb is UNSTABLE too: tag it `serial`.
  Hand-written checks don't stop a case, so every step is recorded.
- **Outcomes,** one per case:

  | Outcome | Written | When |
  |---|---|---|
  | NEW, CHANGED, UNCHANGED | yes; an unchanged file isn't touched | every pass answered alike |
  | UNSTABLE | no | the answers or the outcome differ between passes |
  | INCOMPLETE | no | a step wasn't reached, e.g. after a capture found nothing |
  | SECRET | no | an answer holds the salt or a secret var: report it privately |
  | ERROR, SKIP | no | as in `run` |

  When a hand-written `expect` fails, the recording is still written and the
  failure is shown: decide whether the case or the server is wrong. In a
  `defect` case that is expected; a defect case that passes is flagged.
- **Leftovers:** recordings whose case no longer exists are listed, never
  deleted.
- **Exit status:** 1 if a case is UNSTABLE, INCOMPLETE, SECRET or ERROR, or
  an `expect` outside a defect case failed; otherwise 0.

**Checking against recordings:** `run --golden golden/bbb-web` compares each
`compare` step's normalized answer with its recording, before the step's
`expect`. Each line that differs fails the step, e.g.
`recording /response/returncode: expected "SUCCESS", got "FAILED"`. bbb-api
runs against bbb-web's recordings, so its gaps show up the same way. A case
with something to compare and no recording, or with a stale one, is an ERROR,
and sends nothing.

**Reviewing:** `review --golden golden/bbb-web` shows each recording beside
its case: ID, title, class, file and the case itself. `--since REV` (a git
revision, e.g. `HEAD` before committing or the target branch of a pull
request) shows only the recordings added, changed or removed since then,
changed ones as a diff, section by section. `--id` narrows it down, and
`--html FILE` also writes it as one page.

Record from the server CI runs against, so recordings hold its
configuration rather than a developer's. A recording is reviewed like code
before it is committed, and never edited by hand: change the case or
`masks.yaml` and record again.

### Recording files

```
# Recorded by bbb-conform record. Review it with bbb-conform review before committing.
case create.side-effects.recorded
target bbb-web

== step 1: call create
status 200
header Cache-Control no-cache
header Content-Type text/xml;charset=utf-8
body xml
/response/returncode "SUCCESS"
/response/meetingID "${uid}"
...

== step 3: redis meeting:info:${intId}
$.key "meeting:info:<sha1(meetingID)>-<time>"
$.ttl -1
$.type "hash"
$.value.color "blue"
...
```

- **Sections:** one per step that takes `golden` and isn't `off`, numbered
  like the steps in reports (`wait` steps count) and named after what the
  step does, e.g. `call create`, `presence join as ann`, `graphql query
  Me as ann`, `bus MeetingCreatedEvtMsg` or `fs <path>`. `(document)` marks
  a step that is recorded but not compared.
- **The lines** are the normalized response (see
  [Normalized responses](#normalized-responses)).
- **Stale:** a case's sections follow from the case alone. When the case
  changes so that they no longer match, record it again.

## Case format

Keys, step types and their meanings are stable: they won't change
incompatibly. Template functions, matchers, capture forms and target
variables may still be added.

### A case

```yaml
id: create.duplicate.same-passwords
title: Re-creating with identical passwords returns duplicateWarning
endpoint: create
class: compat
tags: [ci]
requires: [akka]
steps:
  - call: create
    params: {meetingID: "${uid}", name: Dup test, attendeePW: ap, moderatorPW: mp}
    expect: {returncode: SUCCESS}
    capture: {createTime: /response/createTime}
  - call: create
    params: {meetingID: "${uid}", name: Dup test, attendeePW: ap, moderatorPW: mp}
    expect:
      messageKey: duplicateWarning
      xpath:
        /response/createTime: "${createTime}"
teardown:
  - call: end
    params: {meetingID: "${uid}"}
    ignoreResult: true
    eventually: {within: 2s, every: 100ms, until: {messageKey: notFound}}
```

One case per file. A case that creates a meeting ends it in its teardown,
like this. bbb-web answers an `end` that reaches akka-apps before the
meeting's create with SUCCESS, but the meeting goes on running (seen
about once in ten when the two are sent back to back). So the teardown
sends `end` until bbb-web no longer knows the meeting, which takes one or
two tries. On a target with no `end`, such as bbb-api today, it gives up
after 2s with a warning.

| Key | Meaning |
|---|---|
| `id` | `<endpoint>.<area>.<scenario>`, and it must start with `endpoint`. Unique and stable: reports and the gap matrix key on it. |
| `title` | One line saying what the case shows. |
| `endpoint` | The endpoint the case is about. |
| `class` | `contract` (documented or relied-on behaviour), `compat` (a bbb-web quirk clients may depend on) or `defect` (asserts the *correct* behaviour that bbb-web gets wrong). |
| `tags` | Any of `ci`, `slow`, `disruptive`, `full-stack`, `presence`, `conversion`, `serial`, `triage`. `triage` marks behaviour still to be classified as contract, compat or defect: until then each of its steps (outside teardown) must say `golden: document` or `off`, which `validate` checks. |
| `requires` | Capabilities the target must declare, or the case is skipped: `akka`, `presence`, `recordings-fs`, `callbacks`, `presentation-conversion`, `bus`, `fs`, `redis`, `clamav`, `full-stack`. Step types add their own: `presence` and `graphql` add `presence`; `bus`, `fs` and `redis` add themselves; `sink` adds `callbacks`. |
| `profile` | A named config overlay the target must run with, e.g. one with short timeouts. |
| `variants` | See below. |
| `defs` | Ignored. A place to define YAML anchors. |
| `steps` | Run in order; the case stops at the first failure. |
| `teardown` | Always runs, even after a failure. Its failures are reported as warnings. |

### Variants

A variant turns one file into several cases, each with one change from the
baseline. Its ID is appended to the case's: `create.validation.name-length-257`.

```yaml
id: create.validation.name-length
...
variants:
  - {id: "1", vars: {len: 1, returncode: FAILED}}
  - {id: "256", vars: {len: 256, returncode: SUCCESS}}
  - {id: missing, vars: {len: null}}       # null removes what holds it
steps:
  - call: create
    params:
      meetingID: "${uid}"
      name: '${repeat("n", len)}'
    expect:
      returncode: ${returncode}
```

- `vars` are substituted when the file loads, before the case is checked,
  so a variant can set any field, including `method` or a number.
- An unquoted `${var}` takes the YAML type of its value (`count: ${n}`
  becomes a number); a quoted one stays a string.
- A var whose value is `null` removes the mapping entry or list item that is
  exactly `${var}`. That's how a variant leaves a param out. Using a null var
  anywhere else is an error.
- A variant can also set `profile` and `class` (replacing the case's) and
  `requires` and `tags` (added to the case's).

### Anchors

YAML anchors and merge keys work within a file. Keys written next to a `<<`
win over merged ones, and merged keys land where the `<<` is:

```yaml
defs:
  meeting: &meeting {meetingID: "${uid}", name: Meta}
steps:
  - call: create
    params:
      <<: *meeting
      meta_Color: blue        # sent as meetingID, name, meta_Color
```

### Steps

Each step has exactly one step-type key.

| Step type | Shape | Runs |
|---|---|---|
| `call`, `route`, `url` | An HTTP request; see below. | yes |
| `wait` | A duration: `wait: 500ms`. | yes |
| `presence` | `{action: join\|leave\|disconnect\|reconnect, as: <user>, args\|joinUrl\|sessionToken, timeout}`: a headless user; see [Users](#users-presence-and-graphql). `expect: {jsonpath}`. | yes |
| `graphql` | `{as: <user>, query, variables, timeout}`, run as a user `presence` joined. `expect: {jsonpath, errors}`, `eventually`. | yes |
| `bus` | `{name, channel, meetingId, within}`: a message on the redis bus. `expect: {jsonpath, absent, count}`. See [Side effects](#side-effects-bus-fs-and-redis). | yes |
| `fs` | `{path, within}`: a file under the server's data directory; `path` may be a glob. `expect: {exists, absent, contents, jsonpath}`. | yes |
| `redis` | `{key, within}`: a redis key. `expect: {exists, absent, hash, members, ttl}`. | yes |
| `sink` | `{key, within}`: a callback the sink received. `expect: {absent, count, method, path, query, headers}`. The callback URL the case gives bbb-web sets how the sink answers. | not yet |
| `env` | `{action: stop\|start\|restart\|reset, service}`. | not yet |

- A case that uses a step type that isn't implemented yet is skipped as
  `unimplemented:<type>`. This is decided before any step runs.
- Every step that observes something takes `expect`, `capture` and `golden`.

#### Users: `presence` and `graphql`

A `presence` user joins a meeting the way the HTML5 client does: over
bbb-graphql-middleware's websocket (the target's `graphqlUrl`), with the
JSESSIONID the join set. Targets that can do this declare the `presence`
capability; `presence` and `graphql` steps need it.

```yaml
- presence: {action: join, as: ann, args: {meetingID: "${uid}", fullName: Ann, role: MODERATOR}}
  capture: {annId: $.userId}
- presence: {action: join, as: bob, joinUrl: "${joinUrl}"}         # e.g. from getJoinUrl
- call: join                                                       # a join with its own headers
  client: eve
  params: {meetingID: "${uid}", fullName: Eve, redirect: "false"}
  headers: {User-Agent: Integration/1.0}
  capture: {eveToken: /response/session_token}
- presence: {action: join, as: eve, sessionToken: "${eveToken}"}
```

- **Joining:** a user's first `join` takes exactly one of `args` (join
  params, signed like a call step's), `joinUrl`, or `sessionToken` (the
  session a `call` step with `client: <as>` began: they share cookies).
  The user then joins the meeting, and `join` waits until their in-meeting
  queries are answered. `timeout` defaults to 30s.
- **Guests:** a guest who must wait for approval is left waiting: the step
  passes and shows `guestStatus: WAIT`. A later `join` on the same user,
  with no source, waits for the approval and joins.
- **Other actions:** `leave` logs the user out, like the client's Leave
  button; for a user who isn't in the meeting, such as a guest still
  waiting, it only closes the connection, since the server ignores their
  leave. `disconnect` drops the connection, like a closed tab: the user is
  removed about 10 to 20 seconds later, unless they `reconnect`.
- **The result** is the user's state from `user_current`: `userId`, `extId`,
  `name`, `role`, `isModerator`, `guest`, `guestStatus`, `joined`,
  `loggedOut`, `ejected`, `ejectReasonCode`, `joinErrorCode`,
  `joinErrorMessage`, and the `sessionToken`. A failed join stops the case.
- **Connections close** when the case ends, whatever happened in it.

A `graphql` step runs one operation as a user who joined:

```yaml
- graphql:
    as: ann
    query: "mutation SetPresenter($id: String!) { userSetPresenter(userId: $id) }"
    variables: {id: "${bobId}"}
- graphql: {as: bob, query: "query Me { user_current { presenter } }"}
  eventually: {within: 10s, until: {jsonpath: {$.data.user_current[0].presenter: "true"}}}
```

- **The query** holds one named operation (the name is sent with it), and
  takes values from `variables`, never from templates in the query.
- **Mutations** must have the shape `mutation Name($a: T!) { action(arg:
  $a) }`, with every argument a variable that `variables` gives: that is
  what bbb-graphql-middleware routes correctly. It takes an alias for the
  action's name, and passes a literal argument on as text. A mutation's `true` only means it
  was sent on: check what it did with a later query, with `eventually`
  (every 500ms by default, at least 300ms).
- **While a user isn't in the meeting** (before they join, or after they
  leave, are removed or are denied), the middleware answers only a few
  queries (`userCurrentSubscription`, `getGuestLobbyInfo`, ...) and drops
  the rest without an answer; the runner refuses to send them, with an
  ERROR. To join again after `leave`, join as a new user (another `as`).
- **The result** is GraphQL's `{data, errors}`. Errors fail the step unless
  `expect.errors` is given; it is matched against each error's message.
  When the server closes the connection or doesn't answer, the result holds
  that as an error.
- **A subscription** is read as a query: its first answer.

The actions other cases need, with their signatures (from
`bbb-graphql-server/metadata/actions.graphql`); most need a moderator, and
`presentationRequestUploadToken` the presenter. `presence` steps send
`userJoinMeeting` and `userLeaveMeeting` themselves.

| Action | Arguments |
|---|---|
| `userSetPresenter` | `userId: String!` |
| `userSetRole` | `userId: String!, role: String!` (MODERATOR or VIEWER) |
| `userSetLocked` | `userId: String!, locked: Boolean!` |
| `userEjectFromMeeting` | `userId: String!, banUser: Boolean!` |
| `guestUsersSubmitApprovalStatus` | `guests: [GuestUserApprovalStatus]!`, each `{guest: <userId>, status: ALLOW\|DENY}` |
| `guestUsersSetPolicy` | `guestPolicy: String!` |
| `meetingLockSettingsSetProps` | `disableCam, disableMic, disablePrivChat, disablePubChat, disableNotes, hideUserList, lockOnJoin, lockOnJoinConfigurable, hideViewersCursor, hideViewersAnnotation: Boolean!, presenterPolicy: String!`, all of them every time |
| `meetingRecordingSetStatus` | `recording: Boolean!` |
| `breakoutRoomCreate` | `record, captureNotes, captureSlides, sendInviteToModerators, inheritLockSettings: Boolean!, durationInSeconds: Int!, rooms: [BreakoutRoom]!` |
| `presentationRequestUploadToken` | `podId: String!` (DEFAULT_PRESENTATION_POD), `filename: String!, uploadTemporaryId: String!` |
| `chatSendMessage` | `chatId: String!` (MAIN-PUBLIC-GROUP-CHAT), `chatMessageInMarkdownFormat: String!`; optional `replyToMessageId: String`, `metadata: json` |

#### Side effects: `bus`, `fs` and `redis`

These steps check what a call did outside its answer, through the target's
[tap](#the-tap-tap):
- `bus`: what bbb-web and akka-apps said on the redis bus;
- `redis`: the keys bbb-web wrote for the recording scripts;
- `fs`: the files written under the data directory.

```yaml
- call: create
  params: {meetingID: "${uid}", name: Props, record: "true", muteOnStart: "true", meta_Color: blue}
  capture: {intId: /response/internalMeetingID}
- bus: {name: MeetingCreatedEvtMsg, meetingId: "${intId}", within: 5s}
  expect:
    jsonpath: {$.core.body.props.voiceProp.muteOnStart: "true"}
  capture: {voiceConf: $.core.body.props.voiceProp.voiceConf}
- redis: {key: "meeting:info:${intId}", within: 5s}
  expect: {hash: {color: blue}, ttl: "-1"}
- call: end
  params: {meetingID: "${uid}"}
- fs: {path: "recording/status/recorded/${intId}.done", within: 5s}
- bus: {name: MeetingCreatedEvtMsg, meetingId: "${intId}", within: 500ms}
  expect: {count: 1}                     # the meeting was created once
```

- **The window:** a case with a `bus` or `fs` step takes a mark from the tap
  before its first step. Each such step looks at everything since that mark,
  for up to `within` after the step starts. So it sees what an earlier step
  caused, even if that happened before the step began.
  - `within` is required for `bus`, and for any `absent` step. Without
    it, an `fs` or `redis` step looks once.
  - `fs` and `redis` steps look every 250ms, and a last time at the end of
    the window. A `redis` step reads the key as it is then.
- **What matches:** these keys narrow what counts as a match:
  - `jsonpath`, for all three, on the step's document;
  - `contents`, for `fs`;
  - `hash`, `members` (the exact set) and `ttl`, for `redis`.

  How the step uses the matches:
  - by default, it passes at the first match;
  - with `absent: true`, it passes if nothing matches during the whole
    window, so it always takes the whole window;
  - with `count` (bus), it checks how many messages matched by the end of
    the window;
  - with `exists: false` (fs, redis), it passes once the file or key is
    gone.
- **`meetingId`** is an internal meeting ID: capture it from create's
  `internalMeetingID`.
  - A bus step needs one unless the case is tagged `serial`, so that other
    cases' messages can't match. For the same reason, an `fs` path needs a
    template, normally the meeting's internal ID, unless the case is
    tagged `serial`.
  - An `fs` step considers the files that match now, whenever they were
    written, as well as those that appeared since the mark.
  - The tap finds a message's meeting wherever the message keeps it: its
    header, its routing, or its body (`meetingId`, `props.meetingProp.intId`,
    `meetingInfo.internalId`, `recordId` or `room.breakoutMeetingId`).
- **The documents** that `jsonpath`, `capture` and recordings see:
  - bus: the message as published, plus `channel`, or `null` when none
    matched;
  - fs: `{path, found, contents}`, with contents parsed when they are JSON.
    A file that appeared and is gone again counts as found, without
    contents, unless the step checks its contents;
  - redis: `{key, type, ttl, value}`. `ttl` is -1 for no expiry and -2 for a
    missing key. `value` is an object for a hash, a sorted list for a set, a
    list, or a string.
- **Errors:**
  - When the tap may have missed something during the window (it lost redis
    or file events), a step whose outcome rests on not seeing something
    ERRORs. So does an `fs` step like that whose path is under a directory
    the tap was asked to watch but can't. Elsewhere the tap doesn't watch,
    so only the files there now count.
  - So does a step whose window the tap no longer holds (raise `--max-mb`),
    or whose tap was restarted during the case.
- **Paths** are relative to the data directory and can't contain `..`.

#### HTTP requests

```yaml
- call: join                         # or route: + pathParams:, or url:
  method: GET                        # GET (default), POST, PUT, DELETE, HEAD
  sign: sha256                       # see Signing
  params: {meetingID: "${uid}", fullName: Ann, role: moderator}
  headers: {Accept: null, X-Forwarded-For: 203.0.113.7}
  client: ann
  expect: {status: 302}
  capture: {sessionToken: location:query.sessionToken}
```

| Key | Meaning |
|---|---|
| `call` | An API call name, sent to the target's API prefix. `""` is the version endpoint. |
| `route`, `pathParams` | A non-API route (presentation, connection, textTrack), mapped per target. |
| `url` | An absolute URL sent as it is, e.g. a link getJoinUrl returned. |
| `method` | A HEAD response has no body, so a HEAD step can only check `status`, `headers` and `redirect`, and capture headers. |
| `params` | Query parameters, in the order written. |
| `raw_query` | The query string exactly as written, instead of `params`. |
| `headers` | Extra request headers. `null` removes a default header: the runner sends `Accept: */*` and `User-Agent: bbb-conform/<version>`. It speaks HTTP/1.1 and never asks for compression. |
| `body` | See Bodies. |
| `client` | A named cookie jar, for cases with several users. Each case starts with fresh jars. |
| `followRedirects` | Default `false`: a redirect is the response. |
| `timeout` | Per-request timeout; default 30s. |
| `ignoreResult` | Don't fail on this step, typically in teardown. |
| `eventually` | `{within, every, until}`: repeat the request every `every` (default 1s) until `until` passes, or fail after `within`. `every` must be shorter than `within`. Each attempt gets the step's `timeout`, cut to what is left of `within` (at least 250ms), so a server too slow for that ERRORs. `expect` then checks the final response. |

#### Signing

The checksum is `hash(callName + query + salt)` over the exact query string
sent, without the checksum itself. Body params are never signed, as in
bbb-web.

- `sign` is a scalar (`sha1`, `sha256`, `sha384`, `sha512`, or a mode other
  than `valid`, which is the default anyway) or a map `{alg, mode, position,
  call}`:
  - `mode`:
    - `valid`;
    - `uppercase`;
    - `bad`: the right length, but the wrong digest;
    - `duplicate`: the checksum is sent twice;
    - `wrong-length`: the valid checksum minus its last hex digit, a length
      no algorithm has;
    - `reencode`: signed over the query with each `+` (an encoded space)
      written as `%20`, then sent with `+`. The params are the same; the
      string isn't. The query needs a param value with a space;
    - `none`.
  - `position`: `last` (default), `first` or `middle`. `middle` needs at
  least two other params, or the step ERRORs; with no params at all, the
  checksum is the whole query whatever the position.
  - `call`: sign as this call name instead of the step's own, e.g. a
    getMeetingInfo request carrying isMeetingRunning's checksum.
- The default is the target's `defaultSign` (sha256) for API calls. It's
  `none` for `url` and `route` steps, the version endpoint and the session-token
  calls (stuns, signOut, getJoinUrl, learningDashboard).
- With `raw_query`, the checksum is added to the string as written. For
  anything stranger, use `sign: none` and build the checksum with
  `${checksum(...)}`.

#### Bodies

Exactly one of:

| Key | Sent as |
|---|---|
| `xml` | The string, as `application/xml`. |
| `xmlFile` | A file under `fixtures/`; its contents are templated. |
| `form` | `application/x-www-form-urlencoded`. |
| `json` | Any YAML value as JSON, with its strings templated. |
| `raw` | The string, with no Content-Type unless `contentType` sets one. |
| `multipart` | `{fields, files: [{field, path \| content, filename, contentType}]}`; `path` is under `fixtures/`. |

Plus `contentType` (overrides the default) and `chunked: true` (no
Content-Length). Set Content-Type either here or in `headers`, not both.

### Checking responses: `expect`

| Key | Checks |
|---|---|
| `status` | The HTTP status: a number, or a matcher. |
| `headers` | Header name (any case) → matcher. A header sent several times passes if any value matches. |
| `format` | `xml`, `json` or `text`. A response that doesn't parse as its format fails. |
| `returncode`, `messageKey`, `message` | From `/response/*` in XML, `$.response.*` in JSON, or the top level of JSON that has no `response` object (stuns). |
| `xpath` | XPath 1.0 → matcher. |
| `jsonpath` | JSONPath (RFC 9535) → matcher. |
| `body` | The whole body as text. |
| `redirect` | `{host, path, query: {name: matcher}}`, from the parsed Location header. |
| `schema` | A response schema under `fixtures/` (skipped until response schemas exist). |

**Matchers.** A plain value means "equals", compared as text, and the path
must select exactly one node. Anything else is a map with one key:

```yaml
/response/returncode: SUCCESS
/response/createTime: {type: int}            # int or bool
/response/moderatorPW: {exists: true}
/response/parentMeetingID: {absent: true}
/response/voiceBridge: {regex: '^[0-9]{5}$'}  # RE2 syntax
/response/attendees/attendee: {count: 2}
/response/message: {contains: unknown}
/response/messageKey: {oneOf: [idNotUnique, duplicateWarning]}
```

### Capturing values: `capture`

`name: expression` stores a value for later steps as `${name}`.

| Expression | Value |
|---|---|
| `/xpath`, `$.jsonpath` | The selected node's text (the first, if several). |
| `header:<Name>` | A response header. |
| `cookie:<name>` | A cookie the response set. |
| `location:host`, `location:path`, `location:query.<key>` | Parts of the Location header. |
| `status` | The HTTP status. |

Steps other than HTTP requests capture with JSONPath. A capture that finds
nothing fails the step.

### Templates

Any string can contain `${...}`.

- **Variables:**
  - `${uid}`: unique per case per run, valid as a meetingID;
  - `${salt}`: redacted from reports;
  - `${baseUrl}`, `${sinkUrl}`, `${fixtureUrl}`;
  - `${target.<name>}`: from the target file's `vars`, where an entry marked
    `secret` is redacted;
  - captures from earlier steps and variant vars.

  A reference to anything else is an error.
- **Functions:**
  - `repeat(s, n)`;
  - `urlencode(s)`;
  - `base64File(path)`, a file under `fixtures/`;
  - `checksum(alg, call, query)`, a lowercase hex digest of call + query + salt.

  Arguments are `"strings"`, integers, variables or nested calls.
- **Escaping:** `$${` is a literal `${`.

In YAML flow style (`{...}` and `[...]`), quote any value that contains
`${...}`: there the braces are YAML syntax.

### Record mode: `golden`

`golden` on a step says how record mode treats its output:
- `compare`: recorded, and compared with the recording;
- `document`: recorded, but not compared. A `defect` case asserts the
  correct behaviour with `expect`; its recording shows what the server does
  today. It also suits a step whose body is incidental, such as the error page
  of a 404, with `expect` pinning what matters;
- `off`: neither.

Defaults: `off` in teardown and in steps with `ignoreResult`, whose answers
may vary by design; `document` in `defect` cases; otherwise `compare`.

## Public-repo rule

Anything found while writing cases that could be exploited must not appear
in case names, comments, expectations, recordings or PRs. Report it through
the repository's private security advisory (see `CLAUDE.md` at the repository
root), and keep the case neutral: state the invariant only.
