package getmeetinginfo

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
	endpoint := "getMeetingInfo"
	queryString := "meetingID=" + meetingID
	checksum := generateChecksum(endpoint, queryString, salt)

	req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo?meetingID="+meetingID+"&checksum="+checksum, nil)

	params := make(bbbhttp.Params)
	params.Set(meeting.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
	ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)

	return req.WithContext(ctx)
}

// Helper to create a full MeetingInfoResponse for testing
func createMeetingInfoResponse(meetingExtID, meetingIntID, meetingName string) *grpcmeeting.MeetingInfoResponse {
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
				{
					UserId:          "user-2",
					FullName:        "Test User 2",
					Role:            "VIEWER",
					IsPresenter:     false,
					IsListeningOnly: true,
					HasJoinedVoice:  false,
					HasVideo:        false,
					ClientType:      "HTML5",
				},
			},
		},
	}
}

func TestNewGetMeetingInfoFlow_Execute(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name            string
		meetingID       string
		setupMock       func(*meeting.MockClient)
		wantErr         bool
		errContains     string
		verifyResponse  func(*testing.T, *meeting.GetMeetingInfoResponse)
		verifyMockCalls func(*testing.T, *meeting.MockClient)
	}{
		{
			name:      "successful flow with full meeting info",
			meetingID: "test-meeting-123",
			setupMock: func(m *meeting.MockClient) {
				m.GetMeetingInfoResponse = createMeetingInfoResponse(
					"test-meeting-123",
					"internal-meeting-456",
					"Test Meeting",
				)
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if resp.ReturnCode != responses.ReturnCodeSuccess {
					t.Errorf("ReturnCode = %s, want %s", resp.ReturnCode, responses.ReturnCodeSuccess)
				}
				if resp.MeetingId != "test-meeting-123" {
					t.Errorf("MeetingId = %s, want test-meeting-123", resp.MeetingId)
				}
				if resp.InternalMeetingId != "internal-meeting-456" {
					t.Errorf("InternalMeetingId = %s, want internal-meeting-456", resp.InternalMeetingId)
				}
				if resp.MeetingName != "Test Meeting" {
					t.Errorf("MeetingName = %s, want Test Meeting", resp.MeetingName)
				}
				if resp.VoiceBridge != "12345" {
					t.Errorf("VoiceBridge = %s, want 12345", resp.VoiceBridge)
				}
				if !resp.Running {
					t.Error("Running = false, want true")
				}
				if resp.ParticipantCount != 5 {
					t.Errorf("ParticipantCount = %d, want 5", resp.ParticipantCount)
				}
				if len(resp.Users.Users) != 2 {
					t.Errorf("len(Users) = %d, want 2", len(resp.Users.Users))
				}
				if resp.Metadata.Data["key1"] != "value1" {
					t.Errorf("Metadata[key1] = %s, want value1", resp.Metadata.Data["key1"])
				}
			},
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
				if len(m.GetMeetingInfoRequests) != 1 {
					t.Fatalf("Expected 1 GetMeetingInfo request, got %d", len(m.GetMeetingInfoRequests))
				}
				if m.GetMeetingInfoRequests[0].MeetingData.MeetingId != "test-meeting-123" {
					t.Errorf("Request MeetingId = %s, want test-meeting-123", m.GetMeetingInfoRequests[0].MeetingData.MeetingId)
				}
			},
		},
		{
			name:      "gRPC error - meeting not found",
			meetingID: "non-existent-meeting",
			setupMock: func(m *meeting.MockClient) {
				m.GetMeetingInfoError = errors.New("meeting not found")
			},
			wantErr:     true,
			errContains: "",
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
			},
		},
		{
			name:      "gRPC error - connection refused",
			meetingID: "valid-meeting-id",
			setupMock: func(m *meeting.MockClient) {
				m.GetMeetingInfoError = errors.New("connection refused")
			},
			wantErr:     true,
			errContains: "",
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
			},
		},
		{
			name:      "successful flow with empty users list",
			meetingID: "empty-meeting",
			setupMock: func(m *meeting.MockClient) {
				resp := createMeetingInfoResponse("empty-meeting", "internal-empty", "Empty Meeting")
				resp.MeetingInfo.Users = []*common.User{}
				resp.MeetingInfo.ParticipantInfo.ParticipantCount = 0
				m.GetMeetingInfoResponse = resp
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if resp.ReturnCode != responses.ReturnCodeSuccess {
					t.Errorf("ReturnCode = %s, want %s", resp.ReturnCode, responses.ReturnCodeSuccess)
				}
				if len(resp.Users.Users) != 0 {
					t.Errorf("len(Users) = %d, want 0", len(resp.Users.Users))
				}
				if resp.ParticipantCount != 0 {
					t.Errorf("ParticipantCount = %d, want 0", resp.ParticipantCount)
				}
			},
		},
		{
			name:      "successful flow with breakout room info",
			meetingID: "breakout-meeting",
			setupMock: func(m *meeting.MockClient) {
				resp := createMeetingInfoResponse("breakout-meeting", "internal-breakout", "Breakout Meeting")
				resp.MeetingInfo.BreakoutInfo.IsBreakout = true
				resp.MeetingInfo.BreakoutRooms = []string{"room-1", "room-2", "room-3"}
				m.GetMeetingInfoResponse = resp
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if !resp.IsBreakout {
					t.Error("IsBreakout = false, want true")
				}
				if len(resp.BreakoutRooms.Breakout) != 3 {
					t.Errorf("len(BreakoutRooms) = %d, want 3", len(resp.BreakoutRooms.Breakout))
				}
			},
		},
		{
			name:      "successful flow with special characters in meeting name",
			meetingID: "special-meeting",
			setupMock: func(m *meeting.MockClient) {
				resp := createMeetingInfoResponse("special-meeting", "internal-special", "Meeting <with> \"special\" & 'chars'")
				m.GetMeetingInfoResponse = resp
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if resp.MeetingName != "Meeting <with> \"special\" & 'chars'" {
					t.Errorf("MeetingName = %s, want Meeting <with> \"special\" & 'chars'", resp.MeetingName)
				}
			},
		},
		{
			name:      "successful flow with empty metadata",
			meetingID: "no-metadata-meeting",
			setupMock: func(m *meeting.MockClient) {
				resp := createMeetingInfoResponse("no-metadata-meeting", "internal-no-meta", "No Metadata Meeting")
				resp.MeetingInfo.Metadata = nil
				m.GetMeetingInfoResponse = resp
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if len(resp.Metadata.Data) != 0 {
					t.Errorf("Metadata should be empty, got %v", resp.Metadata.Data)
				}
			},
		},
		{
			name:      "successful flow with recording disabled",
			meetingID: "no-recording-meeting",
			setupMock: func(m *meeting.MockClient) {
				resp := createMeetingInfoResponse("no-recording-meeting", "internal-no-rec", "No Recording Meeting")
				resp.MeetingInfo.Recording = false
				m.GetMeetingInfoResponse = resp
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if resp.Recording {
					t.Error("Recording = true, want false")
				}
			},
		},
		{
			name:      "successful flow with meeting not running",
			meetingID: "stopped-meeting",
			setupMock: func(m *meeting.MockClient) {
				resp := createMeetingInfoResponse("stopped-meeting", "internal-stopped", "Stopped Meeting")
				resp.MeetingInfo.DurationInfo.IsRunning = false
				resp.MeetingInfo.DurationInfo.EndTime = 1234567899000
				m.GetMeetingInfoResponse = resp
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if resp.Running {
					t.Error("Running = true, want false")
				}
				if resp.EndTime != 1234567899000 {
					t.Errorf("EndTime = %d, want 1234567899000", resp.EndTime)
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
			flow := NewGetMeetingInfoFlow(mockClient)

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

func TestNewGetMeetingInfoFlow_FilterErrors(t *testing.T) {
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

				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo?meetingID="+meetingID+"&checksum="+invalidChecksum, nil)

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

				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo?meetingID="+meetingID, nil)

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
				endpoint := "getMeetingInfo"
				queryString := "meetingID="
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo?meetingID=&checksum="+checksum, nil)

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
				endpoint := "getMeetingInfo"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo?meetingID="+meetingID+"&checksum="+checksum, nil)

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
				endpoint := "getMeetingInfo"
				queryString := "meetingID=" + meetingID
				checksum := generateChecksum(endpoint, queryString, salt)

				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo?meetingID="+meetingID+"&checksum="+checksum, nil)

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
			mockClient.GetMeetingInfoResponse = createMeetingInfoResponse("test", "test", "Test")

			// Create the flow
			flow := NewGetMeetingInfoFlow(mockClient)

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
			if mockClient.CallCounts["GetMeetingInfo"] != 0 {
				t.Errorf("GetMeetingInfo should not be called on filter error, but was called %d times", mockClient.CallCounts["GetMeetingInfo"])
			}
		})
	}
}

