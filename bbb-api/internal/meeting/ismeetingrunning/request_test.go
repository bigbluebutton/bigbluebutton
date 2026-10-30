package ismeetingrunning

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

func TestSendMeetingRunningRequest_Send(t *testing.T) {
	tests := []struct {
		name            string
		client          *meeting.MockClient
		request         *grpcmeeting.MeetingRunningRequest
		wantErr         bool
		errContains     string
		wantRunning     bool
		verifyMockCalls func(*testing.T, *meeting.MockClient)
	}{
		{
			name:   "successful request returns meeting running status true",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingRunningRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "test-meeting-123",
				},
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
				if m.IsMeetingRunningRequests[0].MeetingData.MeetingId != "test-meeting-123" {
					t.Errorf("Request MeetingId = %s, want test-meeting-123", m.IsMeetingRunningRequests[0].MeetingData.MeetingId)
				}
			},
		},
		{
			name:   "successful request returns meeting not running status false",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingRunningRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "stopped-meeting",
				},
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
			name:        "nil client returns error",
			client:      nil,
			request:     &grpcmeeting.MeetingRunningRequest{},
			wantErr:     true,
			errContains: responses.NoClientProvided,
		},
		{
			name:   "gRPC error - generic error",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingRunningRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "error-meeting",
				},
			},
			wantErr:     true,
			errContains: responses.UnknownErrorKey,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["IsMeetingRunning"] != 1 {
					t.Errorf("IsMeetingRunning called %d times, want 1", m.CallCounts["IsMeetingRunning"])
				}
			},
		},
		{
			name:   "gRPC error - not found with BBB error details",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingRunningRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "not-found-meeting",
				},
			},
			wantErr:     true,
			errContains: responses.MeetingNotFoundKey,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["IsMeetingRunning"] != 1 {
					t.Errorf("IsMeetingRunning called %d times, want 1", m.CallCounts["IsMeetingRunning"])
				}
			},
		},
		{
			name:   "gRPC error - connection refused",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingRunningRequest{
				MeetingData: &common.MeetingData{
					MeetingId: "connection-refused-meeting",
				},
			},
			wantErr:     true,
			errContains: responses.UnknownErrorKey,
			verifyMockCalls: func(t *testing.T, m *meeting.MockClient) {
				if m.CallCounts["IsMeetingRunning"] != 1 {
					t.Errorf("IsMeetingRunning called %d times, want 1", m.CallCounts["IsMeetingRunning"])
				}
			},
		},
		{
			name:   "request with nil MeetingData",
			client: meeting.NewMockClient(),
			request: &grpcmeeting.MeetingRunningRequest{
				MeetingData: nil,
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
				if m.IsMeetingRunningRequests[0].MeetingData != nil {
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
				case "successful request returns meeting running status true":
					tt.client.IsMeetingRunningResponse = &grpcmeeting.MeetingRunningResponse{
						MeetingRunning: &common.MeetingRunning{
							IsRunning: true,
						},
					}
				case "successful request returns meeting not running status false":
					tt.client.IsMeetingRunningResponse = &grpcmeeting.MeetingRunningResponse{
						MeetingRunning: &common.MeetingRunning{
							IsRunning: false,
						},
					}
				case "gRPC error - generic error":
					tt.client.IsMeetingRunningError = errors.New("some generic error")
				case "gRPC error - not found with BBB error details":
					st := status.New(codes.NotFound, "meeting not found")
					st, _ = st.WithDetails(&common.ErrorResponse{
						Key:     responses.MeetingNotFoundKey,
						Message: responses.MeetingNotFoundMsg,
					})
					tt.client.IsMeetingRunningError = st.Err()
				case "gRPC error - connection refused":
					tt.client.IsMeetingRunningError = errors.New("connection refused")
				case "request with nil MeetingData":
					tt.client.IsMeetingRunningResponse = &grpcmeeting.MeetingRunningResponse{
						MeetingRunning: &common.MeetingRunning{
							IsRunning: true,
						},
					}
				}
			}

			// Create the sender with the mock client
			var sender *SendMeetingRunningRequest
			if tt.client != nil {
				sender = &SendMeetingRunningRequest{client: tt.client}
			} else {
				sender = &SendMeetingRunningRequest{client: nil}
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
				if respMsg.Payload.MeetingRunning == nil {
					t.Fatal("Expected non-nil MeetingRunning")
				}
				if respMsg.Payload.MeetingRunning.IsRunning != tt.wantRunning {
					t.Errorf("IsRunning = %v, want %v", respMsg.Payload.MeetingRunning.IsRunning, tt.wantRunning)
				}
			}

			// Verify mock calls
			if tt.verifyMockCalls != nil && tt.client != nil {
				tt.verifyMockCalls(t, tt.client)
			}
		})
	}
}

