// Package meeting provides the functionality for handling
// requests to the BigBlueButton meeting API and communicating
// with Akka Apps.
package meeting

import (
	"encoding/xml"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"google.golang.org/grpc"
)

// A Response is a standard response that may be returned by
// multiple endpoints.
type Response struct {
	XMLName    xml.Name  `xml:"response"`
	ReturnCode string    `xml:"returncode"`
	MessageKey string    `xml:"messageKey,omitempty"`
	Message    string    `xml:"message,omitempty"`
	Running    *bool     `xml:"running,omitempty"`
	Meetings   *Meetings `xml:"meetings,omitempty"`
}

// MapData is a wrapper for custom parameters that may be passed
// to or returned from various endpoints.
type MapData struct {
	Data    map[string]string
	TagName string
}

// Meetings is a wrapper for a slice of type [Meeting].
type Meetings struct {
	Meetings []Meeting `xml:"meetings"`
}

// Users is a wrapper for a slice of type [User].
type Users struct {
	Users []User `xml:"attendee"`
}

// A User is a collection of information related to a
// BigBlueButton user.
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

// BreakoutRooms is a wrapper for a slice of strings
// containing breakout room IDs.
type BreakoutRooms struct {
	XMLName  xml.Name `xml:"breakoutRooms"`
	Breakout []string `xml:"breakout"`
}

// A User is a collection of information related to a
// BigBlueButton user.
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

// GetMeetingInfoResponse is the response returned from the
// GetMeetingInfo endpoint.
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

// CreateMeetingResponse is the response returned from the
// CreateMeeting endpoint.
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

// MarshalXML is the custom XML marshaling function for marshaling [MapData].
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

// A Client wraps the functionality for communicating
// with Akka Apps through the gRPC [MeetingService] and
// other basic HTTP functionality.
type Client interface {
	meeting.MeetingServiceClient
	bbbhttp.Client
}

// DefaultClient is the primary [Client] implementation
// that should be used within the Meeting API. Basic
// HTTP requests a made using a custom HTTP client that
// does not follow redirects by default.
type DefaultClient struct {
	meeting.MeetingServiceClient
	*bbbhttp.NoRedirectClient
}

// NewClientWithConn creates a new [DefaultClient] using
// the provided gRPC client connnection to build a gRPC
// [MeetingService] client.
func NewClientWithConn(conn *grpc.ClientConn) *DefaultClient {
	return NewClientWithServiceClient(meeting.NewMeetingServiceClient(conn))
}

// NewClientWithServiceClient creates a new [DefaultClient]
// using the provided gRPC [MeetingService] client.
func NewClientWithServiceClient(serviceClient meeting.MeetingServiceClient) *DefaultClient {
	return &DefaultClient{
		MeetingServiceClient: serviceClient,
		NoRedirectClient:     bbbhttp.NewNoRedirectClient(60 * time.Second),
	}
}
