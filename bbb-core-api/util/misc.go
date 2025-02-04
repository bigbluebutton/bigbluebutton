package util

import (
	"regexp"
	"strings"
)

func StripCtrlChars(input string) string {
	r, _ := regexp.Compile("\\p{Cc}")
	output := r.ReplaceAllString(input, "")
	return strings.TrimSpace(output)
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
