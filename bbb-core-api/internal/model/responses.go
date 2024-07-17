package model

import (
	"encoding/xml"

	common "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/common"
)

const (
	ValidationErrorKey = "validationError"

	ReturnCodeSuccess string = "SUCCESS"
	ReturnCodeFailure string = "FAILED"

	UnknownErrorKey string = "unknownError"
	UnknownErrorMsg string = "An unknown error occurred"

	ChecksumErrorKey string = "checksumError"
	ChecksumErrorMsg string = "Checksums do not match."

	ContentTypeErrorKey string = "unsupportedContentType"
	ContentTypeErrorMsg string = "POST request Content-Type is missing or unsupported"

	InvalidRequestBodyKey string = "invalidRequestBody"
	InvalidRequestBodyMsg string = "Invalid request body"

	MeetingIdMissingErrorKey string = "missingParamMeetingID"
	MeetingIdMissingErrorMsg string = "You must provide a meeting ID."

	MeetingIdLengthErrorKey string = ValidationErrorKey
	MeetingIdLengthErrorMsg string = "Meeting ID must be between 2 and 256 characters."

	MeetingIdFormatErrorKey string = ValidationErrorKey
	MeetingIdFormatErrorMsg string = "Meeting ID cannot contain ','."

	MeetingIdNotUniqueErrorKey string = "idNotUnique"
	MeetingIdNotUniqueErrorMsg string = "A meeting already exists with that meeting ID.  Please use a different meeting ID."

	MeetingNameMissingErrorKey string = ValidationErrorKey
	MeetingNameMissingErrorMsg string = "You must provide a meeting name."

	MeetingNameSizeErrorKey string = ValidationErrorKey
	MeetingNameSizeErrorMsg string = "Meeting name must be between 2 and 256 characters."

	VoiceBridgeFormatErrorKey string = ValidationErrorKey
	VoiceBridgeFormatErrorMsg string = "Voice bridge must be an integer."

	VoiceBridgeInUserErrorKey string = "nonUniqueVoiceBridge"
	VoiceBridgeInUserErrorMsg string = "The selected voice bridge is already in use."

	PasswordLengthErrorKey = "invalidPassword"
	PasswordLengthErrorMsg = "Passwords must be between 2 and 64 character in length"

	IsBreakoutRoomFormatErrorKey string = ValidationErrorKey
	IsBreakoutRoomFormatErrorMsg string = "You must provide a boolean value (true or false) for the breakout room"

	RecordFormatErrorKey string = ValidationErrorKey
	RecordFormatErrorMsg string = "Record must be a boolean value (true or false)"

	ParentMeetingIdMissingErrorKey string = "parentMeetingIDMissing"
	ParentMeetingIdMissingErrorMsg string = "No parent meeting ID was provided for the breakout room"

	ParentMeetingDoesNotExistErrorKey string = "parentMeetingDoesNotExist"
	ParentMeetingDoesNotExistErrorMsg string = "No parent meeting exists for the breakout room"

	CreateMeetingErrorKey string = "createFailed"
	CreateMeetingErrorMsg string = "Failed to create meeting"

	CreateMeetingDuplicateKey string = "duplicateWarning"
	CreateMeetingDuplicateMsg string = "This conference was already in existence and may currently be in progress."
)

type Response struct {
	XMLName    xml.Name  `xml:"response"`
	ReturnCode string    `xml:"returncode"`
	MessageKey string    `xml:"messageKey,omitempty"`
	Message    string    `xml:"message,omitempty"`
	Running    *bool     `xml:"running,omitempty"`
	Meetings   *Meetings `xml:"meetings,omitempty"`
}

type MapData struct {
	Data    map[string]string
	TagName string
}

type Meetings struct {
	Meetings []Meeting `xml:"meetings"`
}

type Users struct {
	Users []User `xml:"attendee"`
}

