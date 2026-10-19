# Configuration contract tools

`docker/config-contract.yaml` declares every environment variable of the container stack
(status: draft). The tools in this directory check it, generate files from it and compare it
with the code.

| Tool | Does |
|---|---|
| `validate.sh [--fixtures FILE] [CONTRACT]` | schema check (below); with `--fixtures`, every fixture value must match its variable's pattern |
| `generate.sh [--check]` | writes `.env.sample` and `docs/docs/administration/docker-configuration.md`; `--check` writes nothing and fails on any difference |
| `drift-check.sh [PATH...]` | reports variables used but not declared (`UNDECLARED`) and declared but not used (`UNUSED`) |

All three need bash ≥ 4.4, coreutils, diffutils, grep, sed, awk and mikefarah/yq v4 (`yq` or
upstream's `yq-go`, v4.53.2 as in `build/packages-template/bbb-yq-go/build.sh`). The runner
image has all of them:

```bash
docker/tests/contract/run.sh                                   # tests
docker/tests/contract/run.sh docker/contract/validate.sh       # any tool, repository read-only
docker/tests/contract/run.sh --write docker/contract/generate.sh   # regenerate the outputs
```

Exit codes: 0 ok, 1 findings (schema problems, drift, differences), 2 usage error.

## Changing the contract

1. Edit `docker/config-contract.yaml`.
2. `docker/contract/validate.sh` (and `--fixtures` with the project fixture list when a Tier 1
   variable or a pattern changed; a new secret needs a fixture value first).
3. `docker/contract/generate.sh`, commit the contract and both outputs together.
4. `docker/contract/drift-check.sh` once the images use the change.

## Schema

Top-level keys: `version` (1), `meta`, `variables`, `derived`, `internal`, `overrides`,
`features`, `decided`, `decisions_needed`. `variables` is required, the other lists may be
missing (empty). Unknown keys and fields are errors. Text fields (`description`, `notes`,
`formula`, `merge`, ...) are one line without tabs and with balanced backticks; use YAML `>-`
for long text. Every entry has `sources`: a list with at least one upstream citation
`path:lines @ sha` (optionally followed by ` — note`); entries starting with `UNVERIFIED` are
allowed in addition.

`status` (every entry): `draft` (agreed, not yet released), `pending-g2` / `pending-g3`
(depends on an open question in `decisions_needed`; no entry uses them any more).

### `variables` — what an admin may set

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | upper-case env name, unique; `BBB_*` global, `<SERVICE>_*` service-specific |
| `tier` | yes | `1` essential (in `.env.sample`), `2` advanced (optional, documented) |
| `required` | yes | `true`: images refuse to start without a non-empty value. A required variable has no default |
| `secret` | yes | `true`: never printed, never shown with a value in generated files; `default` must be `null`; `example` is `null` or a project fixture (`fixture…notreal…`) |
| `default` | yes | string used when unset or empty, or `null` (no default). Quote numbers and booleans |
| `pattern` | yes | extended regular expression the **whole** value must match (anchored as `^(ERE)$`, exactly like `bbb_require_match` in `docker/lib/entrypoint-lib.sh`). **Enforced** (decision `value-patterns` in `decided`): every entrypoint that reads the variable calls `bbb_require_match NAME '<pattern>'` and refuses to start on a mismatch; setup and preflight check the same patterns. Checked for non-empty values; whether empty is allowed is `required` |
| `setup` | no | how the setup container fills it: `generate` (random secret), `detect` (e.g. public IP), `ask`; omitted or `null`: setup leaves it alone. Tier 1 secrets must be `generate` |
| `description` | yes | one line for admins |
| `consumers` | yes | services that read the value (directly or derived) |
| `example` | yes | string matching `pattern`, or `null`. Must equal the fixture value when one exists |
| `status` | yes | see above |
| `sources` | yes | where each consumer reads it upstream |
| `notes` | no | one line, shown in the docs |

Booleans are the strings `true` / `false`; lists are comma-separated without spaces;
durations carry their unit in the name (`..._DAYS`).

### `derived` — computed by the images, never set by the admin

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | lower-case id |
| `formula` | yes | how the value is computed; every `${NAME}` must be a declared variable listed in `inputs` |
| `inputs` | yes | variables it depends on |
| `env` | no | env variable name the images (or `.env`) carry it in; counts as declared for the drift check |
| `env_file` | no | `true`: written into `.env.sample` as `env=formula` (e.g. `COMPOSE_PROFILES=${BBB_FEATURES}`) |
| `targets` | yes | `service: config key or env` it ends up in |
| `description`, `status`, `sources` | yes | |

### `internal` — fixed container wiring

Values the images or compose set so the services find each other (`REDIS_HOST=redis`, ...).
Fields, all required: `name` (env name, or `service: config key` for file-only wiring),
`consumer` (one service; `name` is unique per consumer), `value`, `description`, `status`,
`sources`. Upper-case names count as declared for the drift check. An internal name must not
also be a user variable.

### `overrides` — Tier 3 files

Fields: `component`, `path` (absolute bare-metal path, unique), `format`
(`properties xml hocon yaml json env ini nginx shell`), `merge` (how the file is applied, as
upstream and in the container), `support` (`supported`, `not-supported` — the bare-metal
mechanism does not exist in containers and the description says what replaces it — or
`pending`), `status`, `sources`; all required. Optional `env_precedence`: for components where
environment variables beat the file (node-config: bbb-webhooks, bbb-webrtc-sfu; decision
`env-vs-override-precedence` in `decided`), which settings the image passes as env and
therefore cannot be changed in the file.

### `features` — entries of `BBB_FEATURES`

Fields, all required: `name` (lower-case, unique, must be accepted by the `BBB_FEATURES`
pattern), `services` (what its Compose profile starts), `settings` (list of
`image: setting` the images derive from the feature; may be empty), `description`, `status`,
`sources` (at least one citation when `settings` is not empty; may be empty otherwise).

### `decided` — decisions taken

Fields: `id` (unique, also across `decisions_needed`), `date` (quoted `YYYY-MM-DD`), `choice`
(the option chosen), `decision` (one line: what was decided), `affects` (declared variables),
`related` (optional). A question moves here from `decisions_needed` once decided.

### `decisions_needed` — open questions for the human gate

Fields: `id` (lower-case words joined by `-`), `question`, `options` (at least two, each exactly
`{id, text}`), `recommendation`, `affects` (declared variable names; those carry status
`pending-g3`), `related` (optional list of references).

## Fixtures

`validate.sh --fixtures FILE` reads `KEY=value` lines (only the first fenced code block if the
file has one, so the project's fixture list can be passed as is). Each key must be a variable
or a derived `env` with `env_file: true`; the value must match the pattern (secrets: the value
is never printed), equal the variable's `example`, and every Tier 1 variable needs a fixture.

## Drift check

What is scanned by default (relative to the repository root): `docker-compose*.yml`,
`compose*.yml` (and `.yaml`) at the root, everything below `docker/` and `*/docker/`, and
`*/docker-entrypoint.sh`. Excluded: `docker/contract/`, `docker/tests/`, `docker/lib/` (the
helper's own names), the contract itself, `*.md`, Dockerfiles and `.dockerignore`. Paths given
on the command line are scanned as given, without exclusions; `UNUSED` is then relative to
those paths. Binary files are skipped.

What counts as a use, per file kind:

| File | Kind | Uses |
|---|---|---|
| `docker-compose*.y*ml`, `compose*.y*ml` | compose | `${NAME…}` and `$NAME`, any case (Compose interpolates both); `$$` is an escape and ignored |
| `*.sh` or a `#!…sh` first line | shell | `${NAME…}` and `$NAME` with upper-case names; names passed to `bbb_require`, `bbb_require_secret`, `bbb_require_match` (first argument), `bbb_default` (first argument), `bbb_write_shell_vars` (after `--mode M` and DEST); `strenv(NAME)` / `env(NAME)` in yq expressions |
| anything else | template | `${NAME}` and HOCON `${?NAME}` with upper-case names (the templating rule: only braced upper-case names are project variables) |

Lines whose first non-blank character is `#` are skipped in every kind.

A used name is **declared** if it is a variable, an upper-case `internal` name, or a derived
`env`. It is not reported either if it is in `drift-ignore.txt` (bash and process variables,
helper internals), or if a shell script of the same image scope assigns it — `NAME=` at the
start of a statement (also after `export`/`local`/`declare`/`readonly`/`typeset`, `;`, `&`,
`|`, `(`), `for NAME in`, `read … NAME`, `printf -v NAME`. The image scope is `docker/<name>/`
for files below `docker/`, else the first path component (`<component>/docker/…` and
`<component>/docker-entrypoint.sh` together); a root file is its own scope. This lets an
entrypoint derive a value that its templates use.

`UNUSED` lists variables with status `draft` that no scanned file uses. Pending variables are
never reported. `derived` and `internal` entries are not checked for use.

Limits (known false results):

- Quoting is not parsed: `'$NAME'` in single quotes and names inside heredocs count as uses;
  `#` after code on the same line is not treated as a comment.
- Only the first assignment of `A=1 B=2 cmd` counts as local; `env NAME=…` is not recognised.
- Variables a compose file passes with `env_file:` are invisible; the check prints a `NOTE`
  for every `env_file:` line (not a finding). Pass variables by name in `environment:`.
- Variables read by a program without appearing in a scanned file (Compose reading
  `COMPOSE_PROFILES` from `.env`, a service reading its native env such as
  `HASURA_GRAPHQL_ADMIN_SECRET`) are only visible where the compose file or entrypoint
  mentions them.
- Templates in other comment styles (`<!-- -->`, `//`, `/* */`) are scanned including their
  comments.
- Dockerfiles are not scanned; `ARG`/`ENV` there are build-time or image defaults.
