// Package gap builds the gap matrix: every case against every target, from
// the JSON reports of their runs.
package gap

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"os"
	"sort"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
)

// Load reads JSON reports written by run --json.
func Load(paths []string) ([]*report.Run, error) {
	var runs []*report.Run
	for _, p := range paths {
		data, err := os.ReadFile(p)
		if err != nil {
			return nil, err
		}
		r := &report.Run{}
		if err := json.Unmarshal(data, r); err != nil {
			return nil, fmt.Errorf("%s: %w", p, err)
		}
		if r.Target == "" {
			return nil, fmt.Errorf("%s: not a bbb-conform run report", p)
		}
		runs = append(runs, r)
	}
	return runs, nil
}

// Matrix is the gap matrix.
type Matrix struct {
	Targets   []string
	Endpoints []Endpoint
}

// Endpoint groups the cases of one endpoint.
type Endpoint struct {
	Name    string
	Rows    []Row
	Summary []Summary // one per target
}

// Summary counts one target's passes on an endpoint.
type Summary struct{ Passed, Total int }

// Row is one case.
type Row struct {
	ID    string
	Cells []Cell // one per target
}

// Cell is a case's outcome on one target. Present is false when the run
// didn't include the case.
type Cell struct {
	Status  report.Status
	Reason  string
	Issue   string
	Present bool
}

// Build lays the runs out, endpoints and cases in name order.
func Build(runs []*report.Run) *Matrix {
	m := &Matrix{}
	type row struct {
		endpoint string
		cells    []Cell
	}
	rows := map[string]*row{}
	for i, r := range runs {
		m.Targets = append(m.Targets, r.Target)
		for _, c := range r.Cases {
			rw := rows[c.ID]
			if rw == nil {
				rw = &row{endpoint: c.Endpoint, cells: make([]Cell, len(runs))}
				rows[c.ID] = rw
			}
			cell := Cell{Status: c.Status, Reason: c.Reason, Present: true}
			if c.Expected != nil {
				cell.Issue = c.Expected.Issue
			}
			rw.cells[i] = cell
		}
	}
	byEndpoint := map[string][]string{}
	for id, rw := range rows {
		byEndpoint[rw.endpoint] = append(byEndpoint[rw.endpoint], id)
	}
	var names []string
	for e := range byEndpoint {
		names = append(names, e)
	}
	sort.Strings(names)
	for _, e := range names {
		ids := byEndpoint[e]
		sort.Strings(ids)
		ep := Endpoint{Name: e, Summary: make([]Summary, len(runs))}
		for _, id := range ids {
			cells := rows[id].cells
			ep.Rows = append(ep.Rows, Row{ID: id, Cells: cells})
			for i, c := range cells {
				if !c.Present {
					continue
				}
				ep.Summary[i].Total++
				if c.Status == report.Pass {
					ep.Summary[i].Passed++
				}
			}
		}
		m.Endpoints = append(m.Endpoints, ep)
	}
	return m
}

func (c Cell) label() string {
	if !c.Present {
		return "—"
	}
	return string(c.Status)
}

// WriteMarkdown writes one table per endpoint, with the reasons for every
// outcome other than PASS listed under it.
func (m *Matrix) WriteMarkdown(w io.Writer) error {
	fmt.Fprintf(w, "# Gap matrix\n\n| Endpoint | %s |\n|---|%s\n", strings.Join(m.Targets, " | "), strings.Repeat("---|", len(m.Targets)))
	for _, e := range m.Endpoints {
		var cells []string
		for _, s := range e.Summary {
			cells = append(cells, fmt.Sprintf("%d/%d", s.Passed, s.Total))
		}
		fmt.Fprintf(w, "| [%s](#%s) | %s |\n", e.Name, strings.ToLower(e.Name), strings.Join(cells, " | "))
	}
	for _, e := range m.Endpoints {
		fmt.Fprintf(w, "\n## %s\n\n| Case | %s |\n|---|%s\n", e.Name, strings.Join(m.Targets, " | "), strings.Repeat("---|", len(m.Targets)))
		var notes []string
		for _, r := range e.Rows {
			var cells []string
			for i, c := range r.Cells {
				label := c.label()
				if c.Issue != "" {
					label = fmt.Sprintf("[%s](%s)", label, mdURL(c.Issue))
				}
				cells = append(cells, label)
				if c.Present && c.Status != report.Pass && c.Reason != "" {
					notes = append(notes, fmt.Sprintf("- `%s` on %s: %s", r.ID, m.Targets[i], mdEscape(c.Reason)))
				}
			}
			fmt.Fprintf(w, "| `%s` | %s |\n", r.ID, strings.Join(cells, " | "))
		}
		if len(notes) > 0 {
			fmt.Fprintf(w, "\n%s\n", strings.Join(notes, "\n"))
		}
	}
	return nil
}

