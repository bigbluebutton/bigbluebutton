// Package review shows recordings beside the cases they record, so a
// reviewer can check each answer against what the case says it is about.
package review

import (
	"bytes"
	"errors"
	"fmt"
	"html/template"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/golden"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
)

// Entry is one recording to review.
type Entry struct {
	ID     string
	Status string // recorded | missing | orphaned, or with Since: new | changed | removed
	Case   *spec.Case
	Source string   // the case's file
	Lines  []string // the recording, or with Since its diff against that revision
}

// Review is what to review in a recordings directory.
type Review struct {
	Dir     string
	Since   string // a git revision, or "" to show every recording
	Entries []Entry

	sources map[string]string // case files read so far; variants share one
}

// Build lists the recordings under dir of the cases whose IDs match (all
// when match is nil), beside the cases. With since, only those added,
// changed or removed since that git revision, each changed one as a diff.
func Build(dir string, cases []*spec.Case, match func(id string) bool, since string) (*Review, error) {
	if match == nil {
		match = func(string) bool { return true }
	}
	files, err := golden.List(dir)
	if err != nil {
		return nil, err
	}
	byID := map[string]*spec.Case{}
	for _, c := range cases {
		byID[c.ID] = c
	}
	rv := &Review{Dir: dir, Since: since, sources: map[string]string{}}
	if since == "" {
		for _, c := range cases {
			if !match(c.ID) {
				continue
			}
			e := Entry{ID: c.ID, Case: c, Status: "missing"}
			if name, ok := files[c.ID]; ok {
				data, err := os.ReadFile(name)
				if err != nil {
					return nil, err
				}
				e.Status, e.Lines = "recorded", splitLines(string(data))
			} else if len(golden.Sections(c)) == 0 {
				continue // nothing to record
			}
			rv.Entries = append(rv.Entries, rv.withSource(e))
		}
		for _, id := range sortedKeys(files) {
			if byID[id] == nil && match(id) {
				data, err := os.ReadFile(files[id])
				if err != nil {
					return nil, err
				}
				rv.Entries = append(rv.Entries, Entry{ID: id, Status: "orphaned", Lines: splitLines(string(data))})
			}
		}
		return rv, nil
	}

	if _, err := git(dir, "rev-parse", "--verify", "--quiet", since+"^{commit}"); err != nil {
		return nil, fmt.Errorf("%s is not a revision of the repository holding %s", since, dir)
	}
	listed, err := git(dir, "ls-tree", "-r", "--name-only", since, ".")
	if err != nil {
		return nil, err
	}
	before := map[string]string{} // case ID -> path relative to dir
	for _, p := range splitLines(string(listed)) {
		if strings.HasSuffix(p, ".txt") {
			before[strings.TrimSuffix(filepath.Base(p), ".txt")] = p
		}
	}
	ids := map[string]string{}
	for id := range files {
		ids[id] = ""
	}
	for id := range before {
		ids[id] = ""
	}
	for _, id := range sortedKeys(ids) {
		if !match(id) {
			continue
		}
		var now, then string
		if name, ok := files[id]; ok {
			data, err := os.ReadFile(name)
			if err != nil {
				return nil, err
			}
			now = string(data)
		}
		if p, ok := before[id]; ok {
			data, err := git(dir, "show", since+":./"+filepath.ToSlash(p))
			if err != nil {
				return nil, err
			}
			then = string(data)
		}
		e := Entry{ID: id, Case: byID[id]}
		switch {
		case then == now:
			continue
		case then == "":
			e.Status, e.Lines = "new", splitLines(now)
		case now == "":
			e.Status = "removed"
		default:
			e.Status, e.Lines = "changed", diff(then, now)
		}
		rv.Entries = append(rv.Entries, rv.withSource(e))
	}
	return rv, nil
}

func sortedKeys(m map[string]string) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func (rv *Review) withSource(e Entry) Entry {
	if e.Case == nil {
		return e
	}
	src, ok := rv.sources[e.Case.File]
	if !ok {
		if data, err := os.ReadFile(e.Case.File); err == nil {
			src = string(data)
		}
		rv.sources[e.Case.File] = src
	}
	e.Source = src
	return e
}

// diff compares two versions of a recording section by section, each
// section's changes under its header.
func diff(then, now string) []string {
	parse := func(s string) (head []string, secs map[string][]string, order []string) {
		secs = map[string][]string{}
		cur := ""
		for _, l := range splitLines(s) {
			switch {
			case strings.HasPrefix(l, "== "):
				cur = l
				order = append(order, l)
			case cur == "":
				head = append(head, l)
			case l != "":
				secs[cur] = append(secs[cur], l)
			}
		}
		return head, secs, order
	}
	headA, a, orderA := parse(then)
	headB, b, orderB := parse(now)
	out := golden.Lines(headA, headB)
	seen := map[string]bool{}
	for _, title := range append(orderB, orderA...) {
		if seen[title] {
			continue
		}
		seen[title] = true
		sa, okA := a[title]
		sb, okB := b[title]
		switch {
		case !okA && !contains(orderA, title):
			out = append(out, "+ "+title)
			for _, l := range sb {
				out = append(out, "+ "+l)
			}
		case !okB && !contains(orderB, title):
			out = append(out, "- "+title)
			for _, l := range sa {
				out = append(out, "- "+l)
			}
		default:
			if h := golden.Lines(sa, sb); h != nil {
				out = append(out, "  "+title)
				out = append(out, h...)
			}
		}
	}
	return out
}

