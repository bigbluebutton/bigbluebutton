package create

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/plugin"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/document"
)

// RequestToIsMeetingRunning is a pipleline.Transformer implementation that is used
// to transform a HTTP request into a [MeetingRunningRequest].
type RequestToIsMeetingRunning struct{}

// Transform takes an incoming message with a payload of type http.Request, transforms
// it into a [MeetingRunningRequest], and then returns it in a new message. The new message
// will also have the initial HTTP request's bbbhttp.Params embededded in its context.
func (r *RequestToIsMeetingRunning) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*meeting.MeetingRunningRequest], error) {
	req := msg.Payload

	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)

	parentMeetingID := validation.StripCtrlChars(params.Get(meetingapi.ParentMeetingIDParam).Value)
	grpcReq := &meeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: parentMeetingID,
		},
	}

	ctx := context.WithValue(msg.Context(), core.ParamsKey, params)
	ctx = context.WithValue(ctx, core.RequestBodyKey, req.Body)

	return pipeline.NewMessageWithContext(grpcReq, ctx), nil
}

type MeetingRunningToMeetingInfo struct{}

func (m *MeetingRunningToMeetingInfo) Transform(msg pipeline.Message[*meeting.MeetingRunningResponse]) (pipeline.Message[*meeting.MeetingInfoRequest], error) {
	params := msg.Context().Value(core.ParamsKey).(bbbhttp.Params)
	parentMeetingID := validation.StripCtrlChars(params.Get(meetingapi.ParentMeetingIDParam).Value)
	req := &meeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: parentMeetingID,
		},
	}
	return pipeline.NewMessageWithContext(req, msg.Context()), nil
}

type MeetingRunningToCreate struct {
	proc document.Processor
}

func (m *MeetingRunningToCreate) Transform(msg pipeline.Message[*meeting.MeetingInfoResponse]) (pipeline.Message[*meeting.CreateMeetingRequest], error) {
	params := msg.Context().Value(core.ParamsKey).(bbbhttp.Params)

	settings := createMeetingSettings(params, msg.Payload.MeetingInfo)

	cfg := config.DefaultConfig()

	body := msg.Context().Value(core.RequestBodyKey).(io.ReadCloser)
	modules, err := bbbhttp.ProcessRequestModules(body)
	if err != nil {
		return pipeline.Message[*meeting.CreateMeetingRequest]{}, core.NewBBBError(responses.InvalidRequestBodyKey, responses.InvalidRequestBodyMsg)
	}

	if cso, ok := modules.Get(meetingapi.ClientSettingsOverrideModule); ok && cfg.Override.ClientSettings {
		settings.OverrideClientSettings = cso.Content
	}

	req := &meeting.CreateMeetingRequest{
		CreateMeetingSettings: settings,
	}

	if m.proc == nil {
		slog.Warn("Could not process document; no document process was provided")
		return pipeline.NewMessageWithContext(req, msg.Context()), nil
	}

	parsedDocs, err := m.proc.Parse(modules, params, false)
	if err != nil {
		slog.Error("Failed to parse documents from request", "error", err)
		return pipeline.NewMessageWithContext(req, msg.Context()), nil
	}

	presentations, err := m.proc.Process(parsedDocs)
	if err != nil {
		slog.Error("Failed to process documents from request", "error", err)
		return pipeline.NewMessageWithContext(req, msg.Context()), nil
	}

	ctx := context.WithValue(msg.Context(), core.ParamsKey, presentations)

	return pipeline.NewMessageWithContext(req, ctx), nil
}

