package create

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	corev "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	meetingv "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/validation"
)

// CreateMeetingFilter is an impementaion of the pipeline.Filter interface. It verifies
// the validity of the request data for create meeting requests.
type CreateMeetingFilter struct{}

// Filter checks the validity of the checksum, meeting ID, meeting name, voice bridge,
// breakout room, and record parameters for the incoming request.
func (f *CreateMeetingFilter) Filter(msg pipeline.Message[*http.Request]) error {
	req := msg.Payload
	cfg := config.DefaultConfig()

	if err := corev.ValidateChecksum(req, cfg.Security.Salt, cfg.ChecksumAlgorithms()); err != nil {
		return err
	}

	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)

	if err := meetingv.ValidateMeetingID(params.Get(meetingapi.IDParam).Value); err != nil {
		return err
	}

	if err := meetingv.ValidateMeetingName(params.Get(meetingapi.NameParam).Value); err != nil {
		return err
	}

	voiceBridge := params.Get(meetingapi.VoiceBirdgeParam).Value
	if voiceBridge != "" {
		if err := corev.ValidateInteger(voiceBridge); err != nil {
			return core.NewBBBError(responses.VoiceBridgeFormatErrorKey, responses.VoiceBridgeFormatErrorMsg)
		}
	}

	if err := corev.ValidateStringLength(params.Get(meetingapi.AttendeePWParam).Value, 2, 64); err != nil {
		return core.NewBBBError(responses.PasswordLengthErrorKey, responses.PasswordLengthErrorKey)
	}

	if err := corev.ValidateStringLength(params.Get(meetingapi.ModeratorPWParam).Value, 2, 64); err != nil {
		return core.NewBBBError(responses.PasswordLengthErrorKey, responses.PasswordLengthErrorMsg)
	}

	isBreakoutRoom := params.Get(meetingapi.IsBreakoutRoomParam).Value
	if isBreakoutRoom != "" {
		if err := corev.ValidateBoolean(isBreakoutRoom); err != nil {
			return core.NewBBBError(responses.IsBreakoutRoomFormatErrorKey, responses.IsBreakoutRoomFormatErrorMsg)
		}

		if core.GetBoolOrDefaultValue(isBreakoutRoom, false) {
			if params.Get(meetingapi.ParentMeetingIDParam).Value == "" {
				return core.NewBBBError(responses.ParentMeetingIdMissingErrorKey, responses.ParentMeetingIdMissingErrorMsg)
			}
		}
	}

	record := params.Get(meetingapi.RecordParam).Value
	if record != "" {
		if err := corev.ValidateBoolean(record); err != nil {
			return core.NewBBBError(responses.RecordFormatErrorKey, responses.RecordFormatErrorMsg)
		}
	}

	return nil
}

// MeetingRunningResponseFilter is an impementaion of the pipeline.Filter interface for
// validating gRPC MeetingRunningResponses.
type MeetingRunningResponseFilter struct{}

// Filter verifies that the desired meeting is currently running. If the meeting is not
// running an error will be returned.
func (f *MeetingRunningResponseFilter) Filter(msg pipeline.Message[*meeting.MeetingRunningResponse]) error {
	if !msg.Payload.MeetingRunning.IsRunning {
		return core.NewBBBError(responses.ParentMeetingDoesNotExistErrorKey, responses.ParentMeetingDoesNotExistErrorMsg)
	}
	return nil
}