func contains(list []string, s string) bool {
	for _, x := range list {
		if x == s {
			return true
		}
	}
	return false
}

func splitLines(s string) []string {
	s = strings.ReplaceAll(s, "\r\n", "\n")
	if s = strings.TrimSuffix(s, "\n"); s == "" {
		return nil
	}
	return strings.Split(s, "\n")
}

func git(dir string, args ...string) ([]byte, error) {
	cmd := exec.Command("git", append([]string{"-C", dir}, args...)...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			return nil, fmt.Errorf("git %s: %s", strings.Join(args, " "), strings.TrimSpace(stderr.String()))
		}
		return nil, fmt.Errorf("git: %w", err)
	}
	return out, nil
}

// WriteConsole writes each entry: what it is, its case, then the recording
// or its diff.
func (rv *Review) WriteConsole(w io.Writer) {
	counts := map[string]int{}
	for _, e := range rv.Entries {
		counts[e.Status]++
		fmt.Fprintf(w, "== %s (%s)\n", e.ID, e.Status)
		if e.Case != nil {
			fmt.Fprintf(w, "   %s [%s], %s:%d\n", e.Case.Title, e.Case.Class, e.Case.File, e.Case.Line)
		} else {
			fmt.Fprintf(w, "   no longer a case\n")
		}
		for _, l := range e.Lines {
			fmt.Fprintln(w, strings.TrimRight("   "+l, " "))
		}
		fmt.Fprintln(w)
	}
	var parts []string
	for _, s := range []string{"recorded", "missing", "orphaned", "new", "changed", "removed"} {
		if counts[s] > 0 {
			parts = append(parts, fmt.Sprintf("%d %s", counts[s], s))
		}
	}
	if len(parts) == 0 {
		parts = append(parts, "nothing to review")
	}
	what := rv.Dir
	if rv.Since != "" {
		what += " since " + rv.Since
	}
	fmt.Fprintf(w, "%s: %s\n", what, strings.Join(parts, ", "))
}

// line is one line of a recording or diff, with how to show it.
type line struct {
	Class, Text string
}

// Shown is the entry's lines as the page shows them: diff lines and section
// headers marked.
func (e Entry) Shown() []line {
	out := make([]line, len(e.Lines))
	for i, l := range e.Lines {
		class := ""
		switch {
		case strings.HasPrefix(l, "== "), strings.HasPrefix(l, "  == "):
			class = "head"
		case e.Status == "changed" && strings.HasPrefix(l, "- "):
			class = "del"
		case e.Status == "changed" && strings.HasPrefix(l, "+ "):
			class = "add"
		}
		out[i] = line{class, l}
	}
	return out
}

var page = template.Must(template.New("review").Parse(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Recording review</title>
<style>
:root { --bg: #fff; --fg: #1d2129; --muted: #5f6672; --line: #d7dae0; --code: #f5f6f8;
  --add: #dff3e4; --del: #fbe0de; --head: #e8ecf5; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #16181d; --fg: #e6e8eb; --muted: #a0a6b0; --line: #343842; --code: #1e2127;
    --add: #1d3b27; --del: #4a2321; --head: #262b38; }
}
body { background: var(--bg); color: var(--fg); font: 14px/1.45 system-ui, sans-serif; margin: 0; padding: 16px; }
h1 { font-size: 20px; } h2 { font-size: 16px; margin: 28px 0 4px; word-break: break-all; }
p.meta { color: var(--muted); margin: 0 0 8px; }
.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; }
pre { background: var(--code); border: 1px solid var(--line); margin: 0; padding: 8px; overflow-x: auto;
  font: 12px/1.5 ui-monospace, monospace; }
pre span { display: block; white-space: pre; }
.add { background: var(--add); } .del { background: var(--del); } .head { background: var(--head); font-weight: 600; }
.status { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--muted); margin-left: 6px; }
</style>
</head>
<body>
<h1>Recordings in {{.Dir}}{{if .Since}} since {{.Since}}{{end}}</h1>
{{if not .Entries}}<p>Nothing to review.</p>{{end}}
{{range .Entries}}
<h2>{{.ID}}<span class="status">{{.Status}}</span></h2>
{{if .Case}}<p class="meta">{{.Case.Title}} · {{.Case.Class}} · {{.Case.File}}:{{.Case.Line}}</p>{{else}}<p class="meta">No longer a case.</p>{{end}}
<div class="pair">
<pre>{{.Source}}</pre>
<pre>{{range .Shown}}<span class="{{.Class}}">{{.Text}}</span>{{else}}<span>(nothing)</span>{{end}}</pre>
</div>
{{end}}
</body>
</html>
`))

// WriteHTML writes one self-contained page: inline CSS, no scripts.
func (rv *Review) WriteHTML(w io.Writer) error {
	return page.Execute(w, rv)
}
