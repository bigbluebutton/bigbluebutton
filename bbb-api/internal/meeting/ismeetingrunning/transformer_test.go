package ismeetingrunning

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

func TestHTTPToGRPC_Transform(t *testing.T) {
	tests := []struct {
		name              string
		meetingID         string
		expectedMeetingID string
		shouldErr         bool
		errContains       string
		includeParams     bool
		setupRequest      func(meetingID string, includeParams bool) *http.Request
	}{
		{
			name:              "Valid meeting ID",
			meetingID:         "test-meeting-123",
			expectedMeetingID: "test-meeting-123",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				reqURL := "/isMeetingRunning?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				if includeParams {
					params := make(bbbhttp.Params)
					params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
					ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
					return req.WithContext(ctx)
				}
				return req
			},
		},
		{
			name:              "Meeting ID with spaces",
			meetingID:         "  meeting-with-spaces  ",
			expectedMeetingID: "meeting-with-spaces",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				reqURL := "/isMeetingRunning?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with control characters",
			meetingID:         "meeting\x00\x01\x02ID",
			expectedMeetingID: "meeting\x00\x01\x02ID",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Empty meeting ID",
			meetingID:         "",
			expectedMeetingID: "",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning?meetingID=", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with special characters",
			meetingID:         "meeting-123_test.demo",
			expectedMeetingID: "meeting-123_test.demo",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				reqURL := "/isMeetingRunning?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with unicode characters",
			meetingID:         "meeting-тест-会议",
			expectedMeetingID: "meeting-тест-会议",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Very long meeting ID",
			meetingID:         strings.Repeat("a", 256),
			expectedMeetingID: strings.Repeat("a", 256),
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with newlines and tabs",
			meetingID:         "meeting\nwith\ttabs",
			expectedMeetingID: "meeting\nwith\ttabs",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with only spaces",
			meetingID:         "     ",
			expectedMeetingID: "",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with alphanumeric and hyphens",
			meetingID:         "abc-123-def-456",
			expectedMeetingID: "abc-123-def-456",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				reqURL := "/isMeetingRunning?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with carriage return",
			meetingID:         "meeting\rID",
			expectedMeetingID: "meeting\rID",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			transformer := &HTTPToGRPC{}
			req := tt.setupRequest(tt.meetingID, tt.includeParams)
			msg := pipeline.NewMessageWithContext(req, req.Context())

			result, err := transformer.Transform(msg)

			if tt.shouldErr {
				if err == nil {
					t.Errorf("Transform() expected error but got none")
					return
				}
				if tt.errContains != "" && !strings.Contains(strings.ToLower(err.Error()), strings.ToLower(tt.errContains)) {
					t.Errorf("Transform() error = %v, should contain %q", err, tt.errContains)
				}
			} else {
				if err != nil {
					t.Errorf("Transform() unexpected error = %v", err)
					return
				}

				// Verify the result is not nil
				if result.Payload == nil {
					t.Errorf("Transform() returned nil payload")
					return
				}

				// Verify the gRPC request has the correct structure
				if result.Payload.MeetingData == nil {
					t.Errorf("Transform() returned nil MeetingData")
					return
				}

				// Verify the meeting ID matches expected value
				if result.Payload.MeetingData.MeetingId != tt.expectedMeetingID {
					t.Errorf("Transform() meeting ID = %q, want %q", result.Payload.MeetingData.MeetingId, tt.expectedMeetingID)
				}
			}
		})
	}
}

