# Shared entrypoint helper

`entrypoint-lib.sh` is sourced by every image entrypoint (`<component>/docker/entrypoint.sh`).
It implements the common pattern once, so each entrypoint only lists what is specific to
its component.

## The pattern

```
1. validate   bbb_require, bbb_require_secret,     missing/placeholder/malformed value -> exit 1,
              bbb_require_match                    naming the variable
2. derive     bbb_default, bbb_feature_enabled     plain bash: URLs, flags from BBB_FEATURES
3. render     bbb_render (envsubst), yq strenv(),  write config to $(bbb_path <bare-metal path>)
              bbb_write_shell_vars
4. merge      bbb_merge_yaml (yq)                  Tier 3 override file, if mounted
5. exec       bbb_exec <command...>                PID 1 is the service; signals reach it
```

Native mechanisms come first: if the component reads env (node-config, Hasura, HOCON
`${?VAR}`, `LIVEKIT_*`), the entrypoint only exports variables and renders nothing.

## Example entrypoint

Illustrative: it combines steps from several components. `EXAMPLE_*` names, the template
directory and the patterns are placeholders, not part of the configuration contract.

```bash
#!/usr/bin/env bash
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh

bbb_init "$@"
set -- "${BBB_ARGS[@]}"

# 1. validate (pass names, never "$VALUES")
bbb_require BBB_DOMAIN BBB_FEATURES
bbb_require_secret TURN_SECRET LIVEKIT_API_KEY LIVEKIT_API_SECRET
bbb_require_match BBB_DOMAIN '[A-Za-z0-9.-]+'                 # illustrative pattern
bbb_default RECORDING_RETENTION_DAYS 14
bbb_require_match RECORDING_RETENTION_DAYS '[0-9]+'

# 2. derive
if bbb_feature_enabled recording; then EXAMPLE_DISABLE_RECORDING=false; else EXAMPLE_DISABLE_RECORDING=true; fi

# 3. render: assign the destination first, so a bbb_path error stops the entrypoint
dest="$(bbb_path /etc/bigbluebutton/turn-stun-servers.xml)"
bbb_render --xml --mode 0640 /usr/local/share/bbb/templates/turn-stun-servers.xml "$dest"

dest="$(bbb_path /etc/default/bigbluebutton-cron-config)"     # sourced by a shell script
bbb_write_shell_vars "$dest" RECORDING_RETENTION_DAYS

# 4. merge (secret-bearing output: explicit mode)
dest="$(bbb_path /run/livekit-server/livekit.yaml)"
bbb_merge_yaml --mode 0600 /usr/share/livekit-server/livekit.yaml /etc/bigbluebutton/livekit.yaml "$dest"
export LIVEKIT_API_KEY
yq -i '.webhook.api_key = strenv(LIVEKIT_API_KEY)' "$dest"

# 5. exec
bbb_exec "$@"
```

`bbb_path` is for **outputs** only. Inputs (templates, image defaults, mounted Tier 3 files)
are read from their real paths, also in render-only mode.

Always assign `dest="$(bbb_path ...)"` on its own line. Inside an argument,
`bbb_render T "$(bbb_path ...)"`, a failing `bbb_path` does not stop the script (`set -e`
does not apply to command substitutions in arguments). The helper then refuses the empty
destination, but the first error message is the one that explains the cause.

## Functions

