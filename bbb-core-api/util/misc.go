package util

import (
	"encoding/hex"
	"hash"
	"regexp"
	"strings"
)

func StripCtrlChars(input string) string {
	r, _ := regexp.Compile("\\p{Cc}")
	output := r.ReplaceAllString(input, "")
	return strings.TrimSpace(output)
}

func GenerateHashString(data string, h hash.Hash) string {
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

func RemoveQueryParam(queryString, param string) string {
	entries := strings.Split(queryString, "&")
	var newEntries []string

	for _, entry := range entries {
		if kv := strings.SplitN(entry, "=", 2); kv[0] != param {
			newEntries = append(newEntries, entry)
		}
	}

	return strings.Join(newEntries, "&")
}
