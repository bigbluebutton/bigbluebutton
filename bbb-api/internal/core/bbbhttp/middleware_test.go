package bbbhttp

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
)

func TestParams_Get(t *testing.T) {
	param := Param{}

	tests := []struct {
		name   string
		params Params
		key    string
		want   Param
	}{
		{
			name:   "Empty map returns zero Param",
			params: Params{},
			key:    "missing",
			want:   Param{},
		},
		{
			name:   "Nil map returns zero Param",
			params: nil,
			key:    "missing",
			want:   Param{},
		},
		{
			name:   "Single value returns first",
			params: Params{"a": []Param{param}},
			key:    "a",
			want:   param,
		},
		{
			name:   "Multiple values returns first",
			params: Params{"a": []Param{param, {}, {}}},
			key:    "a",
			want:   param,
		},
		{
			name:   "Other key ignored",
			params: Params{"a": []Param{param}},
			key:    "b",
			want:   Param{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.params.Get(tt.key)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("Get(%q) = %#v, want %#v", tt.key, got, tt.want)
			}
		})
	}
}

func TestParams_Set(t *testing.T) {
	t.Run("Panics on nil map", func(t *testing.T) {
		var p Params
		defer func() {
			if r := recover(); r == nil {
				t.Fatalf("Set on nil map did not panic")
			}
		}()
		p.Set("k", Param{})
	})

	t.Run("Replaces existing values and keeps exactly one", func(t *testing.T) {
		p := Params{"k": []Param{{}, {}}}
		newV := Param{}
		p.Set("k", newV)

		if !p.Has("k") {
			t.Fatalf("Expected key to exist after Set")
		}
		if got := len(p["k"]); got != 1 {
			t.Fatalf("Expected 1 value after Set, got %d", got)
		}
		if !reflect.DeepEqual(p.Get("k"), newV) {
			t.Fatalf("Get should return the value passed to Set")
		}
	})

	t.Run("Creates new entry when key missing", func(t *testing.T) {
		p := make(Params)
		p.Set("new", Param{})
		if !p.Has("new") {
			t.Fatalf("Expected key to exist after Set for missing key")
		}
		if got := len(p["new"]); got != 1 {
			t.Fatalf("Expected exactly one value after Set on missing key, got %d", got)
		}
	})
}

func TestParams_Add(t *testing.T) {
	t.Run("Panics on nil map", func(t *testing.T) {
		var p Params
		defer func() {
			if r := recover(); r == nil {
				t.Fatalf("Add on nil map did not panic")
			}
		}()
		p.Add("k", Param{})
	})

	t.Run("Appends when key missing (creates slice)", func(t *testing.T) {
		p := make(Params)
		p.Add("k", Param{})

		if !p.Has("k") {
			t.Fatalf("Expected key to exist after Add on missing key")
		}
		if got := len(p["k"]); got != 1 {
			t.Fatalf("Expected len==1, got %d", got)
		}
	})

	t.Run("Appends to existing slice and preserves order", func(t *testing.T) {
		first := Param{}
		second := Param{}
		p := Params{"k": []Param{first}}

		p.Add("k", second)

		if got := len(p["k"]); got != 2 {
			t.Fatalf("Expected len==2, got %d", got)
		}

		if !reflect.DeepEqual(p.Get("k"), first) {
			t.Fatalf("Get should return first (original) value after Add")
		}
	})
}

func TestParams_Del(t *testing.T) {
	t.Run("Delete on missing key", func(t *testing.T) {
		p := make(Params)
		p.Del("missing")
	})

	t.Run("Delete removes key", func(t *testing.T) {
		p := Params{"k": {Param{}, Param{}}}
		p.Del("k")

		if p.Has("k") {
			t.Fatalf("Expected key to be deleted")
		}

		if got := p.Get("k"); !reflect.DeepEqual(got, Param{}) {
			t.Fatalf("Expected zero Param after delete, got %#v", got)
		}
	})

	t.Run("Delete on nil map", func(t *testing.T) {
		var p Params
		p.Del("anything")
	})
}

