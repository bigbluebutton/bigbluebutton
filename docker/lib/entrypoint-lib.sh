# shellcheck shell=bash
#
# Shared helper for BigBlueButton image entrypoints.
#
# Sourced, never executed. Every entrypoint follows the same five steps:
#
#   validate  bbb_require / bbb_require_secret / bbb_require_match
#   derive    bbb_default, bbb_feature_enabled, plain bash
#   render    bbb_render (envsubst) or bbb_write_shell_vars into bbb_path <bare-metal path>
#   merge     bbb_merge_yaml (yq) with the Tier 3 override file, if mounted
#   exec      bbb_exec <command...>
#
# `bbb_init --render-only <dir>` runs steps 1-4 with every bbb_path below <dir> and makes
# bbb_exec exit 0 instead of starting the process (golden-file tests, parity checks).
#
# Works under `set -euo pipefail`. Messages go to stderr and name variables, never their
# values. See docker/lib/README.md.

# Variables below are read by the entrypoints that source this file.
# shellcheck disable=SC2034

# The project-wide templating tool. Templates use its syntax: ${NAME} only.
BBB_TEMPLATE_TOOL=envsubst

# Values shipped upstream as stand-ins for real credentials. bbb_require_secret rejects them.
# Entrypoints may append component-specific ones before validating.
BBB_SECRET_PLACEHOLDERS=(changeme secret devkey LIVEKIT_KEY LIVEKIT_SECRET ClueCon)

# Set by bbb_init: render-only root (empty = normal mode) and the arguments left after the
# mode option.
BBB_RENDER_ROOT=""
BBB_ARGS=()

# Internal: the yq binary, resolved from PATH on first use (never taken from the environment).
_BBB_YQ=""

# Bash sets these itself; most change on every expansion. A template must not use them:
# the output would not be deterministic, or would describe the shell rather than the config.
_BBB_SHELL_VARS=" BASHOPTS BASHPID BASH_ARGV0 BASH_COMMAND BASH_EXECUTION_STRING BASH_LINENO
 BASH_SUBSHELL BASH_VERSION EPOCHREALTIME EPOCHSECONDS EUID GROUPS HISTCMD HOSTTYPE LINENO
 MACHTYPE OPTARG OPTIND OSTYPE PIPESTATUS PPID RANDOM SECONDS SHELLOPTS SHLVL SRANDOM UID "

# --- logging -----------------------------------------------------------------------------

# Log to stderr. Callers pass variable names and file paths, never variable values.
bbb_log() {
    printf '%s: %s\n' "${BBB_LOG_TAG:-entrypoint}" "$*" >&2
}

# Log an error and exit 1.
bbb_die() {
    bbb_log "ERROR: $*"
    exit 1
}

