package validation

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
)

func computeChecksumFor(req *http.Request, salt string, algo string) string {
	endpoint := strings.TrimPrefix(req.URL.Path, "/")
	q := req.URL.RawQuery
	qsWithout := RemoveQueryParam(q, core.ChecksumParam)
	data := endpoint + qsWithout + salt

	switch algo {
	case core.SHA1:
		h := sha1.Sum([]byte(data))
		return hex.EncodeToString(h[:])
	case core.SHA256:
		h := sha256.Sum256([]byte(data))
		return hex.EncodeToString(h[:])
	case core.SHA384:
		h := sha512.Sum384([]byte(data))
		return hex.EncodeToString(h[:])
	case core.SHA512:
		h := sha512.Sum512([]byte(data))
		return hex.EncodeToString(h[:])
	default:
		return ""
	}
}

func TestValidateChecksum(t *testing.T) {
	enabledAll := map[string]struct{}{
		core.SHA1:   {},
		core.SHA256: {},
		core.SHA384: {},
		core.SHA512: {},
	}
	enabledSHA1Only := map[string]struct{}{
		core.SHA1: {},
	}

	tests := []struct {
		name       string
		path       string
		rawQuery   string
		salt       string
		enableAlgs map[string]struct{}
		algo       string
		forceBad   bool
		emptySalt  bool
		expectErr  bool
	}{
		{
			name:      "Security disabled - no checksum provided",
			path:      "/join",
			rawQuery:  "a=1&b=2",
			salt:      "",
			emptySalt: true,
			expectErr: false,
		},
		{
			name:      "Missing checksum",
			path:      "/join",
			rawQuery:  "a=1&b=2",
			salt:      "pepper",
			expectErr: true,
		},
		{
			name:       "Unsupported checksum length",
			path:       "/getMeetings",
			rawQuery:   "a=1&b=2",
			salt:       "s",
			enableAlgs: enabledAll,
			algo:       "",
			forceBad:   true,
			expectErr:  true,
		},
		{
			name:       "Length matches SHA1 but algo not enabled",
			path:       "/end",
			rawQuery:   "c=3&d=4",
			salt:       "salt",
			enableAlgs: enabledSHA1Only,
			algo:       core.SHA256,
			expectErr:  true,
		},
		{
			name:       "Valid SHA1 with checksum",
			path:       "/create",
			rawQuery:   "x=1&y=2",
			salt:       "sauce",
			enableAlgs: enabledAll,
			algo:       core.SHA1,
			expectErr:  false,
		},
		{
			name:       "Valid SHA256 with checksum",
			path:       "/update",
			rawQuery:   "x=apple&y=banana",
			salt:       "s0lt",
			enableAlgs: enabledAll,
			algo:       core.SHA256,
			expectErr:  false,
		},
		{
			name:       "Valid SHA384",
			path:       "/delete",
			rawQuery:   "a=1&b=2&c=3",
			salt:       "salty",
			enableAlgs: enabledAll,
			algo:       core.SHA384,
			expectErr:  false,
		},
		{
			name:       "Valid SHA512 with multiple params",
			path:       "/info",
			rawQuery:   "p=alpha&q=beta&r=gamma&s=delta",
			salt:       "NaCl",
			enableAlgs: enabledAll,
			algo:       core.SHA512,
			expectErr:  false,
		},
		{
			name:       "Wrong checksum value",
			path:       "/status",
			rawQuery:   "u=9&v=8",
			salt:       "pepper",
			enableAlgs: enabledAll,
			algo:       core.SHA256,
			forceBad:   true,
			expectErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u := &url.URL{Path: tt.path, RawQuery: tt.rawQuery}
			req := httptest.NewRequest(http.MethodGet, u.String(), nil)
			salt := tt.salt
			if tt.emptySalt {
				salt = ""
			}

			if salt != "" && !strings.Contains(tt.name, "missing checksum") {
				var checksum string
				if tt.forceBad {
					switch tt.algo {
					case core.SHA1:
						checksum = strings.Repeat("a", 40)
					case core.SHA256:
						checksum = strings.Repeat("b", 64)
					case core.SHA384:
						checksum = strings.Repeat("c", 96)
					case core.SHA512:
						checksum = strings.Repeat("d", 128)
					default:
						checksum = "abcde"
					}
				} else {
					var withChecksum string
					if tt.rawQuery == "" {
						withChecksum = core.ChecksumParam + "=PLACEHOLDER"
					} else {
						withChecksum = tt.rawQuery + "&" + core.ChecksumParam + "=PLACEHOLDER"
					}

					req.URL.RawQuery = withChecksum
					checksum = computeChecksumFor(req, salt, tt.algo)
				}

				if tt.rawQuery == "" {
					req.URL.RawQuery = core.ChecksumParam + "=" + checksum
				} else {
					req.URL.RawQuery = tt.rawQuery + "&" + core.ChecksumParam + "=" + checksum
				}
			}

			algos := tt.enableAlgs
			if algos == nil {
				algos = enabledAll
			}

			err := ValidateChecksum(req, salt, algos)

			if (err != nil) != tt.expectErr {
				t.Fatalf("ValidateChecksum() error = %v, expectErr = %v", err, tt.expectErr)
			}

			if tt.expectErr && salt != "" && strings.Contains(tt.name, "missing checksum") {
				_ = responses.ChecksumErrorKey
			}
		})
	}
}