func createMeetingSettings(params bbbhttp.Params, parentMeetingInfo *common.MeetingInfo) *common.CreateMeetingSettings {
	settings := &common.CreateMeetingSettings{}
	createTime := time.Now().UnixMilli()
	isBreakout := core.GetBoolOrDefaultValue(params.Get(meetingapi.IsBreakoutRoomParam).Value, false)

	learningDashboardEnabled := false
	settings.MeetingSettings, learningDashboardEnabled = meetingSettings(params, createTime, isBreakout, parentMeetingInfo)

	settings.BreakoutSettings = breakoutSettings(params, parentMeetingInfo)
	settings.DurationSettings = durationSettings(params, createTime)
	settings.PasswordSettings = passwordSettings(params, learningDashboardEnabled)
	settings.RecordSettings = recordSettings(params)
	settings.VoiceSettings = voiceSettings(params)
	settings.WelcomeSettings = welcomeSettings(params, isBreakout, settings.VoiceSettings.DialNumber, settings.VoiceSettings.VoiceBridge, settings.MeetingSettings.Name)
	settings.UserSettings = usersSettings(params)
	settings.MetadataSettings = metadataSettings(params)
	settings.LockSettings = lockSettings(params)
	settings.SystemSettings = systemSettings(params)
	settings.GroupSettings = groupSettings(params)
	settings.PluginSettings = pluginSettings(params)

	return settings
}

func meetingSettings(params bbbhttp.Params, createTime int64, isBreakout bool, parentMeetingInfo *common.MeetingInfo) (*common.MeetingSettings, bool) {
	var meetingIntId string
	var meetingExtId string

	cfg := config.DefaultConfig()

	if isBreakout {
		meetingIntId = validation.StripCtrlChars(params.Get(meetingapi.IDParam).Value)
		parentMeetingId := parentMeetingInfo.MeetingIntId
		parentCreateTime := parentMeetingInfo.DurationInfo.CreateTime
		data := parentMeetingId + "-" + strconv.Itoa(int(parentCreateTime)) + "-" + validation.StripCtrlChars(params.Get(meetingapi.SequenceParam).Value)
		meetingExtId = random.Sha1Hex(data) + strconv.Itoa(int(createTime))
	} else {
		meetingExtId = validation.StripCtrlChars(params.Get(meetingapi.IDParam).Value)
		meetingIntId = random.Sha1Hex(meetingExtId) + "-" + strconv.Itoa(int(createTime))
	}

	disabledFeaturesMap := make(map[string]struct{})
	for k, v := range cfg.DisabledFeatures() {
		disabledFeaturesMap[k] = v
	}
	if featuresParam := params.Get(meetingapi.DisabledFeaturesParam).Value; featuresParam != "" {
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
	_, ok := disabledFeaturesMap[meetingapi.LearningDashboardFeature]
	if !ok {
		learningDashboardEnabled = true
	}

	return &common.MeetingSettings{
		Name:                validation.StripCtrlChars(params.Get(meetingapi.NameParam).Value),
		MeetingExtId:        meetingExtId,
		MeetingIntId:        meetingIntId,
		MeetingCameraCap:    core.GetInt32OrDefaultValue(params.Get(meetingapi.CameraCapParam).Value, cfg.Meeting.Cameras.Cap),
		MaxPinnedCameras:    core.GetInt32OrDefaultValue(params.Get(meetingapi.MaxPinnedCamerasParam).Value, cfg.Meeting.Cameras.MaxPinned),
		CameraBridge:        core.GetStringOrDefaultValue(params.Get(meetingapi.CameraBridgeParam).Value, cfg.Meeting.Brdige.Camera),
		ScreenShareBridge:   core.GetStringOrDefaultValue(params.Get(meetingapi.ScreenShareBridgeParam).Value, cfg.Meeting.Brdige.ScreenShare),
		AudioBridge:         core.GetStringOrDefaultValue(params.Get(meetingapi.AudioBridgeParam).Value, cfg.Meeting.Brdige.Audio),
		IsBreakout:          isBreakout,
		DisabledFeatures:    disabledFeatures,
		NotifyRecordingIsOn: core.GetBoolOrDefaultValue(params.Get(meetingapi.NotifyRecordingIsOnParam).Value, cfg.Recording.NotifyRecordingIsOn),
		PresUploadExtDesc:   core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.PresUploadExtDescParam).Value), cfg.Presentation.Upload.External.Description),
		PresUploadExtUrl:    core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.PresUploadExtURLParam).Value), cfg.Presentation.Upload.External.Url),
	}, learningDashboardEnabled
}

