package tmpl

import "strings"

const upperHex = "0123456789ABCDEF"

// QueryEscape encodes s the way Java's URLEncoder does with UTF-8, which is
// how bbb-web encodes the links it builds: letters, digits and . - * _ stay
// as they are, a space becomes +, and every other byte becomes %XX. Go's
// url.QueryEscape differs on * (escaped) and ~ (kept).
func QueryEscape(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); i++ {
		c := s[i]
		switch {
		case 'a' <= c && c <= 'z', 'A' <= c && c <= 'Z', '0' <= c && c <= '9', c == '.', c == '-', c == '*', c == '_':
			b.WriteByte(c)
		case c == ' ':
			b.WriteByte('+')
		default:
			b.WriteByte('%')
			b.WriteByte(upperHex[c>>4])
			b.WriteByte(upperHex[c&15])
		}
	}
	return b.String()
}
