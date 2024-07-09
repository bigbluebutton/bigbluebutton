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
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/util"
)

func (app *Config) isMeetingRunning(w http.ResponseWriter, r *http.Request) {
	const endpoint = "isMeetingRunning"
	log.Printf("Handling %s request\n", endpoint)

	params := r.URL.Query()
	var payload model.Response

	meetingId := util.StripCtrlChars(params.Get("meetingID"))
	req := &model.IsMeetingRunningRequest{
		MeetingId: params.Get("meetingID"),
	}

	v := validation.IsMeetingRunningValidator{
		Request: req,
	}
	ok, key, msg := v.Validate()
	if !ok {
		app.respondWithErrorXML(w, model.ReturnCodeFailure, key, msg)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := app.BbbCore.IsMeetingRunning(ctx, &bbbcore.MeetingRunningRequest{
		MeetingId: meetingId,
	})
	if err != nil {
		log.Println(err)
		app.respondWithErrorXML(w, model.ReturnCodeFailure, model.UnknownErrorKey, model.UnknownErrorMsg)
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

	meetingId := params.Get("meetingID")
	ok, key, msg := validation.IsMeetingIdValid(meetingId)
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

	meetingId := params.Get("meetingID")
	if meetingId != "" {
		ok, key, msg := validation.IsMeetingIdValid(meetingId)
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

func (app *Config) createMeeting(w http.ResponseWriter, r *http.Request) {
	log.Println("Handling createMeeting request")

	params := r.URL.Query()
	var errorPayload model.Response

	ok, key, msg := validation.IsMeetingIdValid(params.Get("meetingID"))
	if !ok {
		errorPayload.ReturnCode = model.ReturnCodeFailure
		errorPayload.MessageKey = key
		errorPayload.Message = msg
		app.writeXML(w, http.StatusAccepted, errorPayload)
		return
	}

	ok, key, msg = validation.IsMeetingNameValid(params.Get("name"))
	if !ok {
		errorPayload.ReturnCode = model.ReturnCodeFailure
		errorPayload.MessageKey = key
		errorPayload.Message = msg
		app.writeXML(w, http.StatusAccepted, errorPayload)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	voiceBridge := params.Get("voiceBridge")
	if voiceBridge != "" {
		ok = validation.IsValidInteger(voiceBridge)
		if !ok {
			errorPayload.ReturnCode = model.ReturnCodeFailure
			errorPayload.MessageKey = model.VoiceBridgeFormatErrorKey
			errorPayload.Message = model.VoiceBridgeFormatErrorMsg
			app.writeXML(w, http.StatusAccepted, errorPayload)
			return
		}

		res, err := app.BbbCore.IsVoiceBridgeInUse(ctx, &bbbcore.VoiceBridgeInUseRequest{
			VoiceBridge: voiceBridge,
		})
		if err != nil {
			log.Println(err)
			errorPayload.ReturnCode = model.ReturnCodeFailure
			errorPayload.MessageKey = model.CreateMeetingErrorKey
			errorPayload.Message = model.CreateMeetingErrorMsg
			app.writeXML(w, http.StatusAccepted, errorPayload)
			return
		}

		if res.InUse {
			errorPayload.ReturnCode = model.ReturnCodeFailure
			errorPayload.MessageKey = model.VoiceBridgeInUserErrorKey
			errorPayload.Message = model.VoiceBridgeInUserErrorMsg
			app.writeXML(w, http.StatusAccepted, errorPayload)
			return
		}
	}

	attendeePw := params.Get("attendeePW")
	if attendeePw != "" {
		ok = validation.IsValidLength(attendeePw, 2, 64)
		if !ok {
			errorPayload.ReturnCode = model.ReturnCodeFailure
			errorPayload.MessageKey = model.PasswordLengthErrorKey
			errorPayload.Message = model.PasswordLengthErrorMsg
			app.writeXML(w, http.StatusAccepted, errorPayload)
			return
		}
	}

	moderatorPw := params.Get("moderatorPW")
	if moderatorPw != "" {
		ok = validation.IsValidLength(moderatorPw, 2, 64)
		if !ok {
			errorPayload.ReturnCode = model.ReturnCodeFailure
			errorPayload.MessageKey = model.PasswordLengthErrorKey
			errorPayload.Message = model.PasswordLengthErrorMsg
			app.writeXML(w, http.StatusAccepted, errorPayload)
			return
		}
	}

	isBreakoutRoom := params.Get("isBreakoutRoom")
	if isBreakoutRoom != "" {
		ok = validation.IsValidBoolean(isBreakoutRoom)
		if !ok {
			errorPayload.ReturnCode = model.ReturnCodeFailure
			errorPayload.MessageKey = model.IsBreakoutRoomFormatErrorKey
			errorPayload.Message = model.IsBreakoutRoomFormatErrorMsg
			app.writeXML(w, http.StatusAccepted, errorPayload)
			return
		}

		if util.GetBoolOrDefaultValue(isBreakoutRoom, false) {
			parentMeetingId := params.Get("parentMeetingID")
			if parentMeetingId == "" {
				errorPayload.ReturnCode = model.ReturnCodeFailure
				errorPayload.MessageKey = model.ParentMeetingIdMissingErrorKey
				errorPayload.Message = model.ParentMeetingIdMissingErrorMsg
				app.writeXML(w, http.StatusAccepted, errorPayload)
				return
			}

			res, err := app.BbbCore.IsMeetingRunning(ctx, &bbbcore.MeetingRunningRequest{
				MeetingId: parentMeetingId,
			})
			if err != nil {
				log.Println(err)
				errorPayload.ReturnCode = model.ReturnCodeFailure
				errorPayload.MessageKey = model.CreateMeetingErrorKey
				errorPayload.Message = model.CreateMeetingErrorMsg
				app.writeXML(w, http.StatusAccepted, errorPayload)
				return
			}

			if !res.IsRunning {
				errorPayload.ReturnCode = model.ReturnCodeFailure
				errorPayload.MessageKey = model.ParentMeetingDoesNotExistErrorKey
				errorPayload.Message = model.ParentMeetingDoesNotExistErrorMsg
				app.writeXML(w, http.StatusAccepted, errorPayload)
				return
			}
		}
	}

	record := params.Get("record")
	if record != "" {
		ok = validation.IsValidBoolean(record)
		if !ok {
			errorPayload.ReturnCode = model.ReturnCodeFailure
			errorPayload.MessageKey = model.RecordFormatErrorKey
			errorPayload.Message = model.RecordFormatErrorMsg
			app.writeXML(w, http.StatusAccepted, errorPayload)
			return
		}
	}

	settings, err := app.processCreateQueryParams(&params)
	if err != nil {
		log.Println(err)
		errorPayload.ReturnCode = model.ReturnCodeFailure
		errorPayload.MessageKey = model.CreateMeetingErrorKey
		errorPayload.Message = model.CreateMeetingErrorMsg
		app.writeXML(w, http.StatusAccepted, errorPayload)
		return
	}

	res, err := app.BbbCore.CreateMeeting(ctx, &bbbcore.CreateMeetingRequest{
		CreateMeetingSettings: settings,
	})
	if err != nil {
		log.Println(err)
		errorPayload.ReturnCode = model.ReturnCodeFailure
		errorPayload.MessageKey = model.CreateMeetingErrorKey
		errorPayload.Message = model.CreateMeetingErrorMsg
		app.writeXML(w, http.StatusAccepted, errorPayload)
		return
	}

	if !res.IsValid {
		errorPayload.ReturnCode = model.ReturnCodeFailure
		errorPayload.MessageKey = model.MeetingIdNotUniqueErrorKey
		errorPayload.Message = model.MeetingIdNotUniqueErrorMsg
		app.writeXML(w, http.StatusAccepted, errorPayload)
		return
	}

	payload := model.CreateMeetingResponse{
		ReturnCode:           model.ReturnCodeSuccess,
		MeetingId:            res.MeetingExtId,
		InternalMeetingId:    res.MeetingIntId,
		ParentMeetingId:      res.ParentMeetingId,
		AttendeePW:           res.AttendeePw,
		ModeratorPW:          res.ModeratorPw,
		CreateTime:           res.CreateTime,
		VoiceBridge:          res.VoiceBridge,
		DialNumber:           res.DialNumber,
		CreateDate:           res.CreateDate,
		HasUserJoined:        res.HasUserJoined,
		Duration:             res.Duration,
		HasBeenForciblyEnded: res.HasBeenForciblyEnded,
	}

	if res.IsDuplicate {
		payload.MessageKey = model.CreateMeetingDuplicateKey
		payload.Message = model.CreateMeetingDuplicateMsg
	}

	app.writeXML(w, http.StatusAccepted, payload)
}

func (app *Config) createMeetingPost(w http.ResponseWriter, r *http.Request) {

}
