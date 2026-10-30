package sink

import (
	"net/http"
	"time"
)

// What the sink's own API answers, on paths that start with an
// underscore. Every answer is JSON; errors are {"error": "..."} with a
// 4xx or 5xx status.

// Info describes a running sink: GET /_info.
type Info struct {
	Instance string `json:"instance"`
	Seq      int64  `json:"seq"` // the last request recorded
	Fixtures string `json:"fixtures,omitempty"`
}

// Request is one request the sink recorded, as it arrived.
type Request struct {
	Seq           int64       `json:"seq"`
	At            time.Time   `json:"at"`
	Key           string      `json:"key"`
	Method        string      `json:"method"`
	Path          string      `json:"path"`     // decoded
	RawQuery      string      `json:"rawQuery"` // as sent
	Header        http.Header `json:"headers"`  // with Host
	Body          string      `json:"body,omitempty"`
	BodyEncoding  string      `json:"bodyEncoding,omitempty"` // base64 when the body isn't UTF-8
	BodySize      int64       `json:"bodySize"`
	BodyTruncated bool        `json:"bodyTruncated,omitempty"` // only the first MaxBody bytes are kept
}

// Received answers GET /_received: a key's requests after the given seq,
// up to Seq, the last request looked at. Truncated says some requests in
// that span were already dropped to keep the log's size.
type Received struct {
	Instance  string    `json:"instance"`
	Seq       int64     `json:"seq"`
	Truncated bool      `json:"truncated,omitempty"`
	Requests  []Request `json:"requests"`
}

// MaxBody is the most of a request's body the sink keeps.
const MaxBody = 64 << 10
