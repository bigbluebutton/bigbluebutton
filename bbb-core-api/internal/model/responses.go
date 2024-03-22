package model

import (
	"encoding/xml"

	common "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/common"
	"google.golang.org/grpc/status"
)

const (
	ReturnCodeSuccess string = "SUCCESS"
	ReturnCodeFailure string = "FAILED"

	ChecksumErrorKey string = "checksumError"
	ChecksumErrorMsg string = "Checksums do not match"

	MeetingIdMissingErrorKey string = "missingParamMeetingID"
	MeetingIdMissingErrorMsg string = "You must provide a meeting ID"

	MeetingIdLengthErrorKey string = "validationError"
	MeetingIdLengthErrorMsg string = "Meeting ID must be between 2 and 256 characters"

	MeetingIdFormatErrorKey string = "validationError"
	MeetingIdFormatErrorMsg string = "Meeting ID cannot contain ','"
)

type Entry struct {
	XmlName xml.Name
	Value   string `xml:",chardata"`
}

type Mappable interface {
	Populate(entries []Entry)
}

type Metadata struct {
	XMLName xml.Name `xml:"metadata"`
	Entries []Entry  `xml:",any"`
}

func (m *Metadata) Populate(entries []Entry) {
	m.Entries = entries
}

type CustomData struct {
	XMLName xml.Name `xml:"customdata"`
	Entries []Entry  `xml:",any"`
}

func (c *CustomData) Populate(entries []Entry) {
	c.Entries = entries
}

type Response struct {
	XMLName    xml.Name  `xml:"response"`
	ReturnCode string    `xml:"returncode"`
	MessageKey string    `xml:"messageKey,omitempty"`
	Message    string    `xml:"message,omitempty"`
	Running    *bool     `xml:"running,omitempty"`
	Meetings   *Meetings `xml:"meetings,omitempty"`
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
	CustomData      CustomData
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
	EndTime               int64    `xml:"EndTime"`
	ParticipantCount      int32    `xml:"participantCount"`
	ListenerCount         int32    `xml:"listenerCount"`
	VoiceParticipantCount int32    `xml:"voiceParticipantCount"`
	VideoCount            int32    `xml:"videoCount"`
	MaxUsers              int32    `xml:"maxUsers"`
	ModeratorCount        int32    `xml:"moderatorCount"`
	Users                 Users    `xml:"attendees"`
	Metadata              Metadata
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
	EndTime               int64    `xml:"EndTime"`
	ParticipantCount      int32    `xml:"participantCount"`
	ListenerCount         int32    `xml:"listenerCount"`
	VoiceParticipantCount int32    `xml:"voiceParticipantCount"`
	VideoCount            int32    `xml:"videoCount"`
	MaxUsers              int32    `xml:"maxUsers"`
	ModeratorCount        int32    `xml:"moderatorCount"`
	Users                 Users    `xml:"attendees"`
	Metadata              Metadata
	IsBreakout            bool `xml:"isBreakout"`
	BreakoutRooms         BreakoutRooms
}

func MarshalMapToXML(data map[string]string, mappable Mappable) {
	entries := make([]Entry, 0, len(data))
	for key, value := range data {
		entries = append(entries, Entry{
			XmlName: xml.Name{Local: key},
			Value:   value,
		})
	}
	mappable.Populate(entries)
}

func GrpcUserToRespUser(u *common.User) User {
	customData := &CustomData{}
	MarshalMapToXML(u.CustomData, customData)

	user := User{
		UserId:          u.UserId,
		FullName:        u.FullName,
		Role:            u.Role,
		IsPresenter:     u.IsPresenter,
		IsListeningOnly: u.IsListeningOnly,
		HasJoinedVoice:  u.HasJoinedVoice,
		HasVideo:        u.HasVideo,
		ClientType:      u.ClientType,
		CustomData:      *customData,
	}

	return user
}

func MeetingInfoToMeeting(m *common.MeetingInfo) Meeting {
	metadata := &Metadata{}
	MarshalMapToXML(m.Metadata, metadata)

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
		Metadata:              *metadata,
		IsBreakout:            m.BreakoutInfo.IsBreakout,
		BreakoutRooms:         BreakoutRooms{Breakout: m.BreakoutRooms},
	}

	return meeting
}

func GrpcErrorToErrorResp(err error) Response {
	st, ok := status.FromError(err)
	if ok {
		for _, detail := range st.Details() {
			switch t := detail.(type) {
			case *common.ErrorResponse:
				return Response{
					ReturnCode: ReturnCodeFailure,
					MessageKey: t.Key,
					Message:    t.Message,
				}
			}
		}
	}

	return Response{
		ReturnCode: ReturnCodeFailure,
		MessageKey: "error",
		Message:    "A unknown error occurred",
	}
}
