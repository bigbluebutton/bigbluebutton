// Package guard holds the checks the tap and the sink make before
// answering with what they saw: the Host a request is addressed to and
// its bearer token.
package guard

import (
	"crypto/subtle"
	"net"
	"net/http"
	"strings"
)

// AnswersTo says whether a request for host is addressed to the server by
// an IP address, localhost or one of names, and not by some other name
// that happens to resolve to it, as a DNS-rebinding page's would.
func AnswersTo(host string, names []string) bool {
	h, _, err := net.SplitHostPort(host)
	if err != nil {
		h = host
	}
	h = strings.TrimSuffix(strings.Trim(h, "[]"), ".")
	if net.ParseIP(h) != nil || strings.EqualFold(h, "localhost") {
		return true
	}
	for _, name := range names {
		if strings.EqualFold(h, name) {
			return true
		}
	}
	return false
}

// BearerOK says whether r carries token as its bearer token; any request
// does when token is "".
func BearerOK(r *http.Request, token string) bool {
	if token == "" {
		return true
	}
	got, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
	return ok && subtle.ConstantTimeCompare([]byte(got), []byte(token)) == 1
}
