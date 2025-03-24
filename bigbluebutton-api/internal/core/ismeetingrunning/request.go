package ismeetingrunning

import (
	"context"
	"errors"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/gen/core"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/pipeline"
	coreapi "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core"
)

type SendMeetingRunningRequest struct {
	client *coreapi.Client
}

func (s *SendMeetingRunningRequest) Send(msg pipeline.Message[*core.MeetingRunningRequest]) (pipeline.Message[*core.MeetingRunningResponse], error) {
	if s.client == nil {
		return pipeline.Message[*core.MeetingRunningResponse]{}, errors.New("no client provided for call")
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := s.client.IsMeetingRunning(ctx, msg.Payload)
	if err != nil {
		return pipeline.Message[*core.MeetingRunningResponse]{}, err
	}
	return pipeline.NewMessage(res), nil
}
