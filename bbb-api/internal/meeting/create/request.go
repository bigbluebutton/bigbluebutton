package create

import (
	"context"
	"errors"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
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
// a payload of type [MeetingRunningResponse]. The request to Akka Apps is only sent
// if the meeting to be created is a breakout room.
func (s *SendMeetingRunningRequest) Send(msg pipeline.Message[*meeting.MeetingRunningRequest]) (pipeline.Message[*meeting.MeetingRunningResponse], error) {
	params := msg.Context().Value(core.ParamsKey).(bbbhttp.Params)
	isBreakoutRoom := validation.StripCtrlChars(params.Get(meetingapi.IsBreakoutRoomParam).Value)
	if !core.GetBoolOrDefaultValue(isBreakoutRoom, false) {
		return pipeline.NewMessageWithContext(&meeting.MeetingRunningResponse{
			MeetingRunning: &common.MeetingRunning{
				IsRunning: true,
			},
		}, msg.Context()), nil
	}

	if s.client == nil {
		return pipeline.Message[*meeting.MeetingRunningResponse]{}, errors.New(responses.NoClientProvided)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := s.client.IsMeetingRunning(ctx, msg.Payload)
	if err != nil {
		return pipeline.Message[*meeting.MeetingRunningResponse]{}, err
	}
	return pipeline.NewMessageWithContext(res, msg.Context()), nil
}

type SendMeetingInfoRequest struct {
	client *meetingapi.Client
}

func (s *SendMeetingInfoRequest) Send(msg pipeline.Message[*meeting.MeetingInfoRequest]) (pipeline.Message[*meeting.MeetingInfoResponse], error) {
	params := msg.Context().Value(core.ParamsKey).(bbbhttp.Params)
	isBreakoutRoom := validation.StripCtrlChars(params.Get(meetingapi.IsBreakoutRoomParam).Value)
	if !core.GetBoolOrDefaultValue(isBreakoutRoom, false) {
		return pipeline.NewMessageWithContext(&meeting.MeetingInfoResponse{}, msg.Context()), nil
	}

	if s.client == nil {
		return pipeline.Message[*meeting.MeetingInfoResponse]{}, errors.New(responses.NoClientProvided)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := s.client.GetMeetingInfo(ctx, msg.Payload)
	if err != nil {
		return pipeline.Message[*meeting.MeetingInfoResponse]{}, err
	}
	return pipeline.NewMessageWithContext(res, msg.Context()), nil
}