func TestRemoveQueryParam(t *testing.T) {
	tests := []struct {
		name  string
		query string
		param string
		want  string
	}{
		{
			name:  "Empty query",
			query: "",
			param: "a",
			want:  "",
		},
		{
			name:  "No match returns original",
			query: "a=1&b=2&c=3",
			param: "x",
			want:  "a=1&b=2&c=3",
		},
		{
			name:  "Single match only",
			query: "a=1",
			param: "a",
			want:  "",
		},
		{
			name:  "Param at start",
			query: "a=1&b=2&c=3",
			param: "a",
			want:  "b=2&c=3",
		},
		{
			name:  "Param in middle",
			query: "a=1&b=2&c=3",
			param: "b",
			want:  "a=1&c=3",
		},
		{
			name:  "Param at end",
			query: "a=1&b=2&c=3",
			param: "c",
			want:  "a=1&b=2",
		},
		{
			name:  "Multiple occurrences removed",
			query: "a=1&a=2&a=3&b=4",
			param: "a",
			want:  "b=4",
		},
		{
			name:  "Key without equals",
			query: "a&b=2",
			param: "a",
			want:  "b=2",
		},
		{
			name:  "Remove other key when current has no equals",
			query: "a&b=2",
			param: "b",
			want:  "a",
		},
		{
			name:  "Empty values preserved for others",
			query: "a=&b=",
			param: "a",
			want:  "b=",
		},
		{
			name:  "Value contains equals (SplitN keeps it intact)",
			query: "note=remove=me&x=1",
			param: "note",
			want:  "x=1",
		},
		{
			name:  "Percent-encoded key must match exactly (no decoding)",
			query: "a%20b=1&c=2",
			param: "a b",
			want:  "a%20b=1&c=2",
		},
		{
			name:  "Percent-encoded key exact match",
			query: "a%20b=1&c=2",
			param: "a%20b",
			want:  "c=2",
		},
		{
			name:  "Empty key removal collapses stray separators",
			query: "a=1&&b=2&",
			param: "",
			want:  "a=1&b=2",
		},
		{
			name:  "Leading question mark is treated as part of key",
			query: "?a=1&b=2",
			param: "a",
			want:  "?a=1&b=2",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := RemoveQueryParam(tt.query, tt.param)
			if got != tt.want {
				t.Fatalf("RemoveQueryParam(%q, %q) = %q; want %q",
					tt.query, tt.param, got, tt.want)
			}
		})
	}
}