func breakoutSettings(params bbbhttp.Params, parentMeetingInfo *common.MeetingInfo) *common.BreakoutSettings {
	cfg := config.DefaultConfig()
	return &common.BreakoutSettings{
		ParentMeetingId:       parentMeetingInfo.MeetingIntId,
		Sequence:              core.GetInt32OrDefaultValue(params.Get(meetingapi.SequenceParam).Value, 0),
		FreeJoin:              core.GetBoolOrDefaultValue(params.Get(meetingapi.FreeJoinParam).Value, false),
		BreakoutRooms:         make([]string, 0),
		Record:                core.GetBoolOrDefaultValue(params.Get("breakoutRoomsRecord").Value, cfg.BreakoutRooms.Record),
		PrivateChatEnabled:    core.GetBoolOrDefaultValue(params.Get("breakoutRoomsPrivateChatEnabled").Value, cfg.BreakoutRooms.PrivateChatEnabled),
		CaptureNotes:          core.GetBoolOrDefaultValue(params.Get("breakoutRoomsCaptureNotes").Value, meetingapi.BreakoutRoomsCaptureNotes),
		CaptureSlides:         core.GetBoolOrDefaultValue(params.Get("breakoutRoomsCaptureSlides").Value, meetingapi.BreakoutRoomsCaptureSlides),
		CaptureNotesFileName:  core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get("breakoutRoomsCaptureNotesFileName").Value), meetingapi.BreakoutRoomsCaptureNotesFileName),
		CaptureSlidesFileName: core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get("breakoutRoomsCaptureSlidesFileName").Value), meetingapi.BreakoutRoomsCaptureSlidesFileName),
	}
}

func durationSettings(params bbbhttp.Params, createTime int64) *common.DurationSettings {
	cfg := config.DefaultConfig()
	return &common.DurationSettings{
		Duration:                           int32(core.GetInt32OrDefaultValue(params.Get(meetingapi.DurationParam).Value, cfg.Meeting.Duration)),
		CreateTime:                         createTime,
		CreateDate:                         time.UnixMilli(createTime).String(),
		MeetingExpNoUserJoinedInMin:        core.GetInt32OrDefaultValue(params.Get(meetingapi.MeetingExpireNoUseJoinedParam).Value, cfg.Meeting.Expiry.NoUserJoined),
		MeetingExpLastUserLeftInMin:        core.GetInt32OrDefaultValue(params.Get(meetingapi.MeetingExpireLastUserLeftParam).Value, cfg.Meeting.Expiry.LastUserLeft),
		UserInactivityInspectTimeInMin:     cfg.User.Inactivity.InspectInterval,
		UserInactivityThresholdInMin:       cfg.User.Inactivity.Threshold,
		UserActivitySignResponseDelayInMin: cfg.User.Inactivity.ResponseDelay,
		EndWhenNoMod:                       core.GetBoolOrDefaultValue(params.Get(meetingapi.EndWhenNoModeratorParam).Value, cfg.Meeting.Expiry.EndWhenNoModerator),
		EndWhenNoModDelayInMin:             core.GetInt32OrDefaultValue(params.Get(meetingapi.EndWhenNoModeratorDelayParam).Value, cfg.Meeting.Expiry.EndWhenNoModeratorDelay),
		LearningDashboardCleanupDelayInMin: core.GetInt32OrDefaultValue(params.Get(meetingapi.LearningDashboardCleanupDelayParam).Value, cfg.LearningDashboard.CleanupDelay),
	}
}

func passwordSettings(params bbbhttp.Params, learningDashboardEnabled bool) *common.PasswordSettings {
	learningDashboardAccessToken := ""
	if learningDashboardEnabled {
		learningDashboardAccessToken = random.AlphaNumString(12)
	}

	return &common.PasswordSettings{
		ModeratorPw:                  core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.ModeratorPWParam).Value), ""),
		AttendeePw:                   core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.AttendeePWParam).Value), ""),
		LearningDashboardAccessToken: learningDashboardAccessToken,
	}
}

