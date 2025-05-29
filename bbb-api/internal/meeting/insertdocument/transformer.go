package insertdocument

import (
	"context"
	"io"
	"log/slog"
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/document"
)

type RequestToMeetingInfo struct{}

func (r *RequestToMeetingInfo) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*meeting.MeetingInfoRequest], error) {
	req := msg.Payload
	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)

	meetingID := validation.StripCtrlChars(params.Get(meetingapi.IDParam).Value)
	grpcReq := &meeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	}

	ctx := context.WithValue(msg.Context(), core.ParamsKey, params)
	ctx = context.WithValue(ctx, core.RequestBodyKey, req.Body)

	return pipeline.NewMessageWithContext(grpcReq, ctx), nil
}

type MeetingInfoToResponse struct {
	proc document.Processor
}

func (m *MeetingInfoToResponse) Transform(msg pipeline.Message[*meeting.MeetingInfoResponse]) (pipeline.Message[*meetingapi.Response], error) {
	params := msg.Context().Value(core.ParamsKey).(bbbhttp.Params)

	if m.proc == nil {
		return pipeline.Message[*meetingapi.Response]{}, core.NewBBBError(responses.DocProcessingFailedKey, responses.DocProcessingFailedMsg)
	}

	body := msg.Context().Value(core.RequestBodyKey).(io.ReadCloser)
	modules, err := bbbhttp.ProcessRequestModules(body)
	if err != nil {
		return pipeline.Message[*meetingapi.Response]{}, core.NewBBBError(responses.InvalidRequestBodyKey, responses.InvalidRequestBodyMsg)
	}

	parsedDocs, err := m.proc.Parse(modules, params, false)
	if err != nil {
		slog.Error("Failed to parse documents from request", "error", err)
		return pipeline.Message[*meetingapi.Response]{}, core.NewBBBError(responses.DocProcessingFailedKey, responses.DocProcessingFailedMsg)
	}

	_, err = m.proc.Process(parsedDocs)
	if err != nil {
		slog.Error("Failed to process documents from request", "error", err)
		return pipeline.Message[*meetingapi.Response]{}, core.NewBBBError(responses.DocProcessingFailedKey, responses.DocProcessingFailedMsg)
	}

	return pipeline.NewMessageWithContext(&meetingapi.Response{
		ReturnCode: responses.ReturnCodeSuccess,
		MessageKey: responses.PresentationUploadedKey,
		Message:    responses.PresentationDisabledMsg,
	}, msg.Context()), nil
}
