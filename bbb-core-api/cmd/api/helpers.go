package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	bbbcore "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/bbb-core"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/common"
	bbbmime "github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/mime"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/presentation"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/util"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

const (
	breakoutRoomsCaptureSlides         = false
	breakoutRoomsCaptureNotes          = false
	breakoutRoomsCaptureSlidesFileName = "%%CONFNAME%%"
	breakoutRoomsCaptureNotesFileName  = "%%CONFNAME%%"
	dialNum                            = "%%DIALNUM%%"
	confNum                            = "%%CONFNUM%%"
	confName                           = "%%CONFNAME%%"
	serverUrl                          = "%%SERVERURL%%"

	maxRedirects = 5
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

func (app *Config) respondWithErrorXML(w http.ResponseWriter, code string, key string, msg string) {
	payload := model.Response{
		ReturnCode: code,
		MessageKey: key,
		Message:    msg,
	}
	app.writeXML(w, http.StatusAccepted, payload)
}

func (app *Config) getGrpcErrorCode(err error) codes.Code {
	st, ok := status.FromError(err)
	if ok {
		return st.Code()
	} else {
		return 0
	}
}

func (app *Config) grpcErrorToErrorResp(err error) *model.Response {
	st, ok := status.FromError(err)
	if ok {
		for _, detail := range st.Details() {
			switch t := detail.(type) {
			case *common.ErrorResponse:
				return &model.Response{
					ReturnCode: model.ReturnCodeFailure,
					MessageKey: t.Key,
					Message:    t.Message,
				}
			}
		}
	}

	return &model.Response{
		ReturnCode: model.ReturnCodeFailure,
		MessageKey: model.UnknownErrorKey,
		Message:    model.UnknownErrorMsg,
	}
}

func (app *Config) processCreateParams(params *Params) (*common.CreateMeetingSettings, error) {
	var settings common.CreateMeetingSettings

	createTime := time.Now().UnixMilli()

	isBreakout := util.GetBoolOrDefaultValue(params.Get("isBreakout"), false)
	var parentMeetingInfo *common.MeetingInfo
	if isBreakout {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()
		res, err := app.BbbCore.GetMeetingInfo(ctx, &bbbcore.MeetingInfoRequest{
			MeetingId: util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("parentMeetingID")), ""),
		})
		if err != nil {
			log.Println(err)
			return nil, err
		}
		parentMeetingInfo = res.MeetingInfo
	}
	settings.BreakoutSettings = app.processBreakoutSettings(params, parentMeetingInfo)

	learningDashboardEnabled := false
	settings.MeetingSettings, learningDashboardEnabled = app.processMeetingSettings(params, createTime, isBreakout, parentMeetingInfo)
	settings.DurationSettings = app.processDurationSettings(params, createTime)
	settings.PasswordSettings = app.processPasswordSettings(params, learningDashboardEnabled)
	settings.RecordSettings = app.processRecordSettings(params)

	voiceProps, err := app.processVoiceSettings(params)
	if err != nil {
		return nil, err
	}

	settings.VoiceSettings = voiceProps
	settings.WelcomeSettings = app.processWelcomeSettings(params, isBreakout, settings.VoiceSettings.DialNumber, settings.VoiceSettings.VoiceBridge, settings.MeetingSettings.Name)
	settings.UserSettings = app.processUsersSettings(params)
	settings.MetadataSettings = app.processMetadataSettings(params)
	settings.LockSettings = app.processLockSettings(params)
	settings.SystemSettings = app.processSystemSettings(params)
	settings.GroupSettings = app.processGroupSettings(params)

	/* TODO: Implement client settings override */

	return &settings, nil
}

