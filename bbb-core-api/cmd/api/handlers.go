package main

import (
	"context"
	"io"
	"log"
	"net/http"
	"time"

	bbbcore "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/bbb-core"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/validation"
)

func (app *Config) isMeetingRunning(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling isMeetingRunning request")

	params := r.URL.Query()
	var payload model.Response

	ok, key, msg := app.isChecksumValid(r, "isMeetingRunning")
	if !ok {
		payload.ReturnCode = model.ReturnCodeFailure
		payload.MessageKey = key
		payload.Message = msg
		app.writeXML(w, http.StatusAccepted, payload)
		return
	}

	meetingId := params.Get("meetingID")
	ok, key, msg = validation.IsMeetingIdValid(meetingId)
	if !ok {
		payload.ReturnCode = model.ReturnCodeFailure
		payload.MessageKey = key
		payload.Message = msg
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
		app.writeXML(w, http.StatusAccepted, model.GrpcErrorToErrorResp(err))
		return
	}

	payload = model.Response{
		ReturnCode: model.ReturnCodeSuccess,
		Running:    &resp.IsRunning,
	}

	app.writeXML(w, http.StatusAccepted, payload)
}

func (app *Config) getMeetingInfo(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling getMeetingInfo request")

	params := r.URL.Query()
	var errorPayload model.Response

	ok, key, msg := app.isChecksumValid(r, "getMeetingInfo")
	if !ok {
		errorPayload.ReturnCode = model.ReturnCodeFailure
		errorPayload.MessageKey = key
		errorPayload.Message = msg
		app.writeXML(w, http.StatusAccepted, errorPayload)
		return
	}

	meetingId := params.Get("meetingID")
	ok, key, msg = validation.IsMeetingIdValid(meetingId)
	if !ok {
		errorPayload.ReturnCode = model.ReturnCodeFailure
		errorPayload.MessageKey = key
		errorPayload.Message = msg
		app.writeXML(w, http.StatusAccepted, errorPayload)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	resp, err := app.BbbCore.GetMeetingInfo(ctx, &bbbcore.MeetingInfoRequest{
		MeetingId: meetingId,
	})
	if err != nil {
		log.Println(err)
		app.writeXML(w, http.StatusAccepted, model.GrpcErrorToErrorResp(err))
		return
	}

	users := make([]model.User, 0, len(resp.MeetingInfo.Users))
	for _, u := range resp.MeetingInfo.Users {
		user := model.GrpcUserToRespUser(u)
		users = append(users, user)
	}

	metadata := &model.Metadata{}
	model.MarshalMapToXML(resp.MeetingInfo.Metadata, metadata)

	payload := model.GetMeetingInfoResponse{
		ReturnCode:            model.ReturnCodeSuccess,
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
		Users:                 model.Users{Users: users},
		Metadata:              *metadata,
		IsBreakout:            resp.MeetingInfo.BreakoutInfo.IsBreakout,
		BreakoutRooms:         model.BreakoutRooms{Breakout: resp.MeetingInfo.BreakoutRooms},
	}

	app.writeXML(w, http.StatusAccepted, payload)
}

func (app *Config) getMeetings(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling getMeetings request")

	params := r.URL.Query()
	var payload model.Response

	ok, key, msg := app.isChecksumValid(r, "getMeetings")
	if !ok {
		payload.ReturnCode = model.ReturnCodeFailure
		payload.MessageKey = key
		payload.Message = msg
		app.writeXML(w, http.StatusAccepted, payload)
		return
	}

	meetingId := params.Get("meetingID")
	if meetingId != "" {
		ok, key, msg = validation.IsMeetingIdValid(meetingId)
		if !ok {
			payload.ReturnCode = model.ReturnCodeFailure
			payload.MessageKey = key
			payload.Message = msg
			app.writeXML(w, http.StatusAccepted, payload)
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	stream, err := app.BbbCore.GetMeetingsStream(ctx, &bbbcore.GetMeetingsStreamRequest{
		MeetingId: meetingId,
	})
	if err != nil {
		log.Println(err)
		app.writeXML(w, http.StatusAccepted, model.GrpcErrorToErrorResp(err))
	}

	meetings := make([]model.Meeting, 0)
	for {
		resp, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Println(err)
			err = app.writeXML(w, http.StatusAccepted, model.GrpcErrorToErrorResp(err))
			if err != nil {
				log.Println(err)
			}
			return
		}
		if resp.MeetingInfo != nil {
			meetings = append(meetings, model.MeetingInfoToMeeting(resp.MeetingInfo))
		}
	}

	payload = model.Response{
		ReturnCode: model.ReturnCodeSuccess,
		Meetings: &model.Meetings{
			Meetings: meetings,
		},
	}

	app.writeXML(w, http.StatusAccepted, payload)
}