func TestHTTPToGRPC_Transform_MessageContext(t *testing.T) {
	tests := []struct {
		name      string
		meetingID string
		setupMsg  func(meetingID string) pipeline.Message[*http.Request]
		shouldErr bool
	}{
		{
			name:      "Message with background context",
			meetingID: "test-meeting",
			setupMsg: func(meetingID string) pipeline.Message[*http.Request] {
				reqURL := "/isMeetingRunning?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(context.Background(), bbbhttp.ParamsKey, params)
				req = req.WithContext(ctx)
				return pipeline.NewMessage(req)
			},
			shouldErr: false,
		},
		{
			name:      "Message with custom context",
			meetingID: "custom-meeting",
			setupMsg: func(meetingID string) pipeline.Message[*http.Request] {
				reqURL := "/isMeetingRunning?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(context.Background(), bbbhttp.ParamsKey, params)
				req = req.WithContext(ctx)
				return pipeline.NewMessageWithContext(req, ctx)
			},
			shouldErr: false,
		},
		{
			name:      "Message without params in context",
			meetingID: "no-params",
			setupMsg: func(meetingID string) pipeline.Message[*http.Request] {
				reqURL := "/isMeetingRunning?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				return pipeline.NewMessage(req)
			},
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			transformer := &HTTPToGRPC{}
			msg := tt.setupMsg(tt.meetingID)

			result, err := transformer.Transform(msg)

			if tt.shouldErr {
				if err == nil {
					t.Errorf("Transform() expected error but got none")
				}
			} else {
				if err != nil {
					t.Errorf("Transform() unexpected error = %v", err)
					return
				}
				if result.Payload.MeetingData.MeetingId != tt.meetingID {
					t.Errorf("Transform() meeting ID = %q, want %q", result.Payload.MeetingData.MeetingId, tt.meetingID)
				}
			}
		})
	}
}

func TestGRPCToResponse_Transform(t *testing.T) {
	tests := []struct {
		name        string
		input       *meeting.MeetingRunningResponse
		wantRunning bool
	}{
		{
			name: "Meeting is running",
			input: &meeting.MeetingRunningResponse{
				MeetingRunning: &common.MeetingRunning{
					IsRunning: true,
				},
			},
			wantRunning: true,
		},
		{
			name: "Meeting is not running",
			input: &meeting.MeetingRunningResponse{
				MeetingRunning: &common.MeetingRunning{
					IsRunning: false,
				},
			},
			wantRunning: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			transformer := &GRPCToResponse{}
			msg := pipeline.NewMessage(tt.input)

			result, err := transformer.Transform(msg)

			if err != nil {
				t.Errorf("Transform() unexpected error = %v", err)
				return
			}

			if result.Payload == nil {
				t.Errorf("Transform() returned nil payload")
				return
			}

			// Verify ReturnCode
			if result.Payload.ReturnCode != responses.ReturnCodeSuccess {
				t.Errorf("ReturnCode = %q, want %q", result.Payload.ReturnCode, responses.ReturnCodeSuccess)
			}

			// Verify Running pointer is not nil
			if result.Payload.Running == nil {
				t.Errorf("Running is nil, expected non-nil pointer")
				return
			}

			// Verify Running value
			if *result.Payload.Running != tt.wantRunning {
				t.Errorf("Running = %v, want %v", *result.Payload.Running, tt.wantRunning)
			}
		})
	}
}

func TestGRPCToResponse_Transform_ResponseStructure(t *testing.T) {
	tests := []struct {
		name  string
		input *meeting.MeetingRunningResponse
	}{
		{
			name: "Verify response structure with running true",
			input: &meeting.MeetingRunningResponse{
				MeetingRunning: &common.MeetingRunning{
					IsRunning: true,
				},
			},
		},
		{
			name: "Verify response structure with running false",
			input: &meeting.MeetingRunningResponse{
				MeetingRunning: &common.MeetingRunning{
					IsRunning: false,
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			transformer := &GRPCToResponse{}
			msg := pipeline.NewMessage(tt.input)

			result, err := transformer.Transform(msg)

			if err != nil {
				t.Fatalf("Transform() unexpected error = %v", err)
			}

			// Verify payload is not nil
			if result.Payload == nil {
				t.Fatal("Transform() returned nil payload")
			}

			// Verify ReturnCode is SUCCESS
			if result.Payload.ReturnCode != responses.ReturnCodeSuccess {
				t.Errorf("ReturnCode = %q, want %q", result.Payload.ReturnCode, responses.ReturnCodeSuccess)
			}

			// Verify Running pointer is set
			if result.Payload.Running == nil {
				t.Error("Running pointer should not be nil")
			}

			// Verify the Running value matches the input
			expectedRunning := tt.input.MeetingRunning.IsRunning
			if *result.Payload.Running != expectedRunning {
				t.Errorf("Running = %v, want %v", *result.Payload.Running, expectedRunning)
			}
		})
	}
}
