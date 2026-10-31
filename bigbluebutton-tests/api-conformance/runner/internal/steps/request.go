package steps

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"os"
	"path/filepath"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/client"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/signer"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
)

// unsignedCalls authenticate with a session token, or not at all, so they
// default to sign: none.
var unsignedCalls = map[string]bool{"": true, "stuns": true, "signOut": true, "getJoinUrl": true, "learningDashboard": true}

// multipartBoundary is fixed so the same case sends the same bytes.
const multipartBoundary = "bbb-conform-boundary-5f0c2a9e1d"

// prepare builds the request a call step describes.
func (x *exec) prepare(cs *spec.CallStep) (*client.Prepared, error) {
	var base, query, call string
	switch {
	case cs.HasCall:
		var err error
		if call, err = x.expand(cs.Call); err != nil {
			return nil, err
		}
		if call == "" {
			base = x.r.Target.BaseURL + strings.TrimSuffix(x.r.Target.APIPrefix, "/")
		} else {
			base = x.r.Target.BaseURL + x.r.Target.APIPrefix + call
		}
	case cs.URL != "":
		u, err := x.expand(cs.URL)
		if err != nil {
			return nil, err
		}
		if i := strings.IndexByte(u, '#'); i >= 0 {
			u = u[:i]
		}
		base, query, _ = strings.Cut(u, "?")
	default:
		name, err := x.expand(cs.Route)
		if err != nil {
			return nil, err
		}
		root, path, ok := x.r.Target.Route(name)
		if !ok {
			return nil, fmt.Errorf("the target doesn't map route %s", name)
		}
		params := map[string]string{}
		for _, kv := range cs.PathParams {
			v, err := x.expand(kv.Value)
			if err != nil {
				return nil, err
			}
			params[kv.Key] = v
		}
		if path, err = target.FillPath(path, params); err != nil {
			return nil, fmt.Errorf("route %s: %w", name, err)
		}
		base = root + path
	}

	switch {
	case cs.HasRawQuery:
		q, err := x.expand(cs.RawQuery)
		if err != nil {
			return nil, err
		}
		query = joinQuery(query, q)
	case len(cs.Params) > 0:
		q, err := x.encodePairs(cs.Params)
		if err != nil {
			return nil, err
		}
		query = joinQuery(query, q)
	}

	alg, mode, pos := x.signing(cs, call)
	if mode != signer.ModeNone {
		if !cs.HasCall {
			return nil, fmt.Errorf("only call steps can be signed; a url step is sent as written, so use sign: none")
		}
		var err error
		query, err = signer.Sign(signer.Request{Call: call, SignAs: cs.Sign.Call, Query: query, Salt: x.r.Target.Salt, Alg: alg, Mode: mode, Position: pos})
		if err != nil {
			return nil, err
		}
	}
	full := base
	if query != "" {
		full += "?" + query
	}

	h := http.Header{}
	h.Set("Accept", "*/*")
	h.Set("User-Agent", "bbb-conform/"+x.r.Version)
	p := &client.Prepared{Method: cs.Method, URL: full, Header: h}
	if cs.Body != nil {
		body, ctype, err := x.body(cs.Body)
		if err != nil {
			return nil, err
		}
		p.Body, p.HasBody, p.Chunked = body, true, cs.Body.Chunked
		if ctype != "" {
			h.Set("Content-Type", ctype)
		}
	}
	for _, hd := range cs.Headers {
		name := http.CanonicalHeaderKey(hd.Name)
		if hd.Remove {
			if name == "User-Agent" {
				h[name] = []string{""} // an empty value stops Go adding its own
			} else {
				h.Del(name)
			}
			continue
		}
		v, err := x.expand(hd.Value)
		if err != nil {
			return nil, err
		}
		h.Set(name, v)
	}
	return p, nil
}

func joinQuery(a, b string) string {
	switch {
	case a == "":
		return b
	case b == "":
		return a
	}
	return a + "&" + b
}

// signing resolves a call's sign settings against the defaults.
func (x *exec) signing(cs *spec.CallStep, call string) (alg, mode, pos string) {
	if !cs.Sign.Set {
		if !cs.HasCall || unsignedCalls[call] {
			return "", signer.ModeNone, ""
		}
		return x.r.Target.DefaultSign, signer.ModeValid, signer.PosLast
	}
	alg, mode, pos = cs.Sign.Alg, cs.Sign.Mode, cs.Sign.Position
	if alg == "" {
		alg = x.r.Target.DefaultSign
	}
	if mode == "" {
		mode = signer.ModeValid
	}
	if pos == "" {
		pos = signer.PosLast
	}
	return alg, mode, pos
}

// encodePairs encodes params or form fields in order, as Java's
// URLEncoder would.
func (x *exec) encodePairs(kvs []spec.KV) (string, error) {
	parts := make([]string, 0, len(kvs))
	for _, kv := range kvs {
		k, err := x.expand(kv.Key)
		if err != nil {
			return "", err
		}
		v, err := x.expand(kv.Value)
		if err != nil {
			return "", err
		}
		parts = append(parts, tmpl.QueryEscape(k)+"="+tmpl.QueryEscape(v))
	}
	return strings.Join(parts, "&"), nil
}

