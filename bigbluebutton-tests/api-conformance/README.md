# BBB API conformance suite

Black-box tests that pin down how the BigBlueButton HTTP API behaves, so that
bbb-web and its Go replacement, bbb-api, can be checked against the same
cases. Cases are declarative YAML; `bbb-conform` (in `runner/`) runs them.

**Status:** `bbb-conform` validates cases and runs HTTP steps (`call`, `url`
and `wait`). Cases that use the other step types, `route` steps or response
schemas are skipped until those are implemented.

```
runner/                  the bbb-conform Go module
  schema/case.schema.json  the case format, as JSON Schema
  testdata/cases/          worked examples of every feature
  testdata/smoke/          a quick check of a live server
cases/<area>/*.yaml      the suite's cases
fixtures/                files cases refer to (bodies, presentations, schemas)
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
| `--junit FILE`, `--json FILE` | Write reports. The JSON report has every request, response and check. |
| `-v` | List every failed check and warning on the console. |

Each case ends as one of:
- **PASS**;
- **FAIL**: the server's behaviour didn't match, which includes a response
  that doesn't parse and a capture that finds nothing;
- **ERROR**: the runner couldn't do what the case asked, e.g. the server is
  unreachable or a template didn't expand;
- **SKIP**, with the reason: a capability the target lacks, or something the
  runner can't do yet.

The exit status is 0 when nothing failed or errored, 1 when something did,
and 2 for a bad command line, target or case file. The salt and secret target
vars are replaced with `<salt>` and `<secret:name>` in everything the runner
writes.

### Target files

```yaml
name: bbb-web
baseUrl: https://bbb.example.com     # scheme and host only
apiPrefix: /bigbluebutton/api/       # the default; bbb-api uses /meeting-api/
saltEnv: BBB_SECRET                  # or salt: ...
tls: {caFile: dev-ca.crt}            # relative to this file; or insecureSkipVerify: true
capabilities: [akka]
defaultSign: sha256
sinkUrl: https://sink.example.com    # optional, for ${sinkUrl}
fixtureUrl: https://files.example.com
vars:
  turnSecret: {env: TURN_SECRET, secret: true}   # ${target.turnSecret}
```

Blank fields fall back to the variables the Playwright suite uses: `BBB_URL`
(e.g. `https://bbb-ci.test/bigbluebutton/`) and `BBB_SECRET`.

To smoke-test a server, point a target at it and run `--cases testdata/smoke`.

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
IDs are unique.

Editors with the YAML language server can check against the schema as you
type. Put this first in a case file:

```yaml
# yaml-language-server: $schema=../../runner/schema/case.schema.json
```

The schema describes a case *after* variant expansion. If you put `${var}`
in a field that needs a number or one of a fixed set of values, the editor
may flag it even though `validate` accepts it.

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
  - {call: end, params: {meetingID: "${uid}"}, ignoreResult: true}
```

One case per file.

| Key | Meaning |
|---|---|
| `id` | `<endpoint>.<area>.<scenario>`, and it must start with `endpoint`. Unique and stable: reports and the gap matrix key on it. |
| `title` | One line saying what the case shows. |
| `endpoint` | The endpoint the case is about. |
| `class` | `contract` (documented or relied-on behaviour), `compat` (a bbb-web quirk clients may depend on) or `defect` (asserts the *correct* behaviour that bbb-web gets wrong). |
| `tags` | Any of `ci`, `slow`, `disruptive`, `full-stack`, `presence`, `conversion`, `serial`. |
| `requires` | Capabilities the target must declare, or the case is skipped: `akka`, `presence`, `recordings-fs`, `callbacks`, `presentation-conversion`, `bus`, `fs`, `redis`, `clamav`, `s3`, `full-stack`. Step types add their own: `presence` and `graphql` add `presence`; `bus`, `fs` and `redis` add themselves; `sink` adds `callbacks`. |
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
| `presence` | `{action: join\|leave\|<action>, as: <user>, joinUrl, args}`: a headless user. | not yet |
| `graphql` | `{as: <user>, query, variables}`, run as a user `presence` joined. `expect: {jsonpath, errors}`. | not yet |
| `bus` | `{name, channel, meetingId, within}`: a redis message. `expect: {jsonpath, absent}`. | not yet |
| `fs` | `{path, within}`, relative to the target's data directory; `path` may be a glob. `expect: {exists, absent, contents, jsonpath}`. | not yet |
| `redis` | `{key, within}`. `expect: {exists, absent, hash, members, ttl}`. | not yet |
| `sink` | `{key, within}`: a callback the sink received. `expect: {absent, count, method, path, query, headers}`. The callback URL the case gives bbb-web sets how the sink answers. | not yet |
| `env` | `{action: stop\|start\|restart\|reset, service}`. | not yet |

- A case that uses a step type that isn't implemented yet is skipped as
  `unimplemented:<type>`. This is decided before any step runs.
- With `within`, `absent: true` means "never seen during the whole window".
- Every step that observes something takes `expect`, `capture` and `golden`.

#### HTTP requests

```yaml
- call: join                         # or route: + pathParams:, or url:
  method: GET                        # GET (default), POST, PUT, DELETE
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
| `params` | Query parameters, in the order written. |
| `raw_query` | The query string exactly as written, instead of `params`. |
| `headers` | Extra request headers. `null` removes a default header: the runner sends `Accept: */*` and `User-Agent: bbb-conform/<version>`. It speaks HTTP/1.1 and never asks for compression. |
| `body` | See Bodies. |
| `client` | A named cookie jar, for cases with several users. Each case starts with fresh jars. |
| `followRedirects` | Default `false`: a redirect is the response. |
| `timeout` | Per-request timeout; default 30s. |
| `ignoreResult` | Don't fail on this step, typically in teardown. |
| `eventually` | `{within, every, until}`: repeat the request every `every` (default 1s) until `until` passes, or fail after `within`. `expect` then checks the final response. |

#### Signing

The checksum is `hash(callName + query + salt)` over the exact query string
sent, without the checksum itself. Body params are never signed, as in
bbb-web.

- `sign` is a scalar (`sha1`, `sha256`, `sha384`, `sha512`, `none`, `bad`,
  `duplicate`, `uppercase`) or a map `{alg, mode, position}`:
  - `mode`: `valid`, `uppercase`, `bad` (right length, wrong digest),
    `duplicate` (sent twice) or `none`;
  - `position`: `last` (default), `first` or `middle`.
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

`golden: compare | document | off` on a step says how record mode (planned)
treats its output. Defaults: `off` in teardown, `document` in `defect`
cases, otherwise `compare`.

## Public-repo rule

Anything found while writing cases that could be exploited must not appear
in case names, comments, expectations, recordings or PRs. Report it through
the repository's private security advisory (see `CLAUDE.md` at the repository
root), and keep the case neutral: state the invariant only.