type User struct {
	XMLName         xml.Name `xml:"attendee"`
	UserId          string   `xml:"userID"`
	FullName        string   `xml:"fullName"`
	Role            string   `xml:"role"`
	IsPresenter     bool     `xml:"isPresenter"`
	IsListeningOnly bool     `xml:"isListeningOnly"`
	HasJoinedVoice  bool     `xml:"hasJoinedVoice"`
	HasVideo        bool     `xml:"hasVideo"`
	ClientType      string   `xml:"clientType"`
	CustomData      MapData
}

type BreakoutRooms struct {
	XMLName  xml.Name `xml:"breakoutRooms"`
	Breakout []string `xml:"breakout"`
}

type Meeting struct {
	XMLName               xml.Name `xml:"meeting"`
	MeetingName           string   `xml:"meetingName"`
	MeetingId             string   `xml:"meetingID"`
	InternalMeetingId     string   `xml:"internalMeetingID"`
	CreateTime            int64    `xml:"createTime"`
	CreateDate            string   `xml:"createDate"`
	VoiceBridge           string   `xml:"voiceBridge"`
	DialNumber            string   `xml:"dialNumber"`
	AttendeePW            string   `xml:"attendeePW"`
	ModeratorPW           string   `xml:"moderatorPW"`
	Running               bool     `xml:"running"`
	Duration              int32    `xml:"duration"`
	HasUserJoined         bool     `xml:"hasUserJoined"`
	Recording             bool     `xml:"recording"`
	HasBeenForciblyEnded  bool     `xml:"hasBeenForciblyEnded"`
	StartTime             int64    `xml:"startTime"`
	EndTime               int64    `xml:"endTime"`
	ParticipantCount      int32    `xml:"participantCount"`
	ListenerCount         int32    `xml:"listenerCount"`
	VoiceParticipantCount int32    `xml:"voiceParticipantCount"`
	VideoCount            int32    `xml:"videoCount"`
	MaxUsers              int32    `xml:"maxUsers"`
	ModeratorCount        int32    `xml:"moderatorCount"`
	Users                 Users    `xml:"attendees"`
	Metadata              MapData
	IsBreakout            bool          `xml:"isBreakout"`
	BreakoutRooms         BreakoutRooms `xml:"breakoutRooms"`
}

type GetMeetingInfoResponse struct {
	XMLName               xml.Name `xml:"response"`
	ReturnCode            string   `xml:"returncode"`
	MeetingName           string   `xml:"meetingName"`
	MeetingId             string   `xml:"meetingID"`
	InternalMeetingId     string   `xml:"internalMeetingID"`
	CreateTime            int64    `xml:"createTime"`
	CreateDate            string   `xml:"createDate"`
	VoiceBridge           string   `xml:"voiceBridge"`
	DialNumber            string   `xml:"dialNumber"`
	AttendeePW            string   `xml:"attendeePW"`
	ModeratorPW           string   `xml:"moderatorPW"`
	Running               bool     `xml:"running"`
	Duration              int32    `xml:"duration"`
	HasUserJoined         bool     `xml:"hasUserJoined"`
	Recording             bool     `xml:"recording"`
	HasBeenForciblyEnded  bool     `xml:"hasBeenForciblyEnded"`
	StartTime             int64    `xml:"startTime"`
	EndTime               int64    `xml:"endTime"`
	ParticipantCount      int32    `xml:"participantCount"`
	ListenerCount         int32    `xml:"listenerCount"`
	VoiceParticipantCount int32    `xml:"voiceParticipantCount"`
	VideoCount            int32    `xml:"videoCount"`
	MaxUsers              int32    `xml:"maxUsers"`
	ModeratorCount        int32    `xml:"moderatorCount"`
	Users                 Users    `xml:"attendees"`
	Metadata              MapData
	IsBreakout            bool `xml:"isBreakout"`
	BreakoutRooms         BreakoutRooms
}