# The offending string is not printed: a caller passing "$SECRET" instead of SECRET would
# otherwise log the secret.
_bbb_check_name() {
    [[ "$1" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || bbb_die "invalid variable name passed to ${FUNCNAME[1]}"
}

# --- validate ----------------------------------------------------------------------------

# bbb_require NAME... — each variable must be set and non-empty.
bbb_require() {
    local var_name
    for var_name in "$@"; do
        _bbb_check_name "$var_name"
        [ -n "${!var_name:-}" ] || bbb_die "required variable $var_name is not set or empty"
    done
}

# bbb_require_secret NAME... — like bbb_require, and the value must not be a known upstream
# placeholder (compared case-insensitively).
bbb_require_secret() {
    local var_name placeholder
    for var_name in "$@"; do
        bbb_require "$var_name"
        for placeholder in "${BBB_SECRET_PLACEHOLDERS[@]}"; do
            if [ "${!var_name,,}" = "${placeholder,,}" ]; then
                bbb_die "$var_name is set to a known upstream placeholder; set a generated secret"
            fi
        done
    done
}

# bbb_require_match NAME ERE — NAME must be set and its whole value must match the extended
# regular expression ERE (anchored at both ends by the helper).
bbb_require_match() {
    [ "$#" -eq 2 ] || bbb_die "usage: bbb_require_match NAME ERE"
    _bbb_check_name "$1"
    [ -n "${!1+set}" ] || bbb_die "variable $1 is not set"
    local pattern="^($2)\$"
    [[ "${!1}" =~ $pattern ]] || bbb_die "value of $1 does not have the expected format"
}

# --- derive ------------------------------------------------------------------------------

# bbb_default NAME VALUE — set and export NAME to VALUE if it is unset or empty.
bbb_default() {
    [ "$#" -eq 2 ] || bbb_die "usage: bbb_default NAME VALUE"
    _bbb_check_name "$1"
    if [ -z "${!1:-}" ]; then
        printf -v "$1" '%s' "$2"
    fi
    export "${1?}"
}

# bbb_feature_enabled NAME — true if NAME is an element of the comma-separated BBB_FEATURES.
bbb_feature_enabled() {
    if [ "$#" -ne 1 ] || [ -z "$1" ]; then bbb_die "usage: bbb_feature_enabled NAME"; fi
    local features="${BBB_FEATURES:-}"
    features="${features// /}"
    case ",$features," in
        *",$1,"*) return 0 ;;
        *) return 1 ;;
    esac
}

# --- mode and paths ----------------------------------------------------------------------

# bbb_init [--render-only DIR] [ARGS...] — select the mode. The remaining arguments are left
# in the array BBB_ARGS, so an entrypoint can do:  bbb_init "$@"; set -- "${BBB_ARGS[@]}"
# DIR is made absolute and normalized; it must not resolve to /.
bbb_init() {
    BBB_RENDER_ROOT=""
    if [ "${1:-}" = "--render-only" ]; then
        [ -n "${2:-}" ] || bbb_die "--render-only needs a directory"
        local root
        _bbb_normalize_path "$2"
        root="$_BBB_NORMALIZED"
        [ "$root" != "/" ] || bbb_die "--render-only directory must not be /"
        mkdir -p "$root" || bbb_die "cannot create render-only directory $root"
        BBB_RENDER_ROOT="$root"
        shift 2
    fi
    BBB_ARGS=("$@")
}

# _bbb_normalize_path PATH — set _BBB_NORMALIZED to PATH made absolute (against $PWD) with
# empty, `.` and `..` components resolved lexically, like `realpath -m` without following
# symlinks. Pure bash: BusyBox realpath (Alpine) has no -m.
_bbb_normalize_path() {
    local path="$1" part
    local -a parts=() out=()
    case "$path" in
        /*) ;;
        *) path="$PWD/$path" ;;
    esac
    IFS=/ read -r -a parts <<<"$path"
    for part in "${parts[@]}"; do
        case "$part" in
            "" | .) ;;
            ..) if [ "${#out[@]}" -gt 0 ]; then unset 'out[${#out[@]}-1]'; fi ;;
            *) out+=("$part") ;;
        esac
    done
    if [ "${#out[@]}" -eq 0 ]; then
        _BBB_NORMALIZED=/
    else
        _BBB_NORMALIZED="$(IFS=/; printf '/%s' "${out[*]}")"
    fi
}

# bbb_is_render_only — true in render-only mode.
bbb_is_render_only() {
    [ -n "$BBB_RENDER_ROOT" ]
}

# bbb_path ABSOLUTE_PATH — print where a config file goes: the path itself in normal mode,
# the path below the render-only directory in render-only mode. `..` components are refused,
# so a path cannot leave the render-only directory.
bbb_path() {
    [ "$#" -eq 1 ] || bbb_die "usage: bbb_path ABSOLUTE_PATH"
    case "$1" in
        /*) ;;
        *) bbb_die "bbb_path needs an absolute path: $1" ;;
    esac
    case "/$1/" in
        */../*) bbb_die "bbb_path does not accept '..' components: $1" ;;
    esac
    printf '%s\n' "$BBB_RENDER_ROOT$1"
}

# --- writing files -----------------------------------------------------------------------

_bbb_require_file() { # PATH DESCRIPTION
    if [ ! -f "$1" ] || [ ! -r "$1" ]; then bbb_die "$2 $1 not found or not readable"; fi
}

_bbb_check_dest() {
    case "$1" in
        "") bbb_die "${FUNCNAME[1]}: destination is empty (did bbb_path fail inside \$(...)?)" ;;
        */) bbb_die "${FUNCNAME[1]}: destination $1 ends in /" ;;
    esac
    if [ -d "$1" ]; then bbb_die "${FUNCNAME[1]}: destination $1 is a directory"; fi
}

