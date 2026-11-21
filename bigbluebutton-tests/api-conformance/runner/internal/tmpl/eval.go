package tmpl

import (
	"crypto/hmac"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/signer"
)

// Env is what evaluation can see.
type Env struct {
	// Vars looks up a variable.
	Vars func(name string) (string, bool)
	// FixturesDir is where base64File reads from.
	FixturesDir string
	// Checksum computes hash(call + query + salt) as lowercase hex. The
	// runner provides it; validation never evaluates.
	Checksum func(alg, call, query string) (string, error)
	// Now is the clock now() reads; nil means time.Now.
	Now func() time.Time
}

// Func is a template function. Arguments arrive as text.
type Func struct {
	Arity int
	Fn    func(env *Env, args []string) (string, error)
}

const maxRepeat = 1 << 20

var funcs = map[string]Func{
	"repeat": {2, func(_ *Env, a []string) (string, error) {
		n, err := strconv.Atoi(a[1])
		if err != nil || n < 0 || n > maxRepeat {
			return "", fmt.Errorf("repeat: count must be an integer from 0 to %d, got %q", maxRepeat, a[1])
		}
		return strings.Repeat(a[0], n), nil
	}},
	"urlencode": {1, func(_ *Env, a []string) (string, error) {
		return QueryEscape(a[0]), nil
	}},
	"base64File": {1, func(env *Env, a []string) (string, error) {
		p, err := FixturePath(env.FixturesDir, a[0])
		if err != nil {
			return "", fmt.Errorf("base64File: %w", err)
		}
		data, err := os.ReadFile(p)
		if err != nil {
			return "", fmt.Errorf("base64File: %w", err)
		}
		return base64.StdEncoding.EncodeToString(data), nil
	}},
	"match": {2, func(_ *Env, a []string) (string, error) {
		re, err := regexp.Compile(a[1])
		if err != nil {
			return "", fmt.Errorf("match: %w", err)
		}
		m := re.FindStringSubmatchIndex(a[0])
		switch {
		case m == nil:
			return "", fmt.Errorf("match: %q doesn't match %q", a[0], a[1])
		case len(m) > 2 && m[2] < 0:
			return "", fmt.Errorf("match: %q matches %q, but not its first group", a[0], a[1])
		case len(m) > 2:
			return a[0][m[2]:m[3]], nil
		}
		return a[0][m[0]:m[1]], nil
	}},
	"checksum": {3, func(env *Env, a []string) (string, error) {
		if env.Checksum == nil {
			return "", fmt.Errorf("checksum: not available here")
		}
		return env.Checksum(a[0], a[1], a[2])
	}},
	// hmac is the Base64 of an HMAC, as TURN credentials use.
	"hmac": {3, func(_ *Env, a []string) (string, error) {
		h, err := signer.HashFunc(a[0])
		if err != nil {
			return "", fmt.Errorf("hmac: %w", err)
		}
		m := hmac.New(h, []byte(a[1]))
		m.Write([]byte(a[2]))
		return base64.StdEncoding.EncodeToString(m.Sum(nil)), nil
	}},
	// now is the current Unix time in seconds.
	"now": {0, func(env *Env, _ []string) (string, error) {
		clock := time.Now
		if env.Now != nil {
			clock = env.Now
		}
		return strconv.FormatInt(clock().Unix(), 10), nil
	}},
	"add": {2, func(_ *Env, a []string) (string, error) {
		x, err1 := strconv.ParseInt(a[0], 10, 64)
		y, err2 := strconv.ParseInt(a[1], 10, 64)
		if err1 != nil || err2 != nil {
			return "", fmt.Errorf("add: %q and %q must be integers", a[0], a[1])
		}
		return strconv.FormatInt(x+y, 10), nil
	}},
}

// FuncNames lists the template functions, sorted.
func FuncNames() []string {
	names := make([]string, 0, len(funcs))
	for name := range funcs {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

// LookupFunc returns the function called name.
func LookupFunc(name string) (Func, bool) {
	f, ok := funcs[name]
	return f, ok
}

// FixturePath resolves rel inside dir, refusing paths that leave it.
func FixturePath(dir, rel string) (string, error) {
	if dir == "" {
		return "", fmt.Errorf("no fixtures directory")
	}
	clean := filepath.Clean(filepath.FromSlash(rel))
	if filepath.IsAbs(clean) || clean == ".." || strings.HasPrefix(clean, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("fixture path %q must stay inside the fixtures directory", rel)
	}
	return filepath.Join(dir, clean), nil
}

// Eval evaluates t.
func (t *Template) Eval(env *Env) (string, error) {
	var b strings.Builder
	for _, p := range t.parts {
		if p.expr == nil {
			b.WriteString(p.lit)
			continue
		}
		v, err := eval(p.expr, env)
		if err != nil {
			return "", err
		}
		b.WriteString(v)
	}
	return b.String(), nil
}

// Expand parses and evaluates s in one go.
func Expand(s string, env *Env) (string, error) {
	if !HasExpr(s) {
		return s, nil
	}
	t, err := Parse(s)
	if err != nil {
		return "", err
	}
	return t.Eval(env)
}

func eval(e *Expr, env *Env) (string, error) {
	switch e.Kind {
	case Str, Int:
		return e.Lit, nil
	case Ref:
		if env.Vars != nil {
			if v, ok := env.Vars(e.Name); ok {
				return v, nil
			}
		}
		return "", fmt.Errorf("undefined variable %s", e.Name)
	case Call:
		f, ok := funcs[e.Name]
		if !ok {
			return "", fmt.Errorf("unknown function %s", e.Name)
		}
		if len(e.Args) != f.Arity {
			return "", fmt.Errorf("%s takes %d arguments, got %d", e.Name, f.Arity, len(e.Args))
		}
		args := make([]string, len(e.Args))
		for i, a := range e.Args {
			v, err := eval(a, env)
			if err != nil {
				return "", err
			}
			args[i] = v
		}
		return f.Fn(env, args)
	}
	return "", fmt.Errorf("bad expression")
}
