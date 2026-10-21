package normalize

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
)

// Context is what a case has done so far, which normalizing needs.
type Context struct {
	UID       string
	Bases     []string // the target's base URLs; replaced by ${baseUrl}
	APIPrefix string   // replaced by ${apiPrefix} in URLs
	Salt      string
	// Sent maps every value the case has sent (query params, form fields)
	// to the first param that carried it.
	Sent map[string]string
}

// NewContext starts a case's context.
func NewContext(uid string, bases []string, apiPrefix, salt string) *Context {
	return &Context{UID: uid, Bases: bases, APIPrefix: apiPrefix, Salt: salt, Sent: map[string]string{}}
}

// AddSent records the params of a request URL and, for a form body, its
// fields.
func (c *Context) AddSent(rawURL string, contentType string, body []byte) {
	add := func(q url.Values) {
		keys := make([]string, 0, len(q))
		for k := range q {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			for _, v := range q[k] {
				if _, seen := c.Sent[v]; !seen && v != "" {
					c.Sent[v] = k
				}
			}
		}
	}
	if u, err := url.Parse(rawURL); err == nil {
		if q, err := url.ParseQuery(u.RawQuery); err == nil {
			add(q)
		}
	}
	if strings.HasPrefix(contentType, "application/x-www-form-urlencoded") {
		if q, err := url.ParseQuery(string(body)); err == nil {
			add(q)
		}
	}
}

// fixedHeaders are always compared; Date and Content-Length never are.
var fixedHeaders = []string{"Cache-Control", "Content-Type", "Set-Cookie"}

// Response normalizes one response.
func Response(o *observe.Observation, ctx *Context, r *Rules) []string {
	lines := []string{"status " + strconv.Itoa(o.Status)}
	lines = append(lines, headerLines(o.Header, ctx, r)...)
	if o.Location != nil {
		lines = append(lines, "location "+ctx.url(o.Location.String(), r))
	}
	switch {
	case o.Status >= 300 && o.Status < 400:
		lines = append(lines, "body (redirect)")
	case len(bytes.TrimSpace(o.Body)) == 0:
		lines = append(lines, "body empty")
	default:
		lines = append(lines, bodyLines(o, ctx, r)...)
	}
	return lines
}

func headerLines(h http.Header, ctx *Context, r *Rules) []string {
	names := map[string]bool{}
	for _, n := range fixedHeaders {
		names[n] = true
	}
	for _, n := range r.Headers {
		names[http.CanonicalHeaderKey(n)] = true
	}
	for n := range h {
		if strings.HasPrefix(n, "Access-Control-") {
			names[n] = true
		}
	}
	sorted := make([]string, 0, len(names))
	for n := range names {
		sorted = append(sorted, n)
	}
	sort.Strings(sorted)
	var out []string
	for _, n := range sorted {
		// A copy: Values returns the header map's own slice, and the step's
		// checks still have to see the real headers.
		vals := append([]string(nil), h.Values(n)...)
		if n == "Set-Cookie" {
			var cookies []string
			for _, v := range vals {
				cookies = append(cookies, ctx.cookie(v, r))
			}
			sort.Strings(cookies)
			vals = cookies
		} else {
			for i, v := range vals {
				if m := r.maskFor(n, ""); m != nil {
					v = m.apply(v, ctx)
				}
				vals[i] = ctx.substitute(v)
			}
		}
		for _, v := range vals {
			out = append(out, "header "+n+" "+v)
		}
	}
	return out
}

// cookie renders a Set-Cookie value with its value masked and its
// attributes sorted.
func (c *Context) cookie(v string, r *Rules) string {
	parts := strings.Split(v, ";")
	nameValue := strings.TrimSpace(parts[0])
	name, value, _ := strings.Cut(nameValue, "=")
	if value != "" {
		if m := r.maskFor(name, ""); m != nil {
			value = c.substitute(m.apply(value, c))
		} else {
			value = "<token>"
		}
	}
	var attrs []string
	for _, a := range parts[1:] {
		a = strings.TrimSpace(a)
		if a == "" {
			continue
		}
		if k, _, ok := strings.Cut(a, "="); ok && strings.EqualFold(k, "Expires") {
			a = k + "=<date>" // an absolute date, different on every run
		}
		attrs = append(attrs, c.substitute(a))
	}
	sort.Slice(attrs, func(i, j int) bool { return strings.ToLower(attrs[i]) < strings.ToLower(attrs[j]) })
	return strings.Join(append([]string{name + "=" + value}, attrs...), "; ")
}

