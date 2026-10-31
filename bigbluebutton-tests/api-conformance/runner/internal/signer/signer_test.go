package signer

import (
	"strings"
	"testing"
)

// The inputs come from bbb-web's ValidationServiceChecksumSpec.groovy
// (validChecksumFor, line 86) and from bbb-api's validation_test.go on the
// port branch. The expected digests were computed with coreutils
// (printf '%s' INPUT | sha1sum, sha256sum, ...), not with Go.
var vectors = []struct {
	source, alg, call, query, salt, want string
}{
	{"bbb-web spec", "sha1", "getMeetings", "", "b4578c133b8a49acaecacbb3abec91a1", "626a395f69c5f3a3e04145a8262c318c6f788808"},
	{"bbb-api test", "sha1", "create", "x=1&y=2", "sauce", "1bad859b521a7346a65c079f4e32348be9e8b196"},
	{"bbb-api test", "sha256", "update", "x=apple&y=banana", "s0lt", "32015bbcdf225f76248a135ae0f9ebc069f4b4ffac39ef3a184adace1872cb49"},
	{"bbb-api test", "sha384", "delete", "a=1&b=2&c=3", "salty", "55d53444f813d03953b16030e949d4f7dadb0930bd2b95da9b2829873a6ea4672ee2110bf5a27d78bc24239e3049c370"},
	{"bbb-api test", "sha512", "info", "p=alpha&q=beta&r=gamma&s=delta", "NaCl", "328a4c8970683934e4a4df11f5ab4dff87d95f8edb2df3846d6d9f4271934034aa755a52c98471c72d230f2590347dfdbcdb58eec615f472953f1b111b2cb88e"},
}

func TestChecksumVectors(t *testing.T) {
	for _, v := range vectors {
		got, err := Checksum(v.alg, v.call, v.query, v.salt)
		if err != nil {
			t.Fatal(err)
		}
		if got != v.want {
			t.Errorf("%s %s(%s%s<salt>) = %s, want %s", v.source, v.alg, v.call, v.query, got, v.want)
		}
	}
	if _, err := Digest("md5", "x"); err == nil {
		t.Error("md5 should be rejected")
	}
}

// stripLikeBBBWeb removes the checksum the way GetChecksum.java does: three
// literal replaces of every occurrence. It is deliberately not built on
// Sign, so placement is checked against bbb-web's rule, not against itself.
func stripLikeBBBWeb(query, checksum string) string {
	query = strings.ReplaceAll(query, "&checksum="+checksum, "")
	query = strings.ReplaceAll(query, "checksum="+checksum+"&", "")
	return strings.ReplaceAll(query, "checksum="+checksum, "")
}

func checksumParams(query string) []string {
	var out []string
	for _, p := range strings.Split(query, "&") {
		if v, ok := strings.CutPrefix(p, "checksum="); ok {
			out = append(out, v)
		}
	}
	return out
}

func TestPlacement(t *testing.T) {
	const salt = "s3cret"
	queries := []string{"", "a=1", "a=1&b=2", "a=1&b=2&c=3&d=4", "&fullName=Ann&meetingID=m"}
	for _, q := range queries {
		for _, pos := range []string{PosFirst, PosMiddle, PosLast} {
			for _, mode := range []string{ModeValid, ModeUppercase} {
				if pos == PosMiddle && strings.Count(q, "&") < 1 {
					continue
				}
				signed, err := Sign(Request{Call: "join", Query: q, Salt: salt, Alg: "sha256", Mode: mode, Position: pos})
				if err != nil {
					t.Fatalf("Sign(%q, %s, %s): %v", q, pos, mode, err)
				}
				sums := checksumParams(signed)
				if len(sums) != 1 {
					t.Fatalf("Sign(%q, %s) = %q: want one checksum param", q, pos, signed)
				}
				if got := stripLikeBBBWeb(signed, sums[0]); got != q {
					t.Errorf("Sign(%q, %s, %s) = %q; bbb-web would hash %q", q, pos, mode, signed, got)
				}
				want, _ := Checksum("sha256", "join", q, salt)
				if !strings.EqualFold(sums[0], want) {
					t.Errorf("Sign(%q, %s, %s): checksum %s, want %s (any case)", q, pos, mode, sums[0], want)
				}
				if (mode == ModeUppercase) != (sums[0] == strings.ToUpper(want)) {
					t.Errorf("Sign(%q, %s, %s): checksum %s has the wrong case", q, pos, mode, sums[0])
				}
			}
		}
	}
	if _, err := Sign(Request{Call: "join", Query: "a=1", Salt: salt, Alg: "sha1", Position: PosMiddle}); err == nil {
		t.Error("middle with one param should be an error")
	}
}

func TestModes(t *testing.T) {
	base := Request{Call: "getMeetings", Query: "a=1", Salt: "s", Alg: "sha1"}
	good, _ := Checksum("sha1", "getMeetings", "a=1", "s")

	none := base
	none.Mode = ModeNone
	if got, _ := Sign(none); got != "a=1" {
		t.Errorf("none = %q", got)
	}

	dup := base
	dup.Mode = ModeDuplicate
	if got, _ := Sign(dup); got != "a=1&checksum="+good+"&checksum="+good {
		t.Errorf("duplicate = %q", got)
	}

	bad := base
	bad.Mode = ModeBad
	got, _ := Sign(bad)
	sums := checksumParams(got)
	if len(sums) != 1 || len(sums[0]) != len(good) || sums[0] == good {
		t.Errorf("bad = %q: want one checksum of the right length that doesn't match %s", got, good)
	}

	empty := base
	empty.Query = ""
	if got, _ := Sign(empty); !strings.HasPrefix(got, "checksum=") || strings.Contains(got, "&") {
		t.Errorf("no params = %q, want checksum=X alone", got)
	}

	unknown := base
	unknown.Mode = "sideways"
	if _, err := Sign(unknown); err == nil {
		t.Error("an unknown mode should be an error")
	}
}

func TestWrongLengthReencodeAndSignAs(t *testing.T) {
	base := Request{Call: "getMeetings", Query: "a=x+y&b=1", Salt: "s", Alg: "sha256"}
	good, _ := Checksum("sha256", "getMeetings", base.Query, "s")

	short := base
	short.Mode = ModeWrongLength
	got, err := Sign(short)
	if err != nil || got != base.Query+"&checksum="+good[:63] {
		t.Errorf("wrong-length = %q, %v; want the valid checksum minus its last digit", got, err)
	}

	re := base
	re.Mode = ModeReencode
	want, _ := Checksum("sha256", "getMeetings", "a=x%20y&b=1", "s")
	if got, err := Sign(re); err != nil || got != base.Query+"&checksum="+want {
		t.Errorf("reencode = %q, %v; want the + form sent, signed as %%20", got, err)
	}
	re.Query = "a=1"
	if _, err := Sign(re); err == nil {
		t.Error("reencode without a space in the query should be an error")
	}

	as := base
	as.SignAs = "isMeetingRunning"
	want, _ = Checksum("sha256", "isMeetingRunning", base.Query, "s")
	if got, err := Sign(as); err != nil || got != base.Query+"&checksum="+want {
		t.Errorf("sign as isMeetingRunning = %q, %v", got, err)
	}
}
