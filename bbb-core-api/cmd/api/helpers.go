package main

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	bbbcore "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/bbb-core"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
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

	// TODO: Implement client settings override

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
