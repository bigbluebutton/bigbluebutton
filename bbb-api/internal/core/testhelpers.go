package core

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
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
	Ctx      context.Context
}

// NewMockRequest constructs a new [MockRequest] for
// use in testing BBB APIs.
func NewMockRequest(opts ...func(*MockRequest)) *MockRequest {
	req := &MockRequest{
		Params: make(bbbhttp.Params),
		Ctx:    context.Background(),
	}
	for _, opt := range opts {
		opt(req)
	}
	return req
}

// WithQueryParam is a functional option for a [MockRequest]
// that inserts a new request paramter as part of the URL
// query string.
func WithQueryParam(key, value string) func(*MockRequest) {
	return func(r *MockRequest) {
		r.Params.Add(key, bbbhttp.Param{
			Value:     value,
			FromQuery: true,
		})
	}
}

// WithBodyParam is a functional option for a [MockRequest]
// that inserts a new request parameter as part of the
// request body.
func WithBodyParam(key, value string) func(*MockRequest) {
	return func(r *MockRequest) {
		r.Params.Add(key, bbbhttp.Param{
			Value:    value,
			FromBody: true,
		})
	}
}

// WithContext is a functional option for a [MockRequest]
// that sets the context of the MockRequest to the given
// context if the provided contetx is non-nil.
func WithContext(ctx context.Context) func(*MockRequest) {
	return func(r *MockRequest) {
		if ctx != nil {
			r.Ctx = ctx
		}
	}
}

// WithQueryString is a functional option for a [MockRequest]
// that constructs the URL query string for the request.
func WithQueryString() func(*MockRequest) {
	return func(r *MockRequest) {
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
}

// WithChecksum is a functional option for a [MockRequest]
// that calculates the checksum for the request from the
// request's URL query string combined with the provided
// endpoint and salt using the specified hashing algorihtm.
func WithChecksum(endpoint, salt, algo string) func(*MockRequest) {
	return func(r *MockRequest) {
		if r.Query == "" {
			WithQueryString()(r)
		}

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
}

// WithRequestBody is a functional option for a [MockRequest]
// that constructs the request body for the request.
func (r *MockRequest) WithRequestBody() func(*MockRequest) {
	return func(r *MockRequest) {
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
			slog.Warn("Failed to marshal mock request body", "Error", err)
			return
		}
		r.Body = bytes.NewBuffer(b)
	}
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

	r.Ctx = context.WithValue(req.Context(), bbbhttp.ParamsKey, r.Params)

	return req.WithContext(r.Ctx), nil
}
