// Package tmpl parses and evaluates the ${...} expressions in case files.
//
// An expression is a variable (${uid}, ${target.turnSecret}) or a function
// call (${repeat("a", 256)}). Arguments are string literals, integers,
// variables or nested calls. "$${" produces a literal "${".
package tmpl

import (
	"fmt"
	"strconv"
	"strings"
)

// Kind is the kind of an expression node.
type Kind int

const (
	Ref  Kind = iota // a variable
	Call             // a function call
	Str              // a string literal
	Int              // an integer literal
)

// Expr is one node of a parsed expression.
type Expr struct {
	Kind Kind
	Name string // variable or function name
	Args []*Expr
	Lit  string // literal value, as text
}

type part struct {
	lit  string // unescaped literal text, when expr is nil
	expr *Expr
	src  string // source text of the part, for Rewrite
}

// Template is a parsed string.
type Template struct {
	src   string
	parts []part
}

// HasExpr reports whether s contains anything to parse.
func HasExpr(s string) bool { return strings.Contains(s, "${") }

// Escape makes s a literal: every "${" becomes "$${".
func Escape(s string) string { return strings.ReplaceAll(s, "${", "$${") }

// Parse parses s.
func Parse(s string) (*Template, error) {
	t := &Template{src: s}
	var lit strings.Builder
	litStart := 0
	flush := func(end int) {
		if lit.Len() > 0 {
			t.parts = append(t.parts, part{lit: lit.String(), src: s[litStart:end]})
			lit.Reset()
		}
	}
	for i := 0; i < len(s); {
		switch {
		case strings.HasPrefix(s[i:], "$${"):
			if lit.Len() == 0 {
				litStart = i
			}
			lit.WriteString("${")
			i += 3
		case strings.HasPrefix(s[i:], "${"):
			flush(i)
			p := &parser{src: s, pos: i + 2}
			e, err := p.expr()
			if err != nil {
				return nil, err
			}
			p.space()
			if p.pos >= len(s) || s[p.pos] != '}' {
				return nil, p.errorf("expected }")
			}
			p.pos++
			t.parts = append(t.parts, part{expr: e, src: s[i:p.pos]})
			i = p.pos
			litStart = i
		default:
			if lit.Len() == 0 {
				litStart = i
			}
			lit.WriteByte(s[i])
			i++
		}
	}
	flush(len(s))
	return t, nil
}

// Source returns the text Parse was given.
func (t *Template) Source() string { return t.src }

// IsLiteral reports whether t has no expressions.
func (t *Template) IsLiteral() bool {
	for _, p := range t.parts {
		if p.expr != nil {
			return false
		}
	}
	return true
}

// SingleRef returns the variable name when t is exactly one ${name}.
func (t *Template) SingleRef() (string, bool) {
	if len(t.parts) == 1 && t.parts[0].expr != nil && t.parts[0].expr.Kind == Ref {
		return t.parts[0].expr.Name, true
	}
	return "", false
}

// Refs returns every variable t refers to, including inside calls.
func (t *Template) Refs() []string {
	var out []string
	t.walk(func(e *Expr) {
		if e.Kind == Ref {
			out = append(out, e.Name)
		}
	})
	return out
}

// Calls returns every function call in t, including nested ones.
func (t *Template) Calls() []*Expr {
	var out []*Expr
	t.walk(func(e *Expr) {
		if e.Kind == Call {
			out = append(out, e)
		}
	})
	return out
}

func (t *Template) walk(fn func(*Expr)) {
	var visit func(*Expr)
	visit = func(e *Expr) {
		fn(e)
		for _, a := range e.Args {
			visit(a)
		}
	}
	for _, p := range t.parts {
		if p.expr != nil {
			visit(p.expr)
		}
	}
}

