package spec

import (
	"fmt"
	"net/textproto"
	"os"
	"path"
	"regexp"
	"slices"
	"sort"
	"strings"
	"time"

	"github.com/antchfx/xpath"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
	"github.com/theory/jsonpath"
	"gopkg.in/yaml.v3"
)

// minPollInterval is the shortest eventually.every a call step may use.
const minPollInterval = 10 * time.Millisecond

// A graphql step polls every 500ms unless it says otherwise, and no more
// often than every 300ms: bbb-graphql-middleware delays a connection's
// queries beyond 200 a minute.
const (
	defaultGraphQLPoll = 500 * time.Millisecond
	minGraphQLPoll     = 300 * time.Millisecond
)

var headerNameRe = regexp.MustCompile("^[!#$%&'*+\\-.^_`|~0-9A-Za-z]+$")

// precheck enforces the structural rules whose JSON Schema errors would be
// hard to read. When it fails, the schema check is skipped for the case.
func (f *fileCtx) precheck(root *yaml.Node) bool {
	if root.Kind != yaml.MappingNode {
		f.errf(root, "a case must be a mapping")
		return false
	}
	ok := true
	for _, list := range []string{"steps", "teardown"} {
		seq := mapGet(root, list)
		if seq == nil || seq.Kind != yaml.SequenceNode {
			continue
		}
		for i, st := range seq.Content {
			if st.Kind != yaml.MappingNode {
				continue // the schema reports it
			}
			where := fmt.Sprintf("%s[%d]", list, i)
			var found []string
			for _, k := range stepKeyOrder {
				if mapKey(st, k) != nil {
					found = append(found, k)
				}
			}
			if len(found) != 1 {
				f.errf(st, "%s: a step needs exactly one of %s; found %s", where, strings.Join(stepKeyOrder, ", "), describe(found))
				ok = false
				continue
			}
			if stepKeys[found[0]] != KindCall {
				continue
			}
			if mapKey(st, "params") != nil && mapKey(st, "raw_query") != nil {
				f.errf(mapKey(st, "raw_query"), "%s: use params or raw_query, not both", where)
				ok = false
			}
			if k := mapKey(st, "pathParams"); k != nil && found[0] != "route" {
				f.errf(k, "%s: pathParams only goes with route", where)
				ok = false
			}
			body := mapGet(st, "body")
			if body == nil || body.Kind != yaml.MappingNode {
				continue
			}
			var kinds []string
			for _, k := range bodyKinds {
				if mapKey(body, k) != nil {
					kinds = append(kinds, k)
				}
			}
			if len(kinds) != 1 {
				f.errf(body, "%s.body: a body needs exactly one of %s; found %s", where, strings.Join(bodyKinds, ", "), describe(kinds))
				ok = false
			}
			if mapKey(body, "contentType") != nil {
				if h := mapGet(st, "headers"); h != nil && h.Kind == yaml.MappingNode {
					for j := 0; j+1 < len(h.Content); j += 2 {
						if strings.EqualFold(h.Content[j].Value, "Content-Type") {
							f.errf(h.Content[j], "%s: set Content-Type in headers or in body.contentType, not both", where)
							ok = false
						}
					}
				}
			}
		}
	}
	return ok
}

func describe(found []string) string {
	if len(found) == 0 {
		return "none"
	}
	return strings.Join(found, " and ")
}

// decoder turns one schema-valid case into a Case, checking as it goes.
type decoder struct {
	f       *fileCtx
	opts    Options
	vars    map[string]string // the variant's non-null vars
	nulls   map[string]bool   // its null vars, already reported where misused
	defined map[string]bool   // captures earlier steps define
	joined  map[string]bool   // handles earlier presence steps joined
	uses    map[string]bool   // the target URLs the case refers to
	serial  bool              // the case is tagged serial
}