func recordSettings(params bbbhttp.Params) *common.RecordSettings {
	cfg := config.DefaultConfig()
	record := false
	if !cfg.Recording.Disabled {
		record = core.GetBoolOrDefaultValue(params.Get(meetingapi.RecordParam).Value, false)
	}

	return &common.RecordSettings{
		Record:                  record,
		AutoStartRecording:      core.GetBoolOrDefaultValue(params.Get(meetingapi.AutoStartRecordingParam).Value, cfg.Recording.AutoStart),
		AllowStartStopRecording: core.GetBoolOrDefaultValue(params.Get(meetingapi.AllowStartStopRecordingParam).Value, cfg.Recording.AllowStartStopRecording),
		RecordFullDurationMedia: core.GetBoolOrDefaultValue(params.Get(meetingapi.RecordFullDurationMediaParam).Value, cfg.Recording.RecordFullDurationMedia),
		KeepEvents:              core.GetBoolOrDefaultValue(params.Get(meetingapi.KeepEventsParam).Value, cfg.Recording.KeepEvents),
	}
}

func voiceSettings(params bbbhttp.Params) *common.VoiceSettings {
	cfg := config.DefaultConfig()
	voiceBridge := core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.VoiceBirdgeParam).Value), "")
	return &common.VoiceSettings{
		VoiceBridge:       voiceBridge,
		VoiceConf:         voiceBridge,
		DialNumber:        core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.DialNumberParam).Value), cfg.Meeting.Voice.DialAccessNumber),
		MuteOnStart:       core.GetBoolOrDefaultValue(params.Get(meetingapi.MuteOnStartParam).Value, cfg.Meeting.Voice.MuteOnStart),
		VoiceBridgeLength: cfg.Meeting.Voice.VoiceBridgeLength,
	}
}

func welcomeSettings(params bbbhttp.Params, isBreakout bool, dialNumber string, voiceBridge string, meetingName string) *common.WelcomeSettings {
	cfg := config.DefaultConfig()
	welcomeMessageTemplate := core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.WelcomeParam).Value), cfg.Meeting.Welcome.Message.Template)
	if cfg.Meeting.Welcome.Message.Footer != "" && isBreakout {
		welcomeMessageTemplate += "<br><br>" + cfg.Meeting.Welcome.Message.Footer
	}

	welcomeMessage := replaceKeywords(welcomeMessageTemplate, dialNumber, voiceBridge, meetingName, cfg.Server.BigBlueButton.URL)

	modOnlyMsg := core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.ModOnlyMessageParam).Value), "")
	if modOnlyMsg != "" {
		modOnlyMsg = replaceKeywords(modOnlyMsg, dialNumber, voiceBridge, meetingName, cfg.Server.BigBlueButton.URL)
	}

	return &common.WelcomeSettings{
		WelcomeMsgTemplate: welcomeMessageTemplate,
		WelcomeMsg:         welcomeMessage,
		ModOnlyMsg:         modOnlyMsg,
	}
}

