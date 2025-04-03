package main

import (
	"context"
	"io"
	"log"
	"log/slog"
	"mime"
	"net/http"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	bbbmime "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/mime"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/model"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/validation"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/util"
	"google.golang.org/grpc/codes"
)

func (app *Config) isMeetingRunning(w http.ResponseWriter, r *http.Request) {
	slog.Info("Handling isMeetingRunning request")

	params := r.Context().Value(ParamsKey).(Params)
	var payload model.Response

	meetingID := util.StripCtrlChars(params.Get("meetingID"))
	req := &model.IsMeetingRunningRequest{
		MeetingID: meetingID,
	}

	v := validation.IsMeetingRunningValidator{
		Request: req,
	}
	ok, key, msg := v.Validate()
	if !ok {
		app.respondWithErrorXML(w, model.ReturnCodeFailure, key, msg)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := app.Core.IsMeetingRunning(ctx, &meeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	})
	if err != nil {
		log.Println(err)
		app.respondWithErrorXML(w, model.ReturnCodeFailure, model.UnknownErrorKey, model.UnknownErrorMsg)
		return
	}

	payload = model.Response{
		ReturnCode: model.ReturnCodeSuccess,
		Running:    &res.MeetingRunning.IsRunning,
	}

	app.writeXML(w, http.StatusAccepted, payload)
}