func (d *decoder) decodeCase(root *yaml.Node, file, variantID string) *Case {
	c := &Case{
		ID:       mapGet(root, "id").Value,
		Title:    mapGet(root, "title").Value,
		Endpoint: mapGet(root, "endpoint").Value,
		Class:    mapGet(root, "class").Value,
		Variant:  variantID,
		Vars:     d.vars,
		File:     file,
		Line:     root.Line,
	}
	if !strings.HasPrefix(c.ID, c.Endpoint+".") {
		d.f.errf(mapGet(root, "id"), "id %q must start with the endpoint, %q", c.ID, c.Endpoint+".")
	}
	if p := mapGet(root, "profile"); p != nil {
		c.Profile = p.Value
	}
	c.Tags = d.names(mapGet(root, "tags"), knownTags, "tag")
	d.serial = false
	for _, t := range c.Tags {
		d.serial = d.serial || t == "serial"
	}
	c.Requires = d.names(mapGet(root, "requires"), knownCapabilities, "capability")

	d.defined, d.joined, d.uses = map[string]bool{}, map[string]bool{}, map[string]bool{}
	for i, st := range mapGet(root, "steps").Content {
		c.Steps = append(c.Steps, d.step(st, fmt.Sprintf("steps[%d]", i)))
	}
	if td := mapGet(root, "teardown"); td != nil {
		for i, st := range td.Content {
			c.Teardown = append(c.Teardown, d.step(st, fmt.Sprintf("teardown[%d]", i)))
		}
	}

	c.Uses = sortedKeys(d.uses)

	// A profile restarts the server, which --exclude-tags disruptive must
	// be able to avoid. A triage case's answers aren't decided yet, so
	// they are recorded but not compared.
	tagged := func(tag string) bool { return slices.Contains(c.Tags, tag) }
	if c.Profile != "" && !tagged("disruptive") {
		d.f.errf(mapGet(root, "profile"), "a case with a profile restarts the server: tag it disruptive")
	}
	if tagged("triage") && c.Class != "defect" {
		for i, st := range mapGet(root, "steps").Content {
			s := c.Steps[i]
			ignored := s.Call != nil && s.Call.IgnoreResult
			if s.Kind != KindWait && !ignored && s.Golden != "document" && s.Golden != "off" {
				d.f.errf(st, "steps[%d]: a triage case records what the server answers without comparing it: give the step golden: document", i)
			}
		}
	}

	have := map[string]bool{}
	for _, r := range c.Requires {
		have[r] = true
	}
	for _, s := range append(append([]Step{}, c.Steps...), c.Teardown...) {
		if capName := s.Kind.Capability(); capName != "" && !have[capName] {
			have[capName] = true
			c.Requires = append(c.Requires, capName)
		}
	}
	return c
}

func (d *decoder) names(n *yaml.Node, known map[string]bool, what string) []string {
	if n == nil {
		return nil
	}
	var out []string
	for _, item := range n.Content {
		if !known[item.Value] {
			d.f.errf(item, "unknown %s %q (known: %s)", what, item.Value, strings.Join(sortedKeys(known), ", "))
		}
		out = append(out, item.Value)
	}
	return out
}

func sortedKeys(m map[string]bool) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func (d *decoder) step(n *yaml.Node, where string) Step {
	var key string
	for _, k := range stepKeyOrder {
		if mapKey(n, k) != nil {
			key = k
			break
		}
	}
	s := Step{Kind: stepKeys[key], Line: n.Line}
	if g := mapGet(n, "golden"); g != nil {
		s.Golden = g.Value
	}
	switch s.Kind {
	case KindCall:
		s.Call, s.Expect = d.call(n, key, where)
	case KindWait:
		s.Wait = duration(mapGet(n, "wait"))
	case KindPresence:
		s.Presence = d.presence(mapGet(n, key), where)
		if e := mapGet(n, "expect"); e != nil {
			s.Expect = d.expect(e)
		}
	case KindGraphQL:
		s.GraphQL = d.graphql(n, where)
		if e := mapGet(n, "expect"); e != nil {
			s.Expect = d.expect(e)
		}
	case KindBus, KindFS, KindRedis:
		d.sideEffect(&s, mapGet(n, key), where)
		if s.Kind == KindBus {
			d.busSelect(&s, n, where)
		}
		if e := mapGet(n, "expect"); e != nil {
			s.Expect = d.expect(e)
			d.sideEffectModes(n, e, s.Expect, where)
		}
	case KindSink:
		sk := mapGet(n, key)
		s.Sink = &SinkStep{Key: d.str(mapGet(sk, "key")), Within: duration(mapGet(sk, "within"))}
		if e := mapGet(n, "expect"); e != nil {
			s.Expect = d.sinkExpect(e)
			d.sideEffectModes(n, e, s.Expect, where)
		}
	default:
		cfg := mapGet(n, key)
		d.templatesIn(cfg)
		s.Config, _ = plain(cfg, false).(map[string]any)
		if e := mapGet(n, "expect"); e != nil {
			d.templatesIn(e)
			if jp := mapGet(e, "jsonpath"); jp != nil {
				d.matcherTable(jp, keyJSONPath)
			}
			for _, k := range []string{"contents", "ttl", "count", "method", "path", "errors"} {
				if m := mapGet(e, k); m != nil {
					d.matcher(m)
				}
			}
			for _, k := range []string{"hash", "query", "headers"} {
				if t := mapGet(e, k); t != nil {
					d.matcherTable(t, keyPlain)
				}
			}
			s.RawExpect, _ = plain(e, false).(map[string]any)
		}
	}
	if cp := mapGet(n, "capture"); cp != nil {
		s.Capture = d.captures(cp, s.Kind, where)
	}
	for _, c := range s.Capture {
		d.defined[c.Name] = true
	}
	if s.Kind == KindCall && s.Call.Method == "HEAD" {
		d.headStep(n, s, where)
	}
	return s
}

