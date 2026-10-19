package spec

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"gopkg.in/yaml.v3"
)

// Options configure loading.
type Options struct {
	// FixturesDir is where xmlFile, multipart paths, schema and base64File
	// arguments resolve. When empty, fixture files aren't checked.
	FixturesDir string
}

// Result is what loading found.
type Result struct {
	Cases    []*Case
	Problems []Problem
	Files    int
}

// LoadDir loads every .yaml and .yml file under dir, skipping directories
// whose names start with a dot. The error is only for reading dir itself.
func LoadDir(dir string, opts Options) (*Result, error) {
	var files []string
	err := filepath.WalkDir(dir, func(p string, de fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if de.IsDir() {
			if p != dir && strings.HasPrefix(de.Name(), ".") {
				return filepath.SkipDir
			}
			return nil
		}
		if ext := filepath.Ext(p); ext == ".yaml" || ext == ".yml" {
			files = append(files, p)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	sort.Strings(files)
	return LoadFiles(files, opts), nil
}

// LoadFiles loads the given case files and checks that case IDs are unique
// across them.
func LoadFiles(files []string, opts Options) *Result {
	r := &Result{Files: len(files)}
	for _, p := range files {
		data, err := os.ReadFile(p)
		if err != nil {
			r.Problems = append(r.Problems, Problem{File: p, Msg: err.Error()})
			continue
		}
		cases, probs := LoadBytes(p, data, opts)
		r.Cases = append(r.Cases, cases...)
		r.Problems = append(r.Problems, probs...)
	}
	first := map[string]*Case{}
	kept := r.Cases[:0]
	for _, c := range r.Cases {
		if prev, dup := first[c.ID]; dup {
			r.Problems = append(r.Problems, Problem{File: c.File, Line: c.Line,
				Msg: fmt.Sprintf("case id %q is already used by %s:%d", c.ID, prev.File, prev.Line)})
			continue
		}
		first[c.ID] = c
		kept = append(kept, c)
	}
	r.Cases = kept
	return r
}

var yamlLineRe = regexp.MustCompile(`^yaml: line (\d+): (.*)$`)

// LoadBytes loads one case file. It returns the cases that have no problems.
func LoadBytes(name string, data []byte, opts Options) ([]*Case, []Problem) {
	f := &fileCtx{file: name}
	dec := yaml.NewDecoder(bytes.NewReader(data))
	var docs []*yaml.Node
	for {
		var doc yaml.Node
		err := dec.Decode(&doc)
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			p := Problem{File: name, Msg: err.Error()}
			if m := yamlLineRe.FindStringSubmatch(err.Error()); m != nil {
				p.Line, _ = strconv.Atoi(m[1])
				p.Msg = m[2]
			}
			return nil, []Problem{p}
		}
		docs = append(docs, &doc)
	}
	if len(docs) == 0 || len(docs[0].Content) == 0 {
		f.errf(nil, "the file holds no case")
		return nil, f.probs
	}
	if len(docs) > 1 {
		second := docs[1]
		if len(second.Content) > 0 {
			second = second.Content[0]
		}
		f.errf(second, "a file holds one case, but this one has %d YAML documents", len(docs))
		return nil, f.probs
	}
	root := f.resolve(docs[0].Content[0], 0)
	if len(f.probs) > 0 {
		return nil, f.probs
	}
	if root.Kind != yaml.MappingNode {
		f.errf(root, "a case must be a mapping")
		return nil, f.probs
	}
	// The aliases into defs are resolved by now, so defs itself is done.
	mapDelete(root, "defs")
	vs, ok := f.variants(root)
	if !ok {
		return nil, f.probs
	}

	units := vs
	if units == nil {
		units = []variant{{}} // the case itself
	}

	// Each variant is expanded and checked on its own. A problem every
	// variant shares is reported once; one that only some variants have
	// names them.
	type key struct {
		line int
		msg  string
	}
	var order []key
	which := map[key][]string{}
	var cases []*Case
	for _, v := range units {
		uf := &fileCtx{file: name}
		node, vars, nulls := root, map[string]string(nil), map[string]bool{}
		if vs != nil {
			node = uf.expand(root, v)
			vars = map[string]string{}
			for k, val := range v.vars {
				if val != nil {
					vars[k] = *val
				} else {
					nulls[k] = true
				}
			}
		}
		var c *Case
		if uf.precheck(node) && uf.checkSchema(node) {
			d := &decoder{f: uf, opts: opts, vars: vars, nulls: nulls}
			c = d.decodeCase(node, name, v.id)
		}
		for _, p := range uf.probs {
			k := key{p.Line, p.Msg}
			if _, seen := which[k]; !seen {
				order = append(order, k)
			}
			which[k] = append(which[k], v.id)
		}
		if len(uf.probs) == 0 && c != nil {
			cases = append(cases, c)
		}
	}
	var probs []Problem
	for _, k := range order {
		msg := k.msg
		if ids := which[k]; vs != nil && len(ids) < len(units) {
			msg += " (variant " + strings.Join(ids, ", ") + ")"
		}
		probs = append(probs, Problem{File: name, Line: k.line, Msg: msg})
	}
	if len(probs) > 0 {
		return nil, probs
	}
	return cases, nil
}
