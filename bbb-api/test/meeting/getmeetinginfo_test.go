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

func TestGetMeetingInfo_Success(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Create and configure mock gRPC server
	mockServer := meeting.NewMockMeetingServiceServer()
	mockServer.GetMeetingInfoResponse = &grpcmeeting.MeetingInfoResponse{
		MeetingInfo: &common.MeetingInfo{
			MeetingExtId: meeting.TestMeetingIDSuccess,
			MeetingIntId: meeting.TestMeetingIDSuccess,
			MeetingName:  "Test Meeting",
			DurationInfo: &common.DurationInfo{
				IsRunning: true,
			},
			ParticipantInfo: &common.ParticipantInfo{},
			BreakoutInfo:    &common.BreakoutInfo{},
		},
	}

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDSuccess),
		core.WithChecksum("getMeetingInfo", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetingInfo")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetinginfo response")
	}

	// Verify the gRPC call was made
	if mockServer.CallCounts["GetMeetingInfo"] != 1 {
		t.Errorf("GetMeetingInfo called %d times, want 1", mockServer.CallCounts["GetMeetingInfo"])
	}
}

func TestGetMeetingInfo_MeetingNotFound(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Create and configure mock gRPC server with NotFound error
	mockServer := meeting.NewMockMeetingServiceServer()
	st := status.New(codes.NotFound, "meeting not found")
	st, _ = st.WithDetails(&common.ErrorResponse{
		Key:     responses.MeetingNotFoundKey,
		Message: responses.MeetingNotFoundMsg,
	})
	mockServer.GetMeetingInfoError = st.Err()

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDNotFound),
		core.WithChecksum("getMeetingInfo", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetingInfo")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetinginfo response")
	}

	// Verify the gRPC call was made
	if mockServer.CallCounts["GetMeetingInfo"] != 1 {
		t.Errorf("GetMeetingInfo called %d times, want 1", mockServer.CallCounts["GetMeetingInfo"])
	}
}

func TestGetMeetingInfo_GRPCUnavailable(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Do NOT start gRPC service double to simulate connection refused

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDConnectionRefused),
		core.WithChecksum("getMeetingInfo", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetingInfo")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetinginfo response")
	}
}

func TestGetMeetingInfo_InvalidChecksum(t *testing.T) {
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

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetingInfo")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetinginfo response")
	}

	// Verify gRPC was NOT called (filter should reject before gRPC call)
	if mockServer.CallCounts["GetMeetingInfo"] != 0 {
		t.Errorf("GetMeetingInfo should not be called on filter error, but was called %d times", mockServer.CallCounts["GetMeetingInfo"])
	}

	// Silence unused variable warning
	_ = cfg
}

func TestGetMeetingInfo_InvalidMeetingID(t *testing.T) {
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
		core.WithChecksum("getMeetingInfo", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetingInfo")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetinginfo response")
	}

	// Verify gRPC was NOT called (filter should reject before gRPC call)
	if mockServer.CallCounts["GetMeetingInfo"] != 0 {
		t.Errorf("GetMeetingInfo should not be called on filter error, but was called %d times", mockServer.CallCounts["GetMeetingInfo"])
	}
}
