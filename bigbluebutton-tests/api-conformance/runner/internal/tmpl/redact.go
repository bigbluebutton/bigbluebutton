package tmpl

import (
	"bytes"
	"encoding/json"
	"encoding/xml"
	"net/url"
	"sort"
	"strings"
	"sync"
)

// Redactor hides secret values in anything the runner writes out. Labels
// should need no escaping in XML, JSON or URLs, like [salt], because the
// last pass runs over serialized reports.
type Redactor struct {
	mu      sync.Mutex
	secrets []secret
}

type secret struct{ value, label string }

// Add registers value, shown as label from now on, together with the forms
// it takes once encoded: in a query string or path, in a JSON string, and
// in XML text. Empty values are ignored.
func (r *Redactor) Add(label, value string) {
	if value == "" {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, v := range encodings(value) {
		dup := false
		for _, s := range r.secrets {
			if s.value == v {
				dup = true
				break
			}
		}
		if !dup {
			r.secrets = append(r.secrets, secret{v, label})
		}
	}
	// Longest first, so a secret that contains another is replaced whole.
	sort.SliceStable(r.secrets, func(i, j int) bool { return len(r.secrets[i].value) > len(r.secrets[j].value) })
}

func encodings(v string) []string {
	out := []string{v, QueryEscape(v), url.QueryEscape(v), url.PathEscape(v)}
	if b, err := json.Marshal(v); err == nil {
		out = append(out, strings.Trim(string(b), `"`)) // json.Marshal escapes <, > and &
	}
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	if enc.Encode(v) == nil {
		out = append(out, strings.Trim(strings.TrimSuffix(buf.String(), "\n"), `"`))
	}
	var x strings.Builder
	if xml.EscapeText(&x, []byte(v)) == nil {
		out = append(out, x.String())
	}
	return out
}

// Redact replaces every registered secret in s.
func (r *Redactor) Redact(s string) string {
	if r == nil {
		return s
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, sec := range r.secrets {
		s = strings.ReplaceAll(s, sec.value, sec.label)
	}
	return s
}
