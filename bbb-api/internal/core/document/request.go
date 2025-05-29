package document

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
)

type SendMeetingRunningRequest struct {
	client Client
}

func (s *SendMeetingRunningRequest) Send(msg pipeline.Message[*meeting.MeetingRunningRequest]) (pipeline.Message[*meeting.MeetingRunningResponse], error) {
	if s.client == nil {
		return pipeline.Message[*meeting.MeetingRunningResponse]{}, errors.New(responses.NoClientProvided)
	}

	timeout := 30 * time.Second
	interval := 1 * time.Second
	start := time.Now()

	for {
		if time.Since(start) >= timeout {
			return pipeline.NewMessageWithContext(&meeting.MeetingRunningResponse{
				MeetingRunning: &common.MeetingRunning{
					IsRunning: false,
				},
			}, msg.Context()), nil
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()

		resp, err := s.client.IsMeetingRunning(ctx, msg.Payload)
		if err != nil {
			slog.Error("IsMeetingRunning gRPC request failed", "error", err)
			return pipeline.Message[*meeting.MeetingRunningResponse]{}, core.GrpcErrorToBBBError(err)
		}

		if resp.MeetingRunning.IsRunning {
			return pipeline.NewMessageWithContext(resp, msg.Context()), nil
		}

		time.Sleep(interval)
	}
}
