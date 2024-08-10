package random

import (
	"crypto/rand"
	"fmt"
	"io"
	"math/big"
	"strings"
)

const (
	lower = "abcdefghijklmnopqrstuvwxyz"
	upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	nums  = "0123456789"
)

func NewUUID() (string, error) {
	uuid := make([]byte, 16)
	n, err := io.ReadFull(rand.Reader, uuid)
	if n != len(uuid) || err != nil {
		return "", err
	}

	uuid[6] = (uuid[6] & 0x0f) | 0x40 // Version 4
	uuid[8] = (uuid[8] & 0x3f) | 0x80 // Variant is 10

	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		uuid[0:4], uuid[4:6], uuid[6:8], uuid[8:10], uuid[10:]), nil
}

func String(n int, chars string) string {
	var sb strings.Builder
	k := len(chars)

	for i := 0; i < n; i++ {
		r, _ := rand.Int(rand.Reader, big.NewInt(int64(k)))
		c := chars[r.Int64()]
		sb.WriteByte(c)
	}
	return sb.String()
}

func AlphaString(n int) string {
	return String(n, lower+upper)
}

func LowerAlphaString(n int) string {
	return String(n, lower)
}

func UpperAlphaString(n int) string {
	return String(n, upper)
}

func AlphaNumString(n int) string {
	return String(n, lower+upper+nums)
}