| Function | Does | Fails (exit 1) when |
|---|---|---|
| `bbb_require NAME...` | checks each variable is set and non-empty | a variable is unset or empty; the message names it |
| `bbb_require_secret NAME...` | `bbb_require`, then rejects known upstream placeholders (`BBB_SECRET_PLACEHOLDERS`: `changeme secret devkey LIVEKIT_KEY LIVEKIT_SECRET ClueCon`, case-insensitive). An entrypoint may append its own: `BBB_SECRET_PLACEHOLDERS+=(...)` | unset, empty or placeholder; the value is never printed |
| `bbb_require_match NAME ERE` | the whole value must match the extended regular expression (the helper anchors it as `^(ERE)$`) | unset, or no full match; names the variable, never the value |
| `bbb_default NAME VALUE` | sets NAME to VALUE if unset or empty, and exports it | wrong number of arguments |
| `bbb_feature_enabled NAME` | returns 0 if NAME is an element of comma-separated `BBB_FEATURES` (exact match, spaces ignored), else 1 | — (use it in `if`) |
| `bbb_init [--render-only DIR] [ARGS...]` | selects the mode; puts the remaining arguments in the array `BBB_ARGS`. DIR is made absolute and normalized (lexically, like `realpath -m`) | `--render-only` without DIR, or DIR resolves to `/` |
| `bbb_is_render_only` | returns 0 in render-only mode | — |
| `bbb_path /ABS/PATH` | prints the path, prefixed with DIR in render-only mode | path not absolute, or has a `..` component |
| `bbb_render [--mode M] [--xml] TEMPLATE DEST` | substitutes project variables, writes DEST atomically. `--xml` escapes `& < > " '` in every substituted value | template missing; a used variable is unset (all missing names listed); a value contains CR or LF; an unbraced `$NAME` of a used variable; a bash-set variable (`${RANDOM}`, `${SECONDS}`, `${BASHPID}`, `${UID}`, ...) |
| `bbb_write_shell_vars [--mode M] DEST NAME...` | writes one `NAME='value'` line per variable (POSIX single quoting), for files that a shell sources | a NAME is unset |
| `bbb_merge_yaml [--mode M] BASE OVERRIDE DEST` | deep-merges OVERRIDE into BASE like upstream (`yq eval-all '. as $item ireduce ({}; . * $item)'`): maps merge, arrays and scalars are replaced, BASE key order is kept. Missing OVERRIDE: DEST = BASE | BASE missing; OVERRIDE is a dangling symlink, a directory, invalid YAML, not a mapping, or several documents; the message names the file |
| `bbb_exec CMD [ARGS...]` | `exec`s the command; in render-only mode exits 0 without starting it | no command |
| `bbb_log MESSAGE` | prints `<BBB_LOG_TAG>: MESSAGE` to stderr (tag default `entrypoint`) | — |
| `bbb_die MESSAGE` | `bbb_log "ERROR: ..."`, exit 1 | always |

All writing functions refuse an empty DEST, a DEST ending in `/`, and a DEST that is a
directory.

Also set after sourcing: `BBB_TEMPLATE_TOOL=envsubst`, `BBB_RENDER_ROOT` (render-only
directory or empty). yq is found in `PATH` (`yq`, then upstream's `yq-go`); there is no
environment override. Names starting with `_bbb_`/`_BBB_` are internal.

### Writing and file modes

Output goes to a `mktemp` file in the destination directory, renamed only on success. A failed
render or merge leaves an existing DEST untouched and no temporary file behind.

The file mode is chosen in this order:
1. `--mode M`, if given (octal, e.g. `0600`);
2. the mode of the existing DEST. A replaced file is never silently widened;
3. otherwise the umask default for new files (`0666` minus umask, usually `0644`).

Use `--mode 0600` (or `0640`) for files holding secrets. Do **not** set a global `umask 077`
in an entrypoint: `bbb_exec` passes it on to the service, and services that write to shared
volumes (e.g. `/var/bigbluebutton`) would create files that other containers cannot read. If
a umask is needed, scope it to a subshell, as upstream packaging does
(`bash -c "umask 077; ..."` in the livekit-server unit):

```bash
( umask 077; bbb_render "$tpl" "$dest" )    # errexit still stops the entrypoint on failure
```

### Logging

Messages contain variable names and file paths, never variable values or file contents. The
exception is yq's own parse error for an invalid override file (file, line and column), which
is passed through so admins can find the mistake. Two caller mistakes defeat this, so avoid
them:
- `set -x` in an entrypoint prints every expanded value.
- Passing a value instead of a name (`bbb_require "$TURN_SECRET"`) makes the value appear in
  the "not set" message.

## `--render-only`

`entrypoint.sh --render-only /out` runs validate, derive, render and merge, writes every
output below `/out` at its bare-metal path (`/out/etc/bigbluebutton/...`), and exits 0 at
`bbb_exec`. Golden-file tests and parity checks use it, with the project's fixed test values
(never real secrets). Same env → byte-identical output. Nothing in the helper adds
timestamps, neither envsubst nor yq does, and templates may not use the bash variables that
change per run.

`--render-only DIR` given as container arguments replaces the image's `CMD`, so `bbb_exec`
receives no command. Every entrypoint therefore sets its default command right
after `set -- "${BBB_ARGS[@]}"`, for example `[ "$#" -gt 0 ] || set -- livekit-server --config /run/livekit-server/livekit.yaml`.

Entrypoints must not have side effects outside `bbb_path` before `bbb_exec` (no `chown` of
volumes, no network calls), or must skip them when `bbb_is_render_only` is true.

## Templating rule

The project's single templating tool is **envsubst** (GNU gettext, package `gettext-base`):
a distribution package in every Debian/Ubuntu base, a few hundred kB, and no config file needs
logic inside a template.

- Only **braced upper-case names** are project variables: `${BBB_DOMAIN}`, `${TURN_SECRET}`.
- Everything else is copied unchanged: nginx `$host`, `$remote_addr`, lower-case `${x}`,
  HOCON `${?VAR}`, `${VAR:-default}`, `$$`. There is no escape for a literal
  `${UPPER_CASE}`.
- Every project variable a template uses must be set (it may be empty). Shell variables
  computed in the derive step need not be exported.
- Any upper-case name counts, including process variables: `${HOME}`, `${PATH}`, `${HOSTNAME}`
  take the container's values. Use project names. Variables that bash sets itself (`RANDOM`,
  `SECONDS`, `BASHPID`, `EPOCHSECONDS`, `UID`, `PPID`, ...) are refused.