func TestSendMeetingRunningRequest_Send_ErrorConversion(t *testing.T) {
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
			mockClient.IsMeetingRunningError = tt.grpcError

			sender := &SendMeetingRunningRequest{client: mockClient}
			msg := pipeline.NewMessage(&grpcmeeting.MeetingRunningRequest{
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

func TestSendMeetingRunningRequest_Send_MessagePayloadPreserved(t *testing.T) {
	mockClient := meeting.NewMockClient()
	mockClient.IsMeetingRunningResponse = &grpcmeeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{
			IsRunning: true,
		},
	}

	sender := &SendMeetingRunningRequest{client: mockClient}

	request := &grpcmeeting.MeetingRunningRequest{
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
	if len(mockClient.IsMeetingRunningRequests) != 1 {
		t.Fatalf("Expected 1 request, got %d", len(mockClient.IsMeetingRunningRequests))
	}

	capturedReq := mockClient.IsMeetingRunningRequests[0]
	if capturedReq != request {
		t.Error("Request payload was not preserved - pointer mismatch")
	}
	if capturedReq.MeetingData.MeetingId != "preserved-meeting" {
		t.Errorf("Request MeetingId = %s, want preserved-meeting", capturedReq.MeetingData.MeetingId)
	}

	// Verify response payload
	if !respMsg.Payload.MeetingRunning.IsRunning {
		t.Error("Response IsRunning = false, want true")
	}
}

func TestSendMeetingRunningRequest_Send_MultipleCallsWithReset(t *testing.T) {
	mockClient := meeting.NewMockClient()

	sender := &SendMeetingRunningRequest{client: mockClient}

	// First call - meeting is running
	mockClient.IsMeetingRunningResponse = &grpcmeeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{
			IsRunning: true,
		},
	}

	msg1 := pipeline.NewMessage(&grpcmeeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: "meeting-1",
		},
	})

	resp1, err := sender.Send(msg1)
	if err != nil {
		t.Fatalf("First Send() unexpected error = %v", err)
	}
	if !resp1.Payload.MeetingRunning.IsRunning {
		t.Error("First response IsRunning = false, want true")
	}

	// Second call - meeting is not running
	mockClient.IsMeetingRunningResponse = &grpcmeeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{
			IsRunning: false,
		},
	}

	msg2 := pipeline.NewMessage(&grpcmeeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: "meeting-2",
		},
	})

	resp2, err := sender.Send(msg2)
	if err != nil {
		t.Fatalf("Second Send() unexpected error = %v", err)
	}
	if resp2.Payload.MeetingRunning.IsRunning {
		t.Error("Second response IsRunning = true, want false")
	}

	// Verify call count
	if mockClient.CallCounts["IsMeetingRunning"] != 2 {
		t.Errorf("IsMeetingRunning called %d times, want 2", mockClient.CallCounts["IsMeetingRunning"])
	}

	// Verify both requests were captured
	if len(mockClient.IsMeetingRunningRequests) != 2 {
		t.Fatalf("Expected 2 requests, got %d", len(mockClient.IsMeetingRunningRequests))
	}
	if mockClient.IsMeetingRunningRequests[0].MeetingData.MeetingId != "meeting-1" {
		t.Errorf("First request MeetingId = %s, want meeting-1", mockClient.IsMeetingRunningRequests[0].MeetingData.MeetingId)
	}
	if mockClient.IsMeetingRunningRequests[1].MeetingData.MeetingId != "meeting-2" {
		t.Errorf("Second request MeetingId = %s, want meeting-2", mockClient.IsMeetingRunningRequests[1].MeetingData.MeetingId)
	}

	// Reset and verify
	mockClient.Reset()
	if mockClient.CallCounts["IsMeetingRunning"] != 0 {
		t.Errorf("After Reset(), CallCounts[IsMeetingRunning] = %d, want 0", mockClient.CallCounts["IsMeetingRunning"])
	}
	if len(mockClient.IsMeetingRunningRequests) != 0 {
		t.Errorf("After Reset(), IsMeetingRunningRequests length = %d, want 0", len(mockClient.IsMeetingRunningRequests))
	}
}
