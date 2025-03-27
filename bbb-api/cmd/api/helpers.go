package main

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"errors"
	"io"
	"log"
	"log/slog"
	"net/http"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/model"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/plugin"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/util"
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
)

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
	vals := r[key]
	if len(vals) == 0 {
		return nil
	}
	return &vals[0]
}

func (r RequestModules) GetAll(key string) []Module {
	vals := r[key]
	if len(vals) == 0 {
		return nil
	}
	return vals
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
		res, err := app.Core.GetMeetingInfo(ctx, &core.MeetingInfoRequest{
			MeetingData: &common.MeetingData{
				MeetingId: util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("parentMeetingID")), ""),
			},
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

	// TODO: Implement client settings override
	if app.ServerConfig.Override.ClientSettings {

	}

	settings.PluginSettings = app.processPluginSettings(params)

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
		CameraBridge:        util.GetStringOrDefaultValue(params.Get("cameraBridge"), app.ServerConfig.Meeting.Brdige.Camera),
		ScreenShareBridge:   util.GetStringOrDefaultValue(params.Get("screenShareBridge"), app.ServerConfig.Meeting.Brdige.ScreenShare),
		AudioBridge:         util.GetStringOrDefaultValue(params.Get("audioBridge"), app.ServerConfig.Meeting.Brdige.Audio),
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

	welcomeMessage := replaceKeywords(welcomeMessageTemplate, dialNumber, voiceBridge, meetingName, app.ServerConfig.Server.BigBlueButton.URL)

	modOnlyMsg := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("moderatorOnlyMessage")), "")
	if modOnlyMsg != "" {
		modOnlyMsg = replaceKeywords(modOnlyMsg, dialNumber, voiceBridge, meetingName, app.ServerConfig.Server.BigBlueButton.URL)
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
		WaitingGuestUsersTimeout:  app.ServerConfig.User.Guest.WaitingTimeout,
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
	logoutURL := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("logoutURL")), "")
	defaultLogoutURL := app.ServerConfig.Server.BigBlueButton.LogoutURL
	if logoutURL == "" {
		if defaultLogoutURL == "" || defaultLogoutURL == "default" {
			logoutURL = app.ServerConfig.Server.BigBlueButton.URL
		} else {
			logoutURL = defaultLogoutURL
		}
	}

	var (
		useLogo     = app.ServerConfig.Server.BigBlueButton.Logo.Default.Use
		useDarkLogo = app.ServerConfig.Server.BigBlueButton.Logo.Default.UseDark
	)

	customLogoURL := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("logo")), "")
	if customLogoURL == "" && useLogo {
		customLogoURL = app.ServerConfig.DefaultLogoURL()
	}

	customDarkLogoURL := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("darklogo")), "")
	if customDarkLogoURL == "" && customLogoURL != "" {
		customDarkLogoURL = customLogoURL
	} else if useDarkLogo {
		customDarkLogoURL = app.ServerConfig.DefaultDarkLogoURL()
	} else if !useDarkLogo && useLogo {
		customDarkLogoURL = app.ServerConfig.DefaultLogoURL()
	}

	return &common.SystemSettings{
		LoginUrl:          util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("loginURL")), ""),
		LogoutUrl:         logoutURL,
		CustomLogoUrl:     customLogoURL,
		CustomDarkLogoUrl: customDarkLogoURL,
		BannerText:        util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("bannerText")), ""),
		BannerColour:      util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("bannerColor")), ""),
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

func (app *Config) procesXMLModules(body io.ReadCloser) (RequestModules, error) {
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
	var documents []Document
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
		documents = append(documents, doc)
	}

	if !modules.Has("presentation") {
		if isFromInsertAPI {
			return nil, presentationsHasCurrent, errors.New("insertDocument API called without a payload")
		}

		if presURLInParameter {
			if !overrideDefaultPresentation {
				documents = append(documents, Document{
					Name:    "default",
					Current: true,
				})
			}
		} else {
			documents = append(documents, Document{
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
					documents = append([]Document{doc}, documents...)
					hasCurrent = true
				} else {
					documents = append(documents, doc)
				}
			}

			uploadDefault := !overrideDefaultPresentation && !isDefaultPresUsed && !isFromInsertAPI
			if uploadDefault {
				isDefaultPresCurrent = !hasCurrent
				hasCurrent = true
				isDefaultPresUsed = true
				if isDefaultPresCurrent {
					documents = append([]Document{{Name: "default", Current: true}}, documents...)
				} else {
					documents = append(documents, Document{Name: "default", Current: false})
				}
			}
		}
		if !hasPresModule {
			hasCurrent = true
			documents = append([]Document{{Name: "default", Current: true}}, documents...)
		}
		presentationsHasCurrent = hasCurrent
	}

	return documents, presentationsHasCurrent, nil
}

func (app *Config) processPluginSettings(params *Params) *common.PluginSettings {
	var pluginManifests []*common.PluginManifest

	for _, m := range app.ServerConfig.Plugins.Manifests {
		pluginManifests = append(pluginManifests, &common.PluginManifest{
			Url: m,
		})
	}

	if manifestData := util.GetStringOrDefaultValue(util.StripCtrlChars(params.Get("pluginManifests")), ""); manifestData != "" {
		manifests, err := plugin.Parse(manifestData)
		if err != nil {
			slog.Error("Failed to parse plugin manifest data", "data", manifestData, "error", err)
		}

		for _, m := range manifests {
			pluginManifests = append(pluginManifests, &common.PluginManifest{
				Url:      m.URL,
				Checksum: m.URL,
			})
		}
	}

	return &common.PluginSettings{
		PluginManifests: pluginManifests,
	}
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
