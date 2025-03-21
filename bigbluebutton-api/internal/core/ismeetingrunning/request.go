package ismeetingrunning

import (
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/gen/core"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/pipeline"
)

type SendMeetingRunningRequest struct{}

func (s *SendMeetingRunningRequest) Send(msg pipeline.Message[*core.MeetingRunningRequest]) (pipeline.Message[*core.MeetingRunningResponse], error) {
	// TODO: Implement gRPC call
	return pipeline.Message[*core.MeetingRunningResponse]{}, nil
}
