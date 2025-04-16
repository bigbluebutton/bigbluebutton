package create

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

type RequestToIsMeetingRunning struct{}

func (r *RequestToIsMeetingRunning) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*meeting.MeetingRunningRequest], error) {
	return pipeline.Message[*meeting.MeetingRunningRequest]{}, nil
}
