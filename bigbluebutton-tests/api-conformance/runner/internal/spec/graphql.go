package spec

import (
	"errors"
	"fmt"
	"strings"
)

// Operation is a graphql step's document: one named operation.
type Operation struct {
	// Text is what is sent. A mutation is rewritten in one canonical form,
	// because bbb-graphql-middleware reads mutations with regular
	// expressions; other operations are sent as written, from their keyword
	// on.
	Text string
	Type string // query | mutation | subscription
	Name string
	// Vars are the variables a mutation's action is passed, in order.
	Vars []string
}

// patchedPrefix makes bbb-graphql-middleware answer with JSON patches.
const patchedPrefix = "Patched_"

// ParseOperation checks a graphql step's document. It must hold exactly one
// named operation (fragments may follow a query or subscription), so the
// operation name sent with it matches. A mutation must have the shape the
// middleware can route:
//
//	mutation Name($a: Type!, ...) { action(arg: $a, ...) }
//
// with no alias, a single root field, no selection on it, and every
// argument a variable.
func ParseOperation(doc string) (*Operation, error) {
	toks, err := lexGraphQL(doc)
	if err != nil {
		return nil, err
	}
	p := &gqlParser{toks: toks}
	if len(toks) == 0 {
		return nil, errors.New("the query is empty")
	}
	op := &Operation{Type: p.peek().text}
	switch {
	case p.peek().kind == tokPunct && p.peek().text == "{":
		return nil, errors.New("name the operation, e.g. query Users { ... }: the operation name is sent with it")
	case op.Type != "query" && op.Type != "mutation" && op.Type != "subscription":
		return nil, fmt.Errorf("expected query, mutation or subscription, got %q", p.peek().text)
	}
	p.next()
	name := p.next()
	if name.kind != tokName {
		return nil, fmt.Errorf("name the operation, e.g. %s Users ...: the operation name is sent with it", op.Type)
	}
	if strings.HasPrefix(name.text, patchedPrefix) {
		return nil, fmt.Errorf("operation names starting with %s get JSON patches back", patchedPrefix)
	}
	op.Name = name.text
	if op.Type == "mutation" {
		return p.mutation(op)
	}
	start := toks[0].pos
	if err := p.skipOperation(); err != nil {
		return nil, err
	}
	for !p.done() {
		if t := p.peek(); t.kind != tokName || t.text != "fragment" {
			return nil, errors.New("the query must hold one operation; only fragments may follow it")
		}
		p.next()
		if err := p.skipOperation(); err != nil {
			return nil, err
		}
	}
	op.Text = doc[start:]
	return op, nil
}

func (p *gqlParser) mutation(op *Operation) (*Operation, error) {
	shape := errors.New("a mutation must look like mutation Name($a: Type!) { action(arg: $a) }: bbb-graphql-middleware can't route anything else")
	var b strings.Builder
	b.WriteString("mutation " + op.Name)
	declared := map[string]bool{}
	if p.is("(") {
		p.next()
		var defs []string
		for !p.is(")") {
			if !p.is("$") {
				return nil, shape
			}
			p.next()
			v := p.next()
			if v.kind != tokName || !p.is(":") {
				return nil, shape
			}
			p.next()
			typ, err := p.typeRef()
			if err != nil {
				return nil, shape
			}
			if p.is("=") || p.is("@") {
				return nil, errors.New("a mutation's variables can't have defaults or directives: give their values in variables")
			}
			declared[v.text] = true
			defs = append(defs, "$"+v.text+": "+typ)
		}
		p.next()
		if len(defs) == 0 {
			return nil, shape
		}
		b.WriteString("(" + strings.Join(defs, ", ") + ")")
	}
	if !p.is("{") {
		return nil, shape
	}
	p.next()
	field := p.next()
	if field.kind != tokName {
		return nil, shape
	}
	if p.is(":") {
		return nil, errors.New("a mutation's action can't have an alias")
	}
	b.WriteString(" { " + field.text)
	if p.is("(") {
		p.next()
		var args []string
		for !p.is(")") {
			arg := p.next()
			if arg.kind != tokName || !p.is(":") {
				return nil, shape
			}
			p.next()
			if !p.is("$") {
				return nil, fmt.Errorf("pass %s as a variable ($%s): bbb-graphql-middleware passes literal arguments as text", arg.text, arg.text)
			}
			p.next()
			v := p.next()
			if v.kind != tokName {
				return nil, shape
			}
			if !declared[v.text] {
				return nil, fmt.Errorf("variable $%s isn't declared", v.text)
			}
			op.Vars = append(op.Vars, v.text)
			args = append(args, arg.text+": $"+v.text)
		}
		p.next()
		if len(args) == 0 {
			return nil, shape
		}
		b.WriteString("(" + strings.Join(args, ", ") + ")")
	}
	if !p.is("}") {
		if p.is("{") {
			return nil, errors.New("a mutation's action returns a value, not fields: drop its selection")
		}
		return nil, errors.New("a mutation runs one action")
	}
	p.next()
	if !p.done() {
		return nil, errors.New("the query must hold one operation")
	}
	b.WriteString(" }")
	op.Text = b.String()
	return op, nil
}