func (app *Config) processMeetingSettings(params *Params, createTime int64, isBreakout bool, parentMeetingInfo *common.MeetingInfo) (*common.MeetingSettings, bool) {
	var meetingIntId string
	var meetingExtId string

	if isBreakout {
		meetingIntId = util.StripCtrlChars(params.Get("meetingID"))
		parentMeetingId := parentMeetingInfo.MeetingIntId
		parentCreateTime := parentMeetingInfo.DurationInfo.CreateTime
		data := parentMeetingId + "-" + strconv.Itoa(int(parentCreateTime)) + "-" + util.StripCtrlChars(params.Get("sequence"))
		meetingExtId = random.Sha1Hex(data) + strconv.Itoa(int(createTime))
	} else {
		meetingExtId = util.StripCtrlChars(params.Get("meetingID"))
		meetingIntId = random.Sha1Hex(meetingExtId) + "-" + strconv.Itoa(int(createTime))
	}

	disabledFeaturesMap := make(map[string]struct{})
	for k, v := range app.DisabledFeatures {
		disabledFeaturesMap[k] = v
	}
	if featuresParam := params.Get("disabledFeatures"); featuresParam != "" {
		features := strings.Split(featuresParam, ",")
		for _, feature := range features {
			disabledFeaturesMap[feature] = struct{}{}
		}
	}
	disabledFeatures := make([]string, len(disabledFeaturesMap))
	i := 0
	for feature := range disabledFeaturesMap {
		disabledFeatures[i] = feature
		i++
	}

	learningDashboardEnabled := false
	_, ok := disabledFeaturesMap["learningDashboard"]
	if !ok {
		learningDashboardEnabled = true
	}

	return &common.MeetingSettings{
		Name:                util.StripCtrlChars(params.Get("name")),
		MeetingExtId:        meetingExtId,
		MeetingIntId:        meetingIntId,
		MeetingCameraCap:    util.GetInt32OrDefaultValue(params.Get("meetingCameraCap"), app.ServerConfig.Meeting.Cameras.Cap),
		MaxPinnedCameras:    util.GetInt32OrDefaultValue(params.Get("maxPinnedCamera"), app.ServerConfig.Meeting.Cameras.MaxPinned),
		IsBreakout:          isBreakout,
		DisabledFeatures:    disabledFeatures,
		NotifyRecordingIsOn: util.GetBoolOrDefaultValue(params.Get("notfiyRecordingIsOn"), app.ServerConfig.Recording.NotifyRecordingIsOn),
		PresUploadExtDesc:   util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("presentationUploadExternalDescription")), app.ServerConfig.Presentation.Upload.External.Description),
		PresUploadExtUrl:    util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("presentationUploadExternalUrl")), app.ServerConfig.Presentation.Upload.External.Url),
	}, learningDashboardEnabled
}

func (app *Config) processBreakoutSettings(params *Params, parentMeetingInfo *common.MeetingInfo) *common.BreakoutSettings {
	var parentMeetingId string
	if parentMeetingInfo == nil {
		parentMeetingId = ""
	} else {
		parentMeetingId = parentMeetingInfo.MeetingIntId
	}
	return &common.BreakoutSettings{
		ParentMeetingId:       parentMeetingId,
		Sequence:              util.GetInt32OrDefaultValue(params.Get("sequence"), 0),
		FreeJoin:              util.GetBoolOrDefaultValue(params.Get("freeJoin"), false),
		BreakoutRooms:         make([]string, 0),
		Record:                util.GetBoolOrDefaultValue(params.Get("breakoutRoomsRecord"), app.ServerConfig.BreakoutRooms.Record),
		PrivateChatEnabled:    util.GetBoolOrDefaultValue(params.Get("breakoutRoomsPrivateChatEnabled"), app.ServerConfig.BreakoutRooms.PrivateChatEnabled),
		CaptureNotes:          util.GetBoolOrDefaultValue(params.Get("breakoutRoomsCaptureNotes"), breakoutRoomsCaptureNotes),
		CaptureSlides:         util.GetBoolOrDefaultValue(params.Get("breakoutRoomsCaptureSlides"), breakoutRoomsCaptureSlides),
		CaptureNotesFileName:  util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("breakoutRoomsCaptureNotesFileName")), breakoutRoomsCaptureNotesFileName),
		CaptureSlidesFileName: util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("breakoutRoomsCaptureSlidesFileName")), breakoutRoomsCaptureSlidesFileName),
	}
}

func (app *Config) processDurationSettings(params *Params, createTime int64) *common.DurationSettings {
	return &common.DurationSettings{
		Duration:                           int32(util.GetInt32OrDefaultValue(params.Get("duration"), app.ServerConfig.Meeting.Duration)),
		CreateTime:                         createTime,
		CreateDate:                         time.UnixMilli(createTime).String(),
		MeetingExpNoUserJoinedInMin:        util.GetInt32OrDefaultValue(params.Get("meetingExpireIfNoUserJoinedInMinutes"), app.ServerConfig.Meeting.Expiry.NoUserJoined),
		MeetingExpLastUserLeftInMin:        util.GetInt32OrDefaultValue(params.Get("meetingExpireWhenLastUserLeftInMinutes"), app.ServerConfig.Meeting.Expiry.LastUserLeft),
		UserInactivityInspectTimeInMin:     app.ServerConfig.User.Inactivity.InspectInterval,
		UserInactivityThresholdInMin:       app.ServerConfig.User.Inactivity.Threshold,
		UserActivitySignResponseDelayInMin: app.ServerConfig.User.Inactivity.ResponseDelay,
		EndWhenNoMod:                       util.GetBoolOrDefaultValue(params.Get("endWhenNoModerator"), app.ServerConfig.Meeting.Expiry.EndWhenNoModerator),
		EndWhenNoModDelayInMin:             util.GetInt32OrDefaultValue(params.Get("endWhenNoModeratorDelayInMinutes"), app.ServerConfig.Meeting.Expiry.EndWhenNoModeratorDelay),
		LearningDashboardCleanupDelayInMin: util.GetInt32OrDefaultValue(params.Get("learningDashboardCleanupDelayInMinutes"), app.ServerConfig.LearningDashboard.CleanupDelay),
	}
}

