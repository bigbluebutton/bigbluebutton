package observe

import (
	"net/http"
	"reflect"
	"testing"
)

func obs(ctype, body string) *Observation {
	h := http.Header{}
	if ctype != "" {
		h.Set("Content-Type", ctype)
	}
	return &Observation{Status: 200, Header: h, Body: []byte(body)}
}

func TestFormat(t *testing.T) {
	tests := []struct{ ctype, body, want string }{
		{"text/xml;charset=utf-8", "<response/>", "xml"},
		{"application/json", "{}", "json"},
		{"text/html; charset=utf-8", "<a href=x>Found</a>", "text"},
		{"", "  <response/>", "xml"},
		{"", "[1]", "json"},
		{"", "plain", "text"},
	}
	for _, tt := range tests {
		if got := obs(tt.ctype, tt.body).Format(); got != tt.want {
			t.Errorf("Format(%q, %q) = %s, want %s", tt.ctype, tt.body, got, tt.want)
		}
	}
}

func TestSelect(t *testing.T) {
	x := obs("text/xml", `<response><returncode>SUCCESS</returncode><a k="v">1</a><a>2</a><empty/></response>`)
	for expr, want := range map[string][]string{
		"/response/returncode": {"SUCCESS"},
		"/response/a":          {"1", "2"},
		"/response/a/@k":       {"v"},
		"/response/empty":      {""},
		"/response/none":       nil,
		"count(/response/a)":   {"2"},
		"string(/response/a)":  {"1"},
		"/response/a = '2'":    {"true"},
	} {
		got, err := x.SelectXPath(expr)
		if err != nil || !reflect.DeepEqual(got, want) {
			t.Errorf("SelectXPath(%q) = %q, %v; want %q", expr, got, err, want)
		}
	}
	j := obs("application/json", `{"response":{"returncode":"SUCCESS","n":1760000000001,"f":2.50,"b":true,"z":null,"o":{"k":[1,2]}}}`)
	for expr, want := range map[string][]string{
		"$.response.returncode": {"SUCCESS"},
		"$.response.n":          {"1760000000001"},
		"$.response.f":          {"2.50"},
		"$.response.b":          {"true"},
		"$.response.z":          {"null"},
		"$.response.o":          {`{"k":[1,2]}`},
		"$.response.o.k[*]":     {"1", "2"},
		"$.response.missing":    nil,
	} {
		got, err := j.SelectJSONPath(expr)
		if err != nil || !reflect.DeepEqual(got, want) {
			t.Errorf("SelectJSONPath(%q) = %q, %v; want %q", expr, got, err, want)
		}
	}
	if _, err := x.SelectJSONPath("$.a"); err == nil {
		t.Error("JSONPath on XML should fail")
	}
	if _, err := obs("text/xml", "").SelectXPath("/a"); err == nil {
		t.Error("XPath on an empty body should fail")
	}
}

func TestResponse(t *testing.T) {
	tests := []struct {
		o     *Observation
		field string
		want  string
		ok    bool
	}{
		{obs("text/xml", "<response><returncode>FAILED</returncode></response>"), "returncode", "FAILED", true},
		{obs("text/xml", "<response><returncode>FAILED</returncode></response>"), "messageKey", "", false},
		{obs("application/json", `{"response":{"returncode":"SUCCESS"}}`), "returncode", "SUCCESS", true},
		{obs("application/json", `{"returncode":"FAILED","message":"Could not find conference."}`), "message", "Could not find conference.", true},
	}
	for _, tt := range tests {
		got, ok, err := tt.o.Response(tt.field)
		if err != nil || got != tt.want || ok != tt.ok {
			t.Errorf("Response(%s) on %s = %q, %v, %v", tt.field, tt.o.Body, got, ok, err)
		}
	}
}