// typeRef reads a type such as String!, [Int] or [GuestUserApprovalStatus!]!.
func (p *gqlParser) typeRef() (string, error) {
	var t string
	switch {
	case p.is("["):
		p.next()
		inner, err := p.typeRef()
		if err != nil || !p.is("]") {
			return "", errors.New("bad type")
		}
		p.next()
		t = "[" + inner + "]"
	case p.peek().kind == tokName:
		t = p.next().text
	default:
		return "", errors.New("bad type")
	}
	if p.is("!") {
		p.next()
		t += "!"
	}
	return t, nil
}

// skipOperation skips the rest of a definition, through its selection set.
func (p *gqlParser) skipOperation() error {
	depth := 0
	for !p.done() {
		t := p.next()
		if t.kind != tokPunct {
			continue
		}
		switch t.text {
		case "{":
			depth++
		case "}":
			depth--
			if depth == 0 {
				return nil
			}
			if depth < 0 {
				return errors.New("unbalanced braces")
			}
		}
	}
	return errors.New("the operation has no selection, or its braces don't close")
}

type tokKind int

const (
	tokName tokKind = iota
	tokPunct
	tokValue // a number or a string
)

type gqlToken struct {
	kind tokKind
	text string
	pos  int
}

type gqlParser struct {
	toks []gqlToken
	i    int
}

func (p *gqlParser) done() bool { return p.i >= len(p.toks) }

func (p *gqlParser) peek() gqlToken {
	if p.done() {
		return gqlToken{kind: tokPunct, text: ""}
	}
	return p.toks[p.i]
}

func (p *gqlParser) next() gqlToken {
	t := p.peek()
	p.i++
	return t
}

func (p *gqlParser) is(punct string) bool {
	t := p.peek()
	return t.kind == tokPunct && t.text == punct
}

// lexGraphQL splits a document into tokens, dropping what GraphQL ignores:
// whitespace, commas, comments and a byte order mark.
func lexGraphQL(doc string) ([]gqlToken, error) {
	var out []gqlToken
	for i := 0; i < len(doc); {
		c := doc[i]
		switch {
		case c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == ',':
			i++
		case strings.HasPrefix(doc[i:], "\ufeff"):
			i += len("\ufeff")
		case c == '#':
			for i < len(doc) && doc[i] != '\n' && doc[i] != '\r' {
				i++
			}
		case strings.HasPrefix(doc[i:], "..."):
			out = append(out, gqlToken{tokPunct, "...", i})
			i += 3
		case strings.ContainsRune("!$&()/:=@[]{|}", rune(c)):
			out = append(out, gqlToken{tokPunct, string(c), i})
			i++
		case c == '_' || c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z':
			j := i + 1
			for j < len(doc) && (doc[j] == '_' || doc[j] >= '0' && doc[j] <= '9' || doc[j] >= 'A' && doc[j] <= 'Z' || doc[j] >= 'a' && doc[j] <= 'z') {
				j++
			}
			out = append(out, gqlToken{tokName, doc[i:j], i})
			i = j
		case c == '-' || c >= '0' && c <= '9':
			j := i + 1
			for j < len(doc) && strings.ContainsRune("0123456789.eE+-", rune(doc[j])) {
				j++
			}
			out = append(out, gqlToken{tokValue, doc[i:j], i})
			i = j
		case strings.HasPrefix(doc[i:], `"""`):
			end := strings.Index(doc[i+3:], `"""`)
			for end >= 0 && doc[i+3+end-1] == '\\' { // \""" doesn't end a block string
				next := strings.Index(doc[i+3+end+3:], `"""`)
				if next < 0 {
					end = -1
					break
				}
				end += 3 + next
			}
			if end < 0 {
				return nil, errors.New("a block string doesn't end")
			}
			out = append(out, gqlToken{tokValue, doc[i : i+3+end+3], i})
			i += 3 + end + 3
		case c == '"':
			j := i + 1
			for j < len(doc) && doc[j] != '"' {
				if doc[j] == '\n' || doc[j] == '\r' {
					return nil, errors.New("a string doesn't end on its line")
				}
				if doc[j] == '\\' {
					j++
				}
				j++
			}
			if j >= len(doc) {
				return nil, errors.New("a string doesn't end")
			}
			out = append(out, gqlToken{tokValue, doc[i : j+1], i})
			i = j + 1
		default:
			return nil, fmt.Errorf("unexpected character %q", c)
		}
	}
	return out, nil
}