func (app *Config) processPasswordSettings(params *Params, learningDashboardEnabled bool) *common.PasswordSettings {
	learningDashboardAccessToken := ""
	if learningDashboardEnabled {
		learningDashboardAccessToken = random.AlphaNumString(12)
	}

	return &common.PasswordSettings{
		ModeratorPw:                  util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("moderatorPW")), ""),
		AttendeePw:                   util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("attendeePW")), ""),
		LearningDashboardAccessToken: learningDashboardAccessToken,
	}
}

func (app *Config) processRecordSettings(params *Params) *common.RecordSettings {
	record := false
	if !app.ServerConfig.Recording.Disabled {
		record = util.GetBoolOrDefaultValue(params.Get("record"), false)
	}

	return &common.RecordSettings{
		Record:                  record,
		AutoStartRecording:      util.GetBoolOrDefaultValue(params.Get("autoStartRecording"), app.ServerConfig.Recording.AutoStart),
		AllowStartStopRecording: util.GetBoolOrDefaultValue(params.Get("allowStartStopRecording"), app.ServerConfig.Recording.AllowStartStopRecording),
		RecordFullDurationMedia: util.GetBoolOrDefaultValue(params.Get("recordFullDurationMedia"), app.ServerConfig.Recording.RecordFullDurationMedia),
		KeepEvents:              util.GetBoolOrDefaultValue(params.Get("meetingKeepEvents"), app.ServerConfig.Recording.KeepEvents),
	}
}

func (app *Config) processVoiceSettings(params *Params) (*common.VoiceSettings, error) {
	voiceBridge := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("voiceBridge")), "")
	return &common.VoiceSettings{
		VoiceBridge:       voiceBridge,
		VoiceConf:         voiceBridge,
		DialNumber:        util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("dialNumber")), app.ServerConfig.Meeting.Voice.DialAccessNumber),
		MuteOnStart:       util.GetBoolOrDefaultValue(params.Get("muteOnStart"), app.ServerConfig.Meeting.Voice.MuteOnStart),
		VoiceBridgeLength: app.ServerConfig.Meeting.Voice.VoiceBridgeLength,
	}, nil
}

func (app *Config) processWelcomeSettings(params *Params, isBreakout bool, dialNumber string, voiceBridge string, meetingName string) *common.WelcomeSettings {
	welcomeMessageTemplate := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("welcome")), app.ServerConfig.Meeting.Welcome.Message.Template)
	if app.ServerConfig.Meeting.Welcome.Message.Footer != "" && isBreakout {
		welcomeMessageTemplate += "<br><br>" + app.ServerConfig.Meeting.Welcome.Message.Footer
	}

	welcomeMessage := replaceKeywords(welcomeMessageTemplate, dialNumber, voiceBridge, meetingName, app.ServerConfig.Server.BigBlueButton.Url)

	modOnlyMsg := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("moderatorOnlyMessage")), "")
	if modOnlyMsg != "" {
		modOnlyMsg = replaceKeywords(modOnlyMsg, dialNumber, voiceBridge, meetingName, app.ServerConfig.Server.BigBlueButton.Url)
	}

	return &common.WelcomeSettings{
		WelcomeMsgTemplate: welcomeMessageTemplate,
		WelcomeMsg:         welcomeMessage,
		ModOnlyMsg:         modOnlyMsg,
	}
}