// headStep rejects checks that need a body: a HEAD response has none, so they
// could only fail. Status, headers, redirects and header captures still work.
func (d *decoder) headStep(n *yaml.Node, s Step, where string) {
	at := mapGet(n, "method")
	exps := []*Expect{s.Expect}
	if s.Call.Eventually != nil {
		exps = append(exps, s.Call.Eventually.Until)
	}
	for _, e := range exps {
		if e == nil {
			continue
		}
		var found []string
		for _, c := range []struct {
			name string
			set  bool
		}{
			{"format", e.Format != ""}, {"returncode", e.Returncode != nil}, {"messageKey", e.MessageKey != nil},
			{"message", e.Message != nil}, {"xpath", len(e.XPath) > 0}, {"jsonpath", len(e.JSONPath) > 0},
			{"body", e.Body != nil}, {"schema", e.Schema != ""},
		} {
			if c.set {
				found = append(found, c.name)
			}
		}
		if len(found) > 0 {
			d.f.errf(at, "%s: a HEAD response has no body, so it can't be checked with %s", where, strings.Join(found, ", "))
		}
	}
	for _, c := range s.Capture {
		if strings.HasPrefix(c.Expr, "/") || strings.HasPrefix(c.Expr, "$") {
			d.f.errf(at, "%s: a HEAD response has no body to capture %q from", where, c.Name)
		}
	}
}

func (d *decoder) call(n *yaml.Node, key, where string) (*CallStep, *Expect) {
	cs := &CallStep{Method: "GET"}
	switch key {
	case "call":
		cs.Call, cs.HasCall = d.str(mapGet(n, "call")), true
	case "route":
		cs.Route = d.str(mapGet(n, "route"))
		if pp := mapGet(n, "pathParams"); pp != nil {
			cs.PathParams = d.kvs(pp)
		}
	case "url":
		cs.URL = d.str(mapGet(n, "url"))
	}
	if m := mapGet(n, "method"); m != nil {
		cs.Method = m.Value
	}
	if s := mapGet(n, "sign"); s != nil {
		cs.Sign = decodeSign(s)
		if cs.Sign.Call != "" {
			at := mapGet(s, "call")
			switch {
			case !cs.HasCall:
				d.f.errf(at, "%s: sign.call goes with call steps only, since only they are signed", where)
			case cs.Sign.Call == cs.Call:
				d.f.errf(at, "%s: sign.call is the step's own call; leave it out", where)
			case cs.Sign.Mode == "none":
				d.f.errf(at, "%s: sign.call can't go with mode none, which sends no checksum", where)
			}
		}
	}
	if p := mapGet(n, "params"); p != nil {
		cs.Params = d.kvs(p)
	}
	if rq := mapGet(n, "raw_query"); rq != nil {
		cs.RawQuery, cs.HasRawQuery = d.str(rq), true
	}
	if h := mapGet(n, "headers"); h != nil {
		for i := 0; i+1 < len(h.Content); i += 2 {
			k, v := h.Content[i], h.Content[i+1]
			if !headerNameRe.MatchString(k.Value) {
				d.f.errf(k, "%s: %q is not a valid header name", where, k.Value)
			}
			hd := Header{Name: k.Value}
			if v.ShortTag() == "!!null" {
				hd.Remove = true
			} else {
				hd.Value = d.str(v)
			}
			cs.Headers = append(cs.Headers, hd)
		}
	}
	if b := mapGet(n, "body"); b != nil {
		cs.Body = d.body(b)
	}
	if c := mapGet(n, "client"); c != nil {
		cs.Client = c.Value
	}
	cs.FollowRedirects = boolean(mapGet(n, "followRedirects"))
	cs.IgnoreResult = boolean(mapGet(n, "ignoreResult"))
	if t := mapGet(n, "timeout"); t != nil {
		cs.Timeout = duration(t)
	}
	if ev := mapGet(n, "eventually"); ev != nil {
		cs.Eventually = d.eventually(ev, where, time.Second, minPollInterval)
	}
	var exp *Expect
	if e := mapGet(n, "expect"); e != nil {
		exp = d.expect(e)
	}
	return cs, exp
}

