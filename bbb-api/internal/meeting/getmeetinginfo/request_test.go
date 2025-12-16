package getmeetinginfo

import (
	"errors"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	grpcmeeting "github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func TestSendMeetingInfoRequest_Send(t *testing.T) {
	tests := []struct {
		name            string
		client          *meeting.MockClient
		request         *grpcmeeting.MeetingInfoRequest
		wantErr         bool
		errContains     string
		verifyResponse  func(*testing.T, *grpcmeeting.MeetingInfoResponse)
		verifyMockCalls func(*testing.T, *meeting.MockClient)
	}{
		{
			name:   "successful request returns meeting info",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "test-meeting-123",
				},
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *grpcmeeting.MeetingInfoResponse) {
				if resp == nil {
					t.Fatal("Expected non-nil response")
				}
				if resp.MeetingInfo.MeetingExtId != "test-meeting-123" {
					t.Errorf("MeetingExtId = %s, want test-meeting-123", resp.MeetingInfo.MeetingExtId)
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
				if m.GetMeetingInfoRequests[0].MeetingData.MeetingId != "test-meeting-123" {
					t.Errorf("Request MeetingId = %s, want test-meeting-123", m.GetMeetingInfoRequests[0].MeetingData.MeetingId)
				}
			},
		},
		{
			name:   "successful request with full meeting info response",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "full-meeting",
				},
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *grpcmeeting.MeetingInfoResponse) {
				if resp == nil {
					t.Fatal("Expected non-nil response")
				}
				info := resp.MeetingInfo
				if info.MeetingExtId != "full-meeting" {
					t.Errorf("MeetingExtId = %s, want full-meeting", info.MeetingExtId)
				}
				if info.VoiceBridge != "71234" {
					t.Errorf("VoiceBridge = %s, want 71234", info.VoiceBridge)
				}
				if !info.Recording {
					t.Error("Recording = false, want true")
				}
				if info.DurationInfo == nil {
					t.Fatal("Expected non-nil DurationInfo")
				}
				if !info.DurationInfo.IsRunning {
					t.Error("IsRunning = false, want true")
				}
				if info.ParticipantInfo == nil {
					t.Fatal("Expected non-nil ParticipantInfo")
				}
				if info.ParticipantInfo.ParticipantCount != 10 {
					t.Errorf("ParticipantCount = %d, want 10", info.ParticipantInfo.ParticipantCount)
				}
			},
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
			},
		},
		{
			name:        "nil client returns error",
			client:      nil,
			request:     &grpcmeeting.MeetingInfoRequest{},
			wantErr:     true,
			errContains: responses.NoClientProvided,
		},
		{
			name:   "gRPC error - generic error",
			client: meeting.NewMockClient(),
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
			name:   "gRPC error - not found with BBB error details",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "not-found-meeting",
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
			name:   "gRPC error - connection refused",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "connection-refused-meeting",
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
			name:   "request with nil MeetingData",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingInfoRequest{
				MeetingData: nil,
			},
			wantErr: false,
			verifyResponse: func(t *testing.T, resp *grpcmeeting.MeetingInfoResponse) {
				if resp == nil {
					t.Fatal("Expected non-nil response")
				}
			},
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingInfo"] != 1 {
					t.Errorf("GetMeetingInfo called %d times, want 1", m.CallCounts["GetMeetingInfo"])
				}
				if len(m.GetMeetingInfoRequests) != 1 {
					t.Fatalf("Expected 1 GetMeetingInfo request, got %d", len(m.GetMeetingInfoRequests))
				}
				if m.GetMeetingInfoRequests[0].MeetingData != nil {
					t.Error("Expected nil MeetingData in request")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup mock responses based on test case
			if tt.client != nil {
				switch tt.name {
				case "successful request returns meeting info":
					tt.client.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
						MeetingInfo: &common.MeetingInfo{
							MeetingExtId: "test-meeting-123",
							MeetingIntId: "internal-123",
							MeetingName:  "Test Meeting",
						},
					}
				case "successful request with full meeting info response":
					tt.client.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
						MeetingInfo: &common.MeetingInfo{
							MeetingExtId:  "full-meeting",
							MeetingIntId:  "internal-full",
							MeetingName:   "Full Meeting",
							VoiceBridge:   "71234",
							DialNumber:    "555-1234",
							AttendeePw:    "attendee",
							ModeratorPw:   "moderator",
							Recording:     true,
							Metadata:      map[string]string{"key": "value"},
							BreakoutRooms: []string{},
							DurationInfo: &common.DurationInfo{
								CreateTime: 1700000000000,
								CreatedOn:  "Test Date",
								StartTime:  1700000001000,
								EndTime:    0,
								Duration:   60,
								IsRunning:  true,
							},
							ParticipantInfo: &common.ParticipantInfo{
								HasUserJoined:         true,
								ParticipantCount:      10,
								ListenerCount:         3,
								VoiceParticipantCount: 5,
								VideoCount:            2,
								MaxUsers:              100,
								ModeratorCount:        2,
							},
							BreakoutInfo: &common.BreakoutInfo{
								IsBreakout: false,
							},
							Users: []*common.User{},
						},
					}
				case "gRPC error - generic error":
					tt.client.GetMeetingInfoError = errors.New("some generic error")
				case "gRPC error - not found with BBB error details":
					st := status.New(codes.NotFound, "meeting not found")
					st, _ = st.WithDetails(&common.ErrorResponse{
						Key:     responses.MeetingNotFoundKey,
						Message: responses.MeetingNotFoundMsg,
					})
					tt.client.GetMeetingInfoError = st.Err()
				case "gRPC error - connection refused":
					tt.client.GetMeetingInfoError = errors.New("connection refused")
				case "request with nil MeetingData":
					tt.client.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
						MeetingInfo: &common.MeetingInfo{
							MeetingExtId: "",
							MeetingIntId: "",
							MeetingName:  "",
						},
					}
				}
			}

			// Create the sender with the mock client
			var sender *SendMeetingInfoRequest
			if tt.client != nil {
				sender = &SendMeetingInfoRequest{client: tt.client}
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
			if tt.verifyMockCalls != nil && tt.client != nil {
				tt.verifyMockCalls(t, tt.client)
			}
		})
	}
}

