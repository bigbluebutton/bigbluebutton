package spec

import (
	"regexp"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
	"gopkg.in/yaml.v3"
)

type variant struct {
	id       string
	vars     map[string]*string // nil value: a null var
	varTags  map[string]string  // each var's YAML type, e.g. !!str or !!int
	profile  *yaml.Node
	class    *yaml.Node
	requires []*yaml.Node
	tags     []*yaml.Node
	line     int
}

var (
	variantIDRe = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*$`)
	varNameRe   = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*$`)
)

var variantKeys = set("id", "vars", "profile", "requires", "tags", "class")

// variants reads the variants list of root. ok is false when it is broken;
// the problems are already recorded.
func (f *fileCtx) variants(root *yaml.Node) (vs []variant, ok bool) {
	list := mapGet(root, "variants")
	if list == nil {
		return nil, true
	}
	if list.Kind != yaml.SequenceNode || len(list.Content) == 0 {
		f.errf(list, "variants must be a non-empty list")
		return nil, false
	}
	ok = true
	seen := map[string]bool{}
	for _, vn := range list.Content {
		if vn.Kind != yaml.MappingNode {
			f.errf(vn, "each variant must be a mapping")
			ok = false
			continue
		}
		v := variant{vars: map[string]*string{}, varTags: map[string]string{}, line: vn.Line}
		for i := 0; i+1 < len(vn.Content); i += 2 {
			k, val := vn.Content[i], vn.Content[i+1]
			if !variantKeys[k.Value] {
				f.errf(k, "variants: unknown key %q (allowed: id, vars, profile, requires, tags, class)", k.Value)
				ok = false
				continue
			}
			switch k.Value {
			case "id":
				v.id = val.Value
			case "profile":
				v.profile = val
			case "class":
				v.class = val
			case "requires", "tags":
				if val.Kind != yaml.SequenceNode {
					f.errf(val, "variants: %s must be a list", k.Value)
					ok = false
					continue
				}
				if k.Value == "requires" {
					v.requires = val.Content
				} else {
					v.tags = val.Content
				}
			case "vars":
				if val.Kind != yaml.MappingNode {
					f.errf(val, "variants: vars must be a mapping")
					ok = false
					continue
				}
				for j := 0; j+1 < len(val.Content); j += 2 {
					name, value := val.Content[j], val.Content[j+1]
					if !varNameRe.MatchString(name.Value) {
						f.errf(name, "variants: bad var name %q", name.Value)
						ok = false
						continue
					}
					if builtinVars[name.Value] || name.Value == "target" {
						f.errf(name, "variants: var %q would hide a built-in variable", name.Value)
						ok = false
						continue
					}
					if value.Kind != yaml.ScalarNode {
						f.errf(value, "variants: var %q must be a string, number, boolean or null", name.Value)
						ok = false
						continue
					}
					if value.ShortTag() == "!!null" {
						v.vars[name.Value] = nil
					} else {
						s := value.Value
						v.vars[name.Value], v.varTags[name.Value] = &s, value.ShortTag()
					}
				}
			}
		}
		switch {
		case v.id == "":
			f.errf(vn, "each variant needs an id")
			ok = false
		case !variantIDRe.MatchString(v.id):
			f.errf(vn, "variant id %q must be lower-case letters, digits and dashes", v.id)
			ok = false
		case seen[v.id]:
			f.errf(vn, "variant id %q is used twice", v.id)
			ok = false
		}
		seen[v.id] = true
		vs = append(vs, v)
	}
	return vs, ok
}

// expand builds the case for one variant from a copy of root.
func (f *fileCtx) expand(root *yaml.Node, v variant) *yaml.Node {
	c := deepCopy(root)
	mapDelete(c, "variants")
	f.subst(c, v)
	if id := mapGet(c, "id"); id != nil && id.Kind == yaml.ScalarNode {
		id.Value += "-" + v.id
	}
	if v.profile != nil {
		mapSet(c, "profile", deepCopy(v.profile))
	}
	if v.class != nil {
		mapSet(c, "class", deepCopy(v.class))
	}
	addNames(c, "requires", v.requires)
	addNames(c, "tags", v.tags)
	return c
}

// addNames appends the names not already in the case's list key.
func addNames(c *yaml.Node, key string, names []*yaml.Node) {
	if len(names) == 0 {
		return
	}
	list := mapGet(c, key)
	if list == nil || list.Kind != yaml.SequenceNode {
		list = &yaml.Node{Kind: yaml.SequenceNode, Tag: "!!seq", Line: names[0].Line}
		mapSet(c, key, list)
	}
	have := map[string]bool{}
	for _, n := range list.Content {
		have[n.Value] = true
	}
	for _, n := range names {
		if !have[n.Value] {
			have[n.Value] = true
			list.Content = append(list.Content, deepCopy(n))
		}
	}
}

// subst replaces variant vars in n. A string that is exactly ${v} takes v's
// value, and its YAML type when unquoted, so a variant can set a number or
// a method: "" stays an empty string and "0x10" a string, as written in
// vars. When v is null, the mapping entry or list item holding it is
// removed, which is how a variant leaves a param out. It reports whether n
// itself should be removed.
func (f *fileCtx) subst(n *yaml.Node, v variant) (remove bool) {
	vars := v.vars
	switch n.Kind {
	case yaml.ScalarNode:
		if !tmpl.HasExpr(n.Value) || n.ShortTag() != "!!str" {
			return false
		}
		t, err := tmpl.Parse(n.Value)
		if err != nil {
			return false // reported when the case is decoded
		}
		if name, ok := t.SingleRef(); ok {
			if val, isVar := vars[name]; isVar {
				if val == nil {
					return true
				}
				n.Value = tmpl.Escape(*val)
				if n.Style == 0 {
					n.Tag = v.varTags[name]
				}
				return false
			}
		}
		for _, ref := range t.Refs() {
			if val, isVar := vars[ref]; isVar && val == nil {
				f.errf(n, "variant var %s is null, so it can only stand alone as a mapping value or a list item", ref)
			}
		}
		n.Value = t.Rewrite(func(name string) (string, bool) {
			if val, isVar := vars[name]; isVar && val != nil {
				return *val, true
			}
			return "", false
		})
	case yaml.MappingNode:
		kept := n.Content[:0]
		for i := 0; i+1 < len(n.Content); i += 2 {
			k, val := n.Content[i], n.Content[i+1]
			if f.subst(k, v) {
				f.errf(k, "a mapping key can't be a null variant var")
				continue
			}
			if f.subst(val, v) {
				continue
			}
			kept = append(kept, k, val)
		}
		n.Content = kept
	case yaml.SequenceNode:
		kept := n.Content[:0]
		for _, item := range n.Content {
			if !f.subst(item, v) {
				kept = append(kept, item)
			}
		}
		n.Content = kept
	}
	return false
}