func (d *decoder) eventually(ev *yaml.Node, where string, every, minEvery time.Duration) *Eventually {
	e := &Eventually{Within: duration(mapGet(ev, "within")), Every: every, Until: d.expect(mapGet(ev, "until"))}
	if e.Within <= 0 {
		d.f.errf(mapGet(ev, "within"), "%s: eventually.within must be more than 0", where)
	}
	n, of := mapGet(ev, "every"), " (the default)"
	if n != nil {
		e.Every, of = duration(n), ""
		if e.Every < minEvery {
			d.f.errf(n, "%s: eventually.every must be at least %s, so the server isn't flooded", where, minEvery)
		}
	} else {
		n = mapGet(ev, "within")
	}
	if e.Within > 0 && e.Every >= e.Within {
		d.f.errf(n, "%s: eventually.every%s must be shorter than within, %s, or it tries only once", where, of, e.Within)
	}
	return e
}

func (d *decoder) presence(n *yaml.Node, where string) *PresenceStep {
	p := &PresenceStep{Action: mapGet(n, "action").Value, As: mapGet(n, "as").Value}
	var sources []string
	if v := mapGet(n, "joinUrl"); v != nil {
		p.JoinURL = d.str(v)
		sources = append(sources, "joinUrl")
	}
	if v := mapGet(n, "args"); v != nil {
		p.Args = d.kvs(v)
		sources = append(sources, "args")
	}
	if v := mapGet(n, "sessionToken"); v != nil {
		p.SessionToken = d.str(v)
		sources = append(sources, "sessionToken")
	}
	if v := mapGet(n, "timeout"); v != nil {
		p.Timeout = duration(v)
	}
	if p.Action == "join" {
		switch {
		case d.joined[p.As] && len(sources) > 0:
			d.f.errf(n, "%s: %s joined in an earlier step; joining again continues that join (a guest's, once approved), so it takes no %s", where, p.As, strings.Join(sources, " or "))
		case !d.joined[p.As] && len(sources) != 1:
			d.f.errf(n, "%s: join needs exactly one of joinUrl, args and sessionToken; found %s", where, describe(sources))
		}
		d.joined[p.As] = true
		return p
	}
	if len(sources) > 0 {
		d.f.errf(n, "%s: only join takes %s", where, strings.Join(sources, " or "))
	}
	d.mustHaveJoined(n, p.As, where)
	return p
}

func (d *decoder) mustHaveJoined(n *yaml.Node, as, where string) {
	if !d.joined[as] {
		d.f.errf(n, "%s: %s hasn't joined in an earlier step (presence: {action: join, as: %s, ...})", where, as, as)
	}
}

func (d *decoder) graphql(n *yaml.Node, where string) *GraphQLStep {
	m := mapGet(n, "graphql")
	g := &GraphQLStep{As: mapGet(m, "as").Value}
	d.mustHaveJoined(m, g.As, where)
	q := mapGet(m, "query")
	given := map[string]bool{}
	if v := mapGet(m, "variables"); v != nil {
		d.templatesIn(v)
		g.Variables = plain(v, true)
		for i := 0; i+1 < len(v.Content); i += 2 {
			given[v.Content[i].Value] = true
		}
	}
	switch op, err := ParseOperation(q.Value); {
	case tmpl.HasExpr(q.Value):
		d.f.errf(q, "%s: put values in variables, not in the query", where)
	case err != nil:
		d.f.errf(q, "%s: %v", where, err)
	default:
		g.Op = op
		for _, v := range op.Vars {
			if !given[v] {
				d.f.errf(q, "%s: the mutation passes $%s, but variables doesn't give it", where, v)
			}
		}
	}
	if v := mapGet(m, "timeout"); v != nil {
		g.Timeout = duration(v)
	}
	if ev := mapGet(n, "eventually"); ev != nil {
		g.Eventually = d.eventually(ev, where, defaultGraphQLPoll, minGraphQLPoll)
		if g.Op != nil && g.Op.Type != "query" {
			d.f.errf(mapKey(n, "eventually"), "%s: only a query can be repeated with eventually", where)
		}
	}
	return g
}

