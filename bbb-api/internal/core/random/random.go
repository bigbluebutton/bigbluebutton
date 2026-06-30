// Package random provides functionality for
// generating various types of random data.
package random

import (
	"crypto/rand"
	"fmt"
	"io"
	"log/slog"
	"math/big"
	"strconv"
	"strings"
	"time"
)

const (
	Lower = "abcdefghijklmnopqrstuvwxyz"
	Upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	Nums  = "0123456789"
)

// UUID attempts to generate a random UUID string.
// Returns either a UUID or an empty string along
// with an error if UUID generation fails.
func UUID() (string, error) {
	uuid := make([]byte, 16)
	n, err := io.ReadFull(rand.Reader, uuid)
	if n != len(uuid) || err != nil {
		return "", fmt.Errorf("failed to generate UUID: %w", err)
	}

	uuid[6] = (uuid[6] & 0x0f) | 0x40
	uuid[8] = (uuid[8] & 0x3f) | 0x80

	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		uuid[0:4], uuid[4:6], uuid[6:8], uuid[8:10], uuid[10:]), nil
}

// String generates a random string of length
// n using the provided character set. Returns
// an empty string if the desired length is
// greater than zero but no characters are provided.
// Only single-byte characters should be contained
// in the character set.
func String(n int, chars string) string {
	var sb strings.Builder
	k := len(chars)

	if n > 0 && k == 0 {
		return ""
	}

	for i := 0; i < n; i++ {
		r, _ := rand.Int(rand.Reader, big.NewInt(int64(k)))
		c := chars[r.Int64()]
		sb.WriteByte(c)
	}
	return sb.String()
}

// PresentationID generates a random presentation ID.
// A presentation ID is the SHA-1 hex digest of the
// given presentation name concatenated with a UUID
// which is then concatenated with the current Unix
// timestamp.
func PresentationID(name string) string {
	uuid, err := UUID()
	if err != nil {
		slog.Warn("failed to obtain UUID, using empty string", "error", err)
	}
	millis := time.Now().UnixMilli()
	hex := Sha1Hex(name + uuid)
	return fmt.Sprintf("%s-%s", hex, strconv.FormatInt(millis, 10))
}

// AlphaString generates a random alphabetic
// string of length n.
func AlphaString(n int) string {
	return String(n, Lower+Upper)
}

// LowerAlphaString generates a random lowercase
// alphabetic string of length n.
func LowerAlphaString(n int) string {
	return String(n, Lower)
}

// UpperAlphaString generates a random uppercase
// alphabetic string of length n.
func UpperAlphaString(n int) string {
	return String(n, Upper)
}

// AlphaNumString generates a random alphanumeric
// string of length n.
func AlphaNumString(n int) string {
	return String(n, Lower+Upper+Nums)
}