func (app *Config) getMeetingInfo(w http.ResponseWriter, r *http.Request) {
	slog.Info("Handling getMeetingInfo request")

	params := r.Context().Value(ParamsKey).(Params)

	meetingID := util.StripCtrlChars(params.Get("meetingID"))
	req := &model.GetMeetingInfoRequest{
		MeetingID: meetingID,
	}

	v := validation.GetMeetingInfoValidator{
		Request: req,
	}
	ok, key, msg := v.Validate()
	if !ok {
		app.respondWithErrorXML(w, model.ReturnCodeFailure, key, msg)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := app.Core.GetMeetingInfo(ctx, &meeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	})
	if err != nil {
		log.Println(err)
		code := app.getGrpcErrorCode(err)
		switch code {
		case codes.NotFound:
			app.writeXML(w, http.StatusAccepted, app.grpcErrorToErrorResp(err))
			return
		default:
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.UnknownErrorKey, model.UnknownErrorMsg)
		}
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
	slog.Info("Handling getMeetings request")

	params := r.Context().Value(ParamsKey).(Params)
	var payload model.Response

	meetingID := util.StripCtrlChars(params.Get("meetingID"))

	req := &model.GetMeetingsRequest{
		MeetingID: meetingID,
	}

	v := validation.GetMeetingsValidator{
		Request: req,
	}
	ok, key, msg := v.Validate()
	if !ok {
		app.respondWithErrorXML(w, model.ReturnCodeFailure, key, msg)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	stream, err := app.Core.GetMeetingsStream(ctx, &meeting.GetMeetingsStreamRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	})
	if err != nil {
		log.Println(err)
		code := app.getGrpcErrorCode(err)
		switch code {
		case codes.NotFound:
			app.writeXML(w, http.StatusAccepted, app.grpcErrorToErrorResp(err))
			return
		default:
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.UnknownErrorKey, model.UnknownErrorMsg)
			return
		}
	}

	meetings := make([]model.Meeting, 0)
	for {
		res, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Println(err)
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.UnknownErrorKey, model.UnknownErrorMsg)
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
	slog.Info("Handling createMeeting request")

	params := r.Context().Value(ParamsKey).(Params)

	req := &model.CreateRequest{
		Name:            util.StripCtrlChars(params.Get("name")),
		MeetingID:       util.StripCtrlChars(params.Get("meetingID")),
		VoiceBridge:     util.StripCtrlChars(params.Get("voiceBridge")),
		AttendeePw:      util.StripCtrlChars(params.Get("attendeePW")),
		ModeratorPw:     util.StripCtrlChars(params.Get("moderatorPW")),
		IsBreakoutRoom:  util.StripCtrlChars(params.Get("isBreakoutRoom")),
		ParentMeetingID: util.StripCtrlChars(params.Get("parentMeetingId")),
		Record:          util.StripCtrlChars(params.Get("record")),
	}

	v := validation.CreateValidator{
		Request: req,
	}
	ok, key, msg := v.Validate()
	if !ok {
		app.respondWithErrorXML(w, model.ReturnCodeFailure, key, msg)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	if util.GetBoolOrDefaultValue(util.StripCtrlChars(params.Get("isBreakoutRoom")), false) {
		parentMeetingId := util.StripCtrlChars(params.Get("parentMeetingId"))
		if parentMeetingId == "" {
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.ParentMeetingIdMissingErrorKey, model.ParentMeetingIdMissingErrorMsg)
			return
		}

		res, err := app.Core.IsMeetingRunning(ctx, &meeting.MeetingRunningRequest{
			MeetingData: &common.MeetingData{
				MeetingId: parentMeetingId,
			},
		})
		if err != nil {
			log.Println(err)
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.UnknownErrorKey, model.UnknownErrorMsg)
			return
		}

		if !res.MeetingRunning.IsRunning {
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.ParentMeetingDoesNotExistErrorKey, model.ParentMeetingDoesNotExistErrorMsg)
			return
		}
	}

	settings, err := app.processCreateParams(&params)
	if err != nil {
		log.Println(err)
		app.respondWithErrorXML(w, model.ReturnCodeFailure, model.CreateMeetingErrorKey, model.CreateMeetingErrorMsg)
		return
	}

	contentType, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if bbbmime.ApplicationXML.Matches(contentType) || bbbmime.TextXML.Matches(contentType) {
		modules, err := app.procesXMLModules(r.Body)
		if err != nil {
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.InvalidRequestBodyKey, model.InvalidRequestBodyMsg)
			return
		}

		if cso := modules.Get("clientSettingsOverride"); cso != nil && app.ServerConfig.Override.ClientSettings {
			settings.OverrideClientSettings = cso.Content
		}
	}

	res, err := app.Core.CreateMeeting(ctx, &meeting.CreateMeetingRequest{
		CreateMeetingSettings: settings,
	})
	if err != nil {
		log.Println(err)
		code := app.getGrpcErrorCode(err)
		switch code {
		case codes.InvalidArgument, codes.ResourceExhausted, codes.AlreadyExists:
			app.writeXML(w, http.StatusAccepted, app.grpcErrorToErrorResp(err))
			return
		default:
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.CreateMeetingErrorKey, model.CreateMeetingErrorMsg)
			return
		}
	}

	if !res.CreatedMeetingInfo.IsValid {
		app.respondWithErrorXML(w, model.ReturnCodeFailure, model.MeetingIdNotUniqueErrorKey, model.MeetingIdNotUniqueErrorMsg)
		return
	}

	payload := model.CreateMeetingResponse{
		ReturnCode:           model.ReturnCodeSuccess,
		MeetingId:            res.CreatedMeetingInfo.MeetingExtId,
		InternalMeetingId:    res.CreatedMeetingInfo.MeetingIntId,
		ParentMeetingId:      res.CreatedMeetingInfo.ParentMeetingId,
		AttendeePW:           res.CreatedMeetingInfo.AttendeePw,
		ModeratorPW:          res.CreatedMeetingInfo.ModeratorPw,
		CreateTime:           res.CreatedMeetingInfo.CreateTime,
		VoiceBridge:          res.CreatedMeetingInfo.VoiceBridge,
		DialNumber:           res.CreatedMeetingInfo.DialNumber,
		CreateDate:           res.CreatedMeetingInfo.CreateDate,
		HasUserJoined:        res.CreatedMeetingInfo.HasUserJoined,
		Duration:             res.CreatedMeetingInfo.Duration,
		HasBeenForciblyEnded: res.CreatedMeetingInfo.HasBeenForciblyEnded,
	}

	if res.CreatedMeetingInfo.IsDuplicate {
		payload.MessageKey = model.CreateMeetingDuplicateKey
		payload.Message = model.CreateMeetingDuplicateMsg
	}
	app.writeXML(w, http.StatusAccepted, payload)
}

func (app *Config) insertDocument(w http.ResponseWriter, r *http.Request) {
	slog.Info("Handling insertDocument request")

	params := r.Context().Value(ParamsKey).(Params)

	meetingID := util.StripCtrlChars(params.Get("meetingID"))
	req := &model.InsertDocumentRequest{
		MeetingID: meetingID,
	}

	v := validation.InsertDocumentValidator{
		Request: req,
	}
	ok, key, msg := v.Validate()
	if !ok {
		app.respondWithErrorXML(w, model.ReturnCodeFailure, key, msg)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	res, err := app.Core.GetMeetingInfo(ctx, &meeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	})
	if err != nil {
		log.Println(err)
		code := app.getGrpcErrorCode(err)
		switch code {
		case codes.NotFound:
			app.writeXML(w, http.StatusAccepted, app.grpcErrorToErrorResp(err))
			return
		default:
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.UnknownErrorKey, model.UnknownErrorMsg)
		}
	}

	for _, df := range res.MeetingInfo.DisabledFeatures {
		if df == "presentation" {
			app.respondWithErrorXML(w, model.ReturnCodeFailure, model.PresentationDisabledKey, model.PresentationDisabledMsg)
		}
	}
}