func TestNewGetMeetingInfoFlow_UserTransformation(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name       string
		users      []*common.User
		verifyUser func(*testing.T, []meeting.User)
	}{
		{
			name: "single moderator user",
			users: []*common.User{
				{
					UserId:          "mod-user-1",
					FullName:        "Moderator User",
					Role:            "MODERATOR",
					IsPresenter:     true,
					IsListeningOnly: false,
					HasJoinedVoice:  true,
					HasVideo:        true,
					ClientType:      "HTML5",
					CustomData:      map[string]string{"customKey": "customValue"},
				},
			},
			verifyUser: func(t *testing.T, users []meeting.User) {
				if len(users) != 1 {
					t.Fatalf("Expected 1 user, got %d", len(users))
				}
				u := users[0]
				if u.UserId != "mod-user-1" {
					t.Errorf("UserId = %s, want mod-user-1", u.UserId)
				}
				if u.FullName != "Moderator User" {
					t.Errorf("FullName = %s, want Moderator User", u.FullName)
				}
				if u.Role != "MODERATOR" {
					t.Errorf("Role = %s, want MODERATOR", u.Role)
				}
				if !u.IsPresenter {
					t.Error("IsPresenter = false, want true")
				}
				if u.IsListeningOnly {
					t.Error("IsListeningOnly = true, want false")
				}
				if !u.HasJoinedVoice {
					t.Error("HasJoinedVoice = false, want true")
				}
				if !u.HasVideo {
					t.Error("HasVideo = false, want true")
				}
				if u.ClientType != "HTML5" {
					t.Errorf("ClientType = %s, want HTML5", u.ClientType)
				}
			},
		},
		{
			name: "viewer in listen-only mode",
			users: []*common.User{
				{
					UserId:          "viewer-1",
					FullName:        "Listen Only Viewer",
					Role:            "VIEWER",
					IsPresenter:     false,
					IsListeningOnly: true,
					HasJoinedVoice:  false,
					HasVideo:        false,
					ClientType:      "HTML5",
				},
			},
			verifyUser: func(t *testing.T, users []meeting.User) {
				if len(users) != 1 {
					t.Fatalf("Expected 1 user, got %d", len(users))
				}
				u := users[0]
				if u.Role != "VIEWER" {
					t.Errorf("Role = %s, want VIEWER", u.Role)
				}
				if !u.IsListeningOnly {
					t.Error("IsListeningOnly = false, want true")
				}
				if u.HasJoinedVoice {
					t.Error("HasJoinedVoice = true, want false")
				}
			},
		},
		{
			name: "multiple users with different roles",
			users: []*common.User{
				{UserId: "user-1", FullName: "Moderator", Role: "MODERATOR", IsPresenter: true},
				{UserId: "user-2", FullName: "Viewer 1", Role: "VIEWER", IsPresenter: false},
				{UserId: "user-3", FullName: "Viewer 2", Role: "VIEWER", IsPresenter: false},
			},
			verifyUser: func(t *testing.T, users []meeting.User) {
				if len(users) != 3 {
					t.Fatalf("Expected 3 users, got %d", len(users))
				}
				// Check first user is moderator
				if users[0].Role != "MODERATOR" {
					t.Errorf("First user Role = %s, want MODERATOR", users[0].Role)
				}
				// Check presenter flag
				if !users[0].IsPresenter {
					t.Error("First user should be presenter")
				}
				if users[1].IsPresenter || users[2].IsPresenter {
					t.Error("Viewers should not be presenters")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := meeting.NewMockClient()
			resp := createMeetingInfoResponse("test-meeting", "internal-test", "Test Meeting")
			resp.MeetingInfo.Users = tt.users
			mockClient.GetMeetingInfoResponse = resp

			flow := NewGetMeetingInfoFlow(mockClient)
			req := createTestRequest("test-meeting", salt)
			msg := pipeline.NewMessage(req)

			resultMsg, err := flow.Execute(msg)
			if err != nil {
				t.Fatalf("Execute() unexpected error = %v", err)
			}

			tt.verifyUser(t, resultMsg.Payload.Users.Users)
		})
	}
}

