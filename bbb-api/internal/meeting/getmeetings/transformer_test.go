package getmeetings

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
				reqURL := "/getMeetings?meetingID=" + url.QueryEscape(meetingID)
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
			name:              "Empty meeting ID",
			meetingID:         "",
			expectedMeetingID: "",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with spaces",
			meetingID:         "  meeting-with-spaces  ",
			expectedMeetingID: "meeting-with-spaces",
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				reqURL := "/getMeetings?meetingID=" + url.QueryEscape(meetingID)
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
			expectedMeetingID: "meeting\x00\x01\x02ID", // StripCtrlChars doesn't strip all control chars
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)
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
				reqURL := "/getMeetings?meetingID=" + url.QueryEscape(meetingID)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)
				params := make(bbbhttp.Params)
				params.Set(meetingapi.IDParam, bbbhttp.Param{Value: meetingID, FromQuery: true})
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, params)
				return req.WithContext(ctx)
			},
		},
		{
			name:              "Meeting ID with newlines and tabs",
			meetingID:         "meeting\nwith\ttabs",
			expectedMeetingID: "meeting\nwith\ttabs", // StripCtrlChars doesn't strip newlines/tabs
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)
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
				reqURL := "/getMeetings?meetingID=" + url.QueryEscape(meetingID)
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
			expectedMeetingID: "meeting\rID", // StripCtrlChars doesn't strip carriage return
			shouldErr:         false,
			includeParams:     true,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				req := httptest.NewRequest(http.MethodGet, "/getMeetings", nil)
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
				reqURL := "/getMeetings?meetingID=" + url.QueryEscape(meetingID)
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
				reqURL := "/getMeetings?meetingID=" + url.QueryEscape(meetingID)
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
				reqURL := "/getMeetings?meetingID=" + url.QueryEscape(meetingID)
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

