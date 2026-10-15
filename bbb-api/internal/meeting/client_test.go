package meeting

import (
	"context"
	"errors"
	"io"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
)

func TestMockMeetingServiceClient_IsMeetingRunning(t *testing.T) {
	tests := []struct {
		name           string
		response       *meeting.MeetingRunningResponse
		err            error
		request        *meeting.MeetingRunningRequest
		wantCallCount  int
		wantRequestLen int
	}{
		{
			name: "returns configured response",
			response: &meeting.MeetingRunningResponse{
				MeetingRunning: &common.MeetingRunning{IsRunning: true},
			},
			err: nil,
			request: &meeting.MeetingRunningRequest{
				MeetingData: &common.MeetingData{MeetingId: "test-meeting-1"},
			},
			wantCallCount:  1,
			wantRequestLen: 1,
		},
		{
			name:     "returns configured error",
			response: nil,
			err:      errors.New("connection refused"),
			request: &meeting.MeetingRunningRequest{
				MeetingData: &common.MeetingData{MeetingId: "test-meeting-2"},
			},
			wantCallCount:  1,
			wantRequestLen: 1,
		},
		{
			name: "returns false running status",
			response: &meeting.MeetingRunningResponse{
				MeetingRunning: &common.MeetingRunning{IsRunning: false},
			},
			err: nil,
			request: &meeting.MeetingRunningRequest{
				MeetingData: &common.MeetingData{MeetingId: "non-existent"},
			},
			wantCallCount:  1,
			wantRequestLen: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockMeetingServiceClient()
			mock.IsMeetingRunningResponse = tt.response
			mock.IsMeetingRunningError = tt.err

			resp, err := mock.IsMeetingRunning(context.Background(), tt.request)

			if tt.err != nil {
				if err == nil {
					t.Errorf("IsMeetingRunning() expected error %v, got nil", tt.err)
				}
				if err.Error() != tt.err.Error() {
					t.Errorf("IsMeetingRunning() error = %v, want %v", err, tt.err)
				}
			} else {
				if err != nil {
					t.Errorf("IsMeetingRunning() unexpected error = %v", err)
				}
				if resp != tt.response {
					t.Errorf("IsMeetingRunning() response = %v, want %v", resp, tt.response)
				}
			}

			if mock.CallCounts["IsMeetingRunning"] != tt.wantCallCount {
				t.Errorf("CallCounts[IsMeetingRunning] = %d, want %d", mock.CallCounts["IsMeetingRunning"], tt.wantCallCount)
			}

			if len(mock.IsMeetingRunningRequests) != tt.wantRequestLen {
				t.Errorf("len(IsMeetingRunningRequests) = %d, want %d", len(mock.IsMeetingRunningRequests), tt.wantRequestLen)
			}

			if tt.wantRequestLen > 0 && mock.IsMeetingRunningRequests[0] != tt.request {
				t.Errorf("captured request = %v, want %v", mock.IsMeetingRunningRequests[0], tt.request)
			}
		})
	}
}

func TestMockMeetingServiceClient_GetMeetingInfo(t *testing.T) {
	tests := []struct {
		name           string
		response       *meeting.MeetingInfoResponse
		err            error
		request        *meeting.MeetingInfoRequest
		wantCallCount  int
		wantRequestLen int
	}{
		{
			name: "returns meeting info",
			response: &meeting.MeetingInfoResponse{
				MeetingInfo: &common.MeetingInfo{
					MeetingExtId: "ext-123",
					MeetingIntId: "int-456",
					MeetingName:  "Test Meeting",
				},
			},
			err: nil,
			request: &meeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{MeetingId: "ext-123"},
			},
			wantCallCount:  1,
			wantRequestLen: 1,
		},
		{
			name:     "returns not found error",
			response: nil,
			err:      errors.New("meeting not found"),
			request: &meeting.MeetingInfoRequest{
				MeetingData: &common.MeetingData{MeetingId: "non-existent"},
			},
			wantCallCount:  1,
			wantRequestLen: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockMeetingServiceClient()
			mock.GetMeetingInfoResponse = tt.response
			mock.GetMeetingInfoError = tt.err

			resp, err := mock.GetMeetingInfo(context.Background(), tt.request)

			if tt.err != nil {
				if err == nil {
					t.Errorf("GetMeetingInfo() expected error %v, got nil", tt.err)
				}
			} else {
				if err != nil {
					t.Errorf("GetMeetingInfo() unexpected error = %v", err)
				}
				if resp != tt.response {
					t.Errorf("GetMeetingInfo() response = %v, want %v", resp, tt.response)
				}
			}

			if mock.CallCounts["GetMeetingInfo"] != tt.wantCallCount {
				t.Errorf("CallCounts[GetMeetingInfo] = %d, want %d", mock.CallCounts["GetMeetingInfo"], tt.wantCallCount)
			}

			if len(mock.GetMeetingInfoRequests) != tt.wantRequestLen {
				t.Errorf("len(GetMeetingInfoRequests) = %d, want %d", len(mock.GetMeetingInfoRequests), tt.wantRequestLen)
			}
		})
	}
}

