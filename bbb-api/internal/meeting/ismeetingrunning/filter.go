package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/common/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/common/pipeline"
	commonv "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/common/validation"
	core "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	meetinv "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/validation"
)

type IsMeetingRunningFilter struct{}

func (f *IsMeetingRunningFilter) Filter(msg pipeline.Message[*http.Request]) error {
	req := msg.Payload
	cfg := config.DefaultConfig()

	if err := commonv.ValidateChecksum(req, cfg.Security.Salt, cfg.ChecksumAlgorithms()); err != nil {
		return err
	}

	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	return meetinv.ValidateMeetingID(params.Get(core.MeetingIDParam))

}