var titleRe = regexp.MustCompile(`(?is)<title>(.*?)</title>`)

func bodyLines(o *observe.Observation, ctx *Context, r *Rules) []string {
	var root *node
	var err error
	switch o.Format() {
	case "xml":
		root, err = parseXML(o.Body)
	case "json":
		root, err = parseJSON(o.Body)
	default:
		return []string{"body text " + textSummary(o.Body, ctx)}
	}
	if err != nil {
		return []string{fmt.Sprintf("body %s unparsable: %s", o.Format(), textSummary(o.Body, ctx))}
	}
	lines := []string{"body " + o.Format()}
	return append(lines, ctx.tree(root, r, o.Format() == "json")...)
}

// tree normalizes a parsed body and renders it as lines.
func (c *Context) tree(root *node, r *Rules, jsonPaths bool) []string {
	c.scope(root, r)
	drop(root, r)
	c.mask(root, r)
	c.substituteTree(root)
	sortTree(root, r)
	return flatten(root, jsonPaths)
}

// Document turns a JSON document, what a presence or graphql step returned
// rather than an HTTP response, into ordered lines: one per value, masked
// and sorted like a response body.
func Document(doc []byte, ctx *Context, r *Rules) []string {
	root, err := parseJSON(doc)
	if err != nil {
		return []string{"document unparsable: " + textSummary(doc, ctx)}
	}
	return ctx.tree(root, r, true)
}

// textSummary describes a body that isn't XML or JSON: its title, if it
// has one, else its size and a hash.
func textSummary(body []byte, ctx *Context) string {
	if m := titleRe.FindSubmatch(body); m != nil {
		return strconv.Quote(ctx.substitute(strings.TrimSpace(string(m[1]))))
	}
	sum := sha256.Sum256([]byte(ctx.substitute(string(body))))
	return fmt.Sprintf("%d bytes, sha256 %s", len(body), hex.EncodeToString(sum[:6]))
}

// node is one element, attribute holder, object, array or value.
type node struct {
	name   string
	path   string
	attrs  []attr
	text   string
	isText bool // a leaf: XML text or a JSON scalar
	raw    bool // a JSON scalar that is not a string (number, bool, null)
	kids   []*node
	drop   bool
}

type attr struct{ name, value string }

func parseXML(body []byte) (*node, error) {
	dec := xml.NewDecoder(bytes.NewReader(body))
	dec.Strict = true
	root := &node{path: ""}
	stack := []*node{root}
	var text strings.Builder
	for {
		tok, err := dec.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		top := stack[len(stack)-1]
		switch t := tok.(type) {
		case xml.StartElement:
			n := &node{name: t.Name.Local, path: top.path + "/" + t.Name.Local}
			for _, a := range t.Attr {
				n.attrs = append(n.attrs, attr{a.Name.Local, a.Value})
			}
			sort.Slice(n.attrs, func(i, j int) bool { return n.attrs[i].name < n.attrs[j].name })
			top.kids = append(top.kids, n)
			stack = append(stack, n)
			text.Reset()
		case xml.CharData:
			text.Write(t)
		case xml.EndElement:
			if len(top.kids) == 0 {
				top.text, top.isText = strings.TrimSpace(text.String()), true
			}
			text.Reset()
			stack = stack[:len(stack)-1]
		}
	}
	if len(root.kids) != 1 {
		return nil, fmt.Errorf("want one root element, got %d", len(root.kids))
	}
	return root, nil
}

func parseJSON(body []byte) (*node, error) {
	dec := json.NewDecoder(bytes.NewReader(body))
	dec.UseNumber()
	var v any
	if err := dec.Decode(&v); err != nil {
		return nil, err
	}
	root := &node{path: ""}
	root.kids = []*node{jsonNode("$", "$", v)}
	return root, nil
}

func jsonNode(name, path string, v any) *node {
	n := &node{name: name, path: path}
	switch t := v.(type) {
	case map[string]any:
		keys := make([]string, 0, len(t))
		for k := range t {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			n.kids = append(n.kids, jsonNode(k, path+"/"+k, t[k]))
		}
		if len(t) == 0 {
			n.text, n.isText, n.raw = "{}", true, true
		}
	case []any:
		for _, item := range t {
			child := jsonNode(name+"[]", path+"[]", item)
			n.kids = append(n.kids, child)
		}
		if len(t) == 0 {
			n.text, n.isText, n.raw = "[]", true, true
		}
	case string:
		n.text, n.isText = t, true
	default:
		n.text, n.isText, n.raw = observe.JSONText(t), true, true
	}
	return n
}