func intBoundsStrings() (minStr, maxStr, overMinStr, overMaxStr string) {
	if strconv.IntSize == 32 {
		minStr = "-2147483648"
		maxStr = "2147483647"
		overMinStr = "-2147483649"
		overMaxStr = "2147483648"
	} else {
		minStr = "-9223372036854775808"
		maxStr = "9223372036854775807"
		overMinStr = "-9223372036854775809"
		overMaxStr = "9223372036854775808"
	}
	return
}

func TestValidateInteger(t *testing.T) {
	minStr, maxStr, overMinStr, overMaxStr := intBoundsStrings()

	tests := []struct {
		name      string
		input     string
		wantError bool
		contains  string
	}{
		{name: "Simple zero", input: "0", wantError: false},
		{name: "Positive", input: "123", wantError: false},
		{name: "Negative", input: "-456", wantError: false},
		{name: "Leading plus", input: "+789", wantError: false},
		{name: "Leading zeros", input: "00042", wantError: false},
		{name: "Min int exact", input: minStr, wantError: false},
		{name: "Max int exact", input: maxStr, wantError: false},
		{name: "Empty string", input: "", wantError: true, contains: responses.InvalidInteger},
		{name: "Whitespace only", input: "   ", wantError: true},
		{name: "Leading space", input: " 1", wantError: true},
		{name: "Trailing space", input: "1 ", wantError: true},
		{name: "Alpha", input: "abc", wantError: true},
		{name: "Mixed", input: "12a3", wantError: true},
		{name: "Hex-like", input: "0x10", wantError: true},
		{name: "Underscores", input: "1_000", wantError: true},
		{name: "Sign only +", input: "+", wantError: true},
		{name: "Sign only -", input: "-", wantError: true},
		{name: "Over max int", input: overMaxStr, wantError: true},
		{name: "Under min int", input: overMinStr, wantError: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateInteger(tt.input)
			if (err != nil) != tt.wantError {
				t.Fatalf("ValidateInteger(%q) error=%v, wantError=%v", tt.input, err, tt.wantError)
			}
			if tt.wantError && tt.contains != "" {
				if !strings.Contains(err.Error(), tt.contains) || !strings.Contains(err.Error(), tt.input) {
					t.Fatalf("error %q does not include expected substrings %q and %q",
						err.Error(), tt.contains, tt.input)
				}
			}
		})
	}
}

func FuzzValidateInteger(f *testing.F) {
	minStr, maxStr, overMinStr, overMaxStr := intBoundsStrings()
	seeds := []string{
		"", "0", "00", "+0", "-0", "1", "-1", "+1",
		"123", "-456", "+789",
		" 1", "1 ", " 1 ", "   ",
		"abc", "12a3", "1_000", "0x10",
		minStr, maxStr, overMinStr, overMaxStr,
	}
	for _, s := range seeds {
		f.Add(s)
	}

	f.Fuzz(func(t *testing.T, s string) {
		gotErr := ValidateInteger(s)
		_, wantErr := strconv.Atoi(s)

		if (gotErr != nil) != (wantErr != nil) {
			t.Fatalf("Mismatch for %q: ValidateInteger err=%v, Atoi err=%v", s, gotErr, wantErr)
		}

		if gotErr != nil {
			msg := gotErr.Error()
			if !strings.Contains(msg, responses.InvalidInteger) || !strings.Contains(msg, s) {
				t.Fatalf("Error %q must contain %q and the input %q", msg, responses.InvalidInteger, s)
			}
		}
	})
}

