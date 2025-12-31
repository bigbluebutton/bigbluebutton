// Package meeting provides the functionality for handling
// requests to the BigBlueButton meeting API and communicating
// with Akka Apps.
//
// This file contains a mock server implementation of MeetingServiceServer
// for use in integration tests.
package meeting

import (
	"context"
	"sync"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
)

// MockMeetingServiceServer implements meeting.MeetingServiceServer for testing.
// It allows configuring responses and captures requests for verification.
// All methods are thread-safe as gRPC handlers may run concurrently.
type MockMeetingServiceServer struct {
	meeting.UnimplementedMeetingServiceServer

	mu sync.Mutex

	// Configurable responses for each method
	IsMeetingRunningResponse   *meeting.MeetingRunningResponse
	IsMeetingRunningError      error
	GetMeetingInfoResponse     *meeting.MeetingInfoResponse
	GetMeetingInfoError        error
	ListMeetingsResponse       *meeting.ListMeetingsResponse
	ListMeetingsError          error
	GetMeetingsStreamResponses []*meeting.MeetingInfoResponse
	GetMeetingsStreamError     error
	IsVoiceBridgeInUseResponse *meeting.VoiceBridgeInUseResponse
	IsVoiceBridgeInUseError    error
	CreateMeetingResponse      *meeting.CreateMeetingResponse
	CreateMeetingError         error

	// Captured requests for verification
	IsMeetingRunningRequests   []*meeting.MeetingRunningRequest
	GetMeetingInfoRequests     []*meeting.MeetingInfoRequest
	ListMeetingsRequests       []*meeting.ListMeetingsRequest
	GetMeetingsStreamRequests  []*meeting.GetMeetingsStreamRequest
	IsVoiceBridgeInUseRequests []*meeting.VoiceBridgeInUseRequest
	CreateMeetingRequests      []*meeting.CreateMeetingRequest

	// Call tracking
	CallCounts map[string]int
}

// NewMockMeetingServiceServer creates a new MockMeetingServiceServer
// with initialized maps and slices.
func NewMockMeetingServiceServer() *MockMeetingServiceServer {
	return &MockMeetingServiceServer{
		CallCounts:                 make(map[string]int),
		IsMeetingRunningRequests:   make([]*meeting.MeetingRunningRequest, 0),
		GetMeetingInfoRequests:     make([]*meeting.MeetingInfoRequest, 0),
		ListMeetingsRequests:       make([]*meeting.ListMeetingsRequest, 0),
		GetMeetingsStreamRequests:  make([]*meeting.GetMeetingsStreamRequest, 0),
		IsVoiceBridgeInUseRequests: make([]*meeting.VoiceBridgeInUseRequest, 0),
		CreateMeetingRequests:      make([]*meeting.CreateMeetingRequest, 0),
	}
}

// IsMeetingRunning implements meeting.MeetingServiceServer.
func (m *MockMeetingServiceServer) IsMeetingRunning(ctx context.Context, req *meeting.MeetingRunningRequest) (*meeting.MeetingRunningResponse, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.CallCounts["IsMeetingRunning"]++
	m.IsMeetingRunningRequests = append(m.IsMeetingRunningRequests, req)

	return m.IsMeetingRunningResponse, m.IsMeetingRunningError
}

// GetMeetingInfo implements meeting.MeetingServiceServer.
func (m *MockMeetingServiceServer) GetMeetingInfo(ctx context.Context, req *meeting.MeetingInfoRequest) (*meeting.MeetingInfoResponse, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.CallCounts["GetMeetingInfo"]++
	m.GetMeetingInfoRequests = append(m.GetMeetingInfoRequests, req)

	return m.GetMeetingInfoResponse, m.GetMeetingInfoError
}

// ListMeetings implements meeting.MeetingServiceServer.
func (m *MockMeetingServiceServer) ListMeetings(ctx context.Context, req *meeting.ListMeetingsRequest) (*meeting.ListMeetingsResponse, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.CallCounts["ListMeetings"]++
	m.ListMeetingsRequests = append(m.ListMeetingsRequests, req)

	return m.ListMeetingsResponse, m.ListMeetingsError
}

// GetMeetingsStream implements meeting.MeetingServiceServer.
// It sends all configured responses through the stream.
func (m *MockMeetingServiceServer) GetMeetingsStream(req *meeting.GetMeetingsStreamRequest, stream meeting.MeetingService_GetMeetingsStreamServer) error {
	m.mu.Lock()
	m.CallCounts["GetMeetingsStream"]++
	m.GetMeetingsStreamRequests = append(m.GetMeetingsStreamRequests, req)

	// Copy values under lock to avoid holding lock during Send operations
	err := m.GetMeetingsStreamError
	responses := m.GetMeetingsStreamResponses
	m.mu.Unlock()

	if err != nil {
		return err
	}

	for _, resp := range responses {
		if sendErr := stream.Send(resp); sendErr != nil {
			return sendErr
		}
	}
	return nil
}

// IsVoiceBridgeInUse implements meeting.MeetingServiceServer.
func (m *MockMeetingServiceServer) IsVoiceBridgeInUse(ctx context.Context, req *meeting.VoiceBridgeInUseRequest) (*meeting.VoiceBridgeInUseResponse, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.CallCounts["IsVoiceBridgeInUse"]++
	m.IsVoiceBridgeInUseRequests = append(m.IsVoiceBridgeInUseRequests, req)

	return m.IsVoiceBridgeInUseResponse, m.IsVoiceBridgeInUseError
}

// CreateMeeting implements meeting.MeetingServiceServer.
func (m *MockMeetingServiceServer) CreateMeeting(ctx context.Context, req *meeting.CreateMeetingRequest) (*meeting.CreateMeetingResponse, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.CallCounts["CreateMeeting"]++
	m.CreateMeetingRequests = append(m.CreateMeetingRequests, req)

	return m.CreateMeetingResponse, m.CreateMeetingError
}

// Reset clears all captured requests and call counts.
func (m *MockMeetingServiceServer) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.CallCounts = make(map[string]int)
	m.IsMeetingRunningRequests = m.IsMeetingRunningRequests[:0]
	m.GetMeetingInfoRequests = m.GetMeetingInfoRequests[:0]
	m.ListMeetingsRequests = m.ListMeetingsRequests[:0]
	m.GetMeetingsStreamRequests = m.GetMeetingsStreamRequests[:0]
	m.IsVoiceBridgeInUseRequests = m.IsVoiceBridgeInUseRequests[:0]
	m.CreateMeetingRequests = m.CreateMeetingRequests[:0]
}