func TestParams_Has(t *testing.T) {
	tests := []struct {
		name   string
		params Params
		key    string
		want   bool
	}{
		{
			name:   "Nil map returns false",
			params: nil,
			key:    "k",
			want:   false,
		},
		{
			name:   "Empty map returns false",
			params: Params{},
			key:    "k",
			want:   false,
		},
		{
			name:   "Present key returns true even if zero-length slice",
			params: Params{"k": nil},
			key:    "k",
			want:   true,
		},
		{
			name:   "Present key with values returns true",
			params: Params{"k": {Param{}}},
			key:    "k",
			want:   true,
		},
		{
			name:   "Absent key returns false",
			params: Params{"other": {Param{}}},
			key:    "k",
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.params.Has(tt.key); got != tt.want {
				t.Fatalf("Has(%q) = %v, want %v", tt.key, got, tt.want)
			}
		})
	}
}

func TestEndToEnd_OrderAndReplacement(t *testing.T) {
	p := make(Params)

	first := Param{}
	second := Param{}

	p.Set("k", first)
	p.Add("k", second)

	if !reflect.DeepEqual(p.Get("k"), first) {
		t.Fatalf("Get should return the first value (query precedence) after Add")
	}
	if got := len(p["k"]); got != 2 {
		t.Fatalf("Expected two values after Set+Add, got %d", got)
	}

	p.Set("k", second)
	if got := len(p["k"]); got != 1 {
		t.Fatalf("Expected exactly one value after replacement Set, got %d", got)
	}
	if !reflect.DeepEqual(p.Get("k"), second) {
		t.Fatalf("Get should return the replacement value after Set")
	}
}

