package getmeetinginfo

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
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
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
			name:              "Missing params in context",
			meetingID:         "test-meeting",
			expectedMeetingID: "",
			shouldErr:         true,
			errContains:       "request parameters are missing",
			includeParams:     false,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				// Don't add params to context
				return req
			},
		},
		{
			name:              "Wrong type in context",
			meetingID:         "test-meeting",
			expectedMeetingID: "",
			shouldErr:         true,
			errContains:       "request parameters are missing",
			includeParams:     false,
			setupRequest: func(meetingID string, includeParams bool) *http.Request {
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
				req := httptest.NewRequest(http.MethodGet, reqURL, nil)
				// Add wrong type to context
				ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, "wrong-type")
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
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo", nil)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo?meetingID=", nil)
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
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo", nil)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo", nil)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo", nil)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo", nil)
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
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
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
				req := httptest.NewRequest(http.MethodGet, "/getMeetingInfo", nil)
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
				// Verify empty payload is returned on error
				if result.Payload != nil {
					t.Errorf("Transform() should return nil payload on error, got %v", result.Payload)
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
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
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
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
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
				reqURL := "/getMeetingInfo?meetingID=" + url.QueryEscape(meetingID)
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
				if result.Payload != nil {
					t.Errorf("Transform() should return nil payload on error")
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
		name     string
		input    *meeting.MeetingInfoResponse
		expected *meetingapi.GetMeetingInfoResponse
	}{
		{
			name: "Full meeting info with all fields populated",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:  "Test Meeting",
					MeetingExtId: "ext-123",
					MeetingIntId: "int-456",
					VoiceBridge:  "71234",
					DialNumber:   "613-555-1234",
					AttendeePw:   "ap",
					ModeratorPw:  "mp",
					Recording:    true,
					Users: []*common.User{
						{
							UserId:          "user-1",
							FullName:        "John Doe",
							Role:            "MODERATOR",
							IsPresenter:     true,
							IsListeningOnly: false,
							HasJoinedVoice:  true,
							HasVideo:        true,
							ClientType:      "HTML5",
							CustomData:      map[string]string{"key1": "value1"},
						},
						{
							UserId:          "user-2",
							FullName:        "Jane Smith",
							Role:            "VIEWER",
							IsPresenter:     false,
							IsListeningOnly: true,
							HasJoinedVoice:  false,
							HasVideo:        false,
							ClientType:      "HTML5",
							CustomData:      nil,
						},
					},
					Metadata:      map[string]string{"meta1": "data1", "meta2": "data2"},
					BreakoutRooms: []string{"breakout-1", "breakout-2"},
					DurationInfo: &common.DurationInfo{
						CreateTime:           1700000000000,
						CreatedOn:            "Wed Nov 14 12:26:40 UTC 2023",
						Duration:             60,
						StartTime:            1700000001000,
						EndTime:              0,
						IsRunning:            true,
						HasBeenForciblyEnded: false,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         true,
						ParticipantCount:      2,
						ListenerCount:         1,
						VoiceParticipantCount: 1,
						VideoCount:            1,
						MaxUsers:              100,
						ModeratorCount:        1,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: false,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "Test Meeting",
				MeetingId:             "ext-123",
				InternalMeetingId:     "int-456",
				CreateTime:            1700000000000,
				CreateDate:            "Wed Nov 14 12:26:40 UTC 2023",
				VoiceBridge:           "71234",
				DialNumber:            "613-555-1234",
				AttendeePW:            "ap",
				ModeratorPW:           "mp",
				Running:               true,
				Duration:              60,
				HasUserJoined:         true,
				Recording:             true,
				HasBeenForciblyEnded:  false,
				StartTime:             1700000001000,
				EndTime:               0,
				ParticipantCount:      2,
				ListenerCount:         1,
				VoiceParticipantCount: 1,
				VideoCount:            1,
				MaxUsers:              100,
				ModeratorCount:        1,
				Users: meetingapi.Users{
					Users: []meetingapi.User{
						{
							UserId:          "user-1",
							FullName:        "John Doe",
							Role:            "MODERATOR",
							IsPresenter:     true,
							IsListeningOnly: false,
							HasJoinedVoice:  true,
							HasVideo:        true,
							ClientType:      "HTML5",
							CustomData:      meetingapi.MapData{Data: map[string]string{"key1": "value1"}, TagName: "customdata"},
						},
						{
							UserId:          "user-2",
							FullName:        "Jane Smith",
							Role:            "VIEWER",
							IsPresenter:     false,
							IsListeningOnly: true,
							HasJoinedVoice:  false,
							HasVideo:        false,
							ClientType:      "HTML5",
							CustomData:      meetingapi.MapData{Data: nil, TagName: "customdata"},
						},
					},
				},
				Metadata:      meetingapi.MapData{Data: map[string]string{"meta1": "data1", "meta2": "data2"}, TagName: "metadata"},
				IsBreakout:    false,
				BreakoutRooms: meetingapi.BreakoutRooms{Breakout: []string{"breakout-1", "breakout-2"}},
			},
		},
		{
			name: "Meeting with no users",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:   "Empty Meeting",
					MeetingExtId:  "empty-ext",
					MeetingIntId:  "empty-int",
					VoiceBridge:   "70000",
					DialNumber:    "",
					AttendeePw:    "att",
					ModeratorPw:   "mod",
					Recording:     false,
					Users:         []*common.User{},
					Metadata:      map[string]string{},
					BreakoutRooms: []string{},
					DurationInfo: &common.DurationInfo{
						CreateTime:           1700000000000,
						CreatedOn:            "Wed Nov 14 12:26:40 UTC 2023",
						Duration:             0,
						StartTime:            0,
						EndTime:              0,
						IsRunning:            false,
						HasBeenForciblyEnded: false,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         false,
						ParticipantCount:      0,
						ListenerCount:         0,
						VoiceParticipantCount: 0,
						VideoCount:            0,
						MaxUsers:              50,
						ModeratorCount:        0,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: false,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "Empty Meeting",
				MeetingId:             "empty-ext",
				InternalMeetingId:     "empty-int",
				CreateTime:            1700000000000,
				CreateDate:            "Wed Nov 14 12:26:40 UTC 2023",
				VoiceBridge:           "70000",
				DialNumber:            "",
				AttendeePW:            "att",
				ModeratorPW:           "mod",
				Running:               false,
				Duration:              0,
				HasUserJoined:         false,
				Recording:             false,
				HasBeenForciblyEnded:  false,
				StartTime:             0,
				EndTime:               0,
				ParticipantCount:      0,
				ListenerCount:         0,
				VoiceParticipantCount: 0,
				VideoCount:            0,
				MaxUsers:              50,
				ModeratorCount:        0,
				Users:                 meetingapi.Users{Users: []meetingapi.User{}},
				Metadata:              meetingapi.MapData{Data: map[string]string{}, TagName: "metadata"},
				IsBreakout:            false,
				BreakoutRooms:         meetingapi.BreakoutRooms{Breakout: []string{}},
			},
		},
		{
			name: "Breakout room meeting",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:   "Breakout Room 1",
					MeetingExtId:  "breakout-ext",
					MeetingIntId:  "breakout-int",
					VoiceBridge:   "71111",
					DialNumber:    "613-555-9999",
					AttendeePw:    "bap",
					ModeratorPw:   "bmp",
					Recording:     false,
					Users:         nil,
					Metadata:      nil,
					BreakoutRooms: nil,
					DurationInfo: &common.DurationInfo{
						CreateTime:           1700000500000,
						CreatedOn:            "Wed Nov 14 12:35:00 UTC 2023",
						Duration:             30,
						StartTime:            1700000501000,
						EndTime:              0,
						IsRunning:            true,
						HasBeenForciblyEnded: false,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         true,
						ParticipantCount:      5,
						ListenerCount:         2,
						VoiceParticipantCount: 3,
						VideoCount:            2,
						MaxUsers:              10,
						ModeratorCount:        1,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: true,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "Breakout Room 1",
				MeetingId:             "breakout-ext",
				InternalMeetingId:     "breakout-int",
				CreateTime:            1700000500000,
				CreateDate:            "Wed Nov 14 12:35:00 UTC 2023",
				VoiceBridge:           "71111",
				DialNumber:            "613-555-9999",
				AttendeePW:            "bap",
				ModeratorPW:           "bmp",
				Running:               true,
				Duration:              30,
				HasUserJoined:         true,
				Recording:             false,
				HasBeenForciblyEnded:  false,
				StartTime:             1700000501000,
				EndTime:               0,
				ParticipantCount:      5,
				ListenerCount:         2,
				VoiceParticipantCount: 3,
				VideoCount:            2,
				MaxUsers:              10,
				ModeratorCount:        1,
				Users:                 meetingapi.Users{Users: []meetingapi.User{}},
				Metadata:              meetingapi.MapData{Data: nil, TagName: "metadata"},
				IsBreakout:            true,
				BreakoutRooms:         meetingapi.BreakoutRooms{Breakout: nil},
			},
		},
		{
			name: "Meeting that has been forcibly ended",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:   "Ended Meeting",
					MeetingExtId:  "ended-ext",
					MeetingIntId:  "ended-int",
					VoiceBridge:   "72222",
					DialNumber:    "",
					AttendeePw:    "eap",
					ModeratorPw:   "emp",
					Recording:     true,
					Users:         []*common.User{},
					Metadata:      map[string]string{"recording": "true"},
					BreakoutRooms: []string{},
					DurationInfo: &common.DurationInfo{
						CreateTime:           1700000000000,
						CreatedOn:            "Wed Nov 14 12:26:40 UTC 2023",
						Duration:             120,
						StartTime:            1700000001000,
						EndTime:              1700003600000,
						IsRunning:            false,
						HasBeenForciblyEnded: true,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         true,
						ParticipantCount:      0,
						ListenerCount:         0,
						VoiceParticipantCount: 0,
						VideoCount:            0,
						MaxUsers:              200,
						ModeratorCount:        0,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: false,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "Ended Meeting",
				MeetingId:             "ended-ext",
				InternalMeetingId:     "ended-int",
				CreateTime:            1700000000000,
				CreateDate:            "Wed Nov 14 12:26:40 UTC 2023",
				VoiceBridge:           "72222",
				DialNumber:            "",
				AttendeePW:            "eap",
				ModeratorPW:           "emp",
				Running:               false,
				Duration:              120,
				HasUserJoined:         true,
				Recording:             true,
				HasBeenForciblyEnded:  true,
				StartTime:             1700000001000,
				EndTime:               1700003600000,
				ParticipantCount:      0,
				ListenerCount:         0,
				VoiceParticipantCount: 0,
				VideoCount:            0,
				MaxUsers:              200,
				ModeratorCount:        0,
				Users:                 meetingapi.Users{Users: []meetingapi.User{}},
				Metadata:              meetingapi.MapData{Data: map[string]string{"recording": "true"}, TagName: "metadata"},
				IsBreakout:            false,
				BreakoutRooms:         meetingapi.BreakoutRooms{Breakout: []string{}},
			},
		},
		{
			name: "Meeting with special characters in fields",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:   "Test <Meeting> & \"Special\" 'Chars'",
					MeetingExtId:  "special-<>&\"'-ext",
					MeetingIntId:  "special-int",
					VoiceBridge:   "73333",
					DialNumber:    "+1-555-TEST",
					AttendeePw:    "pass<>",
					ModeratorPw:   "mod&pass",
					Recording:     false,
					Users:         []*common.User{},
					Metadata:      map[string]string{"key<>": "value&"},
					BreakoutRooms: []string{},
					DurationInfo: &common.DurationInfo{
						CreateTime:           1700000000000,
						CreatedOn:            "Wed Nov 14 12:26:40 UTC 2023",
						Duration:             0,
						StartTime:            0,
						EndTime:              0,
						IsRunning:            false,
						HasBeenForciblyEnded: false,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         false,
						ParticipantCount:      0,
						ListenerCount:         0,
						VoiceParticipantCount: 0,
						VideoCount:            0,
						MaxUsers:              0,
						ModeratorCount:        0,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: false,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "Test <Meeting> & \"Special\" 'Chars'",
				MeetingId:             "special-<>&\"'-ext",
				InternalMeetingId:     "special-int",
				CreateTime:            1700000000000,
				CreateDate:            "Wed Nov 14 12:26:40 UTC 2023",
				VoiceBridge:           "73333",
				DialNumber:            "+1-555-TEST",
				AttendeePW:            "pass<>",
				ModeratorPW:           "mod&pass",
				Running:               false,
				Duration:              0,
				HasUserJoined:         false,
				Recording:             false,
				HasBeenForciblyEnded:  false,
				StartTime:             0,
				EndTime:               0,
				ParticipantCount:      0,
				ListenerCount:         0,
				VoiceParticipantCount: 0,
				VideoCount:            0,
				MaxUsers:              0,
				ModeratorCount:        0,
				Users:                 meetingapi.Users{Users: []meetingapi.User{}},
				Metadata:              meetingapi.MapData{Data: map[string]string{"key<>": "value&"}, TagName: "metadata"},
				IsBreakout:            false,
				BreakoutRooms:         meetingapi.BreakoutRooms{Breakout: []string{}},
			},
		},
		{
			name: "Meeting with single user having nil custom data",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:  "Single User Meeting",
					MeetingExtId: "single-ext",
					MeetingIntId: "single-int",
					VoiceBridge:  "74444",
					DialNumber:   "",
					AttendeePw:   "ap",
					ModeratorPw:  "mp",
					Recording:    false,
					Users: []*common.User{
						{
							UserId:          "solo-user",
							FullName:        "Solo Person",
							Role:            "MODERATOR",
							IsPresenter:     true,
							IsListeningOnly: false,
							HasJoinedVoice:  false,
							HasVideo:        false,
							ClientType:      "FLASH",
							CustomData:      nil,
						},
					},
					Metadata:      nil,
					BreakoutRooms: nil,
					DurationInfo: &common.DurationInfo{
						CreateTime:           1700000000000,
						CreatedOn:            "Wed Nov 14 12:26:40 UTC 2023",
						Duration:             0,
						StartTime:            1700000001000,
						EndTime:              0,
						IsRunning:            true,
						HasBeenForciblyEnded: false,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         true,
						ParticipantCount:      1,
						ListenerCount:         0,
						VoiceParticipantCount: 0,
						VideoCount:            0,
						MaxUsers:              25,
						ModeratorCount:        1,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: false,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "Single User Meeting",
				MeetingId:             "single-ext",
				InternalMeetingId:     "single-int",
				CreateTime:            1700000000000,
				CreateDate:            "Wed Nov 14 12:26:40 UTC 2023",
				VoiceBridge:           "74444",
				DialNumber:            "",
				AttendeePW:            "ap",
				ModeratorPW:           "mp",
				Running:               true,
				Duration:              0,
				HasUserJoined:         true,
				Recording:             false,
				HasBeenForciblyEnded:  false,
				StartTime:             1700000001000,
				EndTime:               0,
				ParticipantCount:      1,
				ListenerCount:         0,
				VoiceParticipantCount: 0,
				VideoCount:            0,
				MaxUsers:              25,
				ModeratorCount:        1,
				Users: meetingapi.Users{
					Users: []meetingapi.User{
						{
							UserId:          "solo-user",
							FullName:        "Solo Person",
							Role:            "MODERATOR",
							IsPresenter:     true,
							IsListeningOnly: false,
							HasJoinedVoice:  false,
							HasVideo:        false,
							ClientType:      "FLASH",
							CustomData:      meetingapi.MapData{Data: nil, TagName: "customdata"},
						},
					},
				},
				Metadata:      meetingapi.MapData{Data: nil, TagName: "metadata"},
				IsBreakout:    false,
				BreakoutRooms: meetingapi.BreakoutRooms{Breakout: nil},
			},
		},
		{
			name: "Meeting with Unicode characters",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:   "会议 - Встреча - مؤتمر",
					MeetingExtId:  "unicode-ext",
					MeetingIntId:  "unicode-int",
					VoiceBridge:   "75555",
					DialNumber:    "",
					AttendeePw:    "密码",
					ModeratorPw:   "пароль",
					Recording:     false,
					Users:         []*common.User{},
					Metadata:      map[string]string{"名前": "値"},
					BreakoutRooms: []string{},
					DurationInfo: &common.DurationInfo{
						CreateTime:           1700000000000,
						CreatedOn:            "Wed Nov 14 12:26:40 UTC 2023",
						Duration:             0,
						StartTime:            0,
						EndTime:              0,
						IsRunning:            false,
						HasBeenForciblyEnded: false,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         false,
						ParticipantCount:      0,
						ListenerCount:         0,
						VoiceParticipantCount: 0,
						VideoCount:            0,
						MaxUsers:              0,
						ModeratorCount:        0,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: false,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "会议 - Встреча - مؤتمر",
				MeetingId:             "unicode-ext",
				InternalMeetingId:     "unicode-int",
				CreateTime:            1700000000000,
				CreateDate:            "Wed Nov 14 12:26:40 UTC 2023",
				VoiceBridge:           "75555",
				DialNumber:            "",
				AttendeePW:            "密码",
				ModeratorPW:           "пароль",
				Running:               false,
				Duration:              0,
				HasUserJoined:         false,
				Recording:             false,
				HasBeenForciblyEnded:  false,
				StartTime:             0,
				EndTime:               0,
				ParticipantCount:      0,
				ListenerCount:         0,
				VoiceParticipantCount: 0,
				VideoCount:            0,
				MaxUsers:              0,
				ModeratorCount:        0,
				Users:                 meetingapi.Users{Users: []meetingapi.User{}},
				Metadata:              meetingapi.MapData{Data: map[string]string{"名前": "値"}, TagName: "metadata"},
				IsBreakout:            false,
				BreakoutRooms:         meetingapi.BreakoutRooms{Breakout: []string{}},
			},
		},
		{
			name: "Meeting with multiple breakout rooms",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:   "Parent Meeting",
					MeetingExtId:  "parent-ext",
					MeetingIntId:  "parent-int",
					VoiceBridge:   "76666",
					DialNumber:    "",
					AttendeePw:    "ap",
					ModeratorPw:   "mp",
					Recording:     false,
					Users:         []*common.User{},
					Metadata:      map[string]string{},
					BreakoutRooms: []string{"breakout-room-1", "breakout-room-2", "breakout-room-3", "breakout-room-4"},
					DurationInfo: &common.DurationInfo{
						CreateTime:           1700000000000,
						CreatedOn:            "Wed Nov 14 12:26:40 UTC 2023",
						Duration:             0,
						StartTime:            0,
						EndTime:              0,
						IsRunning:            true,
						HasBeenForciblyEnded: false,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         false,
						ParticipantCount:      0,
						ListenerCount:         0,
						VoiceParticipantCount: 0,
						VideoCount:            0,
						MaxUsers:              0,
						ModeratorCount:        0,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: false,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "Parent Meeting",
				MeetingId:             "parent-ext",
				InternalMeetingId:     "parent-int",
				CreateTime:            1700000000000,
				CreateDate:            "Wed Nov 14 12:26:40 UTC 2023",
				VoiceBridge:           "76666",
				DialNumber:            "",
				AttendeePW:            "ap",
				ModeratorPW:           "mp",
				Running:               true,
				Duration:              0,
				HasUserJoined:         false,
				Recording:             false,
				HasBeenForciblyEnded:  false,
				StartTime:             0,
				EndTime:               0,
				ParticipantCount:      0,
				ListenerCount:         0,
				VoiceParticipantCount: 0,
				VideoCount:            0,
				MaxUsers:              0,
				ModeratorCount:        0,
				Users:                 meetingapi.Users{Users: []meetingapi.User{}},
				Metadata:              meetingapi.MapData{Data: map[string]string{}, TagName: "metadata"},
				IsBreakout:            false,
				BreakoutRooms:         meetingapi.BreakoutRooms{Breakout: []string{"breakout-room-1", "breakout-room-2", "breakout-room-3", "breakout-room-4"}},
			},
		},
		{
			name: "Meeting with max integer values",
			input: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingName:   "Max Values Meeting",
					MeetingExtId:  "max-ext",
					MeetingIntId:  "max-int",
					VoiceBridge:   "99999",
					DialNumber:    "",
					AttendeePw:    "ap",
					ModeratorPw:   "mp",
					Recording:     false,
					Users:         []*common.User{},
					Metadata:      map[string]string{},
					BreakoutRooms: []string{},
					DurationInfo: &common.DurationInfo{
						CreateTime:           9223372036854775807,
						CreatedOn:            "Max Time",
						Duration:             2147483647,
						StartTime:            9223372036854775807,
						EndTime:              9223372036854775807,
						IsRunning:            false,
						HasBeenForciblyEnded: false,
					},
					ParticipantInfo: &common.ParticipantInfo{
						HasUserJoined:         false,
						ParticipantCount:      2147483647,
						ListenerCount:         2147483647,
						VoiceParticipantCount: 2147483647,
						VideoCount:            2147483647,
						MaxUsers:              2147483647,
						ModeratorCount:        2147483647,
					},
					BreakoutInfo: &common.BreakoutInfo{
						IsBreakout: false,
					},
				},
			},
			expected: &meetingapi.GetMeetingInfoResponse{
				ReturnCode:            "SUCCESS",
				MeetingName:           "Max Values Meeting",
				MeetingId:             "max-ext",
				InternalMeetingId:     "max-int",
				CreateTime:            9223372036854775807,
				CreateDate:            "Max Time",
				VoiceBridge:           "99999",
				DialNumber:            "",
				AttendeePW:            "ap",
				ModeratorPW:           "mp",
				Running:               false,
				Duration:              2147483647,
				HasUserJoined:         false,
				Recording:             false,
				HasBeenForciblyEnded:  false,
				StartTime:             9223372036854775807,
				EndTime:               9223372036854775807,
				ParticipantCount:      2147483647,
				ListenerCount:         2147483647,
				VoiceParticipantCount: 2147483647,
				VideoCount:            2147483647,
				MaxUsers:              2147483647,
				ModeratorCount:        2147483647,
				Users:                 meetingapi.Users{Users: []meetingapi.User{}},
				Metadata:              meetingapi.MapData{Data: map[string]string{}, TagName: "metadata"},
				IsBreakout:            false,
				BreakoutRooms:         meetingapi.BreakoutRooms{Breakout: []string{}},
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

			got := result.Payload

			// Check all scalar fields
			if got.ReturnCode != tt.expected.ReturnCode {
				t.Errorf("ReturnCode = %q, want %q", got.ReturnCode, tt.expected.ReturnCode)
			}
			if got.MeetingName != tt.expected.MeetingName {
				t.Errorf("MeetingName = %q, want %q", got.MeetingName, tt.expected.MeetingName)
			}
			if got.MeetingId != tt.expected.MeetingId {
				t.Errorf("MeetingId = %q, want %q", got.MeetingId, tt.expected.MeetingId)
			}
			if got.InternalMeetingId != tt.expected.InternalMeetingId {
				t.Errorf("InternalMeetingId = %q, want %q", got.InternalMeetingId, tt.expected.InternalMeetingId)
			}
			if got.CreateTime != tt.expected.CreateTime {
				t.Errorf("CreateTime = %d, want %d", got.CreateTime, tt.expected.CreateTime)
			}
			if got.CreateDate != tt.expected.CreateDate {
				t.Errorf("CreateDate = %q, want %q", got.CreateDate, tt.expected.CreateDate)
			}
			if got.VoiceBridge != tt.expected.VoiceBridge {
				t.Errorf("VoiceBridge = %q, want %q", got.VoiceBridge, tt.expected.VoiceBridge)
			}
			if got.DialNumber != tt.expected.DialNumber {
				t.Errorf("DialNumber = %q, want %q", got.DialNumber, tt.expected.DialNumber)
			}
			if got.AttendeePW != tt.expected.AttendeePW {
				t.Errorf("AttendeePW = %q, want %q", got.AttendeePW, tt.expected.AttendeePW)
			}
			if got.ModeratorPW != tt.expected.ModeratorPW {
				t.Errorf("ModeratorPW = %q, want %q", got.ModeratorPW, tt.expected.ModeratorPW)
			}
			if got.Running != tt.expected.Running {
				t.Errorf("Running = %v, want %v", got.Running, tt.expected.Running)
			}
			if got.Duration != tt.expected.Duration {
				t.Errorf("Duration = %d, want %d", got.Duration, tt.expected.Duration)
			}
			if got.HasUserJoined != tt.expected.HasUserJoined {
				t.Errorf("HasUserJoined = %v, want %v", got.HasUserJoined, tt.expected.HasUserJoined)
			}
			if got.Recording != tt.expected.Recording {
				t.Errorf("Recording = %v, want %v", got.Recording, tt.expected.Recording)
			}
			if got.HasBeenForciblyEnded != tt.expected.HasBeenForciblyEnded {
				t.Errorf("HasBeenForciblyEnded = %v, want %v", got.HasBeenForciblyEnded, tt.expected.HasBeenForciblyEnded)
			}
			if got.StartTime != tt.expected.StartTime {
				t.Errorf("StartTime = %d, want %d", got.StartTime, tt.expected.StartTime)
			}
			if got.EndTime != tt.expected.EndTime {
				t.Errorf("EndTime = %d, want %d", got.EndTime, tt.expected.EndTime)
			}
			if got.ParticipantCount != tt.expected.ParticipantCount {
				t.Errorf("ParticipantCount = %d, want %d", got.ParticipantCount, tt.expected.ParticipantCount)
			}
			if got.ListenerCount != tt.expected.ListenerCount {
				t.Errorf("ListenerCount = %d, want %d", got.ListenerCount, tt.expected.ListenerCount)
			}
			if got.VoiceParticipantCount != tt.expected.VoiceParticipantCount {
				t.Errorf("VoiceParticipantCount = %d, want %d", got.VoiceParticipantCount, tt.expected.VoiceParticipantCount)
			}
			if got.VideoCount != tt.expected.VideoCount {
				t.Errorf("VideoCount = %d, want %d", got.VideoCount, tt.expected.VideoCount)
			}
			if got.MaxUsers != tt.expected.MaxUsers {
				t.Errorf("MaxUsers = %d, want %d", got.MaxUsers, tt.expected.MaxUsers)
			}
			if got.ModeratorCount != tt.expected.ModeratorCount {
				t.Errorf("ModeratorCount = %d, want %d", got.ModeratorCount, tt.expected.ModeratorCount)
			}
			if got.IsBreakout != tt.expected.IsBreakout {
				t.Errorf("IsBreakout = %v, want %v", got.IsBreakout, tt.expected.IsBreakout)
			}

			// Check Users
			if len(got.Users.Users) != len(tt.expected.Users.Users) {
				t.Errorf("Users count = %d, want %d", len(got.Users.Users), len(tt.expected.Users.Users))
			} else {
				for i, gotUser := range got.Users.Users {
					expUser := tt.expected.Users.Users[i]
					if gotUser.UserId != expUser.UserId {
						t.Errorf("User[%d].UserId = %q, want %q", i, gotUser.UserId, expUser.UserId)
					}
					if gotUser.FullName != expUser.FullName {
						t.Errorf("User[%d].FullName = %q, want %q", i, gotUser.FullName, expUser.FullName)
					}
					if gotUser.Role != expUser.Role {
						t.Errorf("User[%d].Role = %q, want %q", i, gotUser.Role, expUser.Role)
					}
					if gotUser.IsPresenter != expUser.IsPresenter {
						t.Errorf("User[%d].IsPresenter = %v, want %v", i, gotUser.IsPresenter, expUser.IsPresenter)
					}
					if gotUser.IsListeningOnly != expUser.IsListeningOnly {
						t.Errorf("User[%d].IsListeningOnly = %v, want %v", i, gotUser.IsListeningOnly, expUser.IsListeningOnly)
					}
					if gotUser.HasJoinedVoice != expUser.HasJoinedVoice {
						t.Errorf("User[%d].HasJoinedVoice = %v, want %v", i, gotUser.HasJoinedVoice, expUser.HasJoinedVoice)
					}
					if gotUser.HasVideo != expUser.HasVideo {
						t.Errorf("User[%d].HasVideo = %v, want %v", i, gotUser.HasVideo, expUser.HasVideo)
					}
					if gotUser.ClientType != expUser.ClientType {
						t.Errorf("User[%d].ClientType = %q, want %q", i, gotUser.ClientType, expUser.ClientType)
					}
					if gotUser.CustomData.TagName != expUser.CustomData.TagName {
						t.Errorf("User[%d].CustomData.TagName = %q, want %q", i, gotUser.CustomData.TagName, expUser.CustomData.TagName)
					}
					if !mapsEqual(gotUser.CustomData.Data, expUser.CustomData.Data) {
						t.Errorf("User[%d].CustomData.Data = %v, want %v", i, gotUser.CustomData.Data, expUser.CustomData.Data)
					}
				}
			}

			// Check Metadata
			if got.Metadata.TagName != tt.expected.Metadata.TagName {
				t.Errorf("Metadata.TagName = %q, want %q", got.Metadata.TagName, tt.expected.Metadata.TagName)
			}
			if !mapsEqual(got.Metadata.Data, tt.expected.Metadata.Data) {
				t.Errorf("Metadata.Data = %v, want %v", got.Metadata.Data, tt.expected.Metadata.Data)
			}

			// Check BreakoutRooms
			if len(got.BreakoutRooms.Breakout) != len(tt.expected.BreakoutRooms.Breakout) {
				t.Errorf("BreakoutRooms count = %d, want %d", len(got.BreakoutRooms.Breakout), len(tt.expected.BreakoutRooms.Breakout))
			} else {
				for i, gotRoom := range got.BreakoutRooms.Breakout {
					if gotRoom != tt.expected.BreakoutRooms.Breakout[i] {
						t.Errorf("BreakoutRooms[%d] = %q, want %q", i, gotRoom, tt.expected.BreakoutRooms.Breakout[i])
					}
				}
			}
		})
	}
}

// mapsEqual compares two string maps for equality, handling nil maps.
func mapsEqual(a, b map[string]string) bool {
	if len(a) != len(b) {
		return false
	}
	for k, v := range a {
		if bv, ok := b[k]; !ok || v != bv {
			return false
		}
	}
	return true
}
