package meeting

const (
	RetryPolicy = `{
		"methodConfig": [{
			"name": [{"service": "org.bigbluebutton.protos.BbbCoreService"}],
			"waitForReady": true,
	
			"retryPolicy": {
				"MaxAttempts": 5,
				"InitialBackoff": ".01s",
				"MaxBackoff": ".1s",
				"BackoffMultiplier": 2.0,
				"RetryableStatusCodes": [ "UNAVAILABLE" ]
			}
		}]
	}`

	BreakoutRoomsCaptureSlides         = false
	BreakoutRoomsCaptureNotes          = false
	BreakoutRoomsCaptureSlidesFileName = "%%CONFNAME%%"
	BreakoutRoomsCaptureNotesFileName  = "%%CONFNAME%%"
	DialNum                            = "%%DIALNUM%%"
	ConfNum                            = "%%CONFNUM%%"
	ConfName                           = "%%CONFNAME%%"
	ServerUrl                          = "%%SERVERURL%%"

	IDParam                            = "meetingID"
	NameParam                          = "name"
	VoiceBirdgeParam                   = "voiceBridge"
	AttendeePWParam                    = "attendeePW"
	ModeratorPWParam                   = "moderatorPW"
	IsBreakoutRoomParam                = "isBreakout"
	ParentMeetingIDParam               = "parentMeetingId"
	RecordParam                        = "record"
	SequenceParam                      = "sequence"
	FreeJoinParam                      = "freeJoin"
	DisabledFeaturesParam              = "disabledFeatures"
	CameraCapParam                     = "meetingCameraCap"
	MaxPinnedCamerasParam              = "maxPinnedCameras"
	CameraBridgeParam                  = "cameraBridge"
	ScreenShareBridgeParam             = "screenShareBridge"
	AudioBridgeParam                   = "audioBridge"
	NotifyRecordingIsOnParam           = "notfiyRecordingIsOn"
	PresUploadExtDescParam             = "presentationUploadExternalDescription"
	PresUploadExtURLParam              = "presentationUploadExternalUrl"
	DurationParam                      = "duration"
	MeetingExpireNoUseJoinedParam      = "meetingExpireIfNoUserJoinedInMinutes"
	MeetingExpireLastUserLeftParam     = "meetingExpireWhenLastUserLeftInMinutes"
	EndWhenNoModeratorParam            = "endWhenNoModerator"
	EndWhenNoModeratorDelayParam       = "endWhenNoModeratorDelayInMinutes"
	LearningDashboardCleanupDelayParam = "learningDashboardCleanupDelayInMinutes"
	AutoStartRecordingParam            = "autoStartRecording"
	AllowStartStopRecordingParam       = "allowStartStopRecording"
	RecordFullDurationMediaParam       = "recordFullDurationMedia"
	KeepEventsParam                    = "meetingKeepEvents"
	DialNumberParam                    = "dialNumber"
	MuteOnStartParam                   = "muteOnStart"
	WelcomeParam                       = "welcome"
	ModOnlyMessageParam                = "moderatorOnlyMessage"
	MaxParticipantsParam               = "maxParticipants"
	WebcamsOnlyForModParam             = "webcamsOnlyForModerator"
	UserCameraCapParam                 = "userCameraCap"
	GuestPolicyParam                   = "guestPolicy"
	MeetingLayoutParam                 = "meetingLayout"
	AllowModsToUnmuteUsersParam        = "allowModsToUnmuteUsers"
	AllowModsToEjectCameraParam        = "allowModsToEjectCameras"
	AllowPromoteGuestToModeratorParam  = "allowPromoteGuestToModerator"

	LockSettingsDiableNotesParam           = "lockSettingsDisableNotes"
	LockSettingsDisableNoteParam           = "lockSettingsDisableNote"
	LockSettingsDisableCamParam            = "lockSettingsDisbaleCam"
	LockSettingsDisableMicParam            = "lockSettingsDisableMic"
	LockSettingsDisablePrivateChatParam    = "lockSettingsDisablePrivateChat"
	LockSettingsDiablePublicChatParam      = "lockSettingsDisablePublicChat"
	LockSettingsHideUserListParam          = "lockSettingsHideUserList"
	LockSettingsLockOnJoinParam            = "lockSettingsLockOnJoin"
	LockSettingsOnJoinConfigurableParam    = "lockSettingsOnJoinConfigurable"
	LockSettingsHideViewersCursorParam     = "lockSettingsHideViewersCursor"
	LockSettingsHideViewersAnnotationParam = "lockSettingsHideViewersAnnotation"

	LogoutURLParam    = "logoutURL"
	DefaultLogoutURL  = "default"
	LogoParam         = "logo"
	DarkLogoParam     = "darklogo"
	LoginURLParam     = "loginURL"
	BannerTextParam   = "bannerText"
	BannerColourParam = "bannerColor"
	GroupsParam       = "groups"

	LearningDashboardFeature = "learningDashboard"

	ClientSettingsOverrideModule = "clientSettingsOverride"
)
