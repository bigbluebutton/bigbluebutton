package getmeetings

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
	endpoint := "getMeetings"
	var queryString string
	var reqURL string

	if meetingID != "" {
		queryString = "meetingID=" + meetingID
		checksum := generateChecksum(endpoint, queryString, salt)
		reqURL = "/getMeetings?meetingID=" + meetingID + "&checksum=" + checksum
	} else {
		queryString = ""
		checksum := generateChecksum(endpoint, queryString, salt)
		reqURL = "/getMeetings?checksum=" + checksum
	}

	req := httptest.NewRequest(http.MethodGet, reqURL, nil)

	params := make(bbbhttp.Params)
	params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
	ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

	return req.WithContext(ctx)
}

// Helper to create a full MeetingInfoResponse for testing
func createTestMeetingInfoResponse(meetingExtID, meetingIntID, meetingName string) *grpcmeeting.MeetingInfoResponse {
	return &grpcmeeting.MeetingInfoResponse{
		MeetingInfo: &common.MeetingInfo{
			MeetingExtId:  meetingExtID,
			MeetingIntId:  meetingIntID,
			MeetingName:   meetingName,
			VoiceBridge:   "12345",
			DialNumber:    "613-555-1234",
			AttendeePw:    "ap",
			ModeratorPw:   "mp",
			Recording:     true,
			Metadata:      map[string]string{"key1": "value1"},
			BreakoutRooms: []string{},
			DurationInfo: &common.DurationInfo{
				CreateTime:           1234567890000,
				CreatedOn:            "Mon Jan 01 2024",
				StartTime:            1234567891000,
				EndTime:              0,
				Duration:             60,
				IsRunning:            true,
				HasBeenForciblyEnded: false,
			},
			ParticipantInfo: &common.ParticipantInfo{
				HasUserJoined:         true,
				ParticipantCount:      5,
				ListenerCount:         2,
				VoiceParticipantCount: 3,
				VideoCount:            1,
				MaxUsers:              100,
				ModeratorCount:        2,
			},
			BreakoutInfo: &common.BreakoutInfo{
				IsBreakout: false,
			},
			Users: []*common.User{
				{
					UserId:          "user-1",
					FullName:        "Test User 1",
					Role:            "MODERATOR",
					IsPresenter:     true,
					IsListeningOnly: false,
					HasJoinedVoice:  true,
					HasVideo:        true,
					ClientType:      "HTML5",
				},
			},
		},
	}
}

