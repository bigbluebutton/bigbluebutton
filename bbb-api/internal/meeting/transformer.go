package meeting

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
)

// ToMapData converts the given map into map into [MapData]
// with the provided XML tag name.
func ToMapData(data map[string]string, tagName string) MapData {
	return MapData{Data: data, TagName: tagName}
}

// ToUser converts the provided gRPC common.User into
// a Meeting API [User].
func ToUser(u *common.User) User {
	customData := ToMapData(u.CustomData, "customdata")

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

// ToMeeting converts the provided gRPC common.MeetingInfo
// into a Meeting API [Meeting].
func ToMeeting(m *common.MeetingInfo) Meeting {
	metadata := ToMapData(m.Metadata, "metadata")

	users := make([]User, 0, len(m.Users))
	for _, u := range m.Users {
		user := ToUser(u)
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

// ToResponse converts the provided [error] into a
// Meeting API [Response].
func ToResponse(err error) *Response {
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
