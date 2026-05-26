package getmeetinginfo

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	grpcmeeting "github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// Helper function to create an HTTP request with proper params context
func createTestRequest(meetingID, salt string) *http.Request {
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meetingID),
		core.WithChecksum("getMeetingInfo", salt, core.SHA256),
	)
	req, _ := mockReq.BuildRequest(http.MethodGet, "/getMeetingInfo")
	return req
}

func TestFlow_Success(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
		MeetingInfo: &common.MeetingInfo{
			MeetingExtId:    meeting.TestMeetingIDSuccess,
			MeetingIntId:    meeting.TestMeetingIDSuccess,
			MeetingName:     "Test Meeting",
			DurationInfo:    &common.DurationInfo{IsRunning: true},
			ParticipantInfo: &common.ParticipantInfo{},
			BreakoutInfo:    &common.BreakoutInfo{},
		},
	}
	flow := NewGetMeetingInfoFlow(mockClient)
	req := createTestRequest(meeting.TestMeetingIDSuccess, salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err != nil {
		t.Fatalf("Execute() unexpected error = %v", err)
	}
	if respMsg.Payload == nil {
		t.Fatal("Execute() expected non-nil payload")
	}
	if mockClient.CallCounts["GetMeetingInfo"] != 1 {
		t.Errorf("GetMeetingInfo called %d times, want 1", mockClient.CallCounts["GetMeetingInfo"])
	}
}

func TestFlow_GRPCError_MeetingNotFound(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	st := status.New(codes.NotFound, "meeting not found")
	st, _ = st.WithDetails(&common.ErrorResponse{
		Key:     responses.MeetingNotFoundKey,
		Message: responses.MeetingNotFoundMsg,
	})
	mockClient.GetMeetingInfoError = st.Err()
	flow := NewGetMeetingInfoFlow(mockClient)
	req := createTestRequest(meeting.TestMeetingIDNotFound, salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err == nil {
		t.Fatal("Execute() expected error but got none")
	}
	if respMsg.Payload != nil {
		t.Error("Execute() expected nil payload on error")
	}
	if mockClient.CallCounts["GetMeetingInfo"] != 1 {
		t.Errorf("GetMeetingInfo called %d times, want 1", mockClient.CallCounts["GetMeetingInfo"])
	}
}

func TestFlow_GRPCError_ConnectionRefused(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingInfoError = errors.New("connection refused")
	flow := NewGetMeetingInfoFlow(mockClient)
	req := createTestRequest(meeting.TestMeetingIDConnectionRefused, salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err == nil {
		t.Fatal("Execute() expected error but got none")
	}
	if respMsg.Payload != nil {
		t.Error("Execute() expected nil payload on error")
	}
	if mockClient.CallCounts["GetMeetingInfo"] != 1 {
		t.Errorf("GetMeetingInfo called %d times, want 1", mockClient.CallCounts["GetMeetingInfo"])
	}
}

func TestFlow_FilterError_InvalidChecksum(t *testing.T) {
	mockClient := meeting.NewMockClient()

	flow := NewGetMeetingInfoFlow(mockClient)

	// Build request with invalid checksum
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, "valid-meeting-id"),
		core.WithQueryString(),
	)
	mockReq.Checksum = "0000000000000000000000000000000000000000000000000000000000000000"
	req, _ := mockReq.BuildRequest(http.MethodGet, "/getMeetingInfo")
	ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, mockReq.Params)
	req = req.WithContext(ctx)

	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err == nil {
		t.Fatal("Execute() expected error but got none")
	}
	if respMsg.Payload != nil {
		t.Error("Execute() expected nil payload on error")
	}
	if mockClient.CallCounts["GetMeetingInfo"] != 0 {
		t.Errorf("GetMeetingInfo should not be called on filter error, but was called %d times", mockClient.CallCounts["GetMeetingInfo"])
	}
}

func TestFlow_FilterError_InvalidMeetingID(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()

	flow := NewGetMeetingInfoFlow(mockClient)

	// Build request with invalid meeting ID (too short)
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, "a"),
		core.WithChecksum("getMeetingInfo", salt, core.SHA256),
	)
	req, _ := mockReq.BuildRequest(http.MethodGet, "/getMeetingInfo")
	ctx := context.WithValue(req.Context(), bbbhttp.ParamsKey, mockReq.Params)
	req = req.WithContext(ctx)

	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err == nil {
		t.Fatal("Execute() expected error but got none")
	}
	if respMsg.Payload != nil {
		t.Error("Execute() expected nil payload on error")
	}
	if mockClient.CallCounts["GetMeetingInfo"] != 0 {
		t.Errorf("GetMeetingInfo should not be called on filter error, but was called %d times", mockClient.CallCounts["GetMeetingInfo"])
	}
}