- Do not write `$BBB_DOMAIN` without braces in a template that also uses `${BBB_DOMAIN}`; the
  helper refuses it, because envsubst would replace both forms.
- No logic in templates. Conditionals pick values in bash (derive) or pick whole files (render
  this fragment or not). nginx include directories make the second easy.

### Values

Substitution copies values verbatim, so values are checked before they reach a file:

- **Line breaks:** `bbb_render` refuses any value with CR or LF. Otherwise one value could add
  config lines (a second `securitySalt=`, a `no-auth` line in `turnserver.conf`).
- **Format:** validate values with `bbb_require_match` in step 1 wherever the target syntax
  could be broken by them, e.g. `;` or `}` in an nginx `server_name`, or `\` in a Java
  `.properties` value (Java interprets backslashes).
- **XML targets:** always `bbb_render --xml`. It escapes `& < > " '` in every value, which is
  correct inside element text and attribute values.
- **Shell fragments** (files a shell sources, e.g. `/etc/default/bigbluebutton-cron-config`):
  **never rendered from a template.** Use `bbb_write_shell_vars`, which quotes every value so
  that sourcing the file only assigns it. A rendered `days=${X}` with `X='7; rm -rf /'` would
  run the command.
- **YAML and JSON:** set values with yq, which quotes them correctly. Do not template them.
  Variables must be exported for `strenv()`:

  ```bash
  export LIVEKIT_API_KEY
  yq -i '.webhook.api_key = strenv(LIVEKIT_API_KEY)' "$dest"
  ```

The nginx image's own `/etc/nginx/templates` mechanism also uses envsubst, so templates
following this rule work there too (without the checks above).

## Installing the helper in an image

The helper is passed to image builds as a bake named context (`docker-bake.hcl`):

```hcl
target "web" {
  contexts = {
    entrypoint-lib = "./docker/lib"
  }
}
```

```dockerfile
COPY --from=entrypoint-lib entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
# envsubst: only images that render templates. No per-package version pin: the base image
# is pinned by digest, and the installed package versions are recorded at build time.
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext-base \
    && rm -rf /var/lib/apt/lists/*
COPY docker/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

Runtime requirements: bash ≥ 4.4, coreutils; `envsubst` for `bbb_render`; mikefarah/yq v4 for
`bbb_merge_yaml`. Install yq exactly as upstream pins it: version from
`build/packages-template/bbb-yq-go/build.sh`, verified against `bbb-yq-go.sha256sum`
(see `docker/tests/lib/Dockerfile`).

The helper also runs on Alpine once `bash` is added (`apk add bash`): it avoids GNU-only
tool options, and Alpine's `envsubst` (package `gettext-envsubst`) passes the same tests.
Images without bash (e.g. distroless) cannot use the helper; they use their component's native
env support only.

## Tests

```bash
docker/tests/lib/run.sh                     # docker if installed, else podman
CONTAINER_ENGINE=podman docker/tests/lib/run.sh
```

`run.sh` builds `docker/tests/lib/Dockerfile` (pinned ubuntu:24.04, envsubst, yq as upstream)
and runs:
- `test-entrypoint-lib.sh`: the interface contract. Do not change it to make the helper pass.
- `test-entrypoint-lib-extra.sh`: additional behaviour.
