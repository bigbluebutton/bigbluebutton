package main

import (
	"encoding/xml"
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
)

func (app *Config) writeXML(w http.ResponseWriter, status int, data any, headers ...http.Header) error {
	xml, err := xml.Marshal(data)
	if err != nil {
		return err
	}

	if len(headers) > 0 {
		for key, value := range headers[0] {
			w.Header()[key] = value
		}
	}

	w.Header().Set("Content-Type", "application/xml")
	w.WriteHeader(status)

	_, err = w.Write(xml)
	if err != nil {
		return err
	}

	return nil
}

func (app *Config) grpcUserToRespUser(u *common.User) model.User {
	customData := &model.CustomData{}
	model.MarshMapToXML(u.CustomData, customData)

	user := model.User{
		UserId:          u.UserId,
		FullName:        u.FullName,
		Role:            u.Role,
		IsPresenter:     u.IsPresenter,
		IsListeningOnly: u.IsListeningOnly,
		HasJoinedVoice:  u.HasJoinedVoice,
		HasVideo:        u.HasVideo,
		ClientType:      u.ClientType,
		CustomData:      *customData,
	}

	return user
}

func (app *Config) meetingInfoToMeeting(m *common.MeetingInfo) model.Meeting {
	metadata := &model.Metadata{}
	model.MarshMapToXML(m.Metadata, metadata)

	users := make([]model.User, 0, len(m.Users))
	for _, u := range m.Users {
		user := app.grpcUserToRespUser(u)
		users = append(users, user)
	}

	meeting := model.Meeting{
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
		Users:                 model.Users{Users: users},
		Metadata:              *metadata,
		IsBreakout:            m.BreakoutInfo.IsBreakout,
		BreakoutRooms:         model.BreakoutRooms{Breakout: m.BreakoutRooms},
	}

	return meeting
}
