#!/bin/bash
#
# Checks a BigBlueButton server for the problems that made earlier test runs unreliable.
# Run it as root on the server after the tests. Prints one PASS or FAIL line per check
# and exits with 1 if any check failed.
#
# Optional environment:
#   BBB_URL, BBB_SECRET   API endpoint and secret (default: from bbb-conf --secret)
#   BBB_WEB_LOG           bbb-web log to search (default: /var/log/bigbluebutton/bbb-web.log)
#   KERNEL_LOG            file to search instead of the kernel log of the current boot
#   BBB_USER              user whose manager (user@UID.service) the conversions need (default: bigbluebutton)
#   LIVEKIT_PROCESS       process whose threads are sampled (default: livekit-server)
#   THREAD_CPU_LIMIT      busiest thread allowed, in percent of one CPU (default: 90)
#   CPU_SAMPLE_SECONDS    length of the CPU sample (default: 5)
#   MEETING_WAIT_SECONDS  time running meetings get to end by themselves (default: 180)

set -u

BBB_WEB_LOG=${BBB_WEB_LOG:-/var/log/bigbluebutton/bbb-web.log}
BBB_USER=${BBB_USER:-bigbluebutton}
LIVEKIT_PROCESS=${LIVEKIT_PROCESS:-livekit-server}
THREAD_CPU_LIMIT=${THREAD_CPU_LIMIT:-90}
CPU_SAMPLE_SECONDS=${CPU_SAMPLE_SECONDS:-5}
MEETING_WAIT_SECONDS=${MEETING_WAIT_SECONDS:-180}

failures=0

pass() {
  echo "PASS  $1"
}

fail() {
  echo "FAIL  $1"
  failures=$((failures + 1))
}

details() {
  head -n "${1:-5}" | sed 's/^/        /'
}

if [ "$(id -u)" -ne 0 ]; then
  echo "$0: run as root" >&2
  exit 2
fi

