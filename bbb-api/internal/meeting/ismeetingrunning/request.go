package ismeetingrunning

import (
	"context"
	"errors"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

type SendMeetingRunningRequest struct {
	client *meetingapi.Client
}

func (s *SendMeetingRunningRequest) Send(msg pipeline.Message[*meeting.MeetingRunningRequest]) (pipeline.Message[*meeting.MeetingRunningResponse], error) {
	if s.client == nil {
		return pipeline.Message[*meeting.MeetingRunningResponse]{}, errors.New("no client provided for call")
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := s.client.IsMeetingRunning(ctx, msg.Payload)
	if err != nil {
		return pipeline.Message[*meeting.MeetingRunningResponse]{}, err
	}
	return pipeline.NewMessage(res), nil
}
