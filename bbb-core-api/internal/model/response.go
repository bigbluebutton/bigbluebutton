package model

import "encoding/xml"

const (
	Success string = "SUCCESS"
	Failure string = "FAILED"
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

func MarshMapToXML(data map[string]string, mappable Mappable) {
	entries := make([]Entry, 0, len(data))
	for key, value := range data {
		entries = append(entries, Entry{
			XmlName: xml.Name{Local: key},
			Value:   value,
		})
	}
	mappable.Populate(entries)
}