func (app *Config) processUsersSettings(params *Params) *common.UserSettings {
	maxUserConcurentAccess := app.ServerConfig.Meeting.Users.MaxConcurrentAccess
	if !app.ServerConfig.Meeting.Users.AllowDuplicateExtUserId {
		maxUserConcurentAccess = 1
	}
	return &common.UserSettings{
		MaxUsers:                  util.GetInt32OrDefaultValue(params.Get("maxParticipants"), app.ServerConfig.Meeting.Users.Max),
		MaxUserConcurrentAccesses: maxUserConcurentAccess,
		WebcamsOnlyForMod:         util.GetBoolOrDefaultValue(params.Get("webcamsOnlyForModerator"), app.ServerConfig.Meeting.Cameras.ModOnly),
		UserCameraCap:             util.GetInt32OrDefaultValue(params.Get("userCameraCap"), app.ServerConfig.User.Camera.Cap),
		GuestPolicy:               util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("guestPolicy")), app.ServerConfig.Meeting.Users.GuestPolicy),
		MeetingLayout:             util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("meetingLayout")), app.ServerConfig.Meeting.Layout),
		AllowModsUnmuteUsers:      util.GetBoolOrDefaultValue(params.Get("allowModsToUnmuteUsers"), app.ServerConfig.Meeting.Users.AllowModsToUnmute),
		AllowModsEjectCameras:     util.GetBoolOrDefaultValue(params.Get("allowModsToEjectCameras"), app.ServerConfig.Meeting.Cameras.AllowModsToEject),
		AuthenticatedGuest:        app.ServerConfig.Meeting.Users.AuthenticatedGuest,
		AllowPromoteGuest:         util.GetBoolOrDefaultValue(params.Get("allowPromoteGuestToModerator"), app.ServerConfig.Meeting.Users.AllowPromoteGuest),
	}
}

func (app *Config) processMetadataSettings(params *Params) *common.MetadataSettings {
	r, _ := regexp.Compile("meta_[a-zA-Z][a-zA-Z0-9-]*$")
	metadata := make(map[string]string)
	for k, v := range *params {
		if r.MatchString(k) {
			metadata[strings.ToLower(strings.TrimPrefix(k, "meta_"))] = v[0]
		}
	}
	return &common.MetadataSettings{
		Metadata: metadata,
	}
}

func (app *Config) processLockSettings(params *Params) *common.LockSettings {
	disableNotes := util.GetBoolOrDefaultValue(params.Get("lockSettingsDisableNotes"), app.ServerConfig.Meeting.Lock.Disable.Notes)
	disableNotes = util.GetBoolOrDefaultValue(params.Get("lockSettingsDisableNote"), disableNotes)

	return &common.LockSettings{
		DisableCam:             util.GetBoolOrDefaultValue(params.Get("lockSettingsDisbaleCam"), app.ServerConfig.Meeting.Lock.Disable.Cam),
		DisableMic:             util.GetBoolOrDefaultValue(params.Get("lockSettingsDisableMic"), app.ServerConfig.Meeting.Lock.Disable.Mic),
		DisablePrivateChat:     util.GetBoolOrDefaultValue(params.Get("lockSettingsDisablePrivateChat"), app.ServerConfig.Meeting.Lock.Disable.Chat.Private),
		DisablePublicChat:      util.GetBoolOrDefaultValue(params.Get("lockSettingsDisablePublicChat"), app.ServerConfig.Meeting.Lock.Disable.Chat.Public),
		DisableNotes:           disableNotes,
		HideUserList:           util.GetBoolOrDefaultValue(params.Get("lockSettingsHideUserList"), app.ServerConfig.Meeting.Lock.Hide.UserList),
		LockOnJoin:             util.GetBoolOrDefaultValue(params.Get("lockSettingsLockOnJoin"), app.ServerConfig.Meeting.Lock.OnJoin),
		LockOnJoinConfigurable: util.GetBoolOrDefaultValue(params.Get("lockSettingsOnJoinConfigurable"), app.ServerConfig.Meeting.Lock.OnJoinConfigurable),
		HideViewersCursor:      util.GetBoolOrDefaultValue(params.Get("lockSettingsHideViewersCursor"), app.ServerConfig.Meeting.Lock.Hide.ViewersCursor),
		HideViewersAnnotation:  util.GetBoolOrDefaultValue(params.Get("lockSettingsHideViewersAnnotation"), app.ServerConfig.Meeting.Lock.Hide.ViewersAnnotation),
	}
}

