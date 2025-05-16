package getmeetings

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

// SendGetMeetingsRequest is an implementation of the pipeline.SenderReceiver
// interface that is used to send a [GetMeetingsStreamRequest] to Akka Apps and
// recieve a collection of [MeetingInfoResponse].
type SendGetMeetingsRequest struct {
	client meetingapi.Client
}

// Send make a gRPC request to Akka Apps using the incoming message with a payload
// of type [MeetingRunningRequest] and returns the response in a new message with
// a payload of type [MeetingRunningResponse].
func (s *SendGetMeetingsRequest) Send(msg pipeline.Message[*meeting.GetMeetingsStreamRequest]) (pipeline.Message[[]*meeting.MeetingInfoResponse], error) {
	if s.client == nil {
		return pipeline.Message[[]*meeting.MeetingInfoResponse]{}, errors.New(responses.NoClientProvided)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	stream, err := s.client.GetMeetingsStream(ctx, msg.Payload)
	if err != nil {
		slog.Error("GetMeetings gRPC request failed", "error", err)
		return pipeline.Message[[]*meeting.MeetingInfoResponse]{}, core.GrpcErrorToBBBError(err)
	}

	meetings := make([]*meeting.MeetingInfoResponse, 0)
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return pipeline.Message[[]*meeting.MeetingInfoResponse]{}, err
		}
		if res.MeetingInfo != nil {
			meetings = append(meetings, res)
		}
	}

	return pipeline.NewMessage(meetings), nil
}
