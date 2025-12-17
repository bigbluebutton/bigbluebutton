package core

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/random"
)

// A MockRequest is a repesentation of a incoming
// HTTP request to a BBB API.
type MockRequest struct {
	Params   bbbhttp.Params
	Checksum string
	Query    string
	Body     io.Reader
	URL      string
}

// AddQueryParams inserts a new request paramter for the
// current MockRequest that is part of the URL query string.
func (r *MockRequest) AddQueryParam(key, value string) {
	r.Params.Add(key, bbbhttp.Param{
		Value:     value,
		FromQuery: true,
	})
}

// AddBodyParam inserts a new request parameter for the
// current MockRequest that is part of the request body.
func (r *MockRequest) AddBodyParam(key, value string) {
	r.Params.Add(key, bbbhttp.Param{
		Value:    value,
		FromBody: true,
	})
}

// BuildQuery constructs the URL query string for the
// MockRequest.
func (r *MockRequest) BuildQuery() {
	var sb strings.Builder
	for k, v := range r.Params {
		for _, p := range v {
			if p.FromQuery {
				sb.WriteString(fmt.Sprintf("%s=%s&", k, p.Value))
			}
		}
	}

	q := sb.String()
	if last := len(q) - 1; last >= 0 && q[last] == '&' {
		q = q[:last]
	}
	r.Query = q
}

// ComputeChecksum calculates the checksum for the MockRequest
// from the MockRequest URL query string combined with the provided
// endpoint and salt using the specified hashing algorihtm.
func (r *MockRequest) ComputeChecksum(endpoint, salt, algo string) {
	data := endpoint + r.Query + salt

	switch algo {
	case SHA1:
		r.Checksum = random.Sha1Hex(data)
	case SHA256:
		r.Checksum = random.Sha256Hex(data)
	case SHA384:
		r.Checksum = random.Sha384Hex(data)
	case SHA512:
		r.Checksum = random.Sha512Hex(data)
	}
}

// BuildBody constructs the request body for the MockRequest.
func (r *MockRequest) BuildBody() (io.Reader, error) {
	var body bbbhttp.Params
	for k, v := range r.Params {
		for _, p := range v {
			if p.FromBody {
				body.Add(k, p)
			}
		}
	}

	b, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal mock request body: %w", err)
	}

	return bytes.NewBuffer(b), nil
}

// BuildRequest constructs a http.Request corresponding to the
// parameters of the MockRequest.
func (r *MockRequest) BuildRequest(method, url string) (*http.Request, error) {
	var sb strings.Builder
	sb.WriteString(url + "?")

	if r.Query != "" {
		sb.WriteString(r.Query + "&")
	}

	if r.Checksum != "" {
		sb.WriteString("checksum=" + r.Checksum)
	}

	finalURL := sb.String()

	if last := len(finalURL) - 1; last >= 0 &&
		(finalURL[last] == '&' || finalURL[last] == '=') {
		finalURL = finalURL[:last]
	}

	req, err := http.NewRequest(method, finalURL, r.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to build mock HTTP request: %w", err)
	}
	return req, nil
}