_bbb_check_mode() {
    [[ "$1" =~ ^[0-7]{3,4}$ ]] || bbb_die "${FUNCNAME[1]}: --mode needs an octal mode such as 0600"
}

# _bbb_write DEST MODE COMMAND [ARGS...] — write the command's stdout to DEST atomically: a
# mktemp file in the destination directory, renamed only if the command succeeded.
# File mode: MODE if given; else the mode of an existing DEST (never widened); else the
# umask default for new files (0666 minus umask).
_bbb_write() {
    local dest_path="$1" mode="$2" dest_dir tmp_path
    shift 2
    _bbb_check_dest "$dest_path"
    dest_dir="$(dirname -- "$dest_path")"
    mkdir -p -- "$dest_dir" || bbb_die "cannot create directory $dest_dir"
    if [ -z "$mode" ]; then
        if [ -e "$dest_path" ]; then
            mode="$(stat -L -c %a -- "$dest_path")" || bbb_die "cannot read the mode of $dest_path"
        else
            mode="$(printf '%04o' "$(( 0666 & ~0$(umask) ))")"
        fi
    fi
    tmp_path="$(mktemp -- "$dest_dir/.$(basename -- "$dest_path").XXXXXX")" \
        || bbb_die "cannot create a temporary file in $dest_dir"
    if ! "$@" >"$tmp_path"; then
        rm -f -- "$tmp_path"
        return 1
    fi
    if ! chmod "$mode" -- "$tmp_path" || ! mv -f -- "$tmp_path" "$dest_path"; then
        rm -f -- "$tmp_path"
        bbb_die "cannot write $dest_path"
    fi
}

# --- render ------------------------------------------------------------------------------