func TestCollectParams(t *testing.T) {
	type wantEntry struct {
		values []Param
	}
	type tc struct {
		name   string
		method string
		target string
		header http.Header
		body   io.Reader
		want   map[string]wantEntry
	}

	buildForm := func(s string) (hdr http.Header, body io.Reader) {
		h := http.Header{}
		h.Set("Content-Type", "application/x-www-form-urlencoded")
		return h, strings.NewReader(s)
	}

	buildMultipart := func(fields map[string][]string) (hdr http.Header, body io.Reader) {
		var b bytes.Buffer
		w := multipart.NewWriter(&b)
		for k, vs := range fields {
			for _, v := range vs {
				if err := w.WriteField(k, v); err != nil {
					t.Fatalf("Failed to write field: %v", err)
				}
			}
		}
		_ = w.Close()
		h := http.Header{}

		h.Set("Content-Type", w.FormDataContentType())
		return h, &b
	}

	tests := []tc{
		{
			name:   "Only query params",
			method: http.MethodGet,
			target: "/path?a=1&a=2&b=3",
			header: http.Header{},
			body:   nil,
			want: map[string]wantEntry{
				"a": {values: []Param{
					{Value: "1", FromQuery: true},
					{Value: "2", FromQuery: true},
				}},
				"b": {values: []Param{
					{Value: "3", FromQuery: true},
				}},
			},
		},
		func() tc {
			h, b := buildForm("a=10&b=20&b=21")
			return tc{
				name:   "Form-urlencoded body only",
				method: http.MethodPost,
				target: "/submit",
				header: h,
				body:   b,
				want: map[string]wantEntry{
					"a": {values: []Param{{Value: "10", FromBody: true}}},
					"b": {values: []Param{{Value: "20", FromBody: true}, {Value: "21", FromBody: true}}},
				},
			}
		}(),
		func() tc {
			h, b := buildMultipart(map[string][]string{
				"a": {"x"},
				"b": {"y", "z"},
			})
			return tc{
				name:   "Multipart body only",
				method: http.MethodPost,
				target: "/upload",
				header: h,
				body:   b,
				want: map[string]wantEntry{
					"a": {values: []Param{{Value: "x", FromBody: true}}},
					"b": {values: []Param{{Value: "y", FromBody: true}, {Value: "z", FromBody: true}}},
				},
			}
		}(),
		func() tc {
			h, b := buildForm("a=10&a=11&c=Z")
			return tc{
				name:   "Query + form body",
				method: http.MethodPost,
				target: "/mix?a=1&b=Q",
				header: h,
				body:   b,
				want: map[string]wantEntry{
					"a": {values: []Param{
						{Value: "1", FromQuery: true},
						{Value: "10", FromBody: true},
						{Value: "11", FromBody: true},
					}},
					"b": {values: []Param{
						{Value: "Q", FromQuery: true},
					}},
					"c": {values: []Param{
						{Value: "Z", FromBody: true},
					}},
				},
			}
		}(),
		func() tc {
			h, b := buildMultipart(map[string][]string{
				"a": {"second"},
				"d": {"val1", "val2"},
			})
			return tc{
				name:   "Query + multipart",
				method: http.MethodPost,
				target: "/mix2?a=first",
				header: h,
				body:   b,
				want: map[string]wantEntry{
					"a": {values: []Param{
						{Value: "first", FromQuery: true},
						{Value: "second", FromBody: true},
					}},
					"d": {values: []Param{
						{Value: "val1", FromBody: true},
						{Value: "val2", FromBody: true},
					}},
				},
			}
		}(),
		{
			name:   "Unknown Content-Type (e.g., JSON)",
			method: http.MethodPost,
			target: "/json?a=1",
			header: http.Header{
				"Content-Type": []string{"application/json"},
			},
			body: strings.NewReader(`{"a":"body-ignored","x":"1"}`),
			want: map[string]wantEntry{
				"a": {values: []Param{{Value: "1", FromQuery: true}}},
			},
		},
		{
			name:   "Missing Content-Type=",
			method: http.MethodPost,
			target: "/nocontenttype?a=1",
			header: http.Header{},
			body:   strings.NewReader("a=body-wont-parse"),
			want: map[string]wantEntry{
				"a": {values: []Param{{Value: "1", FromQuery: true}}},
			},
		},
		func() tc {
			h := http.Header{}
			h.Set("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")
			return tc{
				name:   "Form-urlencoded parse error",
				method: http.MethodPost,
				target: "/badform?q=1",
				header: h,
				body:   strings.NewReader("%"),
				want: map[string]wantEntry{
					"q": {values: []Param{{Value: "1", FromQuery: true}}},
				},
			}
		}(),
		{
			name:   "Multipart parse error",
			method: http.MethodPost,
			target: "/badmp?q=1",
			header: http.Header{
				"Content-Type": []string{"multipart/form-data; boundary=--broken"},
			},
			body: strings.NewReader("not-a-valid-multipart-body"),
			want: map[string]wantEntry{
				"q": {values: []Param{{Value: "1", FromQuery: true}}},
			},
		},
		{
			name:   "Empty query and body",
			method: http.MethodGet,
			target: "/empty",
			header: http.Header{},
			body:   nil,
			want:   map[string]wantEntry{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.target, tt.body)
			if tt.header != nil {
				for k, vs := range tt.header {
					for _, v := range vs {
						req.Header.Add(k, v)
					}
				}
			}

			var captured Params
			next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				ctx := r.Context()
				v := ctx.Value(ParamsKey)
				if v == nil {
					t.Fatalf("Params not found in context")
				}
				var ok bool
				captured, ok = v.(Params)
				if !ok {
					t.Fatalf("Params in context has wrong type: %T", v)
				}

				if captured == nil {
					t.Fatalf("Captured Params is nil")
				}
				w.WriteHeader(http.StatusOK)
			})

			rr := httptest.NewRecorder()
			CollectParams()(next).ServeHTTP(rr, req)

			if rr.Code != http.StatusOK {
				t.Fatalf("Unexpected status: %d", rr.Code)
			}

			if len(captured) != len(tt.want) {
				t.Fatalf("Number of keys mismatch: got %d, want %d (captured=%v)", len(captured), len(tt.want), captured)
			}
			for k, we := range tt.want {
				gotSlice, ok := captured[k]
				if !ok {
					t.Fatalf("Missing expected key %q", k)
				}
				if len(gotSlice) != len(we.values) {
					t.Fatalf("Length mismatch for key %q: got %d, want %d; got=%#v want=%#v", k, len(gotSlice), len(we.values), gotSlice, we.values)
				}
				for i := range we.values {
					if !reflect.DeepEqual(gotSlice[i], we.values[i]) {
						t.Fatalf("Value mismatch key %q idx %d: got %#v, want %#v", k, i, gotSlice[i], we.values[i])
					}
				}
			}
		})
	}
}
