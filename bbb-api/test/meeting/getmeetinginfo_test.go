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
		t.Error("Expected a valid getmeetinginfo response")
	}

	// Verify the gRPC call was made
	if mockServer.CallCounts["GetMeetingInfo"] != 1 {
		t.Errorf("GetMeetingInfo called %d times, want 1", mockServer.CallCounts["GetMeetingInfo"])
	}
}