func TestValidateStringLength(t *testing.T) {
	tests := []struct {
		name      string
		s         string
		min, max  int
		wantError bool
	}{
		{name: "Exact min", s: "abc", min: 3, max: 10, wantError: false},
		{name: "Exact max", s: "hello", min: 1, max: 5, wantError: false},
		{name: "Between min and max", s: "go", min: 1, max: 5, wantError: false},
		{name: "Empty allowed when min 0", s: "", min: 0, max: 5, wantError: false},
		{name: "Equal min and max exact match", s: "xx", min: 2, max: 2, wantError: false},

		{name: "Leading/trailing spaces trimmed", s: "  a  ", min: 1, max: 1, wantError: false},
		{name: "Spaces only becomes empty", s: "   ", min: 1, max: 5, wantError: true},

		{name: "Below min", s: "a", min: 2, max: 10, wantError: true},
		{name: "Over max", s: "toolong", min: 1, max: 3, wantError: true},

		{name: "Min zero max zero with empty", s: "", min: 0, max: 0, wantError: false},
		{name: "Min zero max zero non-empty", s: "x", min: 0, max: 0, wantError: true},

		{name: "Min greater than max (short string)", s: "ab", min: 3, max: 2, wantError: true},
		{name: "Min greater than max (long string)", s: "abcd", min: 3, max: 2, wantError: true},

		{name: "Non-ascii single rune two bytes ok when max>=2", s: "é", min: 1, max: 2, wantError: false},
		{name: "Non-ascii single rune two bytes fails when max=1", s: "é", min: 1, max: 1, wantError: true},
		{name: "Emoji 4 bytes fails when max=3", s: "🙂", min: 1, max: 3, wantError: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateStringLength(tt.s, tt.min, tt.max)
			if (err != nil) != tt.wantError {
				t.Fatalf("ValidateStringLength(%q, %d, %d) error=%v, wantError=%v",
					tt.s, tt.min, tt.max, err, tt.wantError)
			}
			if tt.wantError {
				if err == nil {
					t.Fatalf("Expected error but got nil")
				}

				msg := err.Error()
				if !strings.Contains(msg, responses.InvalidStringLength) {
					t.Fatalf("Error %q does not contain %q", msg, responses.InvalidStringLength)
				}
				if !strings.Contains(msg, strconv.Itoa(tt.min)) || !strings.Contains(msg, strconv.Itoa(tt.max)) {
					t.Fatalf("Error %q should mention min=%d and max=%d", msg, tt.min, tt.max)
				}
			}
		})
	}
}

func TestValidateBoolean(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		wantError bool
	}{
		{name: "True lowercase", input: "true", wantError: false},
		{name: "False lowercase", input: "false", wantError: false},
		{name: "True uppercase", input: "TRUE", wantError: false},
		{name: "False mixed", input: "False", wantError: false},
		{name: "True mixed", input: "TrUe", wantError: false},

		{name: "Numeric 0", input: "0", wantError: false},
		{name: "Numeric 1", input: "1", wantError: false},

		{name: "Empty string (special error path)", input: "", wantError: true},
		{name: "Leading space", input: " true", wantError: true},
		{name: "Trailing space", input: "false ", wantError: true},
		{name: "Surrounded spaces", input: " 1 ", wantError: true},
		{name: "Newline", input: "true\n", wantError: true},

		{name: "Yes", input: "yes", wantError: true},
		{name: "No", input: "no", wantError: true},
		{name: "T", input: "t", wantError: true},
		{name: "F", input: "f", wantError: true},
		{name: "2", input: "2", wantError: true},
		{name: "-1", input: "-1", wantError: true},
		{name: "01", input: "01", wantError: true},
		{name: "Mixed alphanumeric", input: "true1", wantError: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateBoolean(tt.input)
			if (err != nil) != tt.wantError {
				t.Fatalf("ValidateBoolean(%q) error=%v, wantError=%v", tt.input, err, tt.wantError)
			}
			if tt.wantError {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				msg := err.Error()

				if !strings.Contains(msg, responses.InvalidBoolean) {
					t.Fatalf("Error %q does not contain %q", msg, responses.InvalidBoolean)
				}

				if tt.input != "" && !strings.Contains(msg, tt.input) {
					t.Fatalf("Error %q should include the original input %q", msg, tt.input)
				}
			}
		})
	}
}
