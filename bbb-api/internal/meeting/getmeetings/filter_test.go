package getmeetings

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
)

func TestRequestFilter_Filter(t *testing.T) {
	// Get default config to use the salt and algorithms
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Helper function to generate a valid checksum for a request
	generateChecksum := func(endpoint, queryString, salt string) string {
		data := endpoint + queryString + salt
		return random.Sha256Hex(data)
	}

	tests := []struct {
		name          string
		meetingID     string
		includeParams bool
		setupRequest  func() *http.Request
		shouldErr     bool
		errContains   string
	}{
		{
			name:          "Valid checksum with no meeting ID",
			meetingID:     "",
			includeParams: true,
			setupRequest: func() *http.Request {
				endpoint := "getMeetings"
				queryString := ""
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: "", FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr: false,
		},
		{
			name:          "Valid checksum with valid meeting ID",
			meetingID:     "valid-meeting-id",
			includeParams: true,
			setupRequest: func() *http.Request {
				meetingID := "valid-meeting-id"
				endpoint := "getMeetings"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?meetingID="+meetingID+"&checksum="+checksum, nil)

				// Set up params in context
				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr: false,
		},
		{
			name:          "Missing checksum",
			meetingID:     "",
			includeParams: true,
			setupRequest: func() *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: "", FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr:   true,
			errContains: "checksum",
		},
		{
			name:          "Invalid checksum",
			meetingID:     "",
			includeParams: true,
			setupRequest: func() *http.Request {
				invalidChecksum := "0000000000000000000000000000000000000000000000000000000000000000"

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?checksum="+invalidChecksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: "", FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr:   true,
			errContains: "checksum",
		},
		{
			name:          "Valid checksum but meeting ID too short",
			meetingID:     "a",
			includeParams: true,
			setupRequest: func() *http.Request {
				meetingID := "a"
				endpoint := "getMeetings"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?meetingID="+meetingID+"&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr:   true,
			errContains: "between 2 and 256",
		},
		{
			name:          "Valid checksum but meeting ID too long",
			meetingID:     strings.Repeat("a", 257),
			includeParams: true,
			setupRequest: func() *http.Request {
				meetingID := strings.Repeat("a", 257)
				endpoint := "getMeetings"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?meetingID="+meetingID+"&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr:   true,
			errContains: "between 2 and 256",
		},
		{
			name:          "Valid checksum but meeting ID contains comma",
			meetingID:     "meeting,id,with,commas",
			includeParams: true,
			setupRequest: func() *http.Request {
				meetingID := "meeting,id,with,commas"
				endpoint := "getMeetings"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?meetingID="+meetingID+"&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr:   true,
			errContains: "cannot contain ','",
		},
		{
			name:          "Valid checksum with minimum valid meeting ID length",
			meetingID:     "ab",
			includeParams: true,
			setupRequest: func() *http.Request {
				meetingID := "ab"
				endpoint := "getMeetings"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?meetingID="+meetingID+"&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr: false,
		},
		{
			name:          "Valid checksum with maximum valid meeting ID length",
			meetingID:     strings.Repeat("a", 256),
			includeParams: true,
			setupRequest: func() *http.Request {
				meetingID := strings.Repeat("a", 256)
				endpoint := "getMeetings"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?meetingID="+meetingID+"&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr: false,
		},
		{
			name:          "Valid checksum with meeting ID containing spaces (trimmed)",
			meetingID:     "  valid-meeting-id  ",
			includeParams: true,
			setupRequest: func() *http.Request {
				meetingID := "  valid-meeting-id  "
				// URL encode the meeting ID with spaces for both the URL and checksum calculation
				encodedMeetingID := strings.ReplaceAll(meetingID, " ", "%20")
				endpoint := "getMeetings"
				queryString := "meetingID=" + encodedMeetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?meetingID="+encodedMeetingID+"&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			shouldErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := &RequestFilter{}
			req := tt.setupRequest()
			msg := pipeline.NewMessageWithContext(req, req.Context())

			err := filter.Filter(msg)

			if tt.shouldErr {
				if err == nil {
					t.Errorf("Filter() expected error but got none")
					return
				}
				if tt.errContains != "" && !strings.Contains(strings.ToLower(err.Error()), strings.ToLower(tt.errContains)) {
					t.Errorf("Filter() error = %v, should contain %q", err, tt.errContains)
				}
			} else {
				if err != nil {
					t.Errorf("Filter() unexpected error = %v", err)
				}
			}
		})
	}
}