# bbb_render [--mode MODE] [--xml] TEMPLATE DEST — substitute project variables in TEMPLATE,
# write DEST.
#
# Only braced upper-case names (${BBB_DOMAIN}) are project variables. Everything else,
# including nginx variables such as $host and HOCON ${?VAR}, is copied unchanged. Every
# project variable used by the template must be set (empty is allowed); otherwise nothing is
# written and the missing names are reported. Shell variables need not be exported.
#
# Values must not contain CR or LF (they would add lines to the output). --xml escapes
# & < > " ' in every substituted value, for XML targets. Never render shell fragments:
# use bbb_write_shell_vars.
bbb_render() {
    local mode="" xml=""
    while [ "$#" -gt 0 ]; do
        case "$1" in
            --mode) [ "$#" -ge 2 ] || bbb_die "bbb_render: --mode needs a value"
                    _bbb_check_mode "$2"; mode="$2"; shift 2 ;;
            --xml) xml=1; shift ;;
            --) shift; break ;;
            -*) bbb_die "bbb_render: unknown option $1" ;;
            *) break ;;
        esac
    done
    [ "$#" -eq 2 ] || bbb_die "usage: bbb_render [--mode MODE] [--xml] TEMPLATE DEST"
    local tpl_path="$1" dest_path="$2"
    _bbb_check_dest "$dest_path"
    _bbb_require_file "$tpl_path" template
    command -v envsubst >/dev/null 2>&1 || bbb_die "envsubst not found (install gettext-base)"

    local content rest var_name unbraced
    local braced='\$\{([A-Z][A-Z0-9_]*)\}'
    content="$(<"$tpl_path")"

    # Collect the project variable names used by the template, in order of appearance.
    local -A seen=()
    local names=()
    rest="$content"
    while [[ "$rest" =~ $braced ]]; do
        var_name="${BASH_REMATCH[1]}"
        rest="${rest#*"${BASH_REMATCH[0]}"}"
        if [ -z "${seen[$var_name]:-}" ]; then
            seen[$var_name]=1
            names+=("$var_name")
        fi
    done

    local missing=() line_break=$'[\r\n]'
    for var_name in "${names[@]}"; do
        case "$_BBB_SHELL_VARS" in
            *" $var_name "*) bbb_die "template $tpl_path uses \${$var_name}, which bash sets itself" ;;
        esac
        if [ -z "${!var_name+set}" ]; then
            missing+=("$var_name")
            continue
        fi
        if [[ "${!var_name}" =~ $line_break ]]; then
            bbb_die "value of $var_name contains a line break; refusing to render $tpl_path"
        fi
        # envsubst would also replace the unbraced form; refuse it so the rule stays simple.
        unbraced='\$'"$var_name"'([^A-Za-z0-9_]|$)'
        if [[ "$content" =~ $unbraced ]]; then
            bbb_die "template $tpl_path uses \$$var_name without braces; write \${$var_name}"
        fi
    done
    if [ "${#missing[@]}" -gt 0 ]; then
        bbb_die "template $tpl_path uses undefined variable(s): ${missing[*]}"
    fi

    if [ "${#names[@]}" -eq 0 ]; then
        _bbb_write "$dest_path" "$mode" cat -- "$tpl_path" || bbb_die "cannot write $dest_path"
    else
        _bbb_write "$dest_path" "$mode" _bbb_envsubst "$xml" "$tpl_path" "${names[@]}" \
            || bbb_die "rendering $tpl_path failed"
    fi
    bbb_log "rendered $dest_path"
}

# _bbb_envsubst XML TEMPLATE NAME... — envsubst restricted to the given names, values
# XML-escaped if XML is non-empty. Runs in a subshell, so exporting (and escaping) does not
# change the caller's variables.
_bbb_envsubst() (
    local xml="$1" tpl_path="$2" format="" var_name value
    shift 2
    for var_name in "$@"; do
        if [ -n "$xml" ]; then
            value="${!var_name}"
            # Quoted replacements: with bash 5.2 patsub_replacement, a bare & means "match".
            value="${value//&/"&amp;"}"
            value="${value//</"&lt;"}"
            value="${value//>/"&gt;"}"
            value="${value//\"/"&quot;"}"
            value="${value//\'/"&apos;"}"
            printf -v "$var_name" '%s' "$value"
        fi
        export "${var_name?}"
        format+="\${$var_name} "
    done
    envsubst "$format" <"$tpl_path"
)

# bbb_write_shell_vars [--mode MODE] DEST NAME... — write a file that a shell sources:
# one `NAME='value'` line per variable, single-quoted for POSIX sh, so no value is ever
# executed. Every NAME must be set (empty is allowed).
bbb_write_shell_vars() {
    local mode=""
    if [ "${1:-}" = "--mode" ]; then
        [ "$#" -ge 2 ] || bbb_die "bbb_write_shell_vars: --mode needs a value"
        _bbb_check_mode "$2"; mode="$2"; shift 2
    fi
    [ "$#" -ge 2 ] || bbb_die "usage: bbb_write_shell_vars [--mode MODE] DEST NAME..."
    local dest_path="$1" var_name
    shift
    _bbb_check_dest "$dest_path"
    for var_name in "$@"; do
        _bbb_check_name "$var_name"
        [ -n "${!var_name+set}" ] || bbb_die "variable $var_name is not set"
    done
    _bbb_write "$dest_path" "$mode" _bbb_shell_vars "$@" || bbb_die "cannot write $dest_path"
    bbb_log "wrote shell variables ($*) to $dest_path"
}

