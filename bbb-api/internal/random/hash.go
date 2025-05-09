package random

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"hash"
)

func GenerateHashString(data string, h hash.Hash) string {
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

func Sha1Hex(data string) string {
	return GenerateHashString(data, sha1.New())
}

func Sha256Hex(data string) string {
	return GenerateHashString(data, sha256.New())
}

func Sha384Hex(data string) string {
	return GenerateHashString(data, sha512.New384())
}

func Sha512Hex(data string) string {
	return GenerateHashString(data, sha512.New())
}