func TestNewGetMeetingsFlow_Execute(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name            string
		meetingID       string
		setupMock       func(*meeting.MockClient)
		wantErr         bool
		errContains     string
		wantMeetingCnt  int
		verifyResponse  func(*testing.T, *meeting.Response)
		verifyMockCalls func(*testing.T, *meeting.MockClient)
	}{
		{
			name:      "successful flow with multiple meetings",
			meetingID: "",
			setupMock: func(m *meeting.MockClient) {
				m.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
					createTestMeetingInfoResponse("meeting-1", "internal-1", "Test Meeting 1"),
					createTestMeetingInfoResponse("meeting-2", "internal-2", "Test Meeting 2"),
					createTestMeetingInfoResponse("meeting-3", "internal-3", "Test Meeting 3"),
				}
			},
			wantErr:        false,
			wantMeetingCnt: 3,
			verifyResponse: func(t *testing.T, resp *meeting.Response) {
				if resp.ReturnCode != responses.ReturnCodeSuccess {
					t.Errorf("ReturnCode = %s, want %s", resp.ReturnCode, responses.ReturnCodeSuccess)
				}
				if resp.Meetings == nil {
					t.Fatal("Meetings is nil")
				}
				if len(resp.Meetings.Meetings) != 3 {
					t.Errorf("Meeting count = %d, want 3", len(resp.Meetings.Meetings))
				}
				// Verify first meeting
				if resp.Meetings.Meetings[0].MeetingId != "meeting-1" {
					t.Errorf("First meeting ID = %s, want meeting-1", resp.Meetings.Meetings[0].MeetingId)
				}
			},
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
			},
		},
		{
			name:      "successful flow with single meeting by ID",
			meetingID: "specific-meeting-123",
			setupMock: func(m *meeting.MockClient) {
				m.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
					createTestMeetingInfoResponse("specific-meeting-123", "internal-specific", "Specific Meeting"),
				}
			},
			wantErr:        false,
			wantMeetingCnt: 1,
			verifyResponse: func(t *testing.T, resp *meeting.Response) {
				if resp.ReturnCode != responses.ReturnCodeSuccess {
					t.Errorf("ReturnCode = %s, want %s", resp.ReturnCode, responses.ReturnCodeSuccess)
				}
				if len(resp.Meetings.Meetings) != 1 {
					t.Fatalf("Meeting count = %d, want 1", len(resp.Meetings.Meetings))
				}
				if resp.Meetings.Meetings[0].MeetingId != "specific-meeting-123" {
					t.Errorf("MeetingId = %s, want specific-meeting-123", resp.Meetings.Meetings[0].MeetingId)
				}
			},
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
				if len(m.GetMeetingsStreamRequests) != 1 {
					t.Fatalf("Expected 1 request, got %d", len(m.GetMeetingsStreamRequests))
				}
				if m.GetMeetingsStreamRequests[0].MeetingData.MeetingId != "specific-meeting-123" {
					t.Errorf("Request MeetingId = %s, want specific-meeting-123", m.GetMeetingsStreamRequests[0].MeetingData.MeetingId)
				}
			},
		},
		{
			name:      "successful flow with empty meetings (no meetings found)",
			meetingID: "",
			setupMock: func(m *meeting.MockClient) {
				m.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{}
			},
			wantErr:        false,
			wantMeetingCnt: 0,
			verifyResponse: func(t *testing.T, resp *meeting.Response) {
				if resp.ReturnCode != responses.ReturnCodeSuccess {
					t.Errorf("ReturnCode = %s, want %s", resp.ReturnCode, responses.ReturnCodeSuccess)
				}
				if resp.Meetings == nil {
					t.Fatal("Meetings should not be nil")
				}
				if len(resp.Meetings.Meetings) != 0 {
					t.Errorf("Meeting count = %d, want 0", len(resp.Meetings.Meetings))
				}
			},
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
			},
		},
		{
			name:      "gRPC error - connection refused",
			meetingID: "",
			setupMock: func(m *meeting.MockClient) {
				m.GetMeetingsStreamError = errors.New("connection refused")
			},
			wantErr:     true,
			errContains: "",
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
			},
		},
		{
			name:      "gRPC error - generic error",
			meetingID: "",
			setupMock: func(m *meeting.MockClient) {
				m.GetMeetingsStreamError = errors.New("some generic error")
			},
			wantErr:     true,
			errContains: "",
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
			},
		},
		{
			name:      "meeting with users",
			meetingID: "",
			setupMock: func(m *meeting.MockClient) {
				resp := createTestMeetingInfoResponse("meeting-with-users", "internal-users", "Meeting With Users")
				resp.MeetingInfo.Users = []*common.User{
					{UserId: "user-1", FullName: "User One", Role: "MODERATOR", IsPresenter: true},
					{UserId: "user-2", FullName: "User Two", Role: "VIEWER", IsPresenter: false},
				}
				resp.MeetingInfo.ParticipantInfo.ParticipantCount = 2
				m.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{resp}
			},
			wantErr:        false,
			wantMeetingCnt: 1,
			verifyResponse: func(t *testing.T, resp *meeting.Response) {
				if len(resp.Meetings.Meetings) != 1 {
					t.Fatalf("Meeting count = %d, want 1", len(resp.Meetings.Meetings))
				}
				m := resp.Meetings.Meetings[0]
				if len(m.Users.Users) != 2 {
					t.Errorf("User count = %d, want 2", len(m.Users.Users))
				}
				if m.ParticipantCount != 2 {
					t.Errorf("ParticipantCount = %d, want 2", m.ParticipantCount)
				}
			},
		},
		{
			name:      "meeting with breakout rooms",
			meetingID: "",
			setupMock: func(m *meeting.MockClient) {
				resp := createTestMeetingInfoResponse("breakout-meeting", "internal-breakout", "Breakout Meeting")
				resp.MeetingInfo.BreakoutInfo.IsBreakout = true
				resp.MeetingInfo.BreakoutRooms = []string{"room-1", "room-2", "room-3"}
				m.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{resp}
			},
			wantErr:        false,
			wantMeetingCnt: 1,
			verifyResponse: func(t *testing.T, resp *meeting.Response) {
				if len(resp.Meetings.Meetings) != 1 {
					t.Fatalf("Meeting count = %d, want 1", len(resp.Meetings.Meetings))
				}
				m := resp.Meetings.Meetings[0]
				if !m.IsBreakout {
					t.Error("IsBreakout = false, want true")
				}
				if len(m.BreakoutRooms.Breakout) != 3 {
					t.Errorf("Breakout room count = %d, want 3", len(m.BreakoutRooms.Breakout))
				}
			},
		},
		{
			name:      "meeting with metadata",
			meetingID: "",
			setupMock: func(m *meeting.MockClient) {
				resp := createTestMeetingInfoResponse("metadata-meeting", "internal-meta", "Metadata Meeting")
				resp.MeetingInfo.Metadata = map[string]string{
					"customKey1": "customValue1",
					"customKey2": "customValue2",
				}
				m.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{resp}
			},
			wantErr:        false,
			wantMeetingCnt: 1,
			verifyResponse: func(t *testing.T, resp *meeting.Response) {
				if len(resp.Meetings.Meetings) != 1 {
					t.Fatalf("Meeting count = %d, want 1", len(resp.Meetings.Meetings))
				}
				m := resp.Meetings.Meetings[0]
				if m.Metadata.Data["customKey1"] != "customValue1" {
					t.Errorf("Metadata[customKey1] = %s, want customValue1", m.Metadata.Data["customKey1"])
				}
				if m.Metadata.Data["customKey2"] != "customValue2" {
					t.Errorf("Metadata[customKey2] = %s, want customValue2", m.Metadata.Data["customKey2"])
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
			flow := NewGetMeetingsFlow(mockClient)

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

				// Run custom response verification
				if tt.verifyResponse != nil {
					tt.verifyResponse(t, respMsg.Payload)
				}
			}

			// Verify mock calls
			if tt.verifyMockCalls != nil {
				tt.verifyMockCalls(t, mockClient)
			}
		})
	}
}

