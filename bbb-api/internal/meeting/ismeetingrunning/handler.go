package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	core "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

type handler struct {
	flow pipeline.Flow[*http.Request, *core.Response]
}

func (h *handler) Handle(w http.ResponseWriter, r *http.Request) {
	msg := pipeline.NewMessage(r)
	resp, err := h.flow.Execute(msg)
	if err != nil {
		errResp := core.ErrorToResponse(err)
		bbbhttp.WriteXML(w, http.StatusAccepted, errResp)
		return
	}
	bbbhttp.WriteXML(w, http.StatusAccepted, resp)
}

func NewHandlerFunc(flow pipeline.Flow[*http.Request, *core.Response]) http.HandlerFunc {
	h := &handler{flow}
	return h.Handle
}