func walk(n *node, fn func(*node)) {
	fn(n)
	for _, k := range n.kids {
		walk(k, fn)
	}
}

// scope drops the nodes a scope rule names whose key doesn't contain the
// case's uid. It runs on raw values.
func (c *Context) scope(root *node, r *Rules) {
	if c.UID == "" {
		return
	}
	walk(root, func(n *node) {
		for _, s := range r.Scope {
			if s.re.MatchString(n.path) && !strings.Contains(keyOf(n, s.Key), c.UID) {
				n.drop = true
			}
		}
	})
}

// drop drops the nodes a drop rule names. It runs on raw values.
func drop(root *node, r *Rules) {
	walk(root, func(n *node) {
		for _, d := range r.Drop {
			if d.re.MatchString(n.path) && (d.Value == "" || n.isText && n.text == d.Value) {
				n.drop = true
			}
		}
	})
}

// mask applies masks to raw values, so they still see the real ${uid}.
func (c *Context) mask(root *node, r *Rules) {
	walk(root, func(n *node) {
		for i, a := range n.attrs {
			if m := r.maskFor(a.name, n.path+"/@"+a.name); m != nil {
				n.attrs[i].value = m.apply(a.value, c)
			} else if isURL(a.value) {
				n.attrs[i].value = c.url(a.value, r)
			}
		}
		if !n.isText {
			return
		}
		if m := r.maskFor(n.name, n.path); m != nil {
			// A masked JSON number, such as a timestamp, prints as text.
			if v := m.apply(n.text, c); v != n.text {
				n.text, n.raw = v, false
			}
		} else if !n.raw && isURL(n.text) {
			n.text = c.url(n.text, r)
		}
	})
}

func isURL(s string) bool { return strings.HasPrefix(s, "http://") || strings.HasPrefix(s, "https://") }

// url normalizes a URL: query params sorted and masked by name, and the
// base and API prefix replaced.
func (c *Context) url(raw string, r *Rules) string {
	u, err := url.Parse(raw)
	if err != nil {
		return c.substitute(raw)
	}
	q, _ := url.ParseQuery(u.RawQuery)
	keys := make([]string, 0, len(q))
	for k := range q {
		if k != "" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)
	var parts []string
	for _, k := range keys {
		for _, v := range q[k] {
			if m := r.maskFor(k, ""); m != nil {
				v = m.apply(v, c)
			}
			parts = append(parts, k+"="+c.substitute(v))
		}
	}
	base := u.Scheme + "://" + u.Host
	path := u.EscapedPath()
	if c.APIPrefix != "" && strings.HasPrefix(path, c.APIPrefix) {
		path = "${apiPrefix}" + strings.TrimPrefix(path, c.APIPrefix)
	}
	out := c.substitute(base) + c.substitute(path)
	if len(parts) > 0 {
		out += "?" + strings.Join(parts, "&")
	}
	return out
}

// substitute replaces the run's own strings with placeholders.
func (c *Context) substitute(s string) string {
	if c.Salt != "" {
		s = strings.ReplaceAll(s, c.Salt, "${salt}")
	}
	for _, b := range c.Bases {
		if b != "" {
			s = strings.ReplaceAll(s, b, "${baseUrl}")
			if ws := wsBase(b); ws != "" {
				s = strings.ReplaceAll(s, ws, "${wsBaseUrl}")
			}
		}
	}
	// An internal meeting ID inside a value, such as a redis key name or a
	// file path, gets the internal-id mask's form.
	s = embeddedIDRe.ReplaceAllStringFunc(s, func(id string) string {
		return "<sha1(" + c.preimage(id[:40]) + ")>-<time>"
	})
	if len(c.UID) >= minUID {
		s = strings.ReplaceAll(s, c.UID, "${uid}")
	}
	return s
}

// wsBase is the websocket URL that goes with a base URL, such as the
// GraphQL URL the version endpoint gives: wss:// for https://, ws:// for
// http://.
func wsBase(base string) string {
	switch {
	case strings.HasPrefix(base, "https://"):
		return "wss://" + strings.TrimPrefix(base, "https://")
	case strings.HasPrefix(base, "http://"):
		return "ws://" + strings.TrimPrefix(base, "http://")
	}
	return ""
}

