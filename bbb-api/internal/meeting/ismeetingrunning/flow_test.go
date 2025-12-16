package ismeetingrunning

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	grpcmeeting "github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
)

// Helper function to generate a valid checksum for a request
func generateChecksum(endpoint, queryString, salt string) string {
	data := endpoint + queryString + salt
	return random.Sha256Hex(data)
}

// Helper function to create an HTTP request with proper params context
func createTestRequest(meetingID, salt string) *http.Request {
	endpoint := "isMeetingRunning"
	queryString := "meetingID=" + meetingID
	checksum := generateChecksum(endpoint, queryString, salt)

	req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning?meetingID="+meetingID+"&checksum="+checksum, nil)

	params := make(bbbhttp.Params)
	params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
	ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

	return req.WithContext(ctx)
}

// Helper to create a MeetingRunningResponse for testing
func createMeetingRunningResponse(isRunning bool) *grpcmeeting.MeetingRunningResponse {
	return &grpcmeeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{
			IsRunning: isRunning,
		},
	}
}

func TestNewIsMeetingRunningFlow_Execute(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name            string
		meetingID       string
		setupMock       func(*meeting.MockClient)
		wantErr         bool
		errContains     string
		wantRunning     bool
		verifyMockCalls func(*testing.T, *meeting.MockClient)
	}{
		{
			name:      "successful flow with meeting running",
			meetingID: "running-meeting-123",
			setupMock: func(m *meeting.MockClient) {
				m.IsMeetingRunningResponse = createMeetingRunningResponse(true)
			},
			wantErr:     false,
			wantRunning: true,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["IsMeetingRunning"] != 1 {
					t.Errorf("IsMeetingRunning called %d times, want 1", m.CallCounts["IsMeetingRunning"])
				}
				if len(m.IsMeetingRunningRequests) != 1 {
					t.Fatalf("Expected 1 IsMeetingRunning request, got %d", len(m.IsMeetingRunningRequests))
				}
				if m.IsMeetingRunningRequests[0].MeetingData.MeetingId != "running-meeting-123" {
					t.Errorf("Request MeetingId = %s, want running-meeting-123", m.IsMeetingRunningRequests[0].MeetingData.MeetingId)
				}
			},
		},
		{
			name:      "successful flow with meeting not running",
			meetingID: "stopped-meeting-456",
			setupMock: func(m *meeting.MockClient) {
				m.IsMeetingRunningResponse = createMeetingRunningResponse(false)
			},
			wantErr:     false,
			wantRunning: false,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["IsMeetingRunning"] != 1 {
					t.Errorf("IsMeetingRunning called %d times, want 1", m.CallCounts["IsMeetingRunning"])
				}
			},
		},
		{
			name:      "gRPC error - meeting not found",
			meetingID: "non-existent-meeting",
			setupMock: func(m *meeting.MockClient) {
				m.IsMeetingRunningError = errors.New("meeting not found")
			},
			wantErr:     true,
			errContains: "",
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["IsMeetingRunning"] != 1 {
					t.Errorf("IsMeetingRunning called %d times, want 1", m.CallCounts["IsMeetingRunning"])
				}
			},
		},
		{
			name:      "gRPC error - connection refused",
			meetingID: "valid-meeting-id",
			setupMock: func(m *meeting.MockClient) {
				m.IsMeetingRunningError = errors.New("connection refused")
			},
			wantErr:     true,
			errContains: "",
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["IsMeetingRunning"] != 1 {
					t.Errorf("IsMeetingRunning called %d times, want 1", m.CallCounts["IsMeetingRunning"])
				}
			},
		},
		{
			name:      "verify response structure",
			meetingID: "structure-test-meeting",
			setupMock: func(m *meeting.MockClient) {
				m.IsMeetingRunningResponse = createMeetingRunningResponse(true)
			},
			wantErr:     false,
			wantRunning: true,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["IsMeetingRunning"] != 1 {
					t.Errorf("IsMeetingRunning called %d times, want 1", m.CallCounts["IsMeetingRunning"])
				}
			},
		},
		{
			name:      "meeting ID with special characters",
			meetingID: "meeting-with-special_chars.test",
			setupMock: func(m *meeting.MockClient) {
				m.IsMeetingRunningResponse = createMeetingRunningResponse(true)
			},
			wantErr:     false,
			wantRunning: true,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if len(m.IsMeetingRunningRequests) != 1 {
					t.Fatalf("Expected 1 request, got %d", len(m.IsMeetingRunningRequests))
				}
				if m.IsMeetingRunningRequests[0].MeetingData.MeetingId != "meeting-with-special_chars.test" {
					t.Errorf("Request MeetingId = %s, want meeting-with-special_chars.test", m.IsMeetingRunningRequests[0].MeetingData.MeetingId)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create mock client
			mockClient := meeting.NewMockClient()
			tt.setupMock(mockClient)

			// Create the flow with the mock client
			flow := NewIsMeetingRunningFlow(mockClient)

			// Create test request
			req := createTestRequest(tt.meetingID, salt)
			msg := pipeline.NewMessage(req)

			// Execute the flow
			respMsg, err := flow.Execute(msg)

			// Check error expectations
			if tt.wantErr {
				if err == nil {
					t.Errorf("Execute() expected error but got none")
					return
				}
				if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("Execute() error = %v, should contain %q", err, tt.errContains)
				}
			} else {
				if err != nil {
					t.Errorf("Execute() unexpected error = %v", err)
					return
				}

				// Verify response
				if respMsg.Payload == nil {
					t.Fatal("Expected non-nil response payload")
				}
				if respMsg.Payload.ReturnCode != responses.ReturnCodeSuccess {
					t.Errorf("ReturnCode = %s, want %s", respMsg.Payload.ReturnCode, responses.ReturnCodeSuccess)
				}
				if respMsg.Payload.Running == nil {
					t.Fatal("Expected non-nil Running pointer")
				}
				if *respMsg.Payload.Running != tt.wantRunning {
					t.Errorf("Running = %v, want %v", *respMsg.Payload.Running, tt.wantRunning)
				}
			}

			// Verify mock calls
			if tt.verifyMockCalls != nil {
				tt.verifyMockCalls(t, mockClient)
			}
		})
	}
}

