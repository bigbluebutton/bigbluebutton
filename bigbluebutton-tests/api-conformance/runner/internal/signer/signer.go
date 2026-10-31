// Package signer adds BBB API checksums to query strings.
//
// bbb-web hashes callName + queryWithoutChecksum + salt, where the query is
// the raw string the client sent with "&checksum=X", "checksum=X&" and
// "checksum=X" removed (GetChecksum.java). It picks the algorithm by the
// checksum's length and compares hex case-insensitively. So the signer
// hashes exactly the string it will send, then inserts the checksum.
package signer

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"hash"
	"strings"
)

// Modes and positions, as the case format names them.
const (
	ModeValid     = "valid"
	ModeUppercase = "uppercase"
	ModeBad       = "bad"
	ModeDuplicate = "duplicate"
	ModeNone      = "none"
	// ModeWrongLength sends the valid checksum minus its last hex digit, a
	// length no algorithm has.
	ModeWrongLength = "wrong-length"
	// ModeReencode signs the query with each + (an encoded space) written
	// as %20, then sends it with +: the same params, a different string.
	ModeReencode = "reencode"

	PosFirst  = "first"
	PosMiddle = "middle"
	PosLast   = "last"
)

func newHash(alg string) (hash.Hash, error) {
	switch alg {
	case "sha1":
		return sha1.New(), nil
	case "sha256":
		return sha256.New(), nil
	case "sha384":
		return sha512.New384(), nil
	case "sha512":
		return sha512.New(), nil
	}
	return nil, fmt.Errorf("unknown checksum algorithm %q", alg)
}

// Digest returns the lowercase hex digest of s.
func Digest(alg, s string) (string, error) {
	h, err := newHash(alg)
	if err != nil {
		return "", err
	}
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil)), nil
}

// Checksum is Digest(alg, call + query + salt).
func Checksum(alg, call, query, salt string) (string, error) {
	return Digest(alg, call+query+salt)
}

// Request is one query string to sign.
type Request struct {
	Call     string // the API call name, e.g. getMeetings
	SignAs   string // sign with this call name instead, if set
	Query    string // the encoded query, without a checksum
	Salt     string
	Alg      string
	Mode     string // default valid
	Position string // default last
}

// Sign returns the query string to send.
func Sign(r Request) (string, error) {
	mode, pos := r.Mode, r.Position
	if mode == "" {
		mode = ModeValid
	}
	if pos == "" {
		pos = PosLast
	}
	if mode == ModeNone {
		return r.Query, nil
	}
	call, signed := r.Call, r.Query
	if r.SignAs != "" {
		call = r.SignAs
	}
	if mode == ModeReencode {
		if !strings.Contains(r.Query, "+") {
			return "", fmt.Errorf("sign mode reencode needs a param value with a space, which the query encodes as +")
		}
		signed = strings.ReplaceAll(r.Query, "+", "%20")
	}
	sum, err := Checksum(r.Alg, call, signed, r.Salt)
	if err != nil {
		return "", err
	}
	switch mode {
	case ModeValid, ModeDuplicate, ModeReencode:
	case ModeUppercase:
		sum = strings.ToUpper(sum)
	case ModeBad:
		sum = corrupt(sum)
	case ModeWrongLength:
		sum = sum[:len(sum)-1]
	default:
		return "", fmt.Errorf("unknown sign mode %q", mode)
	}
	pair := "checksum=" + sum
	if mode == ModeDuplicate {
		pair += "&" + pair
	}
	return insert(r.Query, pair, pos)
}

// corrupt changes the last hex digit, so the checksum keeps its length (and
// so its algorithm) but can't match.
func corrupt(sum string) string {
	last := sum[len(sum)-1]
	repl := byte('0')
	if last == '0' {
		repl = '1'
	}
	return sum[:len(sum)-1] + string(repl)
}

func insert(query, pair, pos string) (string, error) {
	if query == "" {
		return pair, nil
	}
	switch pos {
	case PosLast:
		return query + "&" + pair, nil
	case PosFirst:
		return pair + "&" + query, nil
	case PosMiddle:
		parts := strings.Split(query, "&")
		if len(parts) < 2 {
			return "", fmt.Errorf("position middle needs at least two other params, got %d", len(parts))
		}
		mid := len(parts) / 2
		return strings.Join(parts[:mid], "&") + "&" + pair + "&" + strings.Join(parts[mid:], "&"), nil
	}
	return "", fmt.Errorf("unknown checksum position %q", pos)
}