var embeddedIDRe = regexp.MustCompile(`\b[0-9a-f]{40}-[0-9]{10,}\b`)

// minUID is the shortest ${uid} substituted: a shorter one would match
// ordinary text. Real ones are 17 characters.
const minUID = 6

func (c *Context) substituteTree(root *node) {
	walk(root, func(n *node) {
		n.text = c.substitute(n.text)
		for i := range n.attrs {
			n.attrs[i].value = c.substitute(n.attrs[i].value)
		}
	})
}

// sortTree sorts the siblings unordered rules name, by normalized key and
// then by their whole rendering, so ties are stable too.
func sortTree(root *node, r *Rules) {
	walk(root, func(parent *node) {
		for _, u := range r.Unordered {
			var idx []int
			for i, k := range parent.kids {
				if u.re.MatchString(k.path) {
					idx = append(idx, i)
				}
			}
			if len(idx) < 2 {
				continue
			}
			picked := make([]*node, len(idx))
			for i, j := range idx {
				picked[i] = parent.kids[j]
			}
			sort.SliceStable(picked, func(a, b int) bool {
				ka, kb := keyOf(picked[a], u.Key), keyOf(picked[b], u.Key)
				if ka != kb {
					return ka < kb
				}
				return strings.Join(flatten(&node{kids: []*node{picked[a]}}, false), "\n") <
					strings.Join(flatten(&node{kids: []*node{picked[b]}}, false), "\n")
			})
			for i, j := range idx {
				parent.kids[j] = picked[i]
			}
		}
	})
}

// emptied reports whether a node had children and all were dropped.
func emptied(n *node) bool {
	for _, k := range n.kids {
		if !k.drop {
			return false
		}
	}
	return len(n.kids) > 0
}

func keyOf(n *node, key string) string {
	switch {
	case key == "#name":
		return n.name
	case strings.HasPrefix(key, "@"):
		for _, a := range n.attrs {
			if a.name == key[1:] {
				return a.value
			}
		}
		return ""
	case key == "":
		return strings.Join(flatten(&node{kids: []*node{n}}, false), "\n")
	}
	for _, k := range n.kids {
		if k.name == key {
			return k.text
		}
	}
	return ""
}

// flatten renders a tree as path/value lines in order. JSON paths print as
// $.a.b; values are quoted, except JSON numbers, booleans and null. A node
// whose children were all dropped prints as an empty one, so a list with
// only other cases' entries reads like an empty list.
func flatten(root *node, jsonPaths bool) []string {
	var out []string
	var visit func(n *node)
	visit = func(n *node) {
		if n.drop {
			return
		}
		p := n.path
		if jsonPaths {
			p = strings.ReplaceAll(p, "/", ".")
		}
		for _, a := range n.attrs {
			out = append(out, p+"/@"+a.name+" "+strconv.Quote(a.value))
		}
		if emptied(n) {
			switch {
			case !jsonPaths:
				out = append(out, p)
			case strings.HasSuffix(n.kids[0].name, "[]"):
				out = append(out, p+" []")
			default:
				out = append(out, p+" {}")
			}
			return
		}
		if n.isText {
			v := strconv.Quote(n.text)
			if n.raw {
				v = n.text
			}
			if n.text == "" && !n.raw && !jsonPaths {
				out = append(out, p)
			} else {
				out = append(out, p+" "+v)
			}
		}
		for _, k := range n.kids {
			visit(k)
		}
	}
	for _, k := range root.kids {
		visit(k)
	}
	return out
}

// Split cuts a line of Response's output into what it is about and its
// value: "status", "header Name", "location", "body", or a path. A bare
// path, an empty element, has the value "".
func Split(line string) (key, value string) {
	word, rest, _ := strings.Cut(line, " ")
	switch word {
	case "status", "location", "body":
		return word, rest
	case "header":
		name, v, _ := strings.Cut(rest, " ")
		return "header " + name, v
	}
	if i := strings.Index(line, ` "`); i >= 0 {
		return line[:i], line[i+1:]
	}
	if i := strings.LastIndex(line, " "); i >= 0 {
		return line[:i], line[i+1:] // a JSON number, boolean, null, [] or {}
	}
	return line, ""
}