func TestMockMeetingServiceClient_ListMeetings(t *testing.T) {
	tests := []struct {
		name     string
		response *meeting.ListMeetingsResponse
		err      error
		request  *meeting.ListMeetingsRequest
	}{
		{
			name: "returns list of meetings",
			response: &meeting.ListMeetingsResponse{
				Meetings: []*common.MeetingInfo{
					{MeetingExtId: "meeting-1"},
					{MeetingExtId: "meeting-2"},
				},
			},
			err:     nil,
			request: &meeting.ListMeetingsRequest{},
		},
		{
			name:     "returns error",
			response: nil,
			err:      errors.New("internal error"),
			request:  &meeting.ListMeetingsRequest{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockMeetingServiceClient()
			mock.ListMeetingsResponse = tt.response
			mock.ListMeetingsError = tt.err

			resp, err := mock.ListMeetings(context.Background(), tt.request)

			if tt.err != nil {
				if err == nil {
					t.Errorf("ListMeetings() expected error, got nil")
				}
			} else {
				if err != nil {
					t.Errorf("ListMeetings() unexpected error = %v", err)
				}
				if resp != tt.response {
					t.Errorf("ListMeetings() response mismatch")
				}
			}

			if mock.CallCounts["ListMeetings"] != 1 {
				t.Errorf("CallCounts[ListMeetings] = %d, want 1", mock.CallCounts["ListMeetings"])
			}
		})
	}
}

func TestMockMeetingServiceClient_GetMeetingsStream(t *testing.T) {
	tests := []struct {
		name            string
		responses       []*meeting.MeetingInfoResponse
		streamErr       error
		request         *meeting.GetMeetingsStreamRequest
		wantCount       int
		wantStreamError bool
	}{
		{
			name: "returns stream with multiple meetings",
			responses: []*meeting.MeetingInfoResponse{
				{MeetingInfo: &common.MeetingInfo{MeetingExtId: "meeting-1"}},
				{MeetingInfo: &common.MeetingInfo{MeetingExtId: "meeting-2"}},
				{MeetingInfo: &common.MeetingInfo{MeetingExtId: "meeting-3"}},
			},
			streamErr:       nil,
			request:         &meeting.GetMeetingsStreamRequest{},
			wantCount:       3,
			wantStreamError: false,
		},
		{
			name:            "returns empty stream",
			responses:       []*meeting.MeetingInfoResponse{},
			streamErr:       nil,
			request:         &meeting.GetMeetingsStreamRequest{},
			wantCount:       0,
			wantStreamError: false,
		},
		{
			name:            "returns stream error",
			responses:       nil,
			streamErr:       errors.New("stream unavailable"),
			request:         &meeting.GetMeetingsStreamRequest{},
			wantCount:       0,
			wantStreamError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockMeetingServiceClient()
			mock.GetMeetingsStreamResponses = tt.responses
			mock.GetMeetingsStreamError = tt.streamErr

			stream, err := mock.GetMeetingsStream(context.Background(), tt.request)

			if tt.wantStreamError {
				if err == nil {
					t.Errorf("GetMeetingsStream() expected error, got nil")
				}
				return
			}

			if err != nil {
				t.Errorf("GetMeetingsStream() unexpected error = %v", err)
				return
			}

			// Read all responses from stream
			var received []*meeting.MeetingInfoResponse
			for {
				resp, err := stream.Recv()
				if err == io.EOF {
					break
				}
				if err != nil {
					t.Errorf("Recv() unexpected error = %v", err)
					break
				}
				received = append(received, resp)
			}

			if len(received) != tt.wantCount {
				t.Errorf("received %d responses, want %d", len(received), tt.wantCount)
			}

			if mock.CallCounts["GetMeetingsStream"] != 1 {
				t.Errorf("CallCounts[GetMeetingsStream] = %d, want 1", mock.CallCounts["GetMeetingsStream"])
			}
		})
	}
}

