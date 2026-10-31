package spec

import (
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"strings"

	"gopkg.in/yaml.v3"
)

// Problem is one thing wrong with a case file.
type Problem struct {
	File string
	Line int
	Msg  string
}

func (p Problem) String() string {
	if p.Line > 0 {
		return fmt.Sprintf("%s:%d: %s", p.File, p.Line, p.Msg)
	}
	return fmt.Sprintf("%s: %s", p.File, p.Msg)
}

// fileCtx collects the problems of one file.
type fileCtx struct {
	file  string
	probs []Problem
}

func (f *fileCtx) errf(n *yaml.Node, format string, args ...any) {
	line := 0
	if n != nil {
		line = n.Line
	}
	f.probs = append(f.probs, Problem{File: f.file, Line: line, Msg: fmt.Sprintf(format, args...)})
}

const maxAliasDepth = 64

// resolve returns a deep copy of n with aliases replaced by their targets
// and merge keys (<<) applied. Explicit keys win over merged ones, and a
// merged key lands where the << was. Duplicate keys are reported.
func (f *fileCtx) resolve(n *yaml.Node, depth int) *yaml.Node {
	if depth > maxAliasDepth {
		f.errf(n, "anchors and aliases nest more than %d levels deep", maxAliasDepth)
		return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!null", Line: n.Line, Column: n.Column}
	}
	switch n.Kind {
	case yaml.AliasNode:
		return f.resolve(n.Alias, depth+1)
	case yaml.SequenceNode:
		c := *n
		c.Anchor, c.Content = "", nil
		for _, item := range n.Content {
			c.Content = append(c.Content, f.resolve(item, depth+1))
		}
		return &c
	case yaml.MappingNode:
		c := *n
		c.Anchor, c.Content = "", nil
		explicit := map[string]bool{}
		for i := 0; i+1 < len(n.Content); i += 2 {
			k := n.Content[i]
			if isMerge(k) {
				continue
			}
			if k.Kind != yaml.ScalarNode {
				f.errf(k, "mapping keys must be plain strings")
				continue
			}
			if explicit[k.Value] {
				f.errf(k, "key %q is defined twice", k.Value)
			}
			explicit[k.Value] = true
		}
		taken := map[string]bool{}
		for i := 0; i+1 < len(n.Content); i += 2 {
			k, v := n.Content[i], n.Content[i+1]
			if isMerge(k) {
				for _, src := range mergeSources(v) {
					m := f.resolve(src, depth+1)
					if m.Kind != yaml.MappingNode {
						f.errf(k, "<< can only merge mappings")
						continue
					}
					for j := 0; j+1 < len(m.Content); j += 2 {
						mk := m.Content[j]
						if explicit[mk.Value] || taken[mk.Value] {
							continue
						}
						taken[mk.Value] = true
						c.Content = append(c.Content, mk, m.Content[j+1])
					}
				}
				continue
			}
			if k.Kind != yaml.ScalarNode || taken[k.Value] {
				continue
			}
			taken[k.Value] = true
			kc := *k
			kc.Anchor = ""
			c.Content = append(c.Content, &kc, f.resolve(v, depth+1))
		}
		return &c
	default:
		c := *n
		c.Anchor = ""
		return &c
	}
}

func isMerge(k *yaml.Node) bool { return k.Kind == yaml.ScalarNode && k.ShortTag() == "!!merge" }

func mergeSources(v *yaml.Node) []*yaml.Node {
	if v.Kind == yaml.SequenceNode {
		return v.Content
	}
	return []*yaml.Node{v}
}

// deepCopy copies a resolved tree.
func deepCopy(n *yaml.Node) *yaml.Node {
	c := *n
	c.Content = make([]*yaml.Node, len(n.Content))
	for i, k := range n.Content {
		c.Content[i] = deepCopy(k)
	}
	return &c
}

// toValue converts a resolved tree to the plain values the JSON Schema
// validator expects. Numbers become json.Number.
func toValue(n *yaml.Node) (any, error) {
	switch n.Kind {
	case yaml.MappingNode:
		m := make(map[string]any, len(n.Content)/2)
		for i := 0; i+1 < len(n.Content); i += 2 {
			v, err := toValue(n.Content[i+1])
			if err != nil {
				return nil, err
			}
			m[n.Content[i].Value] = v
		}
		return m, nil
	case yaml.SequenceNode:
		out := make([]any, 0, len(n.Content))
		for _, item := range n.Content {
			v, err := toValue(item)
			if err != nil {
				return nil, err
			}
			out = append(out, v)
		}
		return out, nil
	case yaml.ScalarNode:
		return scalarValue(n)
	}
	return nil, fmt.Errorf("line %d: unsupported YAML node", n.Line)
}

