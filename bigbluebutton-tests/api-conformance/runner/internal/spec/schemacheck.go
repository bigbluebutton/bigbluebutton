package spec

import (
	"bytes"
	"sort"
	"strings"
	"sync"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/schema"
	"github.com/santhosh-tekuri/jsonschema/v6"
	"github.com/santhosh-tekuri/jsonschema/v6/kind"
	"golang.org/x/text/language"
	"golang.org/x/text/message"
	"gopkg.in/yaml.v3"
)

var (
	schemaOnce sync.Once
	caseSchema *jsonschema.Schema
	schemaErr  error
	printer    = message.NewPrinter(language.English)
)

func compiledSchema() (*jsonschema.Schema, error) {
	schemaOnce.Do(func() {
		doc, err := jsonschema.UnmarshalJSON(bytes.NewReader(schema.Case))
		if err != nil {
			schemaErr = err
			return
		}
		c := jsonschema.NewCompiler()
		if err := c.AddResource(schema.CaseURL, doc); err != nil {
			schemaErr = err
			return
		}
		caseSchema, schemaErr = c.Compile(schema.CaseURL)
	})
	return caseSchema, schemaErr
}

// checkSchema validates one expanded case and reports each failure at the
// line of the value it is about.
func (f *fileCtx) checkSchema(root *yaml.Node) bool {
	sch, err := compiledSchema()
	if err != nil {
		f.errf(nil, "internal error: case schema: %v", err)
		return false
	}
	v, err := toValue(root)
	if err != nil {
		f.errf(root, "%v", err)
		return false
	}
	err = sch.Validate(v)
	if err == nil {
		return true
	}
	ve, ok := err.(*jsonschema.ValidationError)
	if !ok {
		f.errf(root, "%v", err)
		return false
	}
	seen := map[string]bool{}
	type leafMsg struct {
		line int
		text string
	}
	var msgs []leafMsg
	for _, leaf := range leaves(ve) {
		n := nodeAt(root, leaf.InstanceLocation)
		text := pathString(leaf.InstanceLocation) + ": " + leaf.ErrorKind.LocalizedString(printer)
		key := strings.Join(leaf.InstanceLocation, "/") + "\x00" + text
		if seen[key] {
			continue
		}
		seen[key] = true
		msgs = append(msgs, leafMsg{n.Line, text})
	}
	sort.SliceStable(msgs, func(i, j int) bool { return msgs[i].line < msgs[j].line })
	for _, m := range msgs {
		f.probs = append(f.probs, Problem{File: f.file, Line: m.line, Msg: m.text})
	}
	return false
}

// leaves returns the errors that have no causes. Under anyOf and oneOf,
// alternatives that failed only on type are dropped when another
// alternative of the right type failed for a more specific reason: for a
// matcher written as a map, "want string" is noise next to "additional
// properties 'x' not allowed".
func leaves(e *jsonschema.ValidationError) []*jsonschema.ValidationError {
	if len(e.Causes) == 0 {
		return []*jsonschema.ValidationError{e}
	}
	causes := e.Causes
	switch e.ErrorKind.(type) {
	case *kind.AnyOf, *kind.OneOf:
		var specific []*jsonschema.ValidationError
		for _, c := range causes {
			if !onlyTypeErrors(c) {
				specific = append(specific, c)
			}
		}
		if len(specific) > 0 {
			causes = specific
		}
	}
	var out []*jsonschema.ValidationError
	for _, c := range causes {
		out = append(out, leaves(c)...)
	}
	return out
}

func onlyTypeErrors(e *jsonschema.ValidationError) bool {
	if len(e.Causes) == 0 {
		_, isType := e.ErrorKind.(*kind.Type)
		return isType
	}
	for _, c := range e.Causes {
		if !onlyTypeErrors(c) {
			return false
		}
	}
	return true
}
