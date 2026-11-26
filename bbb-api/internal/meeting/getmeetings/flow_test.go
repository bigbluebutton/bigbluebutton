package getmeetings

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
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
)

// Helper function to create an HTTP request with proper params context
func createTestRequest(meetingID, salt string) *http.Request {
	var mockReq *core.MockRequest
	if meetingID != "" {
		mockReq = core.NewMockRequest(
			core.WithQueryParam(meeting.IDParam, meetingID),
			core.WithChecksum("getMeetings", salt, core.SHA256),
		)
	} else {
		mockReq = core.NewMockRequest(
			core.WithChecksum("getMeetings", salt, core.SHA256),
		)
	}
	req, _ := mockReq.BuildRequest(http.MethodGet, "/getMeetings")
	return req
}

// Helper to create a minimal MeetingInfoResponse for flow testing
func createFlowTestResponse() *grpcmeeting.MeetingInfoResponse {
	return &grpcmeeting.MeetingInfoResponse{
		MeetingInfo: &common.MeetingInfo{
			MeetingExtId: "test-meeting",
			MeetingIntId: "internal-meeting",
			MeetingName:  "Test Meeting",
			DurationInfo: &common.DurationInfo{
				IsRunning: true,
			},
			ParticipantInfo: &common.ParticipantInfo{},
			BreakoutInfo:    &common.BreakoutInfo{},
		},
	}
}

func TestFlow_Success(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createFlowTestResponse(),
	}

	flow := NewGetMeetingsFlow(mockClient)
	req := createTestRequest("", salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err != nil {
		t.Fatalf("Execute() unexpected error = %v", err)
	}
	if respMsg.Payload == nil {
		t.Fatal("Execute() expected non-nil payload")
	}
	if mockClient.CallCounts["GetMeetingsStream"] != 1 {
		t.Errorf("GetMeetingsStream called %d times, want 1", mockClient.CallCounts["GetMeetingsStream"])
	}
}

func TestFlow_GRPCError_MeetingNotFound(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamError = errors.New("meeting not found")

	flow := NewGetMeetingsFlow(mockClient)
	req := createTestRequest("non-existent-meeting", salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err == nil {
		t.Fatal("Execute() expected error but got none")
	}
	if respMsg.Payload != nil {
		t.Error("Execute() expected nil payload on error")
	}
	if mockClient.CallCounts["GetMeetingsStream"] != 1 {
		t.Errorf("GetMeetingsStream called %d times, want 1", mockClient.CallCounts["GetMeetingsStream"])
	}
}

func TestFlow_GRPCError_ConnectionRefused(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamError = errors.New("connection refused")

	flow := NewGetMeetingsFlow(mockClient)
	req := createTestRequest("valid-meeting-id", salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err == nil {
		t.Fatal("Execute() expected error but got none")
	}
	if respMsg.Payload != nil {
		t.Error("Execute() expected nil payload on error")
	}
	if mockClient.CallCounts["GetMeetingsStream"] != 1 {
		t.Errorf("GetMeetingsStream called %d times, want 1", mockClient.CallCounts["GetMeetingsStream"])
	}
}

func TestFlow_FilterError_InvalidChecksum(t *testing.T) {
	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createFlowTestResponse(),
	}

	flow := NewGetMeetingsFlow(mockClient)

	// Build request with invalid checksum
	mockReq := core.NewMockRequest()
	mockReq.Checksum = "0000000000000000000000000000000000000000000000000000000000000000"
	req, _ := mockReq.BuildRequest(http.MethodGet, "/getMeetings")
	mockReq.Params.Set(meeting.IDParam, bbbhttp.Param{Value: "", FromQuery: true})
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
	if mockClient.CallCounts["GetMeetingsStream"] != 0 {
		t.Errorf("GetMeetingsStream should not be called on filter error, but was called %d times", mockClient.CallCounts["GetMeetingsStream"])
	}
}

func TestFlow_FilterError_InvalidMeetingID(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createFlowTestResponse(),
	}

	flow := NewGetMeetingsFlow(mockClient)

	// Build request with invalid meeting ID (too short)
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, "a"),
		core.WithChecksum("getMeetings", salt, core.SHA256),
	)
	req, _ := mockReq.BuildRequest(http.MethodGet, "/getMeetings")
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
	if mockClient.CallCounts["GetMeetingsStream"] != 0 {
		t.Errorf("GetMeetingsStream should not be called on filter error, but was called %d times", mockClient.CallCounts["GetMeetingsStream"])
	}
}

func TestFlow_EmptyMeetingIDAllowed(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		createFlowTestResponse(),
	}

	flow := NewGetMeetingsFlow(mockClient)

	// Create request with empty meeting ID (should be allowed)
	req := createTestRequest("", salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err != nil {
		t.Fatalf("Execute() with empty meeting ID should succeed, got error = %v", err)
	}
	if respMsg.Payload == nil {
		t.Fatal("Execute() expected non-nil payload")
	}
	if mockClient.CallCounts["GetMeetingsStream"] != 1 {
		t.Errorf("GetMeetingsStream called %d times, want 1", mockClient.CallCounts["GetMeetingsStream"])
	}
}
