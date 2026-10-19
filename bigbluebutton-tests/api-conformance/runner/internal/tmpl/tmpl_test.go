package tmpl

import (
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func vars(m map[string]string) func(string) (string, bool) {
	return func(n string) (string, bool) { v, ok := m[n]; return v, ok }
}

func TestExpand(t *testing.T) {
	env := &Env{
		Vars: vars(map[string]string{"uid": "c1", "target.turnSecret": "s3", "n": "3"}),
		Checksum: func(alg, call, query string) (string, error) {
			return alg + "|" + call + "|" + query, nil
		},
	}
	tests := []struct{ in, want string }{
		{"plain", "plain"},
		{"${uid}", "c1"},
		{"m-${uid}-x", "m-c1-x"},
		{"${ uid }", "c1"},
		{"$${uid}", "${uid}"},
		{"a$${b}${uid}", "a${b}c1"},
		{"${target.turnSecret}", "s3"},
		{`${repeat("ab", 3)}`, "ababab"},
		{`${repeat("x", n)}`, "xxx"},
		{`${repeat("x", 0)}`, ""},
		{`${urlencode("a b&c")}`, "a+b%26c"},
		{`${urlencode("*~.-_")}`, "*%7E.-_"},
		{`${urlencode(repeat("é", 2))}`, "%C3%A9%C3%A9"},
		{`${checksum("sha1", "create", "a=1")}`, "sha1|create|a=1"},
		{`${repeat("q\"\\", 1)}`, `q"\`},
		{"$", "$"},
		{"$x {y}", "$x {y}"},
	}
	for _, tt := range tests {
		got, err := Expand(tt.in, env)
		if err != nil {
			t.Errorf("Expand(%q): %v", tt.in, err)
			continue
		}
		if got != tt.want {
			t.Errorf("Expand(%q) = %q, want %q", tt.in, got, tt.want)
		}
	}
}

func TestParseErrors(t *testing.T) {
	for _, in := range []string{"${", "${uid", "${}", `${repeat("a", 2}`, `${repeat("a" 2)}`, `${"open}`, `${a.b()}`, `${"\q"}`, "${1x}"} {
		if _, err := Parse(in); err == nil {
			t.Errorf("Parse(%q) succeeded, want an error", in)
		}
	}
}

func TestEvalErrors(t *testing.T) {
	env := &Env{Vars: vars(nil)}
	for _, in := range []string{"${nope}", `${nope("a")}`, `${repeat("a")}`, `${repeat("a", "x")}`, `${repeat("a", -1)}`, `${checksum("sha1", "c", "q")}`} {
		if _, err := Expand(in, env); err == nil {
			t.Errorf("Expand(%q) succeeded, want an error", in)
		}
	}
}

func TestAnalysis(t *testing.T) {
	tp, err := Parse(`id-${uid}-${repeat(pad, 2)}-${urlencode(name)}`)
	if err != nil {
		t.Fatal(err)
	}
	if got, want := tp.Refs(), []string{"uid", "pad", "name"}; !reflect.DeepEqual(got, want) {
		t.Errorf("Refs = %v, want %v", got, want)
	}
	var calls []string
	for _, c := range tp.Calls() {
		calls = append(calls, c.Name)
	}
	if want := []string{"repeat", "urlencode"}; !reflect.DeepEqual(calls, want) {
		t.Errorf("Calls = %v, want %v", calls, want)
	}
	if _, ok := tp.SingleRef(); ok {
		t.Error("SingleRef matched a mixed template")
	}
	single, _ := Parse("${method}")
	if n, ok := single.SingleRef(); !ok || n != "method" {
		t.Errorf("SingleRef = %q, %v", n, ok)
	}
	lit, _ := Parse("a$${b}")
	if !lit.IsLiteral() {
		t.Error("an escaped template should be literal")
	}
}

func TestRewrite(t *testing.T) {
	tp, err := Parse(`$${keep}-${name}-${uid}-${repeat(name, 2)}`)
	if err != nil {
		t.Fatal(err)
	}
	got := tp.Rewrite(func(n string) (string, bool) {
		if n == "name" {
			return "x${y}", true
		}
		return "", false
	})
	if want := `$${keep}-x$${y}-${uid}-${repeat(name, 2)}`; got != want {
		t.Errorf("Rewrite = %q, want %q", got, want)
	}
}

func TestBase64File(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "a.txt"), []byte("hi"), 0o644); err != nil {
		t.Fatal(err)
	}
	env := &Env{FixturesDir: dir}
	got, err := Expand(`${base64File("a.txt")}`, env)
	if err != nil || got != "aGk=" {
		t.Errorf("base64File = %q, %v", got, err)
	}
	for _, bad := range []string{"../a.txt", "/etc/passwd", "x/../../a.txt"} {
		if _, err := Expand(`${base64File("`+bad+`")}`, env); err == nil || !strings.Contains(err.Error(), "inside") {
			t.Errorf("base64File(%q) error = %v, want a fixtures-directory error", bad, err)
		}
	}
}

func TestRedactor(t *testing.T) {
	var r Redactor
	r.Add("[salt]", "abc")
	r.Add("[secret:long]", "xxabcxx")
	r.Add("[ignored]", "")
	if got, want := r.Redact("abc xxabcxx abcabc"), "[salt] [secret:long] [salt][salt]"; got != want {
		t.Errorf("Redact = %q, want %q", got, want)
	}
	// Encoded forms are caught too: in a query, JSON and XML.
	r.Add("[secret:turn]", `a+b/c=d"<e>&`)
	for _, s := range []string{
		"x=" + QueryEscape(`a+b/c=d"<e>&`),
		`{"k":"a+b/c=d\"<e>&"}`,
		`{"k":"a+b/c=d\"\u003ce\u003e\u0026"}`,
		"<k>a+b/c=d&#34;&lt;e&gt;&amp;</k>",
	} {
		if got := r.Redact(s); strings.Contains(got, "a+b") || strings.Contains(got, "a%2Bb") || !strings.Contains(got, "[secret:turn]") {
			t.Errorf("Redact(%q) = %q", s, got)
		}
	}
	var nilR *Redactor
	if nilR.Redact("abc") != "abc" {
		t.Error("a nil Redactor should change nothing")
	}
}