func (app *Config) processSystemSettings(params *Params) *common.SystemSettings {
	logoutUrl := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("logoutURL")), "")
	defaultLogoutUrl := app.ServerConfig.Server.BigBlueButton.LogoutUrl
	if logoutUrl == "" {
		if defaultLogoutUrl == "" || defaultLogoutUrl == "default" {
			logoutUrl = app.ServerConfig.Server.BigBlueButton.Url
		} else {
			logoutUrl = defaultLogoutUrl
		}
	}

	customLogoUrl := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("logo")), "")
	if customLogoUrl == "" && app.ServerConfig.Server.BigBlueButton.Logo.UseDefaultLogo {
		customLogoUrl = app.ServerConfig.DefaultLogoURL()
	}

	return &common.SystemSettings{
		LoginUrl:      util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("loginURL")), ""),
		LogoutUrl:     logoutUrl,
		CustomLogoUrl: customLogoUrl,
		BannerText:    util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("bannerText")), ""),
		BannerColour:  util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("bannerColor")), ""),
	}
}

func (app *Config) processGroupSettings(params *Params) []*common.GroupSettings {
	type Group struct {
		Id     string   `json:"id"`
		Name   string   `json:"name"`
		Roster []string `json:"roster"`
	}

	var groups []Group
	if groupsParam := params.Get("groups"); groupsParam != "" {
		if err := json.Unmarshal([]byte(groupsParam), &groups); err != nil {
			log.Println("Error unmarshalling groups parameter", err)
			return nil
		}
	}

	groupProps := make([]*common.GroupSettings, len(groups))
	for i, g := range groups {
		groupProps[i] = &common.GroupSettings{
			GroupId:     g.Id,
			Name:        g.Name,
			UsersExtIds: g.Roster,
		}
	}
	return groupProps
}

type Modules struct {
	XMLName xml.Name `xml:"modules"`
	Modules []Module `xml:"module"`
}

type Module struct {
	XMLName xml.Name `xml:"module"`
	Name    string   `xml:"name,attr"`
	Content string   `xml:",innerxml"`
}

type RequestModules map[string][]Module

func (r RequestModules) Get(key string) *Module {
	vs := r[key]
	if len(vs) == 0 {
		return nil
	}
	return &vs[0]
}

func (r RequestModules) GetAll(key string) []Module {
	vs := r[key]
	if len(vs) == 0 {
		return nil
	}
	return vs
}

func (r RequestModules) Set(key string, value Module) {
	r[key] = []Module{value}
}

func (r RequestModules) Add(key string, value Module) {
	r[key] = append(r[key], value)
}

func (r RequestModules) Del(key string) {
	delete(r, key)
}

func (r RequestModules) Has(key string) bool {
	_, ok := r[key]
	return ok
}

type Presentation struct {
	Documents []Document `xml:"document"`
}

type Document struct {
	XMLName       xml.Name `xml:"document"`
	Name          string   `xml:"name,attr,omitempty"`
	Current       bool     `xml:"current,attr,omitempty"`
	Removable     bool     `xml:"removable,attr,omitempty"`
	Downloadable  bool     `xml:"downloadable,attr,omitempty"`
	URL           string   `xml:"url,attr,omitempty"`
	Filename      string   `xml:"filename,attr,omitempty"`
	PresFromParam bool     `xml:"isPreUploadedPresentationFromParameter,attr,omitempty"`
	Content       string   `xml:",chardata"`
}

func (app *Config) processXMLModules(body io.ReadCloser) (RequestModules, error) {
	var modules Modules
	decoder := xml.NewDecoder(body)
	err := decoder.Decode(&modules)
	if err != nil {
		return nil, err
	}

	reqModules := make(RequestModules)
	for _, module := range modules.Modules {
		reqModules.Add(module.Name, module)
	}

	return reqModules, nil
}