func mdEscape(s string) string {
	return strings.NewReplacer("|", `\|`, "\n", " ", "<", "&lt;", ">", "&gt;").Replace(s)
}

// mdURL percent-encodes what would end a Markdown link or a table cell.
func mdURL(s string) string {
	return strings.NewReplacer(" ", "%20", "(", "%28", ")", "%29", "|", "%7C", "<", "%3C", ">", "%3E", "\n", "").Replace(s)
}

var page = template.Must(template.New("gap").Parse(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gap matrix</title>
<style>
:root { --bg: #fff; --fg: #1d2129; --muted: #5f6672; --line: #d7dae0;
  --pass: #dff3e4; --fail: #fbe0de; --xfail: #fdf0d5; --skip: #eceef1; --missing: #fff; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #16181d; --fg: #e6e8eb; --muted: #a0a6b0; --line: #343842;
    --pass: #1d3b27; --fail: #4a2321; --xfail: #463717; --skip: #2a2d34; --missing: #16181d; }
}
body { background: var(--bg); color: var(--fg); font: 14px/1.45 system-ui, sans-serif; margin: 0; padding: 16px; }
h1 { font-size: 20px; } h2 { font-size: 16px; margin-top: 28px; }
.wrap { overflow-x: auto; }
table { border-collapse: collapse; min-width: 100%; }
th, td { border: 1px solid var(--line); padding: 4px 8px; text-align: left; vertical-align: top; }
th { color: var(--muted); font-weight: 600; }
td.case { font-family: ui-monospace, monospace; font-size: 13px; word-break: break-all; }
td.PASS { background: var(--pass); } td.FAIL, td.ERROR, td.XPASS { background: var(--fail); }
td.XFAIL { background: var(--xfail); } td.SKIP { background: var(--skip); } td.missing { background: var(--missing); color: var(--muted); }
td small { display: block; color: var(--muted); }
a { color: inherit; }
</style>
</head>
<body>
<h1>Gap matrix</h1>
<div class="wrap"><table>
<tr><th>Endpoint</th>{{range .Targets}}<th>{{.}}</th>{{end}}</tr>
{{range .Endpoints}}<tr><td><a href="#{{.Name}}">{{.Name}}</a></td>{{range .Summary}}<td>{{.Passed}}/{{.Total}}</td>{{end}}</tr>
{{end}}</table></div>
{{range .Endpoints}}{{$targets := $.Targets}}
<h2 id="{{.Name}}">{{.Name}}</h2>
<div class="wrap"><table>
<tr><th>Case</th>{{range $targets}}<th>{{.}}</th>{{end}}</tr>
{{range .Rows}}<tr><td class="case">{{.ID}}</td>{{range .Cells}}{{if .Present}}<td class="{{.Status}}" title="{{.Reason}}">{{if .Issue}}<a href="{{.Issue}}">{{.Status}}</a>{{else}}{{.Status}}{{end}}{{if and .Reason (ne .Status "PASS")}}<small>{{.Reason}}</small>{{end}}</td>{{else}}<td class="missing">—</td>{{end}}{{end}}</tr>
{{end}}</table></div>
{{end}}
</body>
</html>
`))

// WriteHTML writes one self-contained page: inline CSS, no scripts.
func (m *Matrix) WriteHTML(w io.Writer) error {
	return page.Execute(w, m)
}
