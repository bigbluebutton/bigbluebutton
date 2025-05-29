package meeting

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

type handler struct {
	flow pipeline.Flow[*http.Request, *Response]
}

func (h *handler) Handle(w http.ResponseWriter, r *http.Request) {
	msg := pipeline.NewMessage(r)
	resp, err := h.flow.Execute(msg)
	if err != nil {
		errResp := ErrorToResponse(err)
		bbbhttp.WriteXML(w, http.StatusAccepted, errResp)
		return
	}
	bbbhttp.WriteXML(w, http.StatusAccepted, resp)
}

// NewHandlerFunc creates a new HTTP handler function using the provided pipeline.Flow
// to handle incoming HTTP requests that are expected to return a [Response].
func NewHandlerFunc(flow pipeline.Flow[*http.Request, *Response]) http.HandlerFunc {
	h := &handler{flow}
	return h.Handle
}
