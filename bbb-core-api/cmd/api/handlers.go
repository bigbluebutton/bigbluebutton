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

	res, err := app.BbbCore.IsMeetingRunning(ctx, &bbbcore.MeetingRunningRequest{
		MeetingId: meetingId,
	})
	if err != nil {
		log.Println(err)
		app.writeXML(w, http.StatusAccepted, model.GrpcErrorToErrorResp(err))
		return
	}

	payload = model.Response{
		ReturnCode: model.ReturnCodeSuccess,
		Running:    &res.IsRunning,
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

	res, err := app.BbbCore.GetMeetingInfo(ctx, &bbbcore.MeetingInfoRequest{
		MeetingId: meetingId,
	})
	if err != nil {
		log.Println(err)
		app.writeXML(w, http.StatusAccepted, model.GrpcErrorToErrorResp(err))
		return
	}

	users := make([]model.User, 0, len(res.MeetingInfo.Users))
	for _, u := range res.MeetingInfo.Users {
		user := model.GrpcUserToRespUser(u)
		users = append(users, user)
	}

	metadata := model.MapToMapData(res.MeetingInfo.Metadata, "metadata")

	payload := model.GetMeetingInfoResponse{
		ReturnCode:            model.ReturnCodeSuccess,
		MeetingName:           res.MeetingInfo.MeetingName,
		MeetingId:             res.MeetingInfo.MeetingExtId,
		InternalMeetingId:     res.MeetingInfo.MeetingIntId,
		CreateTime:            res.MeetingInfo.DurationInfo.CreateTime,
		CreateDate:            res.MeetingInfo.DurationInfo.CreatedOn,
		VoiceBridge:           res.MeetingInfo.VoiceBridge,
		DialNumber:            res.MeetingInfo.DialNumber,
		AttendeePW:            res.MeetingInfo.AttendeePw,
		ModeratorPW:           res.MeetingInfo.ModeratorPw,
		Running:               res.MeetingInfo.DurationInfo.IsRunning,
		Duration:              res.MeetingInfo.DurationInfo.Duration,
		HasUserJoined:         res.MeetingInfo.ParticipantInfo.HasUserJoined,
		Recording:             res.MeetingInfo.Recording,
		HasBeenForciblyEnded:  res.MeetingInfo.DurationInfo.HasBeenForciblyEnded,
		StartTime:             res.MeetingInfo.DurationInfo.StartTime,
		EndTime:               res.MeetingInfo.DurationInfo.EndTime,
		ParticipantCount:      res.MeetingInfo.ParticipantInfo.ParticipantCount,
		ListenerCount:         res.MeetingInfo.ParticipantInfo.ListenerCount,
		VoiceParticipantCount: res.MeetingInfo.ParticipantInfo.VoiceParticipantCount,
		VideoCount:            res.MeetingInfo.ParticipantInfo.VideoCount,
		MaxUsers:              res.MeetingInfo.ParticipantInfo.MaxUsers,
		ModeratorCount:        res.MeetingInfo.ParticipantInfo.ModeratorCount,
		Users:                 model.Users{Users: users},
		Metadata:              metadata,
		IsBreakout:            res.MeetingInfo.BreakoutInfo.IsBreakout,
		BreakoutRooms:         model.BreakoutRooms{Breakout: res.MeetingInfo.BreakoutRooms},
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
		res, err := stream.Recv()
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
		if res.MeetingInfo != nil {
			meetings = append(meetings, model.MeetingInfoToMeeting(res.MeetingInfo))
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