// Helper function to create a MeetingInfoResponse for testing
func createMeetingInfoResponse(meetingExtID, meetingIntID, meetingName string) *meeting.MeetingInfoResponse {
	return &meeting.MeetingInfoResponse{
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

func TestGRPCToResponse_Transform(t *testing.T) {
	tests := []struct {
		name           string
		input          []*meeting.MeetingInfoResponse
		wantMeetingCnt int
		verifyMeetings func(*testing.T, []meetingapi.Meeting)
	}{
		{
			name:           "Empty meetings list",
			input:          []*meeting.MeetingInfoResponse{},
			wantMeetingCnt: 0,
			verifyMeetings: func(t *testing.T, meetings []meetingapi.Meeting) {
				if len(meetings) != 0 {
					t.Errorf("Expected 0 meetings, got %d", len(meetings))
				}
			},
		},
		{
			name: "Single meeting in response",
			input: []*meeting.MeetingInfoResponse{
				createMeetingInfoResponse("meeting-1", "internal-1", "Test Meeting 1"),
			},
			wantMeetingCnt: 1,
			verifyMeetings: func(t *testing.T, meetings []meetingapi.Meeting) {
				if len(meetings) != 1 {
					t.Fatalf("Expected 1 meeting, got %d", len(meetings))
				}
				m := meetings[0]
				if m.MeetingId != "meeting-1" {
					t.Errorf("MeetingId = %s, want meeting-1", m.MeetingId)
				}
				if m.InternalMeetingId != "internal-1" {
					t.Errorf("InternalMeetingId = %s, want internal-1", m.InternalMeetingId)
				}
				if m.MeetingName != "Test Meeting 1" {
					t.Errorf("MeetingName = %s, want Test Meeting 1", m.MeetingName)
				}
			},
		},
		{
			name: "Multiple meetings in response",
			input: []*meeting.MeetingInfoResponse{
				createMeetingInfoResponse("meeting-1", "internal-1", "Test Meeting 1"),
				createMeetingInfoResponse("meeting-2", "internal-2", "Test Meeting 2"),
				createMeetingInfoResponse("meeting-3", "internal-3", "Test Meeting 3"),
			},
			wantMeetingCnt: 3,
			verifyMeetings: func(t *testing.T, meetings []meetingapi.Meeting) {
				if len(meetings) != 3 {
					t.Fatalf("Expected 3 meetings, got %d", len(meetings))
				}
				for i, m := range meetings {
					expectedID := "meeting-" + string(rune('1'+i))
					if m.MeetingId != expectedID {
						t.Errorf("Meeting[%d].MeetingId = %s, want %s", i, m.MeetingId, expectedID)
					}
				}
			},
		},
		{
			name: "Meeting with users",
			input: []*meeting.MeetingInfoResponse{
				func() *meeting.MeetingInfoResponse {
					resp := createMeetingInfoResponse("meeting-with-users", "internal-users", "Meeting With Users")
					resp.MeetingInfo.Users = []*common.User{
						{UserId: "user-1", FullName: "User One", Role: "MODERATOR"},
						{UserId: "user-2", FullName: "User Two", Role: "VIEWER"},
					}
					resp.MeetingInfo.ParticipantInfo.ParticipantCount = 2
					return resp
				}(),
			},
			wantMeetingCnt: 1,
			verifyMeetings: func(t *testing.T, meetings []meetingapi.Meeting) {
				if len(meetings) != 1 {
					t.Fatalf("Expected 1 meeting, got %d", len(meetings))
				}
				if len(meetings[0].Users.Users) != 2 {
					t.Errorf("Expected 2 users, got %d", len(meetings[0].Users.Users))
				}
				if meetings[0].ParticipantCount != 2 {
					t.Errorf("ParticipantCount = %d, want 2", meetings[0].ParticipantCount)
				}
			},
		},
		{
			name: "Meeting with metadata",
			input: []*meeting.MeetingInfoResponse{
				func() *meeting.MeetingInfoResponse {
					resp := createMeetingInfoResponse("meeting-with-meta", "internal-meta", "Meeting With Metadata")
					resp.MeetingInfo.Metadata = map[string]string{
						"key1": "value1",
						"key2": "value2",
					}
					return resp
				}(),
			},
			wantMeetingCnt: 1,
			verifyMeetings: func(t *testing.T, meetings []meetingapi.Meeting) {
				if len(meetings) != 1 {
					t.Fatalf("Expected 1 meeting, got %d", len(meetings))
				}
				if meetings[0].Metadata.Data["key1"] != "value1" {
					t.Errorf("Metadata[key1] = %s, want value1", meetings[0].Metadata.Data["key1"])
				}
				if meetings[0].Metadata.Data["key2"] != "value2" {
					t.Errorf("Metadata[key2] = %s, want value2", meetings[0].Metadata.Data["key2"])
				}
			},
		},
		{
			name: "Meeting with breakout rooms",
			input: []*meeting.MeetingInfoResponse{
				func() *meeting.MeetingInfoResponse {
					resp := createMeetingInfoResponse("meeting-with-breakout", "internal-breakout", "Meeting With Breakout")
					resp.MeetingInfo.BreakoutInfo.IsBreakout = true
					resp.MeetingInfo.BreakoutRooms = []string{"room-1", "room-2"}
					return resp
				}(),
			},
			wantMeetingCnt: 1,
			verifyMeetings: func(t *testing.T, meetings []meetingapi.Meeting) {
				if len(meetings) != 1 {
					t.Fatalf("Expected 1 meeting, got %d", len(meetings))
				}
				if !meetings[0].IsBreakout {
					t.Error("IsBreakout = false, want true")
				}
				if len(meetings[0].BreakoutRooms.Breakout) != 2 {
					t.Errorf("Expected 2 breakout rooms, got %d", len(meetings[0].BreakoutRooms.Breakout))
				}
			},
		},
		{
			name: "Meeting with all fields populated",
			input: []*meeting.MeetingInfoResponse{
				createMeetingInfoResponse("full-meeting", "internal-full", "Full Meeting"),
			},
			wantMeetingCnt: 1,
			verifyMeetings: func(t *testing.T, meetings []meetingapi.Meeting) {
				if len(meetings) != 1 {
					t.Fatalf("Expected 1 meeting, got %d", len(meetings))
				}
				m := meetings[0]
				if m.VoiceBridge != "12345" {
					t.Errorf("VoiceBridge = %s, want 12345", m.VoiceBridge)
				}
				if m.DialNumber != "613-555-1234" {
					t.Errorf("DialNumber = %s, want 613-555-1234", m.DialNumber)
				}
				if m.AttendeePW != "ap" {
					t.Errorf("AttendeePW = %s, want ap", m.AttendeePW)
				}
				if m.ModeratorPW != "mp" {
					t.Errorf("ModeratorPW = %s, want mp", m.ModeratorPW)
				}
				if !m.Recording {
					t.Error("Recording = false, want true")
				}
				if !m.Running {
					t.Error("Running = false, want true")
				}
				if m.Duration != 60 {
					t.Errorf("Duration = %d, want 60", m.Duration)
				}
				if m.CreateTime != 1234567890000 {
					t.Errorf("CreateTime = %d, want 1234567890000", m.CreateTime)
				}
				if m.CreateDate != "Mon Jan 01 2024" {
					t.Errorf("CreateDate = %s, want Mon Jan 01 2024", m.CreateDate)
				}
			},
		},
		{
			name: "Meeting not running",
			input: []*meeting.MeetingInfoResponse{
				func() *meeting.MeetingInfoResponse {
					resp := createMeetingInfoResponse("stopped-meeting", "internal-stopped", "Stopped Meeting")
					resp.MeetingInfo.DurationInfo.IsRunning = false
					resp.MeetingInfo.DurationInfo.EndTime = 1234567899000
					return resp
				}(),
			},
			wantMeetingCnt: 1,
			verifyMeetings: func(t *testing.T, meetings []meetingapi.Meeting) {
				if len(meetings) != 1 {
					t.Fatalf("Expected 1 meeting, got %d", len(meetings))
				}
				if meetings[0].Running {
					t.Error("Running = true, want false")
				}
				if meetings[0].EndTime != 1234567899000 {
					t.Errorf("EndTime = %d, want 1234567899000", meetings[0].EndTime)
				}
			},
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

			// Verify Meetings is not nil
			if result.Payload.Meetings == nil {
				t.Errorf("Meetings is nil, expected non-nil")
				return
			}

			// Verify meeting count
			if len(result.Payload.Meetings.Meetings) != tt.wantMeetingCnt {
				t.Errorf("Meeting count = %d, want %d", len(result.Payload.Meetings.Meetings), tt.wantMeetingCnt)
			}

			// Run custom verification
			if tt.verifyMeetings != nil {
				tt.verifyMeetings(t, result.Payload.Meetings.Meetings)
			}
		})
	}
}

func TestGRPCToResponse_Transform_EmptyResponse(t *testing.T) {
	transformer := &GRPCToResponse{}
	msg := pipeline.NewMessage([]*meeting.MeetingInfoResponse{})

	result, err := transformer.Transform(msg)

	if err != nil {
		t.Fatalf("Transform() unexpected error = %v", err)
	}

	if result.Payload == nil {
		t.Fatal("Transform() returned nil payload")
	}

	if result.Payload.ReturnCode != responses.ReturnCodeSuccess {
		t.Errorf("ReturnCode = %q, want %q", result.Payload.ReturnCode, responses.ReturnCodeSuccess)
	}

	if result.Payload.Meetings == nil {
		t.Fatal("Meetings should not be nil")
	}

	if len(result.Payload.Meetings.Meetings) != 0 {
		t.Errorf("Expected empty meetings slice, got %d meetings", len(result.Payload.Meetings.Meetings))
	}
}
