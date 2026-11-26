package ismeetingrunning

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
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meetingID),
		core.WithChecksum("isMeetingRunning", salt, core.SHA256),
	)
	req, _ := mockReq.BuildRequest(http.MethodGet, "/isMeetingRunning")
	return req
}

// Helper to create a minimal MeetingRunningResponse for flow testing
func createFlowTestResponse(isRunning bool) *grpcmeeting.MeetingRunningResponse {
	return &grpcmeeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{
			IsRunning: isRunning,
		},
	}
}

func TestFlow_Success(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.IsMeetingRunningResponse = createFlowTestResponse(true)

	flow := NewIsMeetingRunningFlow(mockClient)
	req := createTestRequest("test-meeting-123", salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err != nil {
		t.Fatalf("Execute() unexpected error = %v", err)
	}
	if respMsg.Payload == nil {
		t.Fatal("Execute() expected non-nil payload")
	}
	if mockClient.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("IsMeetingRunning called %d times, want 1", mockClient.CallCounts["IsMeetingRunning"])
	}
}

func TestFlow_GRPCError_MeetingNotFound(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.IsMeetingRunningError = errors.New("meeting not found")

	flow := NewIsMeetingRunningFlow(mockClient)
	req := createTestRequest("non-existent-meeting", salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err == nil {
		t.Fatal("Execute() expected error but got none")
	}
	if respMsg.Payload != nil {
		t.Error("Execute() expected nil payload on error")
	}
	if mockClient.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("IsMeetingRunning called %d times, want 1", mockClient.CallCounts["IsMeetingRunning"])
	}
}

func TestFlow_GRPCError_ConnectionRefused(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.IsMeetingRunningError = errors.New("connection refused")

	flow := NewIsMeetingRunningFlow(mockClient)
	req := createTestRequest("valid-meeting-id", salt)
	msg := pipeline.NewMessage(req)

	respMsg, err := flow.Execute(msg)

	if err == nil {
		t.Fatal("Execute() expected error but got none")
	}
	if respMsg.Payload != nil {
		t.Error("Execute() expected nil payload on error")
	}
	if mockClient.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("IsMeetingRunning called %d times, want 1", mockClient.CallCounts["IsMeetingRunning"])
	}
}

func TestFlow_FilterError_InvalidChecksum(t *testing.T) {
	mockClient := meeting.NewMockClient()
	mockClient.IsMeetingRunningResponse = createFlowTestResponse(true)

	flow := NewIsMeetingRunningFlow(mockClient)

	// Build request with invalid checksum
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, "valid-meeting-id"),
		core.WithQueryString(),
	)
	mockReq.Checksum = "0000000000000000000000000000000000000000000000000000000000000000"
	req, _ := mockReq.BuildRequest(http.MethodGet, "/isMeetingRunning")
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
	if mockClient.CallCounts["IsMeetingRunning"] != 0 {
		t.Errorf("IsMeetingRunning should not be called on filter error, but was called %d times", mockClient.CallCounts["IsMeetingRunning"])
	}
}

func TestFlow_FilterError_InvalidMeetingID(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	mockClient := meeting.NewMockClient()
	mockClient.IsMeetingRunningResponse = createFlowTestResponse(true)

	flow := NewIsMeetingRunningFlow(mockClient)

	// Build request with invalid meeting ID (too short)
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, "a"),
		core.WithChecksum("isMeetingRunning", salt, core.SHA256),
	)
	req, _ := mockReq.BuildRequest(http.MethodGet, "/isMeetingRunning")
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
	if mockClient.CallCounts["IsMeetingRunning"] != 0 {
		t.Errorf("IsMeetingRunning should not be called on filter error, but was called %d times", mockClient.CallCounts["IsMeetingRunning"])
	}
}
