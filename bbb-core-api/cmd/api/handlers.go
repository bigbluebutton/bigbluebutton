package main

import (
	"context"
	"log"
	"net/http"
	"time"

	bbbcore "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/bbb-core"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
)

func (app *Config) isMeetingRunning(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling isMeetingRunning request")

	params := r.URL.Query()
	var payload model.Response

	meetingId := params.Get("meetingID")
	if meetingId == "" {
		payload.ReturnCode = model.Failure
		payload.MessageKey = "missingParamMeetingID"
		payload.Message = "You must provide a meeting ID"
		app.writeXML(w, http.StatusAccepted, payload)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	resp, err := app.BbbCore.IsMeetingRunning(ctx, &bbbcore.MeetingRunningRequest{
		MeetingId: meetingId,
	})
	if err != nil {
		log.Println(err)
	}

	payload = model.Response{
		ReturnCode: model.Success,
		Running:    &resp.IsRunning,
	}

	app.writeXML(w, http.StatusAccepted, payload)
}

func (app *Config) getMeetingInfo(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling getMeetingInfo request")

	params := r.URL.Query()
	meetingId := params.Get("meetingID")

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	resp, err := app.BbbCore.GetMeetingInfo(ctx, &bbbcore.MeetingInfoRequest{
		MeetingId: meetingId,
	})
	if err != nil {
		log.Println(err)
	}

	users := make([]model.User, len(resp.MeetingInfo.Users))
	for _, u := range resp.MeetingInfo.Users {
		user := app.grpcUserToRespUser(u)
		users = append(users, user)
	}

	meetingInfo := model.GetMeetingInfoResponse{
		ReturnCode:            model.Success,
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
		Users:                 users,
		Metadata:              resp.MeetingInfo.Metadata,
		IsBreakout:            resp.MeetingInfo.BreakoutInfo.IsBreakout,
		BreakoutRooms:         model.BreakoutRooms{Breakout: resp.MeetingInfo.BreakoutRooms},
	}

	app.writeXML(w, http.StatusAccepted, meetingInfo)
}

func (app *Config) getMeetings(w http.ResponseWriter, r *http.Request) {
	log.Println("Hit the getMeetings enpoint!")
}