func TestSendMeetingInfoRequest_Send_ErrorConversion(t *testing.T) {
	tests := []struct {
		name        string
		grpcError   error
		wantKey     string
		wantMessage string
	}{
		{
			name:        "generic error converts to unknown error",
			grpcError:   errors.New("some error"),
			wantKey:     responses.UnknownErrorKey,
			wantMessage: responses.UnknownErrorMsg,
		},
		{
			name: "gRPC status error with BBB error details",
			grpcError: func() error {
				st := status.New(codes.NotFound, "not found")
				st, _ = st.WithDetails(&common.ErrorResponse{
					Key:     responses.MeetingNotFoundKey,
					Message: responses.MeetingNotFoundMsg,
				})
				return st.Err()
			}(),
			wantKey:     responses.MeetingNotFoundKey,
			wantMessage: responses.MeetingNotFoundMsg,
		},
		{
			name: "gRPC status error without BBB error details",
			grpcError: func() error {
				st := status.New(codes.Internal, "internal error")
				return st.Err()
			}(),
			wantKey:     responses.UnknownErrorKey,
			wantMessage: responses.UnknownErrorMsg,
		},
		{
			name: "gRPC unavailable error",
			grpcError: func() error {
				st := status.New(codes.Unavailable, "service unavailable")
				return st.Err()
			}(),
			wantKey:     responses.UnknownErrorKey,
			wantMessage: responses.UnknownErrorMsg,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockClient := meeting.NewMockClient()
			mockClient.GetMeetingInfoError = tt.grpcError

			sender := &SendMeetingInfoRequest{client: mockClient}
			msg := pipeline.NewMessage(&grpcmeeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "test-meeting",
				},
			})

			_, err := sender.Send(msg)
			if err == nil {
				t.Fatal("Expected error but got none")
			}

			bbbErr, ok := err.(*core.BBBError)
			if !ok {
				t.Fatalf("Expected *core.BBBError, got %T", err)
			}

			if bbbErr.Key != tt.wantKey {
				t.Errorf("BBBError.Key = %s, want %s", bbbErr.Key, tt.wantKey)
			}
			if bbbErr.Msg != tt.wantMessage {
				t.Errorf("BBBError.Msg = %s, want %s", bbbErr.Msg, tt.wantMessage)
			}
		})
	}
}