func (app *Config) parseDocuments(modules RequestModules, params *Params, isFromInsertAPI bool) ([]Document, bool, error) {
	for _, df := range app.ServerConfig.Meeting.Features.Disabled {
		if df == "presentation" {
			return nil, false, errors.New("presentation feature is disabled")
		}
	}

	overrideDefaultPresentation := true
	if !isFromInsertAPI {
		if po := params.Get("preUploadedPresentationOverrideDefault"); po == "" {
			overrideDefaultPresentation = app.ServerConfig.Override.DefaultPresentation
		} else {
			overrideDefaultPresentation = util.GetBoolOrDefaultValue(po, overrideDefaultPresentation)
		}
	}

	isDefaultPresUsed := false
	isDefaultPresCurrent := false
	var presentations []Document
	presentationsHasCurrent := false
	presURLInParameter := false

	pres := params.Get("preUploadedPresentation")
	presName := params.Get("preUploadedPresentationName")

	if pres != "" {
		presURLInParameter = true
		if presName == "" {
			fileName := filepath.Base(pres)
			if fileName == "." {
				fileName = "untitled"
			}
		}

		doc := Document{
			Removable:     true,
			Downloadable:  false,
			URL:           pres,
			Filename:      presName,
			PresFromParam: true,
		}
		presentations = append(presentations, doc)
	}

	if !modules.Has("presentation") {
		if isFromInsertAPI {
			return nil, presentationsHasCurrent, errors.New("insertDocument API called without a payload")
		}

		if presURLInParameter {
			if !overrideDefaultPresentation {
				presentations = append(presentations, Document{
					Name:    "default",
					Current: true,
				})
			}
		} else {
			presentations = append(presentations, Document{
				Name:    "default",
				Current: true,
			})
		}
	} else {
		hasCurrent := presURLInParameter
		hasPresModule := false
		if modules.Has("presentation") {
			presModule := modules.Get("presentation")
			presentation, err := parsePresentationModule(presModule.Content)
			if err != nil {
				return nil, presentationsHasCurrent, err
			}
			hasPresModule = true
			for _, doc := range presentation.Documents {
				if doc.Current {
					presentations = append([]Document{doc}, presentations...)
					hasCurrent = true
				} else {
					presentations = append(presentations, doc)
				}
			}

			uploadDefault := !overrideDefaultPresentation && !isDefaultPresUsed && !isFromInsertAPI
			if uploadDefault {
				isDefaultPresCurrent = !hasCurrent
				hasCurrent = true
				isDefaultPresUsed = true
				if isDefaultPresCurrent {
					presentations = append([]Document{{Name: "default", Current: true}}, presentations...)
				} else {
					presentations = append(presentations, Document{Name: "default", Current: false})
				}
			}
		}
		if !hasPresModule {
			hasCurrent = true
			presentations = append([]Document{{Name: "default", Current: true}}, presentations...)
		}
		presentationsHasCurrent = hasCurrent
	}

	return presentations, presentationsHasCurrent, nil
}

func (app *Config) processDocument(doc Document, meetingID string, isFirst, isFromInsertAPI, presentationsHasCurrent bool) (*presentation.UploadedPresentation, error) {
	isCurrent := false
	isRemovable := true
	isDownloadable := false
	isDefaultPres := false
	isPresFromParam := false

	if doc.Name == "default" {
		defaultPres := app.ServerConfig.DefaultPresentation()
		if defaultPres != "" {
			if doc.Current {
				isDefaultPres = true
			}

			return app.processDocumentFromDownload(defaultPres, meetingID, "", doc.Current, false, true, isDefaultPres, isPresFromParam)
		} else {
			return nil, errors.New("no default presentation set.")
		}
	} else {
		isPresFromParam = doc.PresFromParam
		isRemovable = doc.Removable
		isDownloadable = doc.Downloadable

		if isFirst && isFromInsertAPI {
			if presentationsHasCurrent {
				isCurrent = true
			}
		} else if isFirst && !isFromInsertAPI {
			isDefaultPres = true
			isCurrent = true
		}

		// Verify whether the document is base64 encoded or a URL to download
		if doc.URL != "" {
			var fileName string
			if doc.Filename != "" {
				fileName = doc.Filename
				slog.Info(fmt.Sprintf("User provided filename: %s", fileName))
			}

			return app.processDocumentFromDownload(doc.URL, meetingID, fileName, doc.Current, isDownloadable, isRemovable, isDefaultPres, isPresFromParam)
		} else if doc.Name != "" {
			decodedBytes, err := base64.StdEncoding.DecodeString(doc.Content)
			if err != nil {
				return nil, fmt.Errorf("failed to decode document content: %s", doc.Content)
			}
			return app.processDocumentFromBytes(decodedBytes, doc.Name, meetingID, isCurrent, isDownloadable, isRemovable, isDefaultPres)
		} else {
			return nil, fmt.Errorf("presentation module config found, but it did not contain URL or name attributes.")
		}
	}
}

