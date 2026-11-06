// Package observe holds what a step saw: for an HTTP call, the response.
// Assertions and captures read an Observation, reports include it, and
// diff and record mode normalize it.
package observe

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/antchfx/xmlquery"
	"github.com/antchfx/xpath"
	"github.com/theory/jsonpath"
)

// Observation is one HTTP response.
type Observation struct {
	Status   int
	Header   http.Header
	Location *url.URL // resolved against the request URL; nil without a Location header
	Cookies  []*http.Cookie
	Body     []byte
	Elapsed  time.Duration

	once    sync.Once
	format  string
	xmlDoc  *xmlquery.Node
	xmlErr  error
	jsonDoc any
	jsonErr error
}

// New builds an Observation from a response whose body was read already.
func New(resp *http.Response, body []byte, elapsed time.Duration) *Observation {
	o := &Observation{Status: resp.StatusCode, Header: resp.Header, Cookies: resp.Cookies(), Body: body, Elapsed: elapsed}
	if loc := resp.Header.Get("Location"); loc != "" {
		if u, err := url.Parse(loc); err == nil {
			if resp.Request != nil && resp.Request.URL != nil {
				u = resp.Request.URL.ResolveReference(u)
			}
			o.Location = u
		}
	}
	return o
}

// Format is xml, json or text: from the Content-Type, or from the first
// non-space byte of the body when there is no Content-Type.
func (o *Observation) Format() string {
	o.once.Do(func() {
		ct := o.Header.Get("Content-Type")
		mt, _, _ := mime.ParseMediaType(ct)
		switch {
		case strings.Contains(mt, "json"):
			o.format = "json"
		case strings.Contains(mt, "xml"):
			o.format = "xml"
		case ct != "":
			o.format = "text"
		default:
			trimmed := bytes.TrimSpace(o.Body)
			switch {
			case bytes.HasPrefix(trimmed, []byte("<")):
				o.format = "xml"
			case bytes.HasPrefix(trimmed, []byte("{")), bytes.HasPrefix(trimmed, []byte("[")):
				o.format = "json"
			default:
				o.format = "text"
			}
		}
	})
	return o.format
}

// XML parses the body as XML, once.
func (o *Observation) XML() (*xmlquery.Node, error) {
	if o.xmlDoc == nil && o.xmlErr == nil {
		if len(bytes.TrimSpace(o.Body)) == 0 {
			o.xmlErr = fmt.Errorf("the body is empty")
		} else {
			o.xmlDoc, o.xmlErr = xmlquery.Parse(bytes.NewReader(o.Body))
			if o.xmlErr == nil && o.xmlDoc.FirstChild == nil {
				o.xmlErr = fmt.Errorf("the body has no XML element")
			}
		}
	}
	return o.xmlDoc, o.xmlErr
}

// JSON parses the body as JSON, once. Numbers keep their text.
func (o *Observation) JSON() (any, error) {
	if o.jsonDoc == nil && o.jsonErr == nil {
		dec := json.NewDecoder(bytes.NewReader(o.Body))
		dec.UseNumber()
		var v any
		if err := dec.Decode(&v); err != nil {
			o.jsonErr = err
		} else if dec.More() {
			o.jsonErr = fmt.Errorf("unexpected data after the JSON value")
		} else {
			o.jsonDoc = v
		}
	}
	return o.jsonDoc, o.jsonErr
}

// SelectXPath returns the text of each node expr selects. A scalar result,
// such as count(...), is one value.
func (o *Observation) SelectXPath(expr string) ([]string, error) {
	doc, err := o.XML()
	if err != nil {
		return nil, fmt.Errorf("the response is not XML: %w", err)
	}
	e, err := xpath.Compile(expr)
	if err != nil {
		return nil, fmt.Errorf("bad XPath %q: %w", expr, err)
	}
	switch v := e.Evaluate(xmlquery.CreateXPathNavigator(doc)).(type) {
	case *xpath.NodeIterator:
		var out []string
		for v.MoveNext() {
			out = append(out, v.Current().Value())
		}
		return out, nil
	case float64:
		return []string{strconv.FormatFloat(v, 'f', -1, 64)}, nil
	case bool:
		return []string{strconv.FormatBool(v)}, nil
	case string:
		return []string{v}, nil
	default:
		return nil, fmt.Errorf("XPath %q gave an unsupported %T", expr, v)
	}
}

// SelectJSONPath returns each value expr selects, as text: strings as they
// are, numbers as written, objects and arrays as compact JSON.
func (o *Observation) SelectJSONPath(expr string) ([]string, error) {
	doc, err := o.JSON()
	if err != nil {
		return nil, fmt.Errorf("the response is not JSON: %w", err)
	}
	return SelectJSONPath(doc, expr)
}

// SelectJSONPath applies expr to an already decoded JSON value.
func SelectJSONPath(doc any, expr string) ([]string, error) {
	p, err := jsonpath.Parse(expr)
	if err != nil {
		return nil, fmt.Errorf("bad JSONPath %q: %w", expr, err)
	}
	var out []string
	for _, v := range p.Select(doc) {
		out = append(out, JSONText(v))
	}
	return out, nil
}

// JSONText renders one JSON value as text.
func JSONText(v any) string {
	switch x := v.(type) {
	case nil:
		return "null"
	case string:
		return x
	case json.Number:
		return x.String()
	case bool:
		return strconv.FormatBool(x)
	}
	b, err := json.Marshal(v)
	if err != nil {
		return fmt.Sprint(v)
	}
	return string(b)
}

// Response returns the value of a top-level response field: /response/<f>
// in XML, $.response.<f> in JSON, or $.<f> in JSON without a response
// object (stuns answers like that). ok is false when the field is absent.
func (o *Observation) Response(field string) (string, bool, error) {
	switch o.Format() {
	case "xml":
		vals, err := o.SelectXPath("/response/" + field)
		if err != nil {
			return "", false, err
		}
		if len(vals) == 0 {
			return "", false, nil
		}
		return vals[0], true, nil
	case "json":
		doc, err := o.JSON()
		if err != nil {
			return "", false, fmt.Errorf("the response is not JSON: %w", err)
		}
		m, _ := doc.(map[string]any)
		if inner, ok := m["response"].(map[string]any); ok {
			m = inner
		}
		v, ok := m[field]
		if !ok {
			return "", false, nil
		}
		return JSONText(v), true, nil
	}
	return "", false, fmt.Errorf("a %s response has no %s field", o.Format(), field)
}
