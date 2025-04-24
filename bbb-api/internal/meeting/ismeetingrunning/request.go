package ismeetingrunning

import (
	"context"
	"errors"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

// SendMeetingRunningRequest is an implementation of the pipeline.SenderReceiver
// interface that is used to send a [MeetingRunningRequest] to Akka Apps and
// recieve [MeetingRunningResponse].
type SendMeetingRunningRequest struct {
	client *meetingapi.Client
}

// Send makes a gRPC request to Akka Apps using the incoming message with a payload
// of type [MeetingRunningRequest] and returns the response in a new message with
// a payload of type [MeetingRunningResponse].
func (s *SendMeetingRunningRequest) Send(msg pipeline.Message[*meeting.MeetingRunningRequest]) (pipeline.Message[*meeting.MeetingRunningResponse], error) {
	if s.client == nil {
		return pipeline.Message[*meeting.MeetingRunningResponse]{}, errors.New(responses.NoClientProvided)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := s.client.IsMeetingRunning(ctx, msg.Payload)
	if err != nil {
		return pipeline.Message[*meeting.MeetingRunningResponse]{}, err
	}
	return pipeline.NewMessage(res), nil
}