// body renders a body and its default Content-Type.
func (x *exec) body(b *spec.Body) ([]byte, string, error) {
	var (
		data  []byte
		ctype string
	)
	switch b.Kind {
	case "xml", "raw":
		s, err := x.expand(b.Text)
		if err != nil {
			return nil, "", err
		}
		data = []byte(s)
		if b.Kind == "xml" {
			ctype = "application/xml"
		}
	case "xmlFile":
		raw, err := x.readFixture(b.Path)
		if err != nil {
			return nil, "", err
		}
		s, err := x.expand(string(raw))
		if err != nil {
			return nil, "", fmt.Errorf("in %s: %w", b.Path, err)
		}
		data, ctype = []byte(s), "application/xml"
	case "form":
		s, err := x.encodePairs(b.Form)
		if err != nil {
			return nil, "", err
		}
		data, ctype = []byte(s), "application/x-www-form-urlencoded"
	case "json":
		var buf bytes.Buffer
		if err := x.writeJSON(&buf, b.JSON); err != nil {
			return nil, "", err
		}
		data, ctype = buf.Bytes(), "application/json"
	case "multipart":
		var err error
		if data, ctype, err = x.multipart(b.Multipart); err != nil {
			return nil, "", err
		}
	default:
		return nil, "", fmt.Errorf("unknown body kind %q", b.Kind)
	}
	if b.ContentType != "" {
		ct, err := x.expand(b.ContentType)
		if err != nil {
			return nil, "", err
		}
		ctype = ct
	}
	return data, ctype, nil
}

func (x *exec) readFixture(rel string) ([]byte, error) {
	rel, err := x.expand(rel)
	if err != nil {
		return nil, err
	}
	p, err := tmpl.FixturePath(x.r.FixturesDir, rel)
	if err != nil {
		return nil, err
	}
	return os.ReadFile(p)
}

// writeJSON writes an ordered JSON value, expanding templates in strings.
func (x *exec) writeJSON(buf *bytes.Buffer, v any) error {
	switch t := v.(type) {
	case []spec.Member:
		buf.WriteByte('{')
		for i, m := range t {
			if i > 0 {
				buf.WriteByte(',')
			}
			k, err := x.expand(m.Key)
			if err != nil {
				return err
			}
			writeJSONString(buf, k)
			buf.WriteByte(':')
			if err := x.writeJSON(buf, m.Value); err != nil {
				return err
			}
		}
		buf.WriteByte('}')
	case []any:
		buf.WriteByte('[')
		for i, item := range t {
			if i > 0 {
				buf.WriteByte(',')
			}
			if err := x.writeJSON(buf, item); err != nil {
				return err
			}
		}
		buf.WriteByte(']')
	case string:
		s, err := x.expand(t)
		if err != nil {
			return err
		}
		writeJSONString(buf, s)
	default:
		enc, err := json.Marshal(t)
		if err != nil {
			return err
		}
		buf.Write(enc)
	}
	return nil
}

func writeJSONString(buf *bytes.Buffer, s string) {
	enc := json.NewEncoder(buf)
	enc.SetEscapeHTML(false)
	_ = enc.Encode(s)           // strings always encode
	buf.Truncate(buf.Len() - 1) // Encode adds a newline
}

var quoteEscaper = strings.NewReplacer("\\", "\\\\", `"`, "\\\"")

func (x *exec) multipart(m *spec.Multipart) ([]byte, string, error) {
	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)
	if err := w.SetBoundary(multipartBoundary); err != nil {
		return nil, "", err
	}
	for _, f := range m.Fields {
		k, err := x.expand(f.Key)
		if err != nil {
			return nil, "", err
		}
		v, err := x.expand(f.Value)
		if err != nil {
			return nil, "", err
		}
		if strings.Contains(v, multipartBoundary) {
			return nil, "", fmt.Errorf("multipart field %s contains the boundary", k)
		}
		if err := w.WriteField(k, v); err != nil {
			return nil, "", err
		}
	}
	for _, f := range m.Files {
		field, err := x.expand(f.Field)
		if err != nil {
			return nil, "", err
		}
		var content []byte
		filename := f.Filename
		if f.HasContent {
			s, err := x.expand(f.Content)
			if err != nil {
				return nil, "", err
			}
			content = []byte(s)
			if filename == "" {
				filename = field
			}
		} else {
			if content, err = x.readFixture(f.Path); err != nil {
				return nil, "", err
			}
			if filename == "" {
				filename = filepath.Base(f.Path)
			}
		}
		if bytes.Contains(content, []byte(multipartBoundary)) {
			return nil, "", fmt.Errorf("multipart file %s contains the boundary", field)
		}
		if filename, err = x.expand(filename); err != nil {
			return nil, "", err
		}
		ctype := "application/octet-stream"
		if f.ContentType != "" {
			if ctype, err = x.expand(f.ContentType); err != nil {
				return nil, "", err
			}
		}
		hdr := textproto.MIMEHeader{}
		hdr.Set("Content-Disposition", fmt.Sprintf(`form-data; name="%s"; filename="%s"`, quoteEscaper.Replace(field), quoteEscaper.Replace(filename)))
		hdr.Set("Content-Type", ctype)
		part, err := w.CreatePart(hdr)
		if err != nil {
			return nil, "", err
		}
		if _, err := part.Write(content); err != nil {
			return nil, "", err
		}
	}
	if err := w.Close(); err != nil {
		return nil, "", err
	}
	return buf.Bytes(), w.FormDataContentType(), nil
}
