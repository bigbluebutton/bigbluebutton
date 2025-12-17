package random

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"hash"
)

// GenerateHashString computes a hash digest from
// the given data string using the chosen hashing algorithm.
func GenerateHashString(data string, h hash.Hash) string {
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

// Sha1Hex generates a SHA-1 hex string
// from the given data string.
func Sha1Hex(data string) string {
	return GenerateHashString(data, sha1.New())
}

// Sha256Hex generates a SHA-256 hex string
// from the given data string.
func Sha256Hex(data string) string {
	return GenerateHashString(data, sha256.New())
}

// Sha384Hex generates a SHA-384 hex string
// from the given data string.
func Sha384Hex(data string) string {
	return GenerateHashString(data, sha512.New384())
}

// Sha512Hex generates a SHA-512 hex string
// from the given data string.
func Sha512Hex(data string) string {
	return GenerateHashString(data, sha512.New())
}