func TestMockMeetingServiceClient_IsVoiceBridgeInUse(t *testing.T) {
	tests := []struct {
		name     string
		response *meeting.VoiceBridgeInUseResponse
		err      error
		request  *meeting.VoiceBridgeInUseRequest
	}{
		{
			name: "voice bridge in use",
			response: &meeting.VoiceBridgeInUseResponse{
				VoiceBridgeInUse: &common.VoiceBridgeInUse{InUse: true},
			},
			err: nil,
			request: &meeting.VoiceBridgeInUseRequest{
				VoiceData: &common.VoiceData{VoiceBridge: "12345"},
			},
		},
		{
			name: "voice bridge not in use",
			response: &meeting.VoiceBridgeInUseResponse{
				VoiceBridgeInUse: &common.VoiceBridgeInUse{InUse: false},
			},
			err: nil,
			request: &meeting.VoiceBridgeInUseRequest{
				VoiceData: &common.VoiceData{VoiceBridge: "99999"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockMeetingServiceClient()
			mock.IsVoiceBridgeInUseResponse = tt.response
			mock.IsVoiceBridgeInUseError = tt.err

			resp, err := mock.IsVoiceBridgeInUse(context.Background(), tt.request)

			if tt.err != nil {
				if err == nil {
					t.Errorf("IsVoiceBridgeInUse() expected error, got nil")
				}
			} else {
				if err != nil {
					t.Errorf("IsVoiceBridgeInUse() unexpected error = %v", err)
				}
				if resp != tt.response {
					t.Errorf("IsVoiceBridgeInUse() response mismatch")
				}
			}

			if mock.CallCounts["IsVoiceBridgeInUse"] != 1 {
				t.Errorf("CallCounts[IsVoiceBridgeInUse] = %d, want 1", mock.CallCounts["IsVoiceBridgeInUse"])
			}
		})
	}
}

func TestMockMeetingServiceClient_CreateMeeting(t *testing.T) {
	tests := []struct {
		name     string
		response *meeting.CreateMeetingResponse
		err      error
		request  *meeting.CreateMeetingRequest
	}{
		{
			name: "creates meeting successfully",
			response: &meeting.CreateMeetingResponse{
				CreatedMeetingInfo: &common.CreatedMeetingInfo{
					MeetingExtId: "new-meeting-123",
					MeetingIntId: "internal-456",
				},
			},
			err: nil,
			request: &meeting.CreateMeetingRequest{
				CreateMeetingSettings: &common.CreateMeetingSettings{
					MeetingSettings: &common.MeetingSettings{
						Name: "New Meeting",
					},
				},
			},
		},
		{
			name:     "returns error on duplicate",
			response: nil,
			err:      errors.New("meeting already exists"),
			request: &meeting.CreateMeetingRequest{
				CreateMeetingSettings: &common.CreateMeetingSettings{
					MeetingSettings: &common.MeetingSettings{
						Name: "Duplicate Meeting",
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockMeetingServiceClient()
			mock.CreateMeetingResponse = tt.response
			mock.CreateMeetingError = tt.err

			resp, err := mock.CreateMeeting(context.Background(), tt.request)

			if tt.err != nil {
				if err == nil {
					t.Errorf("CreateMeeting() expected error, got nil")
				}
			} else {
				if err != nil {
					t.Errorf("CreateMeeting() unexpected error = %v", err)
				}
				if resp != tt.response {
					t.Errorf("CreateMeeting() response mismatch")
				}
			}

			if mock.CallCounts["CreateMeeting"] != 1 {
				t.Errorf("CallCounts[CreateMeeting] = %d, want 1", mock.CallCounts["CreateMeeting"])
			}
		})
	}
}

func TestMockMeetingServiceClient_Reset(t *testing.T) {
	mock := NewMockMeetingServiceClient()

	// Make some calls
	mock.IsMeetingRunning(context.Background(), &meeting.MeetingRunningRequest{})
	mock.GetMeetingInfo(context.Background(), &meeting.MeetingInfoRequest{})
	mock.GetMeetingsStream(context.Background(), &meeting.GetMeetingsStreamRequest{})

	// Verify calls were recorded
	if mock.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("before reset: IsMeetingRunning count = %d, want 1", mock.CallCounts["IsMeetingRunning"])
	}
	if len(mock.IsMeetingRunningRequests) != 1 {
		t.Errorf("before reset: len(IsMeetingRunningRequests) = %d, want 1", len(mock.IsMeetingRunningRequests))
	}

	// Reset
	mock.Reset()

	// Verify all state cleared
	if mock.CallCounts["IsMeetingRunning"] != 0 {
		t.Errorf("after reset: IsMeetingRunning count = %d, want 0", mock.CallCounts["IsMeetingRunning"])
	}
	if len(mock.IsMeetingRunningRequests) != 0 {
		t.Errorf("after reset: len(IsMeetingRunningRequests) = %d, want 0", len(mock.IsMeetingRunningRequests))
	}
	if len(mock.GetMeetingInfoRequests) != 0 {
		t.Errorf("after reset: len(GetMeetingInfoRequests) = %d, want 0", len(mock.GetMeetingInfoRequests))
	}
	if len(mock.GetMeetingsStreamRequests) != 0 {
		t.Errorf("after reset: len(GetMeetingsStreamRequests) = %d, want 0", len(mock.GetMeetingsStreamRequests))
	}
}

func TestMockMeetingServiceClient_MultipleCalls(t *testing.T) {
	mock := NewMockMeetingServiceClient()
	mock.IsMeetingRunningResponse = &meeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{IsRunning: true},
	}

	// Make multiple calls
	req1 := &meeting.MeetingRunningRequest{MeetingData: &common.MeetingData{MeetingId: "meeting-1"}}
	req2 := &meeting.MeetingRunningRequest{MeetingData: &common.MeetingData{MeetingId: "meeting-2"}}
	req3 := &meeting.MeetingRunningRequest{MeetingData: &common.MeetingData{MeetingId: "meeting-3"}}

	mock.IsMeetingRunning(context.Background(), req1)
	mock.IsMeetingRunning(context.Background(), req2)
	mock.IsMeetingRunning(context.Background(), req3)

	// Verify all calls tracked
	if mock.CallCounts["IsMeetingRunning"] != 3 {
		t.Errorf("CallCounts[IsMeetingRunning] = %d, want 3", mock.CallCounts["IsMeetingRunning"])
	}

	if len(mock.IsMeetingRunningRequests) != 3 {
		t.Errorf("len(IsMeetingRunningRequests) = %d, want 3", len(mock.IsMeetingRunningRequests))
	}

	// Verify requests are in order
	if mock.IsMeetingRunningRequests[0].MeetingData.MeetingId != "meeting-1" {
		t.Errorf("first request MeetingId = %s, want meeting-1", mock.IsMeetingRunningRequests[0].MeetingData.MeetingId)
	}
	if mock.IsMeetingRunningRequests[1].MeetingData.MeetingId != "meeting-2" {
		t.Errorf("second request MeetingId = %s, want meeting-2", mock.IsMeetingRunningRequests[1].MeetingData.MeetingId)
	}
	if mock.IsMeetingRunningRequests[2].MeetingData.MeetingId != "meeting-3" {
		t.Errorf("third request MeetingId = %s, want meeting-3", mock.IsMeetingRunningRequests[2].MeetingData.MeetingId)
	}
}

func TestMockGetMeetingsStreamClient_RecvError(t *testing.T) {
	customErr := errors.New("stream interrupted")
	stream := &MockGetMeetingsStreamClient{
		responses: []*meeting.MeetingInfoResponse{
			{MeetingInfo: &common.MeetingInfo{MeetingExtId: "meeting-1"}},
		},
		recvError: customErr,
	}

	_, err := stream.Recv()
	if err != customErr {
		t.Errorf("Recv() error = %v, want %v", err, customErr)
	}
}

func TestMockHTTPClient_Download(t *testing.T) {
	tests := []struct {
		name     string
		response []byte
		err      error
		address  string
	}{
		{
			name:     "successful download",
			response: []byte("file contents"),
			err:      nil,
			address:  "http://example.com/file.pdf",
		},
		{
			name:     "download error",
			response: nil,
			err:      errors.New("download failed"),
			address:  "http://example.com/missing.pdf",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockHTTPClient()
			mock.DownloadResponse = tt.response
			mock.DownloadError = tt.err

			resp, err := mock.Download(tt.address)

			if tt.err != nil {
				if err == nil {
					t.Errorf("Download() expected error, got nil")
				}
			} else {
				if err != nil {
					t.Errorf("Download() unexpected error = %v", err)
				}
				if string(resp) != string(tt.response) {
					t.Errorf("Download() response = %s, want %s", resp, tt.response)
				}
			}

			if len(mock.DownloadCalls) != 1 {
				t.Errorf("len(DownloadCalls) = %d, want 1", len(mock.DownloadCalls))
			}
			if mock.DownloadCalls[0] != tt.address {
				t.Errorf("DownloadCalls[0] = %s, want %s", mock.DownloadCalls[0], tt.address)
			}
		})
	}
}

