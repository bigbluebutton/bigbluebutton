package getmeetinginfo

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

// HTTPToGRPC is a pipleline.Transformer implementation that is used
// to transform a HTTP request into a [MeetingInfoRequest].
type HTTPToGRPC struct{}

// Transform takes an incoming message with a payload of type http.Request, transforms
// it into a [MeetingInfoRequest], and then returns it in a new message.
func (h *HTTPToGRPC) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*meeting.MeetingInfoRequest], error) {
	req := msg.Payload
	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	meetingID := validation.StripCtrlChars(params.Get(meetingapi.IDParam).Value)
	grpcReq := &meeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	}
	return pipeline.NewMessage(grpcReq), nil
}

// GRPCToResponse is a pipeline.Transformer implementation that is
// used to transform a [MeetingInfoResponse] into a meeting API response.
type GRPCToResponse struct{}

// Transform takes an incoming message with a payload of type [MeetingInfoResponse],
// transforms it into a [GetMeetingInfoResponse], and then returns it in a new message.
func (g *GRPCToResponse) Transform(msg pipeline.Message[*meeting.MeetingInfoResponse]) (pipeline.Message[*meetingapi.GetMeetingInfoResponse], error) {
	resp := msg.Payload

	users := make([]meetingapi.User, 0, len(resp.MeetingInfo.Users))
	for _, u := range resp.MeetingInfo.Users {
		user := meetingapi.GrpcUserToRespUser(u)
		users = append(users, user)
	}

	metadata := meetingapi.MapToMapData(resp.MeetingInfo.Metadata, "metadata")

	meetingInfoResponse := &meetingapi.GetMeetingInfoResponse{
		ReturnCode:            responses.ReturnCodeSuccess,
		MeetingName:           resp.MeetingInfo.MeetingName,
		MeetingId:             resp.MeetingInfo.MeetingExtId,
		InternalMeetingId:     resp.MeetingInfo.MeetingIntId,
		CreateTime:            resp.MeetingInfo.DurationInfo.CreateTime,
		CreateDate:            resp.MeetingInfo.DurationInfo.CreatedOn,
		VoiceBridge:           resp.MeetingInfo.VoiceBridge,
		DialNumber:            resp.MeetingInfo.DialNumber,
		AttendeePW:            resp.MeetingInfo.AttendeePw,
		ModeratorPW:           resp.MeetingInfo.ModeratorPw,
		Running:               resp.MeetingInfo.DurationInfo.IsRunning,
		Duration:              resp.MeetingInfo.DurationInfo.Duration,
		HasUserJoined:         resp.MeetingInfo.ParticipantInfo.HasUserJoined,
		Recording:             resp.MeetingInfo.Recording,
		HasBeenForciblyEnded:  resp.MeetingInfo.DurationInfo.HasBeenForciblyEnded,
		StartTime:             resp.MeetingInfo.DurationInfo.StartTime,
		EndTime:               resp.MeetingInfo.DurationInfo.EndTime,
		ParticipantCount:      resp.MeetingInfo.ParticipantInfo.ParticipantCount,
		ListenerCount:         resp.MeetingInfo.ParticipantInfo.ListenerCount,
		VoiceParticipantCount: resp.MeetingInfo.ParticipantInfo.VoiceParticipantCount,
		VideoCount:            resp.MeetingInfo.ParticipantInfo.VideoCount,
		MaxUsers:              resp.MeetingInfo.ParticipantInfo.MaxUsers,
		ModeratorCount:        resp.MeetingInfo.ParticipantInfo.ModeratorCount,
		Users:                 meetingapi.Users{Users: users},
		Metadata:              metadata,
		IsBreakout:            resp.MeetingInfo.BreakoutInfo.IsBreakout,
		BreakoutRooms:         meetingapi.BreakoutRooms{Breakout: resp.MeetingInfo.BreakoutRooms},
	}

	return pipeline.NewMessage(meetingInfoResponse), nil
}