type CreateMeetingResponse struct {
	XMLName              xml.Name `xml:"response"`
	ReturnCode           string   `xml:"returnCode"`
	MeetingId            string   `xml:"meetingID"`
	InternalMeetingId    string   `xml:"internalMeetingID"`
	ParentMeetingId      string   `xml:"parentMeetingID"`
	AttendeePW           string   `xml:"attendeePW,omitempty"`
	ModeratorPW          string   `xml:"moderatorPw,omitempty"`
	CreateTime           int64    `xml:"createTime"`
	VoiceBridge          string   `xml:"voiceBridge"`
	DialNumber           string   `xml:"dialNumber"`
	CreateDate           string   `xml:"createDate"`
	HasUserJoined        bool     `xml:"hasUserJoined"`
	Duration             int32    `xml:"duration"`
	HasBeenForciblyEnded bool     `xml:"hasBeenForciblyEnded"`
	MessageKey           string   `xml:"messageKey"`
	Message              string   `xml:"message"`
}

func (m MapData) MarshalXML(e *xml.Encoder, start xml.StartElement) error {
	tagName := "metadata"
	if m.TagName != "" {
		tagName = m.TagName
	}

	start.Name = xml.Name{Local: tagName}
	tokens := []xml.Token{start}

	for k, v := range m.Data {
		t := xml.StartElement{Name: xml.Name{Local: k}}
		tokens = append(tokens, t, xml.CharData(v), xml.EndElement{Name: t.Name})
	}

	tokens = append(tokens, xml.EndElement{Name: start.Name})

	for _, t := range tokens {
		if err := e.EncodeToken(t); err != nil {
			return err
		}
	}

	return e.Flush()
}

func MapToMapData(data map[string]string, tagName string) MapData {
	return MapData{Data: data, TagName: tagName}
}

func GrpcUserToRespUser(u *common.User) User {
	customData := MapToMapData(u.CustomData, "customdata")

	user := User{
		UserId:          u.UserId,
		FullName:        u.FullName,
		Role:            u.Role,
		IsPresenter:     u.IsPresenter,
		IsListeningOnly: u.IsListeningOnly,
		HasJoinedVoice:  u.HasJoinedVoice,
		HasVideo:        u.HasVideo,
		ClientType:      u.ClientType,
		CustomData:      customData,
	}

	return user
}

func MeetingInfoToMeeting(m *common.MeetingInfo) Meeting {
	metadata := MapToMapData(m.Metadata, "metadata")

	users := make([]User, 0, len(m.Users))
	for _, u := range m.Users {
		user := GrpcUserToRespUser(u)
		users = append(users, user)
	}

	meeting := Meeting{
		MeetingName:           m.MeetingName,
		MeetingId:             m.MeetingExtId,
		InternalMeetingId:     m.MeetingIntId,
		CreateTime:            m.DurationInfo.CreateTime,
		CreateDate:            m.DurationInfo.CreatedOn,
		VoiceBridge:           m.VoiceBridge,
		DialNumber:            m.DialNumber,
		AttendeePW:            m.AttendeePw,
		ModeratorPW:           m.ModeratorPw,
		Running:               m.DurationInfo.IsRunning,
		Duration:              m.DurationInfo.Duration,
		HasUserJoined:         m.ParticipantInfo.HasUserJoined,
		Recording:             m.Recording,
		HasBeenForciblyEnded:  m.DurationInfo.HasBeenForciblyEnded,
		StartTime:             m.DurationInfo.StartTime,
		EndTime:               m.DurationInfo.EndTime,
		ParticipantCount:      m.ParticipantInfo.ParticipantCount,
		ListenerCount:         m.ParticipantInfo.ListenerCount,
		VoiceParticipantCount: m.ParticipantInfo.VoiceParticipantCount,
		VideoCount:            m.ParticipantInfo.VideoCount,
		MaxUsers:              m.ParticipantInfo.MaxUsers,
		ModeratorCount:        m.ParticipantInfo.ModeratorCount,
		Users:                 Users{Users: users},
		Metadata:              metadata,
		IsBreakout:            m.BreakoutInfo.IsBreakout,
		BreakoutRooms:         BreakoutRooms{Breakout: m.BreakoutRooms},
	}

	return meeting
}
