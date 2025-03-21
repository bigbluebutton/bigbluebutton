package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/pipeline"
	commonv "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/validation"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core/config"
	corev "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core/validation"
)

type IsMeetingRunningFilter struct{}

func (f *IsMeetingRunningFilter) Filter(msg pipeline.Message[*http.Request]) error {
	req := msg.Payload
	cfg := config.DefaultConfig()

	if err := commonv.ValidateChecksum(req, cfg.Security.Salt, cfg.ChecksumAlgorithms()); err != nil {
		return err
	}

	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	return corev.ValidateMeetingID(params.Get(core.MeetingIDParam))

}
