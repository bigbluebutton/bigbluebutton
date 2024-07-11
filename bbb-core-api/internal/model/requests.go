package model

type CreateRequest struct {
	Name            string
	MeetingId       string
	VoiceBridge     string
	AttendeePw      string
	ModeratorPw     string
	IsBreakoutRoom  string
	ParentMeetingId string
	Record          string
}

type IsMeetingRunningRequest struct {
	MeetingId string
}

type GetMeetingInfoRequest struct {
	MeetingId string
}

type GetMeetingsRequest struct {
	MeetingId string
}