// sideEffect decodes a bus, fs or redis step.
func (d *decoder) sideEffect(s *Step, n *yaml.Node, where string) {
	within := time.Duration(0)
	if v := mapGet(n, "within"); v != nil {
		within = duration(v)
	}
	switch s.Kind {
	case KindBus:
		b := &BusStep{Name: d.str(mapGet(n, "name")), Within: within}
		if v := mapGet(n, "channel"); v != nil {
			b.Channel = d.str(v)
		}
		if v := mapGet(n, "meetingId"); v != nil {
			b.MeetingID = d.str(v)
			if t, err := tmpl.Parse(b.MeetingID); err == nil && slices.Contains(t.Refs(), "uid") {
				d.f.errf(v, "%s: the bus carries internal meeting IDs, not ${uid}: capture /response/internalMeetingID from create", where)
			}
		} else if !d.serial {
			d.f.errf(n, "%s: give the bus step a meetingId, or tag the case serial: other cases' messages would match too", where)
		}
		s.Bus = b
	case KindFS:
		p := mapGet(n, "path")
		f := &FSStep{Path: d.str(p), Within: within}
		switch {
		case strings.HasPrefix(f.Path, "/"):
			d.f.errf(p, "%s: fs paths are relative to the data directory", where)
		case slices.Contains(strings.Split(f.Path, "/"), ".."):
			d.f.errf(p, "%s: fs paths stay inside the data directory: no ..", where)
		case tmpl.HasExpr(f.Path):
		case !validGlob(f.Path):
			d.f.errf(p, "%s: bad glob %q", where, f.Path)
		case !d.serial:
			d.f.errf(p, "%s: put the meeting's internal ID (e.g. ${intId}) in the fs path, or tag the case serial: other cases' files would match too", where)
		}
		s.FS = f
	case KindRedis:
		s.Redis = &RedisStep{Key: d.str(mapGet(n, "key")), Within: within}
	}
}

// busSelect decodes a bus step's select; the schema checks its paths. It
// only shapes what is recorded, so a step that isn't recorded can't have
// one: a bus step is off when it says so, and by default in teardown, as
// steps.GoldenMode decides.
func (d *decoder) busSelect(s *Step, n *yaml.Node, where string) {
	sel := mapGet(n, "select")
	if sel == nil {
		return
	}
	if s.Golden == "off" || (s.Golden == "" && strings.HasPrefix(where, "teardown")) {
		d.f.errf(mapKey(n, "select"), "%s: select only shapes what is recorded, and this step isn't recorded (golden: off)", where)
	}
	for _, item := range sel.Content {
		s.Bus.Select = append(s.Bus.Select, item.Value)
	}
}

func validGlob(p string) bool {
	_, err := path.Match(p, "")
	return err == nil
}

// sinkExpect decodes a sink step's expect. Its filters, which choose the
// requests that count, become JSONPath matchers on the request as the
// step sees it: $.method, $.path, $.query['<name>'] and
// $.headers['<Canonical-Name>'].
func (d *decoder) sinkExpect(n *yaml.Node) *Expect {
	e := &Expect{Absent: boolean(mapGet(n, "absent")), Count: d.optMatcher(mapGet(n, "count"))}
	for _, f := range []string{"method", "path"} {
		if v := mapGet(n, f); v != nil {
			e.JSONPath = append(e.JSONPath, NamedMatcher{Key: "$." + f, M: d.matcher(v), Line: v.Line})
		}
	}
	if v := mapGet(n, "query"); v != nil {
		for _, m := range d.matcherTable(v, keyPlain) {
			m.Key = "$.query[" + jsonPathName(m.Key) + "]"
			e.JSONPath = append(e.JSONPath, m)
		}
	}
	if v := mapGet(n, "headers"); v != nil {
		for _, m := range d.matcherTable(v, keyHeader) {
			m.Key = "$.headers[" + jsonPathName(textproto.CanonicalMIMEHeaderKey(m.Key)) + "]"
			e.JSONPath = append(e.JSONPath, m)
		}
	}
	return e
}

