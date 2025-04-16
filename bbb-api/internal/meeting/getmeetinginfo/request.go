package getmeetinginfo

import (
	"context"
	"errors"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

// SendMeetingInfoRequest is an implementation of the pipeline.SenderReceiver
// interface that is used to send a [MeetingInfoRequest] to Akka Apps and
// recieve [MeetingInfoResponse].
type SendMeetingInfoRequest struct {
	client *meetingapi.Client
}

// Send make a gRPC request to Akka Apps using the incoming message with a payload
// of type [MeetingInfoRequest] and returns the response in a new message with
// a payload of type [MeetingInfoResponse].
func (s *SendMeetingInfoRequest) Send(msg pipeline.Message[*meeting.MeetingInfoRequest]) (pipeline.Message[*meeting.MeetingInfoResponse], error) {
	if s.client == nil {
		return pipeline.Message[*meeting.MeetingInfoResponse]{}, errors.New(responses.NoClientProvided)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := s.client.GetMeetingInfo(ctx, msg.Payload)
	if err != nil {
		return pipeline.Message[*meeting.MeetingInfoResponse]{}, err
	}
	return pipeline.NewMessage(res), nil
}