# Prints "<thread id> <user+system clock ticks>" for every thread of the given processes.
thread_ticks() {
  local pid stat
  for pid in "$@"; do
    for stat in /proc/"$pid"/task/*/stat; do
      sed -E 's/^([0-9]+) \(.*\) /\1 /' "$stat" 2>/dev/null
    done
  done | awk '{ print $1, $13 + $14 }'
}

check_livekit_threads() {
  local name="no $LIVEKIT_PROCESS thread pinned near full CPU"
  local pids before after busy top_pct
  mapfile -t pids < <(pgrep -x "$LIVEKIT_PROCESS")
  if [ "${#pids[@]}" -eq 0 ]; then
    fail "$name: $LIVEKIT_PROCESS is not running"
    return
  fi
  before=$(thread_ticks "${pids[@]}")
  sleep "$CPU_SAMPLE_SECONDS"
  after=$(thread_ticks "${pids[@]}")
  busy=$(awk -v hz="$(getconf CLK_TCK)" -v secs="$CPU_SAMPLE_SECONDS" '
    NR == FNR { start[$1] = $2; next }
    ($1 in start) { printf "%d %.0f\n", $1, ($2 - start[$1]) * 100 / hz / secs }
  ' <(echo "$before") <(echo "$after") | sort -k2,2nr)
  top_pct=$(head -n 1 <<<"$busy" | cut -d ' ' -f 2)
  if [ "${top_pct:-0}" -ge "$THREAD_CPU_LIMIT" ]; then
    fail "$name: threads at or above ${THREAD_CPU_LIMIT}% of a CPU over ${CPU_SAMPLE_SECONDS} s"
    awk -v limit="$THREAD_CPU_LIMIT" '$2 >= limit { print "thread " $1 ": " $2 "%" }' <<<"$busy" | details 10
  else
    pass "$name: busiest thread ${top_pct:-0}% of a CPU over ${CPU_SAMPLE_SECONDS} s (limit ${THREAD_CPU_LIMIT}%)"
  fi
}

check_oom_kills() {
  local name="no OOM kill in the kernel log"
  local source log matches
  if [ -n "${KERNEL_LOG:-}" ]; then
    source=$KERNEL_LOG
    log=$(cat "$KERNEL_LOG")
  else
    source="kernel log of this boot"
    log=$(journalctl -k -b --no-pager -q 2>/dev/null || dmesg)
  fi
  matches=$(grep -E 'Out of memory|oom-kill|Killed process' <<<"$log")
  if [ -n "$matches" ]; then
    fail "$name: matching lines in $source: $(wc -l <<<"$matches")"
    details <<<"$matches"
  else
    pass "$name ($source)"
  fi
}

# bbb-web runs every conversion step through systemd-run --user, so it needs the user manager of
# bigbluebutton and its /run/user/UID. The packages start the manager (Wants= on bbb-web) but do not
# enable lingering, so a logind session as that user, e.g. an ssh login, stops the manager when it ends.
check_user_manager() {
  local name="user manager of $BBB_USER alive"
  local uid state linger
  if ! uid=$(id -u "$BBB_USER" 2>/dev/null); then
    fail "$name: no such user"
    return
  fi
  state=$(systemctl is-active "user@$uid.service" 2>/dev/null)
  linger=$(loginctl show-user "$BBB_USER" -p Linger --value 2>/dev/null)
  if [ "$state" != "active" ]; then
    fail "$name: user@$uid.service is ${state:-not loaded}, Linger=${linger:-no}"
  elif [ ! -d "/run/user/$uid" ]; then
    fail "$name: user@$uid.service is active but /run/user/$uid does not exist, Linger=${linger:-no}"
  else
    pass "$name: user@$uid.service active, /run/user/$uid exists, Linger=${linger:-no}"
  fi
}

# bbb-web logs determine_num_pages_failed for every presentation whose pages it cannot count, which the
# tests that upload damaged files cause on purpose; a conversion that failed because the user manager was
# gone is the line run-in-systemd.sh prints (before #24092: "Failed to connect to bus").
check_conversion_runtime() {
  local name="no conversion failed for lack of the user manager (bbb-web.log)"
  local matches total
  if [ ! -r "$BBB_WEB_LOG" ]; then
    fail "$name: cannot read $BBB_WEB_LOG"
    return
  fi
  matches=$(grep -E 'XDG_RUNTIME_DIR is not available|Failed to connect to bus' "$BBB_WEB_LOG")
  total=$(grep -c determine_num_pages_failed "$BBB_WEB_LOG")
  if [ -n "$matches" ]; then
    fail "$name: matching lines: $(wc -l <<<"$matches"), determine_num_pages_failed lines: $total"
    details 3 <<<"$matches"
  else
    pass "$name: determine_num_pages_failed lines: $total, none for a missing user manager"
  fi
}

# Prints "<meetingID> (<participants> participants)" for every running meeting in a getMeetings response.
running_meetings() {
  tr -d '\n' | sed 's#</meeting>#&\n#g' | grep '<running>true</running>' |
    sed -E 's#.*<meetingID>([^<]*)</meetingID>.*<participantCount>([0-9]*)</participantCount>.*#\1 (\2 participants)#'
}

check_meetings() {
  local name="no meeting left running"
  local url secret checksum response running deadline
  url=${BBB_URL:-}
  secret=${BBB_SECRET:-}
  if [ -z "$url" ] || [ -z "$secret" ]; then
    local conf
    conf=$(bbb-conf --secret 2>/dev/null)
    url=$(sed -n 's/^ *URL: //p' <<<"$conf")
    secret=$(sed -n 's/^ *Secret: //p' <<<"$conf")
  fi
  checksum=$(printf '%s' "getMeetings$secret" | sha256sum | cut -d ' ' -f 1)
  deadline=$((SECONDS + MEETING_WAIT_SECONDS))
  while :; do
    if ! response=$(curl -fsS --max-time 20 "${url%/}/api/getMeetings?checksum=$checksum"); then
      fail "$name: the getMeetings request failed"
      return
    fi
    if ! grep -q '<returncode>SUCCESS</returncode>' <<<"$response"; then
      fail "$name: getMeetings did not return SUCCESS"
      return
    fi
    running=$(running_meetings <<<"$response")
    if [ -z "$running" ] || [ "$SECONDS" -ge "$deadline" ]; then
      break
    fi
    sleep 10
  done
  if [ -n "$running" ]; then
    fail "$name: meetings still running after waiting ${MEETING_WAIT_SECONDS} s: $(wc -l <<<"$running")"
    details 10 <<<"$running"
  else
    pass "$name"
  fi
}

echo "Server health check on $(hostname) at $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
check_livekit_threads
check_oom_kills
check_user_manager
check_conversion_runtime
check_meetings

if [ "$failures" -gt 0 ]; then
  echo "$failures of 5 checks failed"
  exit 1
fi
echo "All 5 checks passed"