func TestSendMeetingInfoRequest_Send_MessagePayloadPreserved(t *testing.T) {
	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
		MeetingInfo: &common.MeetingInfo{
			MeetingExtId: "preserved-meeting",
			MeetingIntId: "internal-preserved",
			MeetingName:  "Preserved Meeting",
		},
	}

	sender := &SendMeetingInfoRequest{client: mockClient}

	request := &grpcmeeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: "preserved-meeting",
		},
	}
	msg := pipeline.NewMessage(request)

	respMsg, err := sender.Send(msg)
	if err != nil {
		t.Fatalf("Send() unexpected error = %v", err)
	}

	// Verify that the request was passed correctly to the mock
	if len(mockClient.GetMeetingInfoRequests) != 1 {
		t.Fatalf("Expected 1 request, got %d", len(mockClient.GetMeetingInfoRequests))
	}

	capturedReq := mockClient.GetMeetingInfoRequests[0]
	if capturedReq != request {
		t.Error("Request payload was not preserved - pointer mismatch")
	}
	if capturedReq.MeetingData.MeetingId != "preserved-meeting" {
		t.Errorf("Request MeetingId = %s, want preserved-meeting", capturedReq.MeetingData.MeetingId)
	}

	// Verify response payload
	if respMsg.Payload.MeetingInfo.MeetingExtId != "preserved-meeting" {
		t.Errorf("Response MeetingExtId = %s, want preserved-meeting", respMsg.Payload.MeetingInfo.MeetingExtId)
	}
}

func TestSendMeetingInfoRequest_Send_MultipleCallsWithReset(t *testing.T) {
	mockClient := meeting.NewMockClient()

	sender := &SendMeetingInfoRequest{client: mockClient}

	// First call - successful
	mockClient.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
		MeetingInfo: &common.MeetingInfo{
			MeetingExtId: "meeting-1",
		},
	}

	msg1 := pipeline.NewMessage(&grpcmeeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: "meeting-1",
		},
	})

	resp1, err := sender.Send(msg1)
	if err != nil {
		t.Fatalf("First Send() unexpected error = %v", err)
	}
	if resp1.Payload.MeetingInfo.MeetingExtId != "meeting-1" {
		t.Errorf("First response MeetingExtId = %s, want meeting-1", resp1.Payload.MeetingInfo.MeetingExtId)
	}

	// Second call - different meeting
	mockClient.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
		MeetingInfo: &common.MeetingInfo{
			MeetingExtId: "meeting-2",
		},
	}

	msg2 := pipeline.NewMessage(&grpcmeeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: "meeting-2",
		},
	})

	resp2, err := sender.Send(msg2)
	if err != nil {
		t.Fatalf("Second Send() unexpected error = %v", err)
	}
	if resp2.Payload.MeetingInfo.MeetingExtId != "meeting-2" {
		t.Errorf("Second response MeetingExtId = %s, want meeting-2", resp2.Payload.MeetingInfo.MeetingExtId)
	}

	// Verify call count
	if mockClient.CallCounts["GetMeetingInfo"] != 2 {
		t.Errorf("GetMeetingInfo called %d times, want 2", mockClient.CallCounts["GetMeetingInfo"])
	}

	// Verify both requests were captured
	if len(mockClient.GetMeetingInfoRequests) != 2 {
		t.Fatalf("Expected 2 requests, got %d", len(mockClient.GetMeetingInfoRequests))
	}
	if mockClient.GetMeetingInfoRequests[0].MeetingData.MeetingId != "meeting-1" {
		t.Errorf("First request MeetingId = %s, want meeting-1", mockClient.GetMeetingInfoRequests[0].MeetingData.MeetingId)
	}
	if mockClient.GetMeetingInfoRequests[1].MeetingData.MeetingId != "meeting-2" {
		t.Errorf("Second request MeetingId = %s, want meeting-2", mockClient.GetMeetingInfoRequests[1].MeetingData.MeetingId)
	}

	// Reset and verify
	mockClient.Reset()
	if mockClient.CallCounts["GetMeetingInfo"] != 0 {
		t.Errorf("After Reset(), CallCounts[GetMeetingInfo] = %d, want 0", mockClient.CallCounts["GetMeetingInfo"])
	}
	if len(mockClient.GetMeetingInfoRequests) != 0 {
		t.Errorf("After Reset(), GetMeetingInfoRequests length = %d, want 0", len(mockClient.GetMeetingInfoRequests))
	}
}
