package random

import (
	"bytes"
	"crypto/rand"
	"fmt"
	"io"
	"regexp"
	"strings"
	"testing"
	"unicode/utf8"
)

type errReader struct{ err error }

func (e errReader) Read(_ []byte) (int, error) { return 0, e.err }

func TestUUID(t *testing.T) {
	orig := rand.Reader
	t.Cleanup(func() { rand.Reader = orig })

	seed := []byte{
		0x00, 0x01, 0x02, 0x03,
		0x04, 0x05,
		0x06, 0x07,
		0x08, 0x09,
		0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
	}
	{
		b := make([]byte, len(seed))
		copy(b, seed)
		b[6] = (b[6] & 0x0f) | 0x40
		b[8] = (b[8] & 0x3f) | 0x80
		exp := fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
			b[0:4], b[4:6], b[6:8], b[8:10], b[10:])

		tests := []struct {
			name       string
			reader     io.Reader
			wantErr    bool
			checkRegex bool
			wantExact  string
		}{
			{
				name:       "Success deterministic",
				reader:     bytes.NewReader(seed),
				wantErr:    false,
				checkRegex: true,
				wantExact:  exp,
			},
			{
				name:    "Short read (unexpected EOF)",
				reader:  bytes.NewReader(seed[:10]),
				wantErr: true,
			},
			{
				name:    "Reader error",
				reader:  errReader{err: io.ErrClosedPipe},
				wantErr: true,
			},
		}

		uuidRegex := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				rand.Reader = tt.reader

				got, err := UUID()
				if (err != nil) != tt.wantErr {
					t.Fatalf("UUID() error = %v, wantErr = %v", err, tt.wantErr)
				}
				if tt.wantErr {
					if got != "" {
						t.Fatalf("UUID() returned non-empty string on error: %q", got)
					}
					return
				}

				if tt.wantExact != "" && got != tt.wantExact {
					t.Fatalf("UUID() = %q, want %q", got, tt.wantExact)
				}
				if tt.checkRegex && !uuidRegex.MatchString(got) {
					t.Fatalf("UUID %q does not match expected pattern", got)
				}
			})
		}
	}
}

func onlyFromSet(s, chars string) bool {
	lookup := make([]bool, 256)
	for i := 0; i < len(chars); i++ {
		lookup[chars[i]] = true
	}
	for i := 0; i < len(s); i++ {
		if !lookup[s[i]] {
			return false
		}
	}
	return true
}

func TestString_Table(t *testing.T) {
	tests := []struct {
		name     string
		n        int
		chars    string
		wantLen  int
		checkSet bool
		onlyChar byte
	}{
		{
			name:     "n=0",
			n:        0,
			chars:    Lower,
			wantLen:  0,
			checkSet: true,
		},
		{
			name:     "Negative n",
			n:        -5,
			chars:    Lower,
			wantLen:  0,
			checkSet: true,
		},
		{
			name:     "Single-char charset is deterministic",
			n:        8,
			chars:    "X",
			wantLen:  8,
			checkSet: true,
			onlyChar: 'X',
		},
		{
			name:     "Lowercase set typical length",
			n:        32,
			chars:    Lower,
			wantLen:  32,
			checkSet: true,
		},
		{
			name:     "Mixed alpha numeric set",
			n:        64,
			chars:    Lower + Upper + Nums,
			wantLen:  64,
			checkSet: true,
		},
		{
			name:     "Large length",
			n:        1024,
			chars:    Upper,
			wantLen:  1024,
			checkSet: true,
		},
		{
			name:     "Empty charset and n>0",
			n:        4,
			chars:    "",
			wantLen:  0,
			checkSet: false,
		},
		{
			name:     "Empty charset and n=0 returns empty",
			n:        0,
			chars:    "",
			wantLen:  0,
			checkSet: false,
		},
		{
			name:     "Nums set",
			n:        16,
			chars:    Nums,
			wantLen:  16,
			checkSet: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := String(tt.n, tt.chars)

			if len(got) != tt.wantLen {
				t.Fatalf("len(String(%d, %q))=%d, want %d", tt.n, tt.chars, len(got), tt.wantLen)
			}

			if !utf8.ValidString(got) {
				t.Fatalf("Output is not valid UTF-8: %q", got)
			}

			if tt.checkSet && len(tt.chars) > 0 && !onlyFromSet(got, tt.chars) {
				t.Fatalf("Output %q contains characters outside of charset %q", got, tt.chars)
			}

			if tt.onlyChar != 0 {
				for i := 0; i < len(got); i++ {
					if got[i] != tt.onlyChar {
						t.Fatalf("Determinism failed: expected all %q, got %q", tt.onlyChar, got)
					}
				}
			}
		})
	}
}