// jsonPathName quotes a member name for a JSONPath bracket selector.
func jsonPathName(name string) string {
	return "'" + strings.NewReplacer(`\`, `\\`, `'`, `\'`).Replace(name) + "'"
}

// sideEffectModes checks that a side-effect step's expect asks one
// question: whether something shows up (with filters), never shows up
// (absent), how many times (count), or goes away (exists: false).
func (d *decoder) sideEffectModes(step, n *yaml.Node, e *Expect, where string) {
	if e.Absent {
		for _, k := range []string{"bus", "fs", "redis"} {
			if m := mapGet(step, k); m != nil && mapGet(m, "within") == nil {
				d.f.errf(mapKey(n, "absent"), "%s: give an absent step a within: it passes only if nothing turns up during it", where)
			}
		}
		for _, k := range []string{"count", "exists"} {
			if mapKey(n, k) != nil {
				d.f.errf(mapKey(n, k), "%s: absent can't go with %s", where, k)
			}
		}
		if c := mapKey(step, "capture"); c != nil {
			d.f.errf(c, "%s: an absent step has nothing to capture", where)
		}
	}
	if e.Exists != nil && !*e.Exists {
		for _, k := range []string{"jsonpath", "contents", "hash", "members", "ttl"} {
			if mapKey(n, k) != nil {
				d.f.errf(mapKey(n, k), "%s: exists: false checks that it goes away, so it can't go with %s", where, k)
			}
		}
	}
}

func decodeSign(n *yaml.Node) Sign {
	s := Sign{Set: true}
	if n.Kind == yaml.ScalarNode {
		switch n.Value {
		case "sha1", "sha256", "sha384", "sha512":
			s.Alg = n.Value
		default:
			s.Mode = n.Value
		}
		return s
	}
	if v := mapGet(n, "alg"); v != nil {
		s.Alg = v.Value
	}
	if v := mapGet(n, "mode"); v != nil {
		s.Mode = v.Value
	}
	if v := mapGet(n, "position"); v != nil {
		s.Position = v.Value
	}
	if v := mapGet(n, "call"); v != nil {
		s.Call = v.Value
	}
	return s
}

func (d *decoder) body(n *yaml.Node) *Body {
	b := &Body{}
	for _, k := range bodyKinds {
		v := mapGet(n, k)
		if v == nil {
			continue
		}
		b.Kind = k
		switch k {
		case "xml", "raw":
			b.Text = d.str(v)
		case "xmlFile":
			b.Path = d.str(v)
			d.fixtureTemplate(v, b.Path)
		case "form":
			b.Form = d.kvs(v)
		case "json":
			d.templatesIn(v)
			b.JSON = plain(v, true)
		case "multipart":
			b.Multipart = d.multipart(v)
		}
	}
	if ct := mapGet(n, "contentType"); ct != nil {
		b.ContentType = d.str(ct)
	}
	b.Chunked = boolean(mapGet(n, "chunked"))
	return b
}

func (d *decoder) multipart(n *yaml.Node) *Multipart {
	m := &Multipart{}
	if f := mapGet(n, "fields"); f != nil {
		m.Fields = d.kvs(f)
	}
	if files := mapGet(n, "files"); files != nil {
		for _, fn := range files.Content {
			file := File{Field: d.str(mapGet(fn, "field"))}
			if p := mapGet(fn, "path"); p != nil {
				file.Path = d.str(p)
				d.fixtureExists(p, file.Path)
			}
			if c := mapGet(fn, "content"); c != nil {
				file.Content, file.HasContent = d.str(c), true
			}
			if v := mapGet(fn, "filename"); v != nil {
				file.Filename = d.str(v)
			}
			if v := mapGet(fn, "contentType"); v != nil {
				file.ContentType = d.str(v)
			}
			m.Files = append(m.Files, file)
		}
	}
	return m
}

func (d *decoder) expect(n *yaml.Node) *Expect {
	e := &Expect{}
	if v := mapGet(n, "status"); v != nil {
		m := d.matcher(v)
		e.Status = &m
	}
	if v := mapGet(n, "headers"); v != nil {
		e.Headers = d.matcherTable(v, keyHeader)
	}
	if v := mapGet(n, "format"); v != nil {
		e.Format = v.Value
	}
	e.Returncode = d.optMatcher(mapGet(n, "returncode"))
	e.MessageKey = d.optMatcher(mapGet(n, "messageKey"))
	e.Message = d.optMatcher(mapGet(n, "message"))
	e.Body = d.optMatcher(mapGet(n, "body"))
	e.Errors = d.optMatcher(mapGet(n, "errors"))
	e.Absent = boolean(mapGet(n, "absent"))
	if v := mapGet(n, "exists"); v != nil {
		b := boolean(v)
		e.Exists = &b
	}
	e.Count = d.optMatcher(mapGet(n, "count"))
	e.Contents = d.optMatcher(mapGet(n, "contents"))
	e.TTL = d.optMatcher(mapGet(n, "ttl"))
	if v := mapGet(n, "hash"); v != nil {
		e.Hash = d.matcherTable(v, keyPlain)
	}
	if v := mapGet(n, "members"); v != nil {
		e.HasMembers = true
		for _, m := range v.Content {
			e.Members = append(e.Members, d.str(m))
		}
	}
	if v := mapGet(n, "xpath"); v != nil {
		e.XPath = d.matcherTable(v, keyXPath)
	}
	if v := mapGet(n, "jsonpath"); v != nil {
		e.JSONPath = d.matcherTable(v, keyJSONPath)
	}
	if v := mapGet(n, "redirect"); v != nil {
		e.Redirect = &RedirectExpect{Host: d.optMatcher(mapGet(v, "host")), Path: d.optMatcher(mapGet(v, "path"))}
		if q := mapGet(v, "query"); q != nil {
			e.Redirect.Query = d.matcherTable(q, keyPlain)
		}
	}
	if v := mapGet(n, "schema"); v != nil {
		e.Schema = d.str(v)
		d.fixtureExists(v, e.Schema)
	}
	switch {
	case e.Format == "json" && len(e.XPath) > 0:
		d.f.errf(mapKey(n, "xpath"), "xpath checks need an XML response, but format is json")
	case e.Format == "xml" && len(e.JSONPath) > 0:
		d.f.errf(mapKey(n, "jsonpath"), "jsonpath checks need a JSON response, but format is xml")
	case e.Format == "text" && (len(e.XPath) > 0 || len(e.JSONPath) > 0):
		d.f.errf(mapKey(n, "format"), "format is text, so xpath and jsonpath checks can't apply")
	}
	return e
}

type keyKind int

const (
	keyPlain keyKind = iota
	keyHeader
	keyXPath
	keyJSONPath
)

func (d *decoder) matcherTable(n *yaml.Node, kk keyKind) []NamedMatcher {
	var out []NamedMatcher
	for i := 0; i+1 < len(n.Content); i += 2 {
		k, v := n.Content[i], n.Content[i+1]
		key := d.str(k)
		if !tmpl.HasExpr(key) {
			switch kk {
			case keyHeader:
				if !headerNameRe.MatchString(key) {
					d.f.errf(k, "%q is not a valid header name", key)
				}
			case keyXPath:
				d.checkXPath(k, key)
			case keyJSONPath:
				d.checkJSONPath(k, key)
			}
		}
		out = append(out, NamedMatcher{Key: key, M: d.matcher(v), Line: k.Line})
	}
	return out
}

func (d *decoder) optMatcher(n *yaml.Node) *Matcher {
	if n == nil {
		return nil
	}
	m := d.matcher(n)
	return &m
}

func (d *decoder) matcher(n *yaml.Node) Matcher {
	m := Matcher{Line: n.Line}
	if n.Kind == yaml.ScalarNode {
		m.Op, m.Arg = "eq", d.str(n)
		return m
	}
	k, v := n.Content[0], n.Content[1]
	m.Op = k.Value
	switch m.Op {
	case "regex":
		m.Arg = d.str(v)
		if !tmpl.HasExpr(m.Arg) {
			if _, err := regexp.Compile(m.Arg); err != nil {
				d.f.errf(v, "bad regex: %v", err)
			}
		}
	case "type":
		m.Arg = v.Value
	case "contains":
		m.Arg = d.str(v)
	case "count":
		_ = v.Decode(&m.N) // as YAML reads it; the schema checked it is an integer
	case "oneOf":
		for _, item := range v.Content {
			m.Args = append(m.Args, d.str(item))
		}
	}
	return m
}

func (d *decoder) captures(n *yaml.Node, kind StepKind, where string) []Capture {
	var out []Capture
	for i := 0; i+1 < len(n.Content); i += 2 {
		k, v := n.Content[i], n.Content[i+1]
		name, expr := k.Value, d.str(v)
		if builtinVars[name] {
			d.f.errf(k, "%s: capture %q would hide a built-in variable", where, name)
		} else if _, isVar := d.vars[name]; isVar {
			d.f.errf(k, "%s: capture %q would hide a variant var", where, name)
		}
		if !tmpl.HasExpr(expr) {
			d.checkCaptureExpr(v, expr, kind, where)
		}
		out = append(out, Capture{Name: name, Expr: expr, Line: k.Line})
	}
	return out
}

func (d *decoder) checkCaptureExpr(n *yaml.Node, expr string, kind StepKind, where string) {
	if kind != KindCall {
		if strings.HasPrefix(expr, "$") {
			d.checkJSONPath(n, expr)
			return
		}
		d.f.errf(n, "%s: a %s step captures with a JSONPath ($...), got %q", where, kind, expr)
		return
	}
	switch {
	case strings.HasPrefix(expr, "/"):
		d.checkXPath(n, expr)
	case strings.HasPrefix(expr, "$"):
		d.checkJSONPath(n, expr)
	case strings.HasPrefix(expr, "header:"):
		if !headerNameRe.MatchString(strings.TrimPrefix(expr, "header:")) {
			d.f.errf(n, "%s: bad header name in capture %q", where, expr)
		}
	case strings.HasPrefix(expr, "cookie:"):
		if !headerNameRe.MatchString(strings.TrimPrefix(expr, "cookie:")) {
			d.f.errf(n, "%s: bad cookie name in capture %q", where, expr)
		}
	case strings.HasPrefix(expr, "location:query."):
		if strings.TrimPrefix(expr, "location:query.") == "" {
			d.f.errf(n, "%s: capture %q names no query parameter", where, expr)
		}
	case expr == "location:path", expr == "location:host", expr == "status":
	default:
		d.f.errf(n, "%s: unknown capture %q (use /xpath, $.jsonpath, header:<Name>, cookie:<name>, location:host, location:path, location:query.<key> or status)", where, expr)
	}
}

func (d *decoder) checkXPath(n *yaml.Node, expr string) {
	if _, err := xpath.Compile(expr); err != nil {
		d.f.errf(n, "bad XPath %q: %v", expr, err)
	}
}

func (d *decoder) checkJSONPath(n *yaml.Node, expr string) {
	if _, err := jsonpath.Parse(expr); err != nil {
		d.f.errf(n, "bad JSONPath %q: %v", expr, err)
	}
}

func (d *decoder) kvs(n *yaml.Node) []KV {
	var out []KV
	for i := 0; i+1 < len(n.Content); i += 2 {
		out = append(out, KV{Key: d.str(n.Content[i]), Value: d.str(n.Content[i+1])})
	}
	return out
}

// str returns a scalar's text as written, checking any template in it.
func (d *decoder) str(n *yaml.Node) string {
	if tmpl.HasExpr(n.Value) {
		d.checkTemplate(n, n.Value, "")
	}
	return n.Value
}

// templatesIn checks every string in a subtree, keys included.
func (d *decoder) templatesIn(n *yaml.Node) {
	if n.Kind == yaml.ScalarNode {
		if n.ShortTag() == "!!str" {
			d.str(n)
		}
		return
	}
	for _, c := range n.Content {
		d.templatesIn(c)
	}
}

// checkTemplate checks the template text found at n; in names a fixture
// file when the text came from one.
func (d *decoder) checkTemplate(n *yaml.Node, text, in string) {
	prefix := ""
	if in != "" {
		prefix = "in " + in + ": "
	}
	t, err := tmpl.Parse(text)
	if err != nil {
		d.f.errf(n, "%s%v", prefix, err)
		return
	}
	for _, c := range t.Calls() {
		fn, ok := tmpl.LookupFunc(c.Name)
		if !ok {
			d.f.errf(n, "%sunknown function %s (known: base64File, checksum, repeat, urlencode)", prefix, c.Name)
			continue
		}
		if len(c.Args) != fn.Arity {
			d.f.errf(n, "%s%s takes %d arguments, got %d", prefix, c.Name, fn.Arity, len(c.Args))
			continue
		}
		if c.Name == "base64File" && c.Args[0].Kind == tmpl.Str {
			d.fixtureExists(n, c.Args[0].Lit)
		}
	}
	for _, ref := range t.Refs() {
		switch {
		case !d.isDefined(ref):
			d.f.errf(n, "%sundefined variable %s", prefix, ref)
		case in != "" && d.nulls[ref]:
			// A null var removes what holds it, which a fixture's text can't do.
			d.f.errf(n, "%svariant var %s is null, so a fixture can't use it", prefix, ref)
		}
		if targetURLs[ref] && d.uses != nil {
			d.uses[ref] = true
		}
	}
}

func (d *decoder) isDefined(name string) bool {
	if builtinVars[name] || d.defined[name] || d.nulls[name] {
		return true
	}
	if _, ok := d.vars[name]; ok {
		return true
	}
	if rest, ok := strings.CutPrefix(name, "target."); ok {
		return varNameRe.MatchString(rest)
	}
	return false
}

// fixtureExists checks a fixture path, when the fixtures directory is known
// and the path has no template in it.
func (d *decoder) fixtureExists(n *yaml.Node, rel string) bool {
	if d.opts.FixturesDir == "" || tmpl.HasExpr(rel) {
		return false
	}
	p, err := tmpl.FixturePath(d.opts.FixturesDir, rel)
	if err != nil {
		d.f.errf(n, "%v", err)
		return false
	}
	if _, err := os.Stat(p); err != nil {
		d.f.errf(n, "fixture %s not found in %s", rel, d.opts.FixturesDir)
		return false
	}
	return true
}

// fixtureTemplate checks a templated fixture file: it must exist, and the
// templates in it must be valid here.
func (d *decoder) fixtureTemplate(n *yaml.Node, rel string) {
	if !d.fixtureExists(n, rel) {
		return
	}
	p, _ := tmpl.FixturePath(d.opts.FixturesDir, rel)
	data, err := os.ReadFile(p)
	if err != nil {
		d.f.errf(n, "%v", err)
		return
	}
	if tmpl.HasExpr(string(data)) {
		d.checkTemplate(n, string(data), rel)
	}
}

func duration(n *yaml.Node) time.Duration {
	v, _ := time.ParseDuration(n.Value) // the schema checked the format
	return v
}

func boolean(n *yaml.Node) bool {
	if n == nil {
		return false
	}
	var b bool
	_ = n.Decode(&b)
	return b
}