func (app *Config) processDocumentFromBytes(bytes []byte, presOrigName, meetingID string, current, isDownloadable, isRemovable, isDefault bool) (*presentation.UploadedPresentation, error) {
	fileName := filepath.Base(presOrigName)
	fileExt := filepath.Ext(fileName)

	if fileName == "." || fileExt == "" {
		return nil, fmt.Errorf("upload failed due to invalid faile name %s", presOrigName)
	}

	if !presentation.IsMimeTypeValid(bytes, fileExt) {
		return nil, errors.New("invalid MIME type")
	}

	if !presentation.IsFileTypeSupported(fileExt) {
		return nil, errors.New("file type not supported")
	}

	presDir := app.ServerConfig.Presentation.Upload.Directory
	presID := presentation.GeneratePresentationID(presOrigName)

	uploadDir, err := presentation.CreatePresentationDirectory(meetingID, presDir, presID)
	if err != nil {
		return nil, err
	}

	newFileName := presentation.CreateNewFileName(presID, fileExt)
	presPath := uploadDir + string(os.PathSeparator) + newFileName

	pres, err := os.Create(presPath)
	if err != nil {
		return nil, err
	}
	defer pres.Close()

	_, err = pres.Write(bytes)
	if err != nil {
		return nil, err
	}

	return &presentation.UploadedPresentation{
		PodID:          presentation.DefaultPodID,
		MeetingID:      meetingID,
		ID:             presID,
		Name:           fileName,
		Path:           presPath,
		FileType:       fileExt,
		Current:        current,
		AuthToken:      presentation.DefaultAuthToken,
		IsDownloadable: isDownloadable,
		IsRemovable:    isRemovable,
		IsDefault:      isDefault,
	}, nil
}

func (app *Config) processDocumentFromDownload(address, meetingID, fileName string, current, isDownloadable, isRemovable, isDefault, isPresFromParam bool) (*presentation.UploadedPresentation, error) {
	slog.Info(fmt.Sprintf("Download and process document (%s, %s, %s)", address, meetingID, fileName))

	var presOrigFileName string
	if fileName == "" {
		parts := strings.Split(address, "/")
		name := parts[len(parts)-1]
		decodedFileName, err := url.QueryUnescape(name)
		if err != nil {
			return nil, err
		}
		presOrigFileName = decodedFileName
	} else {
		presOrigFileName = fileName
	}

	presFileName := filepath.Base(presOrigFileName)
	presFileExt := filepath.Ext(presOrigFileName)

	if presFileName == "." || presFileExt == "" {
		slog.Info("Presentation is null by default")
		return nil, fmt.Errorf("invalid file name %s or extension %s", presFileName, presFileExt)
	}

	bytes, err := app.downloadPresentation(meetingID, address)
	if err != nil {
		return nil, err
	}

	if !presentation.IsMimeTypeValid(bytes, presFileExt) {
		return nil, errors.New("invalid MIME type")
	}

	if !presentation.IsFileTypeSupported(presFileExt) {
		return nil, errors.New("file type not supported")
	}

	presDir := app.ServerConfig.Presentation.Upload.Directory
	presID := presentation.GeneratePresentationID(presFileName)
	uploadDir, err := presentation.CreatePresentationDirectory(meetingID, presDir, presID)
	if err != nil {
		return nil, err
	}

	if isPresFromParam && presFileExt == "" {
		fileExt, err := bbbmime.GetExtForMimeType(bbbmime.DetectMimeType(bytes))
		if err != nil {
			return nil, err
		}
		presFileExt = fileExt.ToString()
	}

	newFileName := presentation.CreateNewFileName(presID, presFileExt)
	presPath := uploadDir + string(os.PathSeparator) + newFileName

	pres, err := os.Create(presPath)
	if err != nil {
		return nil, err
	}
	defer pres.Close()

	_, err = pres.Write(bytes)
	if err != nil {
		return nil, err
	}

	return &presentation.UploadedPresentation{
		PodID:          presentation.DefaultPodID,
		MeetingID:      meetingID,
		ID:             presID,
		Name:           presFileName,
		Path:           presPath,
		FileType:       presFileExt,
		Current:        current,
		AuthToken:      presentation.DefaultAuthToken,
		IsDownloadable: isDownloadable,
		IsRemovable:    isRemovable,
		IsDefault:      isDefault,
	}, nil
}

func (app *Config) downloadPresentation(meetingID, URL string) ([]byte, error) {
	finalURL, err := app.followRedirect(meetingID, URL, URL, 0)
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to download presentation: %v", err))
		return nil, err
	}

	if finalURL != URL {
		slog.Info(fmt.Sprintf("Redirected to final URL: %s", finalURL))
	}

	req, err := http.NewRequest(http.MethodGet, finalURL, nil)
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to create request to download presentation from %s for meeting %s: %v", finalURL, meetingID, err))
		return nil, err
	}
	req.Header.Set("Accept-Language", "en-US,en;q=0.8")
	req.Header.Set("User-Agent", "Mozilla")

	resp, err := app.NoRedirectClient.Do(req)
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to execute request to download presentation from %s for meeting %s: %v", finalURL, meetingID, err))
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		slog.Error(fmt.Sprintf("Invalid HTTP response %d for request to download presentation from %s for meeting %s", resp.StatusCode, finalURL, meetingID))
		return nil, err
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error(fmt.Sprintf("Could not read response body for downloaded presentation: %v", err))
		return nil, err
	}

	return body, nil
}

