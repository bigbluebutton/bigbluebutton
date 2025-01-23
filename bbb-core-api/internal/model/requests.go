package model

type CreateRequest struct {
	Name            string
	MeetingID       string
	VoiceBridge     string
	AttendeePw      string
	ModeratorPw     string
	IsBreakoutRoom  string
	ParentMeetingID string
	Record          string
}

type IsMeetingRunningRequest struct {
	MeetingID string
}

type GetMeetingInfoRequest struct {
	MeetingID string
}

type GetMeetingsRequest struct {
	MeetingID string
}

type InsertDocumentRequest struct {
	MeetingID string
}