func FuzzString(f *testing.F) {
	seeds := []struct {
		n     int
		chars string
	}{
		{0, Lower},
		{1, "X"},
		{8, Lower},
		{16, Upper},
		{32, Nums},
		{64, Lower + Upper + Nums},
		{-5, Lower},
		{0, ""},
		{5, ""},
	}
	for _, s := range seeds {
		f.Add(s.n, s.chars)
	}

	f.Fuzz(func(t *testing.T, n int, chars string) {
		got := String(n, chars)

		wantLen := 0
		if n > 0 && len(chars) > 0 {
			wantLen = n
		}
		if len(got) != wantLen {
			t.Fatalf("len(String(%d, charset[%d]))=%d, want %d", n, len(chars), len(got), wantLen)
		}

		allSingleByte := true
		for _, r := range chars {
			if r > 0xFF {
				allSingleByte = false
				break
			}
		}
		if wantLen > 0 && allSingleByte && len(chars) > 0 && !onlyFromSet(got, chars) {
			t.Fatalf("Output contains bytes outside provided charset")
		}
	})
}

func formatUUIDFromSeed(seed []byte) string {
	if len(seed) != 16 {
		panic("seed must be 16 bytes")
	}
	b := make([]byte, 16)
	copy(b, seed)

	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

func TestPresentationID_Success_DeterministicUUID(t *testing.T) {
	orig := rand.Reader
	t.Cleanup(func() { rand.Reader = orig })

	seed := []byte{
		0x00, 0x01, 0x02, 0x03,
		0x04, 0x05,
		0x06, 0x07,
		0x08, 0x09,
		0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
	}
	rand.Reader = bytes.NewReader(seed)

	wantUUID := formatUUIDFromSeed(seed)
	name := "pres"

	id := PresentationID(name)

	parts := strings.Split(id, "-")
	if len(parts) != 2 {
		t.Fatalf("PresentationID format invalid, expected 2 parts: %q", id)
	}
	leftHex := parts[0]

	if len(leftHex) != 40 {
		t.Fatalf("Hash length = %d, want 40; got: %q", len(leftHex), leftHex)
	}

	wantHex := Sha1Hex(name + wantUUID)
	if leftHex != wantHex {
		t.Fatalf("Hash mismatch: got %q, want %q (name=%q uuid=%q)", leftHex, wantHex, name, wantUUID)
	}
}

func TestPresentationID_UUIDFailure_UsesEmptyUUIDInHash(t *testing.T) {
	orig := rand.Reader
	t.Cleanup(func() { rand.Reader = orig })

	rand.Reader = errReader{err: io.ErrClosedPipe}

	name := "pres"
	id := PresentationID(name)

	parts := strings.Split(id, "-")
	if len(parts) != 2 {
		t.Fatalf("PresentationID format invalid, expected 2 parts: %q", id)
	}
	leftHex := parts[0]

	wantHex := Sha1Hex(name + "")
	if leftHex != wantHex {
		t.Fatalf("Hash with UUID failure mismatch: got %q, want %q", leftHex, wantHex)
	}
}

func TestPresentationID_EmptyName_OK(t *testing.T) {
	orig := rand.Reader
	t.Cleanup(func() { rand.Reader = orig })

	seed := bytes.Repeat([]byte{0xAB}, 16)
	rand.Reader = bytes.NewReader(seed)
	wantUUID := formatUUIDFromSeed(seed)

	id := PresentationID("")
	parts := strings.Split(id, "-")
	if len(parts) != 2 {
		t.Fatalf("PresentationID format invalid, expected 2 parts: %q", id)
	}
	leftHex := parts[0]

	wantHex := Sha1Hex("" + wantUUID)
	if leftHex != wantHex {
		t.Fatalf("Hash mismatch for empty name: got %q, want %q", leftHex, wantHex)
	}
}