func TestMockHTTPClient_Follow(t *testing.T) {
	tests := []struct {
		name     string
		response string
		err      error
		address  string
		count    int
		max      int
	}{
		{
			name:     "follows redirects",
			response: "http://example.com/final",
			err:      nil,
			address:  "http://example.com/redirect",
			count:    0,
			max:      5,
		},
		{
			name:     "max redirects exceeded",
			response: "",
			err:      errors.New("max redirects exceeded"),
			address:  "http://example.com/loop",
			count:    5,
			max:      5,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockHTTPClient()
			mock.FollowResponse = tt.response
			mock.FollowError = tt.err

			resp, err := mock.Follow(tt.address, tt.count, tt.max)

			if tt.err != nil {
				if err == nil {
					t.Errorf("Follow() expected error, got nil")
				}
			} else {
				if err != nil {
					t.Errorf("Follow() unexpected error = %v", err)
				}
				if resp != tt.response {
					t.Errorf("Follow() response = %s, want %s", resp, tt.response)
				}
			}

			if len(mock.FollowCalls) != 1 {
				t.Errorf("len(FollowCalls) = %d, want 1", len(mock.FollowCalls))
			}
			if mock.FollowCalls[0].Address != tt.address {
				t.Errorf("FollowCalls[0].Address = %s, want %s", mock.FollowCalls[0].Address, tt.address)
			}
			if mock.FollowCalls[0].Count != tt.count {
				t.Errorf("FollowCalls[0].Count = %d, want %d", mock.FollowCalls[0].Count, tt.count)
			}
			if mock.FollowCalls[0].Max != tt.max {
				t.Errorf("FollowCalls[0].Max = %d, want %d", mock.FollowCalls[0].Max, tt.max)
			}
		})
	}
}