func TestNewIsMeetingRunningFlow_FilterErrors(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name         string
		setupRequest func() *http.Request
		wantErr      bool
		errContains  string
	}{
		{
			name: "invalid checksum",
			setupRequest: func() *http.Request {
				meetingID := "valid-meeting-id"
				invalidChecksum := "0000000000000000000000000000000000000000000000000000000000000000"

				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning?meetingID="+meetingID+"&checksum="+invalidChecksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			wantErr:     true,
			errContains: "checksum",
		},
		{
			name: "missing checksum",
			setupRequest: func() *http.Request {
				meetingID := "valid-meeting-id"

				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning?meetingID="+meetingID, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			wantErr:     true,
			errContains: "checksum",
		},
		{
			name: "missing meeting ID",
			setupRequest: func() *http.Request {
				endpoint := "isMeetingRunning"
				queryString := "meetingID="
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning?meetingID=&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: "", FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			wantErr:     true,
			errContains: "meeting ID",
		},
		{
			name: "meeting ID too short",
			setupRequest: func() *http.Request {
				meetingID := "a"
				endpoint := "isMeetingRunning"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning?meetingID="+meetingID+"&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			wantErr:     true,
			errContains: "between 2 and 256",
		},
		{
			name: "meeting ID with comma",
			setupRequest: func() *http.Request {
				meetingID := "meeting,with,commas"
				endpoint := "isMeetingRunning"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/isMeetingRunning?meetingID="+meetingID+"&checksum="+checksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			wantErr:     true,
			errContains: "','",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create mock client - should not be called due to filter errors
			mockClient := meeting.NewMockClient()
			mockClient.IsMeetingRunningResponse = createMeetingRunningResponse(true)

			// Create the flow
			flow := NewIsMeetingRunningFlow(mockClient)

			// Create test request
			req := tt.setupRequest()
			msg := pipeline.NewMessage(req)

			// Execute the flow
			_, err := flow.Execute(msg)

			// Check error expectations
			if tt.wantErr {
				if err == nil {
					t.Errorf("Execute() expected error but got none")
					return
				}
				if tt.errContains != "" && !strings.Contains(strings.ToLower(err.Error()), strings.ToLower(tt.errContains)) {
					t.Errorf("Execute() error = %v, should contain %q", err, tt.errContains)
				}
			} else {
				if err != nil {
					t.Errorf("Execute() unexpected error = %v", err)
				}
			}

			// Verify gRPC was not called due to filter error
			if mockClient.CallCounts["IsMeetingRunning"] != 0 {
				t.Errorf("IsMeetingRunning should not be called on filter error, but was called %d times", mockClient.CallCounts["IsMeetingRunning"])
			}
		})
	}
}

func TestNewIsMeetingRunningFlow_MeetingIDTransformation(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name              string
		meetingID         string
		expectedMeetingID string
	}{
		{
			name:              "meeting ID preserved exactly",
			meetingID:         "test-meeting-123",
			expectedMeetingID: "test-meeting-123",
		},
		{
			name:              "meeting ID with alphanumeric and hyphens",
			meetingID:         "abc-123-def-456",
			expectedMeetingID: "abc-123-def-456",
		},
		{
			name:              "meeting ID with underscores",
			meetingID:         "meeting_with_underscores",
			expectedMeetingID: "meeting_with_underscores",
		},
		{
			name:              "meeting ID with dots",
			meetingID:         "meeting.with.dots",
			expectedMeetingID: "meeting.with.dots",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := meeting.NewMockClient()
			mockClient.IsMeetingRunningResponse = createMeetingRunningResponse(true)

			flow := NewIsMeetingRunningFlow(mockClient)
			req := createTestRequest(tt.meetingID, salt)
			msg := pipeline.NewMessage(req)

			_, err := flow.Execute(msg)
			if err != nil {
				t.Fatalf("Execute() unexpected error = %v", err)
			}

			// Verify the meeting ID was passed correctly to gRPC
			if len(mockClient.IsMeetingRunningRequests) != 1 {
				t.Fatalf("Expected 1 request, got %d", len(mockClient.IsMeetingRunningRequests))
			}
			actualMeetingID := mockClient.IsMeetingRunningRequests[0].MeetingData.MeetingId
			if actualMeetingID != tt.expectedMeetingID {
				t.Errorf("MeetingId = %s, want %s", actualMeetingID, tt.expectedMeetingID)
			}
		})
	}
}

func TestNewIsMeetingRunningFlow_ResponseValues(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name        string
		isRunning   bool
		wantRunning bool
	}{
		{
			name:        "meeting is running returns true",
			isRunning:   true,
			wantRunning: true,
		},
		{
			name:        "meeting is not running returns false",
			isRunning:   false,
			wantRunning: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := meeting.NewMockClient()
			mockClient.IsMeetingRunningResponse = createMeetingRunningResponse(tt.isRunning)

			flow := NewIsMeetingRunningFlow(mockClient)
			req := createTestRequest("test-meeting", salt)
			msg := pipeline.NewMessage(req)

			resultMsg, err := flow.Execute(msg)
			if err != nil {
				t.Fatalf("Execute() unexpected error = %v", err)
			}

			if resultMsg.Payload.ReturnCode != responses.ReturnCodeSuccess {
				t.Errorf("ReturnCode = %s, want %s", resultMsg.Payload.ReturnCode, responses.ReturnCodeSuccess)
			}

			if resultMsg.Payload.Running == nil {
				t.Fatal("Running is nil")
			}

			if *resultMsg.Payload.Running != tt.wantRunning {
				t.Errorf("Running = %v, want %v", *resultMsg.Payload.Running, tt.wantRunning)
			}
		})
	}
}
