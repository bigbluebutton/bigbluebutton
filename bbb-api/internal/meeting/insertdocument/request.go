package insertdocument

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

type SendMeetingInfoRequest struct {
	client meetingapi.Client
}

func (s *SendMeetingInfoRequest) Send(msg pipeline.Message[*meeting.MeetingInfoRequest]) (pipeline.Message[*meeting.MeetingInfoResponse], error) {
	if s.client == nil {
		return pipeline.Message[*meeting.MeetingInfoResponse]{}, errors.New(responses.NoClientProvided)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := s.client.GetMeetingInfo(ctx, msg.Payload)
	if err != nil {
		slog.Error("MeetingInfo gRPC request failed", "error", err)
		return pipeline.Message[*meeting.MeetingInfoResponse]{}, core.GrpcErrorToBBBError(err)
	}
	return pipeline.NewMessageWithContext(res, msg.Context()), nil
}
