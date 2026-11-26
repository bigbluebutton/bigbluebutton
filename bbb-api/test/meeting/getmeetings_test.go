//go:build integration && meeting

package meeting

import (
	"context"
	"net/http"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	grpcmeeting "github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	test "github.com/bigbluebutton/bigbluebutton/bbb-api/test/core"
	"google.golang.org/grpc"
)

func TestGetMeetings_Success(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Create and configure mock gRPC server
	mockServer := meeting.NewMockMeetingServiceServer()
	mockServer.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		{
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
		},
	}

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDSuccess),
		core.WithChecksum("getMeetings", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetings")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetings response")
	}

	// Verify the gRPC call was made
	if mockServer.CallCounts["GetMeetingsStream"] != 1 {
		t.Errorf("GetMeetingsStream called %d times, want 1", mockServer.CallCounts["GetMeetingsStream"])
	}
}

func TestGetMeetings_EmptyMeetingIDAllowed(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Create and configure mock gRPC server
	mockServer := meeting.NewMockMeetingServiceServer()
	mockServer.GetMeetingsStreamResponses = []*grpcmeeting.MeetingInfoResponse{
		{
			MeetingInfo: &common.MeetingInfo{
				MeetingExtId: "meeting-1",
				MeetingIntId: "meeting-1-internal",
				MeetingName:  "First Meeting",
				DurationInfo: &common.DurationInfo{
					IsRunning: true,
				},
				ParticipantInfo: &common.ParticipantInfo{},
				BreakoutInfo:    &common.BreakoutInfo{},
			},
		},
		{
			MeetingInfo: &common.MeetingInfo{
				MeetingExtId: "meeting-2",
				MeetingIntId: "meeting-2-internal",
				MeetingName:  "Second Meeting",
				DurationInfo: &common.DurationInfo{
					IsRunning: false,
				},
				ParticipantInfo: &common.ParticipantInfo{},
				BreakoutInfo:    &common.BreakoutInfo{},
			},
		},
	}

	// Start gRPC service double on port 9000
	test.GRPCServiceDouble(t, "9000", func(s *grpc.Server) {
		grpcmeeting.RegisterMeetingServiceServer(s, mockServer)
	})

	// Build request without meetingID parameter (should be allowed)
	mockReq := core.NewMockRequest(
		core.WithChecksum("getMeetings", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetings")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetings response")
	}

	// Verify the gRPC call was made
	if mockServer.CallCounts["GetMeetingsStream"] != 1 {
		t.Errorf("GetMeetingsStream called %d times, want 1", mockServer.CallCounts["GetMeetingsStream"])
	}
}

func TestGetMeetings_GRPCUnavailable(t *testing.T) {
	cfg := config.DefaultConfig()
	salt := cfg.Security.Salt

	// Do NOT start gRPC service double to simulate connection refused

	mockReq := core.NewMockRequest(
		core.WithQueryParam(meeting.IDParam, meeting.TestMeetingIDConnectionRefused),
		core.WithChecksum("getMeetings", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetings")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetings response")
	}
}

func TestGetMeetings_InvalidChecksum(t *testing.T) {
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

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetings")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetings response")
	}

	// Verify gRPC was NOT called (filter should reject before gRPC call)
	if mockServer.CallCounts["GetMeetingsStream"] != 0 {
		t.Errorf("GetMeetingsStream should not be called on filter error, but was called %d times", mockServer.CallCounts["GetMeetingsStream"])
	}

	// Silence unused variable warning
	_ = cfg
}

func TestGetMeetings_InvalidMeetingID(t *testing.T) {
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
		core.WithChecksum("getMeetings", salt, core.SHA256),
	)

	ctx := context.Background()
	service := test.NewServiceContainer(ctx, t, "meeting", "9100")

	if service.URI == "" {
		t.Fatal("no URI configured for service container")
	}

	req, err := mockReq.BuildRequest(http.MethodGet, service.URI+"/getMeetings")
	if err != nil {
		t.Fatal(err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if res == nil {
		t.Fatal("Expected a valid getmeetings response")
	}

	// Verify gRPC was NOT called (filter should reject before gRPC call)
	if mockServer.CallCounts["GetMeetingsStream"] != 0 {
		t.Errorf("GetMeetingsStream should not be called on filter error, but was called %d times", mockServer.CallCounts["GetMeetingsStream"])
	}
}