// Rewrite replaces each top-level ${name} for which subst returns ok with
// that literal value, and keeps everything else as written. The result
// parses back to the same template, minus the substituted references.
func (t *Template) Rewrite(subst func(name string) (string, bool)) string {
	var b strings.Builder
	for _, p := range t.parts {
		if p.expr != nil && p.expr.Kind == Ref {
			if v, ok := subst(p.expr.Name); ok {
				b.WriteString(Escape(v))
				continue
			}
		}
		b.WriteString(p.src)
	}
	return b.String()
}

type parser struct {
	src string
	pos int
}

func (p *parser) errorf(format string, args ...any) error {
	return fmt.Errorf("template %q, offset %d: %s", p.src, p.pos, fmt.Sprintf(format, args...))
}

func (p *parser) space() {
	for p.pos < len(p.src) && (p.src[p.pos] == ' ' || p.src[p.pos] == '\t') {
		p.pos++
	}
}

func (p *parser) expr() (*Expr, error) {
	p.space()
	if p.pos >= len(p.src) {
		return nil, p.errorf("unterminated expression")
	}
	c := p.src[p.pos]
	switch {
	case c == '"':
		return p.str()
	case c == '-' || isDigit(c):
		start := p.pos
		p.pos++
		for p.pos < len(p.src) && isDigit(p.src[p.pos]) {
			p.pos++
		}
		text := p.src[start:p.pos]
		if _, err := strconv.Atoi(text); err != nil {
			return nil, p.errorf("bad integer %q", text)
		}
		return &Expr{Kind: Int, Lit: text}, nil
	case isIdentStart(c):
		name := p.ident()
		p.space()
		if p.pos < len(p.src) && p.src[p.pos] == '(' {
			if strings.Contains(name, ".") {
				return nil, p.errorf("bad function name %q", name)
			}
			p.pos++
			e := &Expr{Kind: Call, Name: name}
			p.space()
			if p.pos < len(p.src) && p.src[p.pos] == ')' {
				p.pos++
				return e, nil
			}
			for {
				a, err := p.expr()
				if err != nil {
					return nil, err
				}
				e.Args = append(e.Args, a)
				p.space()
				if p.pos >= len(p.src) {
					return nil, p.errorf("unterminated call to %s", name)
				}
				switch p.src[p.pos] {
				case ',':
					p.pos++
				case ')':
					p.pos++
					return e, nil
				default:
					return nil, p.errorf("expected , or ) in call to %s", name)
				}
			}
		}
		return &Expr{Kind: Ref, Name: name}, nil
	}
	return nil, p.errorf("unexpected %q", c)
}

// ident reads a name; dots separate namespaces, as in target.turnSecret.
func (p *parser) ident() string {
	start := p.pos
	for p.pos < len(p.src) {
		c := p.src[p.pos]
		if isIdentStart(c) || isDigit(c) || (c == '.' && p.pos+1 < len(p.src) && isIdentStart(p.src[p.pos+1])) {
			p.pos++
			continue
		}
		break
	}
	return p.src[start:p.pos]
}

func (p *parser) str() (*Expr, error) {
	p.pos++ // opening quote
	var b strings.Builder
	for p.pos < len(p.src) {
		c := p.src[p.pos]
		switch c {
		case '"':
			p.pos++
			return &Expr{Kind: Str, Lit: b.String()}, nil
		case '\\':
			if p.pos+1 >= len(p.src) {
				return nil, p.errorf("unterminated string")
			}
			switch e := p.src[p.pos+1]; e {
			case '"', '\\':
				b.WriteByte(e)
			case 'n':
				b.WriteByte('\n')
			case 't':
				b.WriteByte('\t')
			default:
				return nil, p.errorf("bad escape \\%c", e)
			}
			p.pos += 2
		default:
			b.WriteByte(c)
			p.pos++
		}
	}
	return nil, p.errorf("unterminated string")
}

func isDigit(c byte) bool      { return c >= '0' && c <= '9' }
func isIdentStart(c byte) bool { return c == '_' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') }
