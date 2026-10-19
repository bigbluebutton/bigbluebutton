package tmpl

import (
	"sort"
	"strings"
	"sync"
)

// Redactor hides secret values in anything the runner writes out.
type Redactor struct {
	mu      sync.Mutex
	secrets []secret
}

type secret struct{ value, label string }

// Add registers value, shown as label from now on. Empty values are ignored.
func (r *Redactor) Add(label, value string) {
	if value == "" {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, s := range r.secrets {
		if s.value == value {
			return
		}
	}
	r.secrets = append(r.secrets, secret{value, label})
	// Longest first, so a secret that contains another is replaced whole.
	sort.SliceStable(r.secrets, func(i, j int) bool { return len(r.secrets[i].value) > len(r.secrets[j].value) })
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
