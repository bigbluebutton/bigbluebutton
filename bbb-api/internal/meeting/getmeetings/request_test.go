package getmeetings

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

func TestSendGetMeetingsRequest_Send(t *testing.T) {
	tests := []struct {
		name            string
		client          *meeting.MockClient
		request         *grpcmeeting.GetMeetingsStreamRequest
		wantErr         bool
		errContains     string
		wantMeetingCnt  int
		verifyMockCalls func(*testing.T, *meeting.MockClient)
		verifyResponse  func(*testing.T, []*grpcmeeting.MeetingInfoResponse)
	}{
		{
			name:   "successful request returns multiple meetings",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.GetMeetingsStreamRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "",
				},
			},
			wantErr:        false,
			wantMeetingCnt: 3,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
				if len(m.GetMeetingsStreamRequests) != 1 {
					t.Fatalf("Expected 1 GetMeetingsStream request, got %d", len(m.GetMeetingsStreamRequests))
				}
			},
			verifyResponse: func(t *testing.T, resp []*grpcmeeting.MeetingInfoResponse) {
				if len(resp) != 3 {
					t.Errorf("Expected 3 meetings, got %d", len(resp))
				}
			},
		},
		{
			name:   "successful request returns single meeting",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.GetMeetingsStreamRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "specific-meeting",
				},
			},
			wantErr:        false,
			wantMeetingCnt: 1,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
				if len(m.GetMeetingsStreamRequests) != 1 {
					t.Fatalf("Expected 1 request, got %d", len(m.GetMeetingsStreamRequests))
				}
				if m.GetMeetingsStreamRequests[0].MeetingData.MeetingId != "specific-meeting" {
					t.Errorf("Request MeetingId = %s, want specific-meeting", m.GetMeetingsStreamRequests[0].MeetingData.MeetingId)
				}
			},
		},
		{
			name:   "successful request returns empty meetings (stream ends immediately)",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.GetMeetingsStreamRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "",
				},
			},
			wantErr:        false,
			wantMeetingCnt: 0,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
			},
		},
		{
			name:        "nil client returns error",
			client:      nil,
			request:     &grpcmeeting.GetMeetingsStreamRequest{},
			wantErr:     true,
			errContains: responses.NoClientProvided,
		},
		{
			name:   "gRPC error - initial connection error",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.GetMeetingsStreamRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "",
				},
			},
			wantErr:     true,
			errContains: responses.UnknownErrorKey,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
			},
		},
		{
			name:   "request with nil MeetingData",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.GetMeetingsStreamRequest{
				MeetingData: nil,
			},
			wantErr:        false,
			wantMeetingCnt: 1,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
				if len(m.GetMeetingsStreamRequests) != 1 {
					t.Fatalf("Expected 1 request, got %d", len(m.GetMeetingsStreamRequests))
				}
				if m.GetMeetingsStreamRequests[0].MeetingData != nil {
					t.Error("Expected nil MeetingData in request")
				}
			},
		},
		{
			name:   "meeting response with nil MeetingInfo is filtered out",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.GetMeetingsStreamRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "",
				},
			},
			wantErr:        false,
			wantMeetingCnt: 1, // One nil MeetingInfo should be filtered, one valid should remain
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["GetMeetingsStream"] != 1 {
					t.Errorf("GetMeetingsStream called %d times, want 1", m.CallCounts["GetMeetingsStream"])
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup mock responses based on test case
			if tt.client != nil {
				switch tt.name {
				case "successful request returns multiple meetings":
					tt.client.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
						createMeetingInfoResponse("meeting-1", "internal-1", "Meeting 1"),
						createMeetingInfoResponse("meeting-2", "internal-2", "Meeting 2"),
						createMeetingInfoResponse("meeting-3", "internal-3", "Meeting 3"),
					}
				case "successful request returns single meeting":
					tt.client.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
						createMeetingInfoResponse("specific-meeting", "internal-specific", "Specific Meeting"),
					}
				case "successful request returns empty meetings (stream ends immediately)":
					tt.client.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{}
				case "gRPC error - initial connection error":
					tt.client.GetMeetingsStreamError = errors.New("connection refused")
				case "request with nil MeetingData":
					tt.client.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
						createMeetingInfoResponse("meeting-nil-data", "internal-nil", "Meeting Nil Data"),
					}
				case "meeting response with nil MeetingInfo is filtered out":
					tt.client.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
						{MeetingInfo: nil}, // Should be filtered
						createMeetingInfoResponse("valid-meeting", "internal-valid", "Valid Meeting"),
					}
				}
			}

			// Create the sender with the mock client
			var sender *SendGetMeetingsRequest
			if tt.client != nil {
				sender = &SendGetMeetingsRequest{client: tt.client}
			} else {
				sender = &SendGetMeetingsRequest{client: nil}
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
				if respMsg.Payload == nil {
					t.Fatal("Expected non-nil response")
				}
				if len(respMsg.Payload) != tt.wantMeetingCnt {
					t.Errorf("Meeting count = %d, want %d", len(respMsg.Payload), tt.wantMeetingCnt)
				}

				// Run custom response verification
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

func TestSendGetMeetingsRequest_Send_ErrorConversion(t *testing.T) {
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
			mockClient.GetMeetingsStreamError = tt.grpcError

			sender := &SendGetMeetingsRequest{client: mockClient}
			msg := pipeline.NewMessage(&grpcmeeting.GetMeetingsStreamRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "",
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

func TestSendGetMeetingsRequest_Send_MessagePayloadPreserved(t *testing.T) {
	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createMeetingInfoResponse("preserved-meeting", "internal-preserved", "Preserved Meeting"),
	}

	sender := &SendGetMeetingsRequest{client: mockClient}

	request := &grpcmeeting.GetMeetingsStreamRequest{
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
	if len(mockClient.GetMeetingsStreamRequests) != 1 {
		t.Fatalf("Expected 1 request, got %d", len(mockClient.GetMeetingsStreamRequests))
	}

	capturedReq := mockClient.GetMeetingsStreamRequests[0]
	if capturedReq != request {
		t.Error("Request payload was not preserved - pointer mismatch")
	}
	if capturedReq.MeetingData.MeetingId != "preserved-meeting" {
		t.Errorf("Request MeetingId = %s, want preserved-meeting", capturedReq.MeetingData.MeetingId)
	}

	// Verify response payload
	if len(respMsg.Payload) != 1 {
		t.Fatalf("Expected 1 meeting in response, got %d", len(respMsg.Payload))
	}
	if respMsg.Payload[0].MeetingInfo.MeetingExtId != "preserved-meeting" {
		t.Errorf("Response MeetingExtId = %s, want preserved-meeting", respMsg.Payload[0].MeetingInfo.MeetingExtId)
	}
}

func TestSendGetMeetingsRequest_Send_MultipleCallsWithReset(t *testing.T) {
	mockClient := meeting.NewMockClient()

	sender := &SendGetMeetingsRequest{client: mockClient}

	// First call - multiple meetings
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createMeetingInfoResponse("meeting-1", "internal-1", "Meeting 1"),
		createMeetingInfoResponse("meeting-2", "internal-2", "Meeting 2"),
	}

	msg1 := pipeline.NewMessage(&grpcmeeting.GetMeetingsStreamRequest{
		MeetingData: &common.MeetingData{
			MeetingId: "",
		},
	})

	resp1, err := sender.Send(msg1)
	if err != nil {
		t.Fatalf("First Send() unexpected error = %v", err)
	}
	if len(resp1.Payload) != 2 {
		t.Errorf("First response meeting count = %d, want 2", len(resp1.Payload))
	}

	// Second call - single meeting
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createMeetingInfoResponse("meeting-3", "internal-3", "Meeting 3"),
	}

	msg2 := pipeline.NewMessage(&grpcmeeting.GetMeetingsStreamRequest{
		MeetingData: &common.MeetingData{
			MeetingId: "meeting-3",
		},
	})

	resp2, err := sender.Send(msg2)
	if err != nil {
		t.Fatalf("Second Send() unexpected error = %v", err)
	}
	if len(resp2.Payload) != 1 {
		t.Errorf("Second response meeting count = %d, want 1", len(resp2.Payload))
	}

	// Verify call count
	if mockClient.CallCounts["GetMeetingsStream"] != 2 {
		t.Errorf("GetMeetingsStream called %d times, want 2", mockClient.CallCounts["GetMeetingsStream"])
	}

	// Verify both requests were captured
	if len(mockClient.GetMeetingsStreamRequests) != 2 {
		t.Fatalf("Expected 2 requests, got %d", len(mockClient.GetMeetingsStreamRequests))
	}
	if mockClient.GetMeetingsStreamRequests[0].MeetingData.MeetingId != "" {
		t.Errorf("First request MeetingId = %s, want empty", mockClient.GetMeetingsStreamRequests[0].MeetingData.MeetingId)
	}
	if mockClient.GetMeetingsStreamRequests[1].MeetingData.MeetingId != "meeting-3" {
		t.Errorf("Second request MeetingId = %s, want meeting-3", mockClient.GetMeetingsStreamRequests[1].MeetingData.MeetingId)
	}

	// Reset and verify
	mockClient.Reset()
	if mockClient.CallCounts["GetMeetingsStream"] != 0 {
		t.Errorf("After Reset(), CallCounts[GetMeetingsStream] = %d, want 0", mockClient.CallCounts["GetMeetingsStream"])
	}
	if len(mockClient.GetMeetingsStreamRequests) != 0 {
		t.Errorf("After Reset(), GetMeetingsStreamRequests length = %d, want 0", len(mockClient.GetMeetingsStreamRequests))
	}
}

func TestSendGetMeetingsRequest_Send_LargeMeetingList(t *testing.T) {
	mockClient := meeting.NewMockClient()

	// Create a large list of meetings
	numMeetings := 100
	responses := make([]*grpcmeeting.MeetingInfoResponse, numMeetings)
	for i := 0; i < numMeetings; i++ {
		responses[i] = createMeetingInfoResponse(
			"meeting-"+string(rune('0'+i%10))+string(rune('0'+i/10)),
			"internal-"+string(rune('0'+i%10)),
			"Meeting "+string(rune('0'+i%10)),
		)
	}
	mockClient.GetMeetingsStreamResponses = responses

	sender := &SendGetMeetingsRequest{client: mockClient}
	msg := pipeline.NewMessage(&grpcmeeting.GetMeetingsStreamRequest{
		MeetingData: &common.MeetingData{
			MeetingId: "",
		},
	})

	respMsg, err := sender.Send(msg)
	if err != nil {
		t.Fatalf("Send() unexpected error = %v", err)
	}

	if len(respMsg.Payload) != numMeetings {
		t.Errorf("Meeting count = %d, want %d", len(respMsg.Payload), numMeetings)
	}
}