func TestNewGetMeetingsFlow_FilterErrors(t *testing.T) {
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
				invalidChecksum := "0000000000000000000000000000000000000000000000000000000000000000"

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?checksum="+invalidChecksum, nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: "", FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			wantErr:     true,
			errContains: "checksum",
		},
		{
			name: "missing checksum",
			setupRequest: func() *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)

				params := make(bbbhttp.Params)
				params.Set(meeting.IDParam, bbbhttp.Param{Value: "", FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

				return req.WithContext(ctx)
			},
			wantErr:     true,
			errContains: "checksum",
		},
		{
			name: "meeting ID too short (when provided)",
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
			wantErr:     true,
			errContains: "between 2 and 256",
		},
		{
			name: "meeting ID with comma (when provided)",
			setupRequest: func() *http.Request {
				meetingID := "meeting,with,commas"
				endpoint := "getMeetings"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetings?meetingID="+meetingID+"&checksum="+checksum, nil)

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
			mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
				createTestMeetingInfoResponse("test", "test", "Test"),
			}

			// Create the flow
			flow := NewGetMeetingsFlow(mockClient)

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
			if mockClient.CallCounts["GetMeetingsStream"] != 0 {
				t.Errorf("GetMeetingsStream should not be called on filter error, but was called %d times", mockClient.CallCounts["GetMeetingsStream"])
			}
		})
	}
}