func TestMockHTTPClient_ValidateURL(t *testing.T) {
	tests := []struct {
		name    string
		err     error
		address string
	}{
		{
			name:    "valid URL",
			err:     nil,
			address: "http://example.com/file.pdf",
		},
		{
			name:    "invalid URL",
			err:     errors.New("invalid URL scheme"),
			address: "ftp://example.com/file",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := NewMockHTTPClient()
			mock.ValidateURLError = tt.err

			err := mock.ValidateURL(tt.address)

			if tt.err != nil {
				if err == nil {
					t.Errorf("ValidateURL() expected error, got nil")
				}
			} else {
				if err != nil {
					t.Errorf("ValidateURL() unexpected error = %v", err)
				}
			}

			if len(mock.ValidateCalls) != 1 {
				t.Errorf("len(ValidateCalls) = %d, want 1", len(mock.ValidateCalls))
			}
			if mock.ValidateCalls[0] != tt.address {
				t.Errorf("ValidateCalls[0] = %s, want %s", mock.ValidateCalls[0], tt.address)
			}
		})
	}
}

func TestMockHTTPClient_Reset(t *testing.T) {
	mock := NewMockHTTPClient()

	// Make some calls
	mock.Download("http://example.com/file1")
	mock.Follow("http://example.com/redirect", 0, 5)
	mock.ValidateURL("http://example.com/check")

	// Verify calls were recorded
	if len(mock.DownloadCalls) != 1 {
		t.Errorf("before reset: len(DownloadCalls) = %d, want 1", len(mock.DownloadCalls))
	}

	// Reset
	mock.Reset()

	// Verify all state cleared
	if len(mock.DownloadCalls) != 0 {
		t.Errorf("after reset: len(DownloadCalls) = %d, want 0", len(mock.DownloadCalls))
	}
	if len(mock.FollowCalls) != 0 {
		t.Errorf("after reset: len(FollowCalls) = %d, want 0", len(mock.FollowCalls))
	}
	if len(mock.ValidateCalls) != 0 {
		t.Errorf("after reset: len(ValidateCalls) = %d, want 0", len(mock.ValidateCalls))
	}
}

