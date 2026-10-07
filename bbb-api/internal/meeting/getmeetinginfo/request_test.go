package getmeetinginfo

import (
	"errors"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	grpcmeeting "github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func TestSendMeetingInfoRequest_Send(t *testing.T) {
	tests := []struct {
		name            string
		setupClient     func() *meeting.MockClient
		request         *grpcmeeting.MeetingInfoRequest
		wantErr         bool
		errContains     string
		verifyResponse  func(*testing.T, *grpcmeeting.MeetingInfoResponse)
		verifyMockCalls func(*testing.T, *meeting.MockClient)
	}{
		{
			name: "successful request returns meeting info",
			setupClient: func() *meeting.MockClient {
				client := meeting.NewMockClient()
				client.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
					MeetingInfo: &common.MeetingInfo{
						MeetingExtId:    meeting.TestMeetingIDSuccess,
						MeetingIntId:    meeting.TestMeetingIDSuccess,
						MeetingName:     "Test Meeting",
						DurationInfo:    &common.DurationInfo{IsRunning: true},
						ParticipantInfo: &common.ParticipantInfo{},
						BreakoutInfo:    &common.BreakoutInfo{},
					},
				}
				return client
			},
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: meeting.TestMeetingIDSuccess,
				},
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *grpcmeeting.MeetingInfoResponse) {
				if resp == nil {
					t.Fatal("Expected non-nil response")
				}
				if resp.MeetingInfo.MeetingExtId != meeting.TestMeetingIDSuccess {
					t.Errorf("MeetingExtId = %s, want %s", resp.MeetingInfo.MeetingExtId, meeting.TestMeetingIDSuccess)
				}
				if resp.MeetingInfo.MeetingName != "Test Meeting" {
					t.Errorf("MeetingName = %s, want Test Meeting", resp.MeetingInfo.MeetingName)
				}
			},
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
				if len(m.GetMeetingInfoRequests) != 1 {
					t.Fatalf("Expected 1 GetMeetingInfo request, got %d", len(m.GetMeetingInfoRequests))
				}
				if m.GetMeetingInfoRequests[0].MeetingData.MeetingId != meeting.TestMeetingIDSuccess {
					t.Errorf("Request MeetingId = %s, want %s", m.GetMeetingInfoRequests[0].MeetingData.MeetingId, meeting.TestMeetingIDSuccess)
				}
			},
		},
		{
			name:        "nil client returns error",
			setupClient: nil,
			request:     &grpcmeeting.MeetingInfoRequest{},
			wantErr:     true,
			errContains: responses.NoClientProvided,
		},
		{
			name: "gRPC error - generic error",
			setupClient: func() *meeting.MockClient {
				client := meeting.NewMockClient()
				client.GetMeetingInfoError = errors.New("some generic error")
				return client
			},
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "error-meeting",
				},
			},
			wantErr:     true,
			errContains: responses.UnknownErrorKey,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
			},
		},
		{
			name: "gRPC error - not found with BBB error details",
			setupClient: func() *meeting.MockClient {
				client := meeting.NewMockClient()
				st := status.New(codes.NotFound, "meeting not found")
				st, _ = st.WithDetails(&common.ErrorResponse{
					Key:     responses.MeetingNotFoundKey,
					Message: responses.MeetingNotFoundMsg,
				})
				client.GetMeetingInfoError = st.Err()
				return client
			},
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: meeting.TestMeetingIDNotFound,
				},
			},
			wantErr:     true,
			errContains: responses.MeetingNotFoundKey,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
			},
		},
		{
			name: "gRPC error - connection refused",
			setupClient: func() *meeting.MockClient {
				client := meeting.NewMockClient()
				client.GetMeetingInfoError = errors.New("connection refused")
				return client
			},
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: meeting.TestMeetingIDConnectionRefused,
				},
			},
			wantErr:     true,
			errContains: responses.UnknownErrorKey,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
			},
		},
		{
			name: "request with nil MeetingData",
			setupClient: func() *meeting.MockClient {
				client := meeting.NewMockClient()
				st := status.New(codes.InvalidArgument, "missing meeting data")
				st, _ = st.WithDetails(&common.ErrorResponse{
					Key:     responses.MissingMeetingDataKey,
					Message: responses.MissingMeetingDataMsg,
				})
				client.GetMeetingInfoError = st.Err()
				return client
			},
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: nil,
			},
			wantErr:     true,
			errContains: responses.MissingMeetingDataKey,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create the sender with the mock client
			var sender *SendMeetingInfoRequest
			var client *meeting.MockClient
			if tt.setupClient != nil {
				client = tt.setupClient()
				sender = &SendMeetingInfoRequest{client: client}
			} else {
				sender = &SendMeetingInfoRequest{client: nil}
			}

			// Create the message
			msg := pipeline.NewMessage(tt.request)

			// Execute Send
			respMsg, err := sender.Send(msg)

			// Check error expectations
			if tt.wantErr {
				if err == nil {
					t.Error("Send() expected error but got none")
					return
				}
				if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("Send() error = %v, should contain %q", err, tt.errContains)
				}
			} else {
				if err != nil {
					t.Errorf("Send() unexpected error = %v", err)
					return
				}

				// Verify response
				if tt.verifyResponse != nil {
					tt.verifyResponse(t, respMsg.Payload)
				}
			}

			// Verify mock calls
			if tt.verifyMockCalls != nil && client != nil {
				tt.verifyMockCalls(t, client)
			}
		})
	}
}