func TestNewGetMeetingsFlow_MeetingIDTransformation(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name              string
		meetingID         string
		expectedMeetingID string
	}{
		{
			name:              "empty meeting ID passed through",
			meetingID:         "",
			expectedMeetingID: "",
		},
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
			mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
				createTestMeetingInfoResponse("response-meeting", "internal-resp", "Response Meeting"),
			}

			flow := NewGetMeetingsFlow(mockClient)
			req := createTestRequest(tt.meetingID, salt)
			msg := pipeline.NewMessage(req)

			_, err := flow.Execute(msg)
			if err != nil {
				t.Fatalf("Execute() unexpected error = %v", err)
			}

			// Verify the meeting ID was passed correctly to gRPC
			if len(mockClient.GetMeetingsStreamRequests) != 1 {
				t.Fatalf("Expected 1 request, got %d", len(mockClient.GetMeetingsStreamRequests))
			}
			actualMeetingID := mockClient.GetMeetingsStreamRequests[0].MeetingData.MeetingId
			if actualMeetingID != tt.expectedMeetingID {
				t.Errorf("MeetingId = %s, want %s", actualMeetingID, tt.expectedMeetingID)
			}
		})
	}
}

func TestNewGetMeetingsFlow_ResponseStructure(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createTestMeetingInfoResponse("test-meeting", "internal-test", "Test Meeting"),
	}

	flow := NewGetMeetingsFlow(mockClient)
	req := createTestRequest("", salt)
	msg := pipeline.NewMessage(req)

	resultMsg, err := flow.Execute(msg)
	if err != nil {
		t.Fatalf("Execute() unexpected error = %v", err)
	}

	// Verify response structure
	resp := resultMsg.Payload
	if resp == nil {
		t.Fatal("Response is nil")
	}

	if resp.ReturnCode != responses.ReturnCodeSuccess {
		t.Errorf("ReturnCode = %s, want %s", resp.ReturnCode, responses.ReturnCodeSuccess)
	}

	if resp.Meetings == nil {
		t.Fatal("Meetings is nil")
	}

	if len(resp.Meetings.Meetings) != 1 {
		t.Fatalf("Meeting count = %d, want 1", len(resp.Meetings.Meetings))
	}

	m := resp.Meetings.Meetings[0]

	// Verify meeting fields
	if m.MeetingId != "test-meeting" {
		t.Errorf("MeetingId = %s, want test-meeting", m.MeetingId)
	}
	if m.InternalMeetingId != "internal-test" {
		t.Errorf("InternalMeetingId = %s, want internal-test", m.InternalMeetingId)
	}
	if m.MeetingName != "Test Meeting" {
		t.Errorf("MeetingName = %s, want Test Meeting", m.MeetingName)
	}
	if m.VoiceBridge != "12345" {
		t.Errorf("VoiceBridge = %s, want 12345", m.VoiceBridge)
	}
	if !m.Running {
		t.Error("Running = false, want true")
	}
	if m.Duration != 60 {
		t.Errorf("Duration = %d, want 60", m.Duration)
	}
	if !m.Recording {
		t.Error("Recording = false, want true")
	}
	if m.ParticipantCount != 5 {
		t.Errorf("ParticipantCount = %d, want 5", m.ParticipantCount)
	}
}

func TestNewGetMeetingsFlow_EmptyMeetingIDAllowed(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createTestMeetingInfoResponse("meeting-1", "internal-1", "Meeting 1"),
		createTestMeetingInfoResponse("meeting-2", "internal-2", "Meeting 2"),
	}

	flow := NewGetMeetingsFlow(mockClient)

	// Create request with empty meeting ID (should be allowed)
	req := createTestRequest("", salt)
	msg := pipeline.NewMessage(req)

	resultMsg, err := flow.Execute(msg)
	if err != nil {
		t.Fatalf("Execute() with empty meeting ID should succeed, got error = %v", err)
	}

	if resultMsg.Payload == nil {
		t.Fatal("Response is nil")
	}

	if len(resultMsg.Payload.Meetings.Meetings) != 2 {
		t.Errorf("Meeting count = %d, want 2", len(resultMsg.Payload.Meetings.Meetings))
	}

	// Verify empty meeting ID was passed to gRPC
	if len(mockClient.GetMeetingsStreamRequests) != 1 {
		t.Fatalf("Expected 1 request, got %d", len(mockClient.GetMeetingsStreamRequests))
	}
	if mockClient.GetMeetingsStreamRequests[0].MeetingData.MeetingId != "" {
		t.Errorf("Request MeetingId should be empty, got %s", mockClient.GetMeetingsStreamRequests[0].MeetingData.MeetingId)
	}
}