func TestMockClient_Combined(t *testing.T) {
	mock := NewMockClient()

	// Configure gRPC mock
	mock.IsMeetingRunningResponse = &meeting.MeetingRunningResponse{
		MeetingRunning: &common.MeetingRunning{IsRunning: true},
	}

	// Configure HTTP mock
	mock.DownloadResponse = []byte("file contents")

	// Test gRPC call
	grpcResp, err := mock.IsMeetingRunning(context.Background(), &meeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{MeetingId: "test-meeting"},
	})
	if err != nil {
		t.Errorf("IsMeetingRunning() unexpected error = %v", err)
	}
	if !grpcResp.MeetingRunning.IsRunning {
		t.Errorf("IsMeetingRunning() IsRunning = false, want true")
	}

	// Test HTTP call
	httpResp, err := mock.Download("http://example.com/file")
	if err != nil {
		t.Errorf("Download() unexpected error = %v", err)
	}
	if string(httpResp) != "file contents" {
		t.Errorf("Download() response = %s, want 'file contents'", httpResp)
	}

	// Verify both mocks tracked calls
	if mock.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("CallCounts[IsMeetingRunning] = %d, want 1", mock.CallCounts["IsMeetingRunning"])
	}
	if len(mock.DownloadCalls) != 1 {
		t.Errorf("len(DownloadCalls) = %d, want 1", len(mock.DownloadCalls))
	}
}

func TestMockClient_Reset(t *testing.T) {
	mock := NewMockClient()

	// Make calls to both mocks
	mock.IsMeetingRunning(context.Background(), &meeting.MeetingRunningRequest{})
	mock.Download("http://example.com/file")

	// Verify calls recorded
	if mock.CallCounts["IsMeetingRunning"] != 1 {
		t.Errorf("before reset: IsMeetingRunning count = %d, want 1", mock.CallCounts["IsMeetingRunning"])
	}
	if len(mock.DownloadCalls) != 1 {
		t.Errorf("before reset: len(DownloadCalls) = %d, want 1", len(mock.DownloadCalls))
	}

	// Reset combined mock
	mock.Reset()

	// Verify both mocks cleared
	if mock.CallCounts["IsMeetingRunning"] != 0 {
		t.Errorf("after reset: IsMeetingRunning count = %d, want 0", mock.CallCounts["IsMeetingRunning"])
	}
	if len(mock.DownloadCalls) != 0 {
		t.Errorf("after reset: len(DownloadCalls) = %d, want 0", len(mock.DownloadCalls))
	}
}

func TestNewMockMeetingServiceClient(t *testing.T) {
	mock := NewMockMeetingServiceClient()

	if mock.CallCounts == nil {
		t.Error("CallCounts should be initialized")
	}
	if mock.IsMeetingRunningRequests == nil {
		t.Error("IsMeetingRunningRequests should be initialized")
	}
	if mock.GetMeetingInfoRequests == nil {
		t.Error("GetMeetingInfoRequests should be initialized")
	}
	if mock.ListMeetingsRequests == nil {
		t.Error("ListMeetingsRequests should be initialized")
	}
	if mock.GetMeetingsStreamRequests == nil {
		t.Error("GetMeetingsStreamRequests should be initialized")
	}
	if mock.IsVoiceBridgeInUseRequests == nil {
		t.Error("IsVoiceBridgeInUseRequests should be initialized")
	}
	if mock.CreateMeetingRequests == nil {
		t.Error("CreateMeetingRequests should be initialized")
	}
}

func TestNewMockHTTPClient(t *testing.T) {
	mock := NewMockHTTPClient()

	if mock.DownloadCalls == nil {
		t.Error("DownloadCalls should be initialized")
	}
	if mock.FollowCalls == nil {
		t.Error("FollowCalls should be initialized")
	}
	if mock.ValidateCalls == nil {
		t.Error("ValidateCalls should be initialized")
	}
}

func TestNewMockClient(t *testing.T) {
	mock := NewMockClient()

	if mock.MockMeetingServiceClient == nil {
		t.Error("MockMeetingServiceClient should be initialized")
	}
	if mock.MockHTTPClient == nil {
		t.Error("MockHTTPClient should be initialized")
	}
}