func TestNewGetMeetingInfoFlow_DurationInfo(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name         string
		durationInfo *common.DurationInfo
		verify       func(*testing.T, *meeting.GetMeetingInfoResponse)
	}{
		{
			name: "running meeting with all duration fields",
			durationInfo: &common.DurationInfo{
				CreateTime:           1700000000000,
				CreatedOn:            "Tue Nov 14 2023",
				StartTime:            1700000001000,
				EndTime:              0,
				Duration:             120,
				IsRunning:            true,
				HasBeenForciblyEnded: false,
			},
			verify: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if resp.CreateTime != 1700000000000 {
					t.Errorf("CreateTime = %d, want 1700000000000", resp.CreateTime)
				}
				if resp.CreateDate != "Tue Nov 14 2023" {
					t.Errorf("CreateDate = %s, want Tue Nov 14 2023", resp.CreateDate)
				}
				if resp.StartTime != 1700000001000 {
					t.Errorf("StartTime = %d, want 1700000001000", resp.StartTime)
				}
				if resp.Duration != 120 {
					t.Errorf("Duration = %d, want 120", resp.Duration)
				}
				if !resp.Running {
					t.Error("Running = false, want true")
				}
				if resp.HasBeenForciblyEnded {
					t.Error("HasBeenForciblyEnded = true, want false")
				}
			},
		},
		{
			name: "ended meeting with end time",
			durationInfo: &common.DurationInfo{
				CreateTime:           1700000000000,
				CreatedOn:            "Tue Nov 14 2023",
				StartTime:            1700000001000,
				EndTime:              1700000100000,
				Duration:             120,
				IsRunning:            false,
				HasBeenForciblyEnded: false,
			},
			verify: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if resp.Running {
					t.Error("Running = true, want false")
				}
				if resp.EndTime != 1700000100000 {
					t.Errorf("EndTime = %d, want 1700000100000", resp.EndTime)
				}
			},
		},
		{
			name: "forcibly ended meeting",
			durationInfo: &common.DurationInfo{
				CreateTime:           1700000000000,
				CreatedOn:            "Tue Nov 14 2023",
				StartTime:            1700000001000,
				EndTime:              1700000050000,
				Duration:             120,
				IsRunning:            false,
				HasBeenForciblyEnded: true,
			},
			verify: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if !resp.HasBeenForciblyEnded {
					t.Error("HasBeenForciblyEnded = false, want true")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := meeting.NewMockClient()
			resp := createMeetingInfoResponse("test-meeting", "internal-test", "Test Meeting")
			resp.MeetingInfo.DurationInfo = tt.durationInfo
			mockClient.GetMeetingInfoResponse = resp

			flow := NewGetMeetingInfoFlow(mockClient)
			req := createTestRequest("test-meeting", salt)
			msg := pipeline.NewMessage(req)

			resultMsg, err := flow.Execute(msg)
			if err != nil {
				t.Fatalf("Execute() unexpected error = %v", err)
			}

			tt.verify(t, resultMsg.Payload)
		})
	}
}

