package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/gen/core"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/pipeline"
	coreapi "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core"
)

func NewIsMeetingRunningFlow() pipeline.Flow[*http.Request, *coreapi.Response] {
	filterTransformGRPC := pipeline.NewStep[*http.Request, *core.MeetingRunningRequest]().Filter(nil).Transform(nil)
	transformToResponse := pipeline.NewStep[*core.MeetingRunningRequest, *coreapi.Response]().Transform(nil)
	return pipeline.Add(filterTransformGRPC.Flow(), transformToResponse)
}