func (app *Config) followRedirect(meetingID, redirectURL, origURL string, redirectCount int32) (string, error) {
	if redirectCount > maxRedirects {
		return "", fmt.Errorf("max number of redirects reached for meeting: %s with URL: %s", meetingID, origURL)
	}

	if !app.isValidRedirectURL(redirectURL) {
		return "", fmt.Errorf("invalid redirect URL %s", redirectURL)
	}

	parsedURL, err := url.Parse(redirectURL)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest(http.MethodGet, parsedURL.String(), nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Accept-Language", "en-US,en;q=0.8")
	req.Header.Set("User-Agent", "Mozilla")

	resp, err := app.NoRedirectClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 && resp.StatusCode < 400 {
		newURL := resp.Header.Get("Location")
		if newURL == "" {
			return "", errors.New("empty location header")
		}
		return app.followRedirect(meetingID, newURL, origURL, redirectCount+1)
	} else if resp.StatusCode == http.StatusOK {
		return redirectURL, nil
	} else {
		return "", errors.New("invalid HTTP response")
	}
}

func (app *Config) isValidRedirectURL(redirectURL string) bool {
	slog.Info(fmt.Sprintf("Validating redirect URL: %s", redirectURL))

	parsedURL, err := url.Parse(redirectURL)
	if err != nil {
		slog.Error(fmt.Sprintf("Malformed URL: %s", redirectURL))
		return false
	}

	protocol := parsedURL.Scheme
	host := parsedURL.Hostname()

	if !app.protocolSupported(protocol) {
		if len(app.ServerConfig.Presentation.Upload.Protocols) == 1 && strings.EqualFold(app.ServerConfig.Presentation.Upload.Protocols[0], "all") {
			slog.Warn("All protocols are supported for presentation download. It is recommended to only allow HTTPS.")
		} else {
			slog.Info(fmt.Sprintf("Invalid protocol: %s", protocol))
			return false
		}
	}

	if app.hostBlocked(host) {
		slog.Error(fmt.Sprintf("Attempted to download from blocked host: %s", host))
		return false
	}

	addresses, err := net.LookupIP(host)
	if err != nil {
		slog.Error(fmt.Sprintf("Unknown host: %s", host))
		return false
	}

	localhostBlocked := app.hostBlocked("localhost")

	for _, address := range addresses {
		ip := address.String()
		if !isValidIPAddress(ip) {
			slog.Error(fmt.Sprintf("Invalid IP address: %s", ip))
			return false
		}

		if localhostBlocked && !strings.EqualFold(redirectURL, app.ServerConfig.DefaultPresentation()) {
			if address.IsLoopback() || address.IsUnspecified() {
				slog.Error(fmt.Sprintf("Address %s is a local or loopback address", ip))
				return false
			}
		}
	}

	return true
}

func (app *Config) protocolSupported(protocol string) bool {
	for _, p := range app.ServerConfig.Presentation.Upload.Protocols {
		if strings.EqualFold(p, protocol) {
			return true
		}
	}
	return false
}

func (app *Config) hostBlocked(host string) bool {
	for _, h := range app.ServerConfig.Presentation.Upload.BlockedHosts {
		if strings.EqualFold(h, host) {
			return true
		}
	}
	return false
}

func isValidIPAddress(ip string) bool {
	return net.ParseIP(ip) != nil
}

func replaceKeywords(message string, dialNumber string, voiceBridge string, meetingName string, url string) string {
	keywords := []string{dialNum, confNum, confName, serverUrl}
	for _, v := range keywords {
		switch v {
		case dialNum:
			message = strings.ReplaceAll(message, dialNum, dialNumber)
		case confNum:
			message = strings.ReplaceAll(message, confNum, voiceBridge)
		case confName:
			message = strings.ReplaceAll(message, confName, meetingName)
		case serverUrl:
			message = strings.ReplaceAll(message, serverUrl, url)
		}
	}
	return message
}

func parsePresentationModule(content string) (*Presentation, error) {
	var presentation Presentation
	err := xml.Unmarshal([]byte(content), &presentation)
	if err != nil {
		return nil, err
	}
	return &presentation, nil
}