_bbb_shell_vars() {
    local var_name value
    for var_name in "$@"; do
        value="${!var_name}"
        value="${value//\'/\'\\\'\'}"
        printf "%s='%s'\n" "$var_name" "$value"
    done
}

# --- merge -------------------------------------------------------------------------------

# Resolve the yq binary once, from PATH, in the current shell (not in a command substitution,
# so a missing yq stops the entrypoint).
_bbb_find_yq() {
    if [ -n "$_BBB_YQ" ]; then return 0; fi
    if command -v yq >/dev/null 2>&1; then _BBB_YQ="$(command -v yq)"
    elif command -v yq-go >/dev/null 2>&1; then _BBB_YQ="$(command -v yq-go)" # upstream package name
    else bbb_die "yq (mikefarah/yq v4) not found in PATH"
    fi
}

_bbb_yq() {
    "$_BBB_YQ" "$@"
}

# bbb_merge_yaml [--mode MODE] BASE OVERRIDE DEST — deep-merge OVERRIDE into BASE and write
# DEST, the same way upstream packaging does (yq `. * $item`): maps merge, arrays and scalars
# are replaced, key order of BASE is kept. A missing OVERRIDE is not an error: DEST is a copy
# of BASE. An OVERRIDE that is a dangling symlink, not valid YAML, or not a single mapping is
# an error naming the file.
bbb_merge_yaml() {
    local mode=""
    if [ "${1:-}" = "--mode" ]; then
        [ "$#" -ge 2 ] || bbb_die "bbb_merge_yaml: --mode needs a value"
        _bbb_check_mode "$2"; mode="$2"; shift 2
    fi
    [ "$#" -eq 3 ] || bbb_die "usage: bbb_merge_yaml [--mode MODE] BASE OVERRIDE DEST"
    local base_path="$1" override_path="$2" dest_path="$3" kind
    _bbb_check_dest "$dest_path"
    _bbb_require_file "$base_path" "base file"
    _bbb_find_yq

    if [ -L "$override_path" ] && [ ! -e "$override_path" ]; then
        bbb_die "override file $override_path is a dangling symlink"
    fi
    if [ ! -e "$override_path" ]; then
        _bbb_write "$dest_path" "$mode" cat -- "$base_path" || bbb_die "cannot write $dest_path"
        bbb_log "no override $override_path; using $base_path"
        return 0
    fi
    if [ -d "$override_path" ]; then
        bbb_die "override file $override_path is a directory (a bind mount of a missing file?)"
    fi
    _bbb_require_file "$override_path" "override file"

    kind="$(_bbb_yq eval-all 'tag' "$override_path")" \
        || bbb_die "override file $override_path is not valid YAML"
    case "$kind" in
        "" | "!!map" | "!!null") ;;
        *) bbb_die "override file $override_path must contain a single YAML mapping" ;;
    esac

    # shellcheck disable=SC2016 # a yq expression, not shell
    _bbb_write "$dest_path" "$mode" _bbb_yq eval-all '. as $item ireduce ({}; . * $item)' "$base_path" "$override_path" \
        || bbb_die "merging $override_path into $base_path failed"
    bbb_log "merged $override_path into $dest_path"
}

# --- exec --------------------------------------------------------------------------------

# bbb_exec COMMAND [ARGS...] — replace the shell with the main process. In render-only mode,
# exit 0 instead: the configuration is written, nothing is started.
bbb_exec() {
    [ "$#" -gt 0 ] || bbb_die "usage: bbb_exec COMMAND [ARGS...]"
    if bbb_is_render_only; then
        bbb_log "render-only: configuration written below $BBB_RENDER_ROOT; process not started"
        exit 0
    fi
    exec "$@"
}
