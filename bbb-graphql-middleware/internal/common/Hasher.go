package common

import (
	"crypto/sha256"
	"fmt"
)

func GenerateSha256(data []byte) string {
	hasher := sha256.New()
	hasher.Write(data)
	return fmt.Sprintf("%x", hasher.Sum(nil))
}
