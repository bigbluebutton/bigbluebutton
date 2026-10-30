//go:build integration && meeting

package meeting

import (
	"context"
	"net/http"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	grpcmeeting "github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	test "github.com/bigbluebutton/bigbluebutton/bbb-api/test/core"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func TestIsMeetingRunning_Success_True(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Create and configure mock gRPC server
	mockServer := meeting.NewMockMeetingServiceServer()
	mockServer.IsMeetingRunningResponse = &grpcmeeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{
			IsRunning: true,
		},
	}

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDSuccess),
		core.WithChecksum("isMeetingRunning", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/isMeetingRunning")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid ismeetingrunning response")
	}

	// Verify the gRPC call was made
	if mockServer.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("IsMeetingRunning called %d times, want 1", mockServer.CallCounts["IsMeetingRunning"])
	}
}

func TestIsMeetingRunning_Success_False(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Create and configure mock gRPC server
	mockServer := meeting.NewMockMeetingServiceServer()
	mockServer.IsMeetingRunningResponse = &grpcmeeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{
			IsRunning: false,
		},
	}

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDSuccess),
		core.WithChecksum("isMeetingRunning", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/isMeetingRunning")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid ismeetingrunning response")
	}

	// Verify the gRPC call was made
	if mockServer.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("IsMeetingRunning called %d times, want 1", mockServer.CallCounts["IsMeetingRunning"])
	}
}

func TestIsMeetingRunning_MeetingNotFound(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Create and configure mock gRPC server with NotFound error
	mockServer := meeting.NewMockMeetingServiceServer()
	st := status.New(codes.NotFound, "meeting not found")
	st, _ = st.WithDetails(&common.ErrorResponse{
		Key:     responses.MeetingNotFoundKey,
		Message: responses.MeetingNotFoundMsg,
	})
	mockServer.IsMeetingRunningError = st.Err()

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDNotFound),
		core.WithChecksum("isMeetingRunning", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/isMeetingRunning")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid ismeetingrunning response")
	}

	// Verify the gRPC call was made
	if mockServer.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("IsMeetingRunning called %d times, want 1", mockServer.CallCounts["IsMeetingRunning"])
	}
}

func TestIsMeetingRunning_GRPCUnavailable(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Do NOT start gRPC service double to simulate connection refused

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDConnectionRefused),
		core.WithChecksum("isMeetingRunning", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/isMeetingRunning")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid ismeetingrunning response")
	}
}

func TestIsMeetingRunning_InvalidChecksum(t *testing.T) {
	cfg := config.DefaultConfig()

	// Create mock gRPC server (won't be called due to filter rejection)
	mockServer := meeting.NewMockMeetingServiceServer()

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	// Build request with invalid checksum
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, "valid-meeting-id"),
		core.WithQueryString(),
	)
	mockReq.Checksum = "0000000000000000000000000000000000000000000000000000000000000000"

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/isMeetingRunning")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid ismeetingrunning response")
	}

	// Verify gRPC was NOT called (filter should reject before gRPC call)
	if mockServer.CallCounts["IsMeetingRunning"] != 0 {
		t.Errorf("IsMeetingRunning should not be called on filter error, but was called %d times", mockServer.CallCounts["IsMeetingRunning"])
	}

	// Silence unused variable warning
	_ = cfg
}

func TestIsMeetingRunning_InvalidMeetingID(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Create mock gRPC server (won't be called due to filter rejection)
	mockServer := meeting.NewMockMeetingServiceServer()

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	// Build request with invalid meeting ID (too short)
	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, "a"),
		core.WithChecksum("isMeetingRunning", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/isMeetingRunning")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid ismeetingrunning response")
	}

	// Verify gRPC was NOT called (filter should reject before gRPC call)
	if mockServer.CallCounts["IsMeetingRunning"] != 0 {
		t.Errorf("IsMeetingRunning should not be called on filter error, but was called %d times", mockServer.CallCounts["IsMeetingRunning"])
	}
}