func scalarValue(n *yaml.Node) (any, error) {
	switch n.ShortTag() {
	case "!!null":
		return nil, nil
	case "!!bool":
		var b bool
		if err := n.Decode(&b); err != nil {
			return nil, err
		}
		return b, nil
	case "!!int":
		var i int64
		if err := n.Decode(&i); err != nil {
			return nil, fmt.Errorf("line %d: integer %s is out of range", n.Line, n.Value)
		}
		return json.Number(strconv.FormatInt(i, 10)), nil
	case "!!float":
		var fl float64
		if err := n.Decode(&fl); err != nil {
			return nil, err
		}
		if math.IsInf(fl, 0) || math.IsNaN(fl) {
			return nil, fmt.Errorf("line %d: %s is not a JSON number", n.Line, n.Value)
		}
		return json.Number(strconv.FormatFloat(fl, 'g', -1, 64)), nil
	}
	return n.Value, nil
}

// nodeAt follows a JSON pointer's tokens and returns the deepest node found.
func nodeAt(root *yaml.Node, tokens []string) *yaml.Node {
	n := root
	for _, tok := range tokens {
		next := child(n, tok)
		if next == nil {
			return n
		}
		n = next
	}
	return n
}

func child(n *yaml.Node, tok string) *yaml.Node {
	switch n.Kind {
	case yaml.MappingNode:
		for i := 0; i+1 < len(n.Content); i += 2 {
			if n.Content[i].Value == tok {
				return n.Content[i+1]
			}
		}
	case yaml.SequenceNode:
		if i, err := strconv.Atoi(tok); err == nil && i >= 0 && i < len(n.Content) {
			return n.Content[i]
		}
	}
	return nil
}

// pathString renders pointer tokens as steps[0].expect.xpath./response/x.
func pathString(tokens []string) string {
	var b strings.Builder
	for _, tok := range tokens {
		if _, err := strconv.Atoi(tok); err == nil {
			b.WriteString("[" + tok + "]")
			continue
		}
		if b.Len() > 0 {
			b.WriteByte('.')
		}
		b.WriteString(tok)
	}
	if b.Len() == 0 {
		return "(case)"
	}
	return b.String()
}

// mapGet returns the value of key in mapping n.
func mapGet(n *yaml.Node, key string) *yaml.Node {
	if n == nil || n.Kind != yaml.MappingNode {
		return nil
	}
	for i := 0; i+1 < len(n.Content); i += 2 {
		if n.Content[i].Value == key {
			return n.Content[i+1]
		}
	}
	return nil
}

// mapKey returns the key node of key in mapping n, for line numbers.
func mapKey(n *yaml.Node, key string) *yaml.Node {
	if n == nil || n.Kind != yaml.MappingNode {
		return nil
	}
	for i := 0; i+1 < len(n.Content); i += 2 {
		if n.Content[i].Value == key {
			return n.Content[i]
		}
	}
	return nil
}

// mapSet sets key in mapping n, appending it when missing.
func mapSet(n *yaml.Node, key string, v *yaml.Node) {
	for i := 0; i+1 < len(n.Content); i += 2 {
		if n.Content[i].Value == key {
			n.Content[i+1] = v
			return
		}
	}
	n.Content = append(n.Content, &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!str", Value: key, Line: n.Line}, v)
}

// mapDelete removes key from mapping n.
func mapDelete(n *yaml.Node, key string) {
	for i := 0; i+1 < len(n.Content); i += 2 {
		if n.Content[i].Value == key {
			n.Content = append(n.Content[:i], n.Content[i+2:]...)
			return
		}
	}
}

func strNode(v string, line int) *yaml.Node {
	return &yaml.Node{Kind: yaml.ScalarNode, Tag: "!!str", Value: v, Line: line}
}

// plain converts a resolved tree to ordered values for JSON bodies and the
// configs of later step types: maps become []Member (or map[string]any when
// ordered is false), lists []any, and scalars keep their YAML type.
func plain(n *yaml.Node, ordered bool) any {
	switch n.Kind {
	case yaml.MappingNode:
		if ordered {
			out := make([]Member, 0, len(n.Content)/2)
			for i := 0; i+1 < len(n.Content); i += 2 {
				out = append(out, Member{Key: n.Content[i].Value, Value: plain(n.Content[i+1], ordered)})
			}
			return out
		}
		out := make(map[string]any, len(n.Content)/2)
		for i := 0; i+1 < len(n.Content); i += 2 {
			out[n.Content[i].Value] = plain(n.Content[i+1], ordered)
		}
		return out
	case yaml.SequenceNode:
		out := make([]any, 0, len(n.Content))
		for _, item := range n.Content {
			out = append(out, plain(item, ordered))
		}
		return out
	}
	v, err := scalarValue(n)
	if err != nil {
		return n.Value
	}
	return v
}