func usersSettings(params bbbhttp.Params) *common.UserSettings {
	cfg := config.DefaultConfig()
	maxUserConcurentAccess := cfg.Meeting.Users.MaxConcurrentAccess
	if !cfg.Meeting.Users.AllowDuplicateExtUserId {
		maxUserConcurentAccess = 1
	}
	return &common.UserSettings{
		MaxUsers:                  core.GetInt32OrDefaultValue(params.Get(meetingapi.MaxParticipantsParam).Value, cfg.Meeting.Users.Max),
		MaxUserConcurrentAccesses: maxUserConcurentAccess,
		WebcamsOnlyForMod:         core.GetBoolOrDefaultValue(params.Get(meetingapi.WebcamsOnlyForModParam).Value, cfg.Meeting.Cameras.ModOnly),
		UserCameraCap:             core.GetInt32OrDefaultValue(params.Get(meetingapi.UserCameraCapParam).Value, cfg.User.Camera.Cap),
		GuestPolicy:               core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.GuestPolicyParam).Value), cfg.Meeting.Users.GuestPolicy),
		MeetingLayout:             core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.MeetingLayoutParam).Value), cfg.Meeting.Layout),
		AllowModsUnmuteUsers:      core.GetBoolOrDefaultValue(params.Get(meetingapi.AllowModsToUnmuteUsersParam).Value, cfg.Meeting.Users.AllowModsToUnmute),
		AllowModsEjectCameras:     core.GetBoolOrDefaultValue(params.Get(meetingapi.AllowModsToEjectCameraParam).Value, cfg.Meeting.Cameras.AllowModsToEject),
		AuthenticatedGuest:        cfg.Meeting.Users.AuthenticatedGuest,
		AllowPromoteGuest:         core.GetBoolOrDefaultValue(params.Get(meetingapi.AllowPromoteGuestToModeratorParam).Value, cfg.Meeting.Users.AllowPromoteGuest),
		WaitingGuestUsersTimeout:  cfg.User.Guest.WaitingTimeout,
	}
}

func metadataSettings(params bbbhttp.Params) *common.MetadataSettings {
	r, _ := regexp.Compile("meta_[a-zA-Z][a-zA-Z0-9-]*$")
	metadata := make(map[string]string)
	for k, v := range params {
		if r.MatchString(k) {
			metadata[strings.ToLower(strings.TrimPrefix(k, "meta_"))] = v[0].Value
		}
	}
	return &common.MetadataSettings{
		Metadata: metadata,
	}
}

func lockSettings(params bbbhttp.Params) *common.LockSettings {
	cfg := config.DefaultConfig()
	disableNotes := core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsDiableNotesParam).Value, cfg.Meeting.Lock.Disable.Notes)
	disableNotes = core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsDisableNoteParam).Value, disableNotes)

	return &common.LockSettings{
		DisableCam:             core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsDisableCamParam).Value, cfg.Meeting.Lock.Disable.Cam),
		DisableMic:             core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsDisableMicParam).Value, cfg.Meeting.Lock.Disable.Mic),
		DisablePrivateChat:     core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsDisablePrivateChatParam).Value, cfg.Meeting.Lock.Disable.Chat.Private),
		DisablePublicChat:      core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsDiablePublicChatParam).Value, cfg.Meeting.Lock.Disable.Chat.Public),
		DisableNotes:           disableNotes,
		HideUserList:           core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsHideUserListParam).Value, cfg.Meeting.Lock.Hide.UserList),
		LockOnJoin:             core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsLockOnJoinParam).Value, cfg.Meeting.Lock.OnJoin),
		LockOnJoinConfigurable: core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsOnJoinConfigurableParam).Value, cfg.Meeting.Lock.OnJoinConfigurable),
		HideViewersCursor:      core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsHideViewersCursorParam).Value, cfg.Meeting.Lock.Hide.ViewersCursor),
		HideViewersAnnotation:  core.GetBoolOrDefaultValue(params.Get(meetingapi.LockSettingsHideViewersAnnotationParam).Value, cfg.Meeting.Lock.Hide.ViewersAnnotation),
	}
}

func systemSettings(params bbbhttp.Params) *common.SystemSettings {
	cfg := config.DefaultConfig()
	logoutURL := core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.LogoutURLParam).Value), "")
	defaultLogoutURL := cfg.Server.BigBlueButton.LogoutURL
	if logoutURL == "" {
		if defaultLogoutURL == "" || defaultLogoutURL == meetingapi.DefaultLogoutURL {
			logoutURL = cfg.Server.BigBlueButton.URL
		} else {
			logoutURL = defaultLogoutURL
		}
	}

	var (
		useLogo     = cfg.Server.BigBlueButton.Logo.Default.Use
		useDarkLogo = cfg.Server.BigBlueButton.Logo.Default.UseDark
	)

	customLogoURL := core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.LogoParam).Value), "")
	if customLogoURL == "" && useLogo {
		customLogoURL = cfg.DefaultLogoURL()
	}

	customDarkLogoURL := core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.DarkLogoParam).Value), "")
	if customDarkLogoURL == "" && customLogoURL != "" {
		customDarkLogoURL = customLogoURL
	} else if useDarkLogo {
		customDarkLogoURL = cfg.DefaultDarkLogoURL()
	} else if !useDarkLogo && useLogo {
		customDarkLogoURL = cfg.DefaultLogoURL()
	}

	return &common.SystemSettings{
		LoginUrl:          core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.LoginURLParam).Value), ""),
		LogoutUrl:         logoutURL,
		CustomLogoUrl:     customLogoURL,
		CustomDarkLogoUrl: customDarkLogoURL,
		BannerText:        core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.BannerTextParam).Value), ""),
		BannerColour:      core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.BannerColourParam).Value), ""),
	}
}

