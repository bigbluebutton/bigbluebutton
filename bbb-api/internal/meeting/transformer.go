package meeting

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
)

func MapToMapData(data map[string]string, tagName string) MapData {
	return MapData{Data: data, TagName: tagName}
}

func GrpcUserToRespUser(u *common.User) User {
	customData := MapToMapData(u.CustomData, "customdata")

	user := User{
		UserId:          u.UserId,
		FullName:        u.FullName,
		Role:            u.Role,
		IsPresenter:     u.IsPresenter,
		IsListeningOnly: u.IsListeningOnly,
		HasJoinedVoice:  u.HasJoinedVoice,
		HasVideo:        u.HasVideo,
		ClientType:      u.ClientType,
		CustomData:      customData,
	}

	return user
}

func MeetingInfoToMeeting(m *common.MeetingInfo) Meeting {
	metadata := MapToMapData(m.Metadata, "metadata")

	users := make([]User, 0, len(m.Users))
	for _, u := range m.Users {
		user := GrpcUserToRespUser(u)
		users = append(users, user)
	}

	meeting := Meeting{
		MeetingName:           m.MeetingName,
		MeetingId:             m.MeetingExtId,
		InternalMeetingId:     m.MeetingIntId,
		CreateTime:            m.DurationInfo.CreateTime,
		CreateDate:            m.DurationInfo.CreatedOn,
		VoiceBridge:           m.VoiceBridge,
		DialNumber:            m.DialNumber,
		AttendeePW:            m.AttendeePw,
		ModeratorPW:           m.ModeratorPw,
		Running:               m.DurationInfo.IsRunning,
		Duration:              m.DurationInfo.Duration,
		HasUserJoined:         m.ParticipantInfo.HasUserJoined,
		Recording:             m.Recording,
		HasBeenForciblyEnded:  m.DurationInfo.HasBeenForciblyEnded,
		StartTime:             m.DurationInfo.StartTime,
		EndTime:               m.DurationInfo.EndTime,
		ParticipantCount:      m.ParticipantInfo.ParticipantCount,
		ListenerCount:         m.ParticipantInfo.ListenerCount,
		VoiceParticipantCount: m.ParticipantInfo.VoiceParticipantCount,
		VideoCount:            m.ParticipantInfo.VideoCount,
		MaxUsers:              m.ParticipantInfo.MaxUsers,
		ModeratorCount:        m.ParticipantInfo.ModeratorCount,
		Users:                 Users{Users: users},
		Metadata:              metadata,
		IsBreakout:            m.BreakoutInfo.IsBreakout,
		BreakoutRooms:         BreakoutRooms{Breakout: m.BreakoutRooms},
	}

	return meeting
}

func ErrorToResponse(err error) *Response {
	resp := &Response{
		ReturnCode: responses.ReturnCodeFailure,
	}
	if bbbErr, ok := err.(*core.BBBError); ok {
		resp.MessageKey = bbbErr.Key
		resp.Message = bbbErr.Msg
	} else {
		resp.MessageKey = responses.UnknownErrorKey
		resp.Message = err.Error()
	}
	return resp
}