func TestNewGetMeetingInfoFlow_ParticipantInfo(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	tests := []struct {
		name            string
		participantInfo *common.ParticipantInfo
		verify          func(*testing.T, *meeting.GetMeetingInfoResponse)
	}{
		{
			name: "meeting with various participant counts",
			participantInfo: &common.ParticipantInfo{
				HasUserJoined:         true,
				ParticipantCount:      10,
				ListenerCount:         3,
				VoiceParticipantCount: 5,
				VideoCount:            2,
				MaxUsers:              50,
				ModeratorCount:        2,
			},
			verify: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if !resp.HasUserJoined {
					t.Error("HasUserJoined = false, want true")
				}
				if resp.ParticipantCount != 10 {
					t.Errorf("ParticipantCount = %d, want 10", resp.ParticipantCount)
				}
				if resp.ListenerCount != 3 {
					t.Errorf("ListenerCount = %d, want 3", resp.ListenerCount)
				}
				if resp.VoiceParticipantCount != 5 {
					t.Errorf("VoiceParticipantCount = %d, want 5", resp.VoiceParticipantCount)
				}
				if resp.VideoCount != 2 {
					t.Errorf("VideoCount = %d, want 2", resp.VideoCount)
				}
				if resp.MaxUsers != 50 {
					t.Errorf("MaxUsers = %d, want 50", resp.MaxUsers)
				}
				if resp.ModeratorCount != 2 {
					t.Errorf("ModeratorCount = %d, want 2", resp.ModeratorCount)
				}
			},
		},
		{
			name: "meeting with no users yet",
			participantInfo: &common.ParticipantInfo{
				HasUserJoined:         false,
				ParticipantCount:      0,
				ListenerCount:         0,
				VoiceParticipantCount: 0,
				VideoCount:            0,
				MaxUsers:              100,
				ModeratorCount:        0,
			},
			verify: func(t *testing.T, resp *meeting.GetMeetingInfoResponse) {
				if resp.HasUserJoined {
					t.Error("HasUserJoined = true, want false")
				}
				if resp.ParticipantCount != 0 {
					t.Errorf("ParticipantCount = %d, want 0", resp.ParticipantCount)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := meeting.NewMockClient()
			resp := createMeetingInfoResponse("test-meeting", "internal-test", "Test Meeting")
			resp.MeetingInfo.ParticipantInfo = tt.participantInfo
			mockClient.GetMeetingInfoResponse = resp

			flow := NewGetMeetingInfoFlow(mockClient)
			req := createTestRequest("test-meeting", salt)
			msg := pipeline.NewMessage(req)

			resultMsg, err := flow.Execute(msg)
			if err != nil {
				t.Fatalf("Execute() unexpected error = %v", err)
			}

			tt.verify(t, resultMsg.Payload)
		})
	}
}