func groupSettings(params bbbhttp.Params) []*common.GroupSettings {
	type Group struct {
		Id     string   `json:"id"`
		Name   string   `json:"name"`
		Roster []string `json:"roster"`
	}

	var groups []Group
	if groupsParam := params.Get(meetingapi.GroupsParam).Value; groupsParam != "" {
		if err := json.Unmarshal([]byte(groupsParam), &groups); err != nil {
			slog.Error("failed to unmarshal groups parameter", "error", err)
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

func pluginSettings(params bbbhttp.Params) *common.PluginSettings {
	cfg := config.DefaultConfig()

	var pluginManifests []*common.PluginManifest
	for _, m := range cfg.Plugins.Manifests {
		pluginManifests = append(pluginManifests, &common.PluginManifest{
			Url: m,
		})
	}

	if manifestData := core.GetStringOrDefaultValue(validation.StripCtrlChars(params.Get(meetingapi.PluginManifests).Value), ""); manifestData != "" {
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
	keywords := []string{meetingapi.DialNum, meetingapi.ConfNum, meetingapi.ConfName, meetingapi.ServerUrl}
	for _, v := range keywords {
		switch v {
		case meetingapi.DialNum:
			message = strings.ReplaceAll(message, meetingapi.DialNum, dialNumber)
		case meetingapi.ConfNum:
			message = strings.ReplaceAll(message, meetingapi.ConfNum, voiceBridge)
		case meetingapi.ConfName:
			message = strings.ReplaceAll(message, meetingapi.ConfName, meetingName)
		case meetingapi.ServerUrl:
			message = strings.ReplaceAll(message, meetingapi.ServerUrl, url)
		}
	}
	return message
}

type CreateMeetingToResponse struct{}

func (c *CreateMeetingToResponse) Transform(msg pipeline.Message[*meeting.CreateMeetingResponse]) (pipeline.Message[*meetingapi.CreateMeetingResponse], error) {
	meetingInfo := msg.Payload.CreatedMeetingInfo
	resp := &meetingapi.CreateMeetingResponse{
		ReturnCode:           responses.ReturnCodeSuccess,
		MeetingId:            meetingInfo.MeetingExtId,
		InternalMeetingId:    meetingInfo.MeetingIntId,
		ParentMeetingId:      meetingInfo.ParentMeetingId,
		AttendeePW:           meetingInfo.AttendeePw,
		ModeratorPW:          meetingInfo.ModeratorPw,
		CreateTime:           meetingInfo.CreateTime,
		VoiceBridge:          meetingInfo.VoiceBridge,
		DialNumber:           meetingInfo.DialNumber,
		CreateDate:           meetingInfo.CreateDate,
		HasUserJoined:        meetingInfo.HasUserJoined,
		Duration:             meetingInfo.Duration,
		HasBeenForciblyEnded: meetingInfo.HasBeenForciblyEnded,
	}

	if meetingInfo.IsDuplicate {
		resp.MessageKey = responses.CreateMeetingDuplicateKey
		resp.Message = responses.CreateMeetingDuplicateMsg
	} else {
		// TODO: Convert presentations
	}

	return pipeline.NewMessageWithContext(resp, msg.Context()), nil
}
