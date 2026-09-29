// Package meeting provides the functionality for handling
// requests to the BigBlueButton meeting API and communicating
// with Akka Apps.
//
// This file contains mock implementations of the Client interface
// for use in unit and integration tests.
package meeting

import (
	"context"
	"io"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/random"
	"google.golang.org/grpc"
)

// MockMeetingServiceClient implements meeting.MeetingServiceClient for testing.
// It allows configuring responses and capturing requests for each method.
type MockMeetingServiceClient struct {
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

// NewMockMeetingServiceClient creates a new MockMeetingServiceClient
// with initialized maps and slices.
func NewMockMeetingServiceClient() *MockMeetingServiceClient {
	return &MockMeetingServiceClient{
		CallCounts:                 make(map[string]int),
		IsMeetingRunningRequests:   make([]*meeting.MeetingRunningRequest, 0),
		GetMeetingInfoRequests:     make([]*meeting.MeetingInfoRequest, 0),
		ListMeetingsRequests:       make([]*meeting.ListMeetingsRequest, 0),
		GetMeetingsStreamRequests:  make([]*meeting.GetMeetingsStreamRequest, 0),
		IsVoiceBridgeInUseRequests: make([]*meeting.VoiceBridgeInUseRequest, 0),
		CreateMeetingRequests:      make([]*meeting.CreateMeetingRequest, 0),
	}
}

// IsMeetingRunning implements meeting.MeetingServiceClient.
func (m *MockMeetingServiceClient) IsMeetingRunning(ctx context.Context, in *meeting.MeetingRunningRequest, opts ...grpc.CallOption) (*meeting.MeetingRunningResponse, error) {
	m.CallCounts["IsMeetingRunning"]++
	m.IsMeetingRunningRequests = append(m.IsMeetingRunningRequests, in)
	return m.IsMeetingRunningResponse, m.IsMeetingRunningError
}

// GetMeetingInfo implements meeting.MeetingServiceClient.
func (m *MockMeetingServiceClient) GetMeetingInfo(ctx context.Context, in *meeting.MeetingInfoRequest, opts ...grpc.CallOption) (*meeting.MeetingInfoResponse, error) {
	m.CallCounts["GetMeetingInfo"]++
	m.GetMeetingInfoRequests = append(m.GetMeetingInfoRequests, in)
	return m.GetMeetingInfoResponse, m.GetMeetingInfoError
}

// ListMeetings implements meeting.MeetingServiceClient.
func (m *MockMeetingServiceClient) ListMeetings(ctx context.Context, in *meeting.ListMeetingsRequest, opts ...grpc.CallOption) (*meeting.ListMeetingsResponse, error) {
	m.CallCounts["ListMeetings"]++
	m.ListMeetingsRequests = append(m.ListMeetingsRequests, in)
	return m.ListMeetingsResponse, m.ListMeetingsError
}

// GetMeetingsStream implements meeting.MeetingServiceClient.
func (m *MockMeetingServiceClient) GetMeetingsStream(ctx context.Context, in *meeting.GetMeetingsStreamRequest, opts ...grpc.CallOption) (meeting.MeetingService_GetMeetingsStreamClient, error) {
	m.CallCounts["GetMeetingsStream"]++
	m.GetMeetingsStreamRequests = append(m.GetMeetingsStreamRequests, in)

	if m.GetMeetingsStreamError != nil {
		return nil, m.GetMeetingsStreamError
	}

	return &MockGetMeetingsStreamClient{
		responses: m.GetMeetingsStreamResponses,
	}, nil
}

// IsVoiceBridgeInUse implements meeting.MeetingServiceClient.
func (m *MockMeetingServiceClient) IsVoiceBridgeInUse(ctx context.Context, in *meeting.VoiceBridgeInUseRequest, opts ...grpc.CallOption) (*meeting.VoiceBridgeInUseResponse, error) {
	m.CallCounts["IsVoiceBridgeInUse"]++
	m.IsVoiceBridgeInUseRequests = append(m.IsVoiceBridgeInUseRequests, in)
	return m.IsVoiceBridgeInUseResponse, m.IsVoiceBridgeInUseError
}

// CreateMeeting implements meeting.MeetingServiceClient.
func (m *MockMeetingServiceClient) CreateMeeting(ctx context.Context, in *meeting.CreateMeetingRequest, opts ...grpc.CallOption) (*meeting.CreateMeetingResponse, error) {
	m.CallCounts["CreateMeeting"]++
	m.CreateMeetingRequests = append(m.CreateMeetingRequests, in)
	return m.CreateMeetingResponse, m.CreateMeetingError
}

// Reset clears all captured requests and call counts.
func (m *MockMeetingServiceClient) Reset() {
	m.CallCounts = make(map[string]int)
	m.IsMeetingRunningRequests = m.IsMeetingRunningRequests[:0]
	m.GetMeetingInfoRequests = m.GetMeetingInfoRequests[:0]
	m.ListMeetingsRequests = m.ListMeetingsRequests[:0]
	m.GetMeetingsStreamRequests = m.GetMeetingsStreamRequests[:0]
	m.IsVoiceBridgeInUseRequests = m.IsVoiceBridgeInUseRequests[:0]
	m.CreateMeetingRequests = m.CreateMeetingRequests[:0]
}

// MockGetMeetingsStreamClient implements meeting.MeetingService_GetMeetingsStreamClient
// for testing GetMeetingsStream.
type MockGetMeetingsStreamClient struct {
	grpc.ClientStream
	responses []*meeting.MeetingInfoResponse
	index     int
	recvError error
}

// Recv returns the next response in the stream or io.EOF when exhausted.
func (m *MockGetMeetingsStreamClient) Recv() (*meeting.MeetingInfoResponse, error) {
	if m.recvError != nil {
		return nil, m.recvError
	}

	if m.index >= len(m.responses) {
		return nil, io.EOF
	}

	resp := m.responses[m.index]
	m.index++
	return resp, nil
}

// MockHTTPClient implements bbbhttp.Client for testing.
type MockHTTPClient struct {
	DownloadResponse []byte
	DownloadError    error
	FollowResponse   string
	FollowError      error
	ValidateURLError error

	DownloadCalls []string
	FollowCalls   []FollowCall
	ValidateCalls []string
}

// FollowCall captures the arguments passed to the Follow method.
type FollowCall struct {
	Address string
	Count   int
	Max     int
}

// NewMockHTTPClient creates a new MockHTTPClient with initialized slices.
func NewMockHTTPClient() *MockHTTPClient {
	return &MockHTTPClient{
		DownloadCalls: make([]string, 0),
		FollowCalls:   make([]FollowCall, 0),
		ValidateCalls: make([]string, 0),
	}
}

// Download implements bbbhttp.Client.
func (m *MockHTTPClient) Download(address string) ([]byte, error) {
	m.DownloadCalls = append(m.DownloadCalls, address)
	return m.DownloadResponse, m.DownloadError
}

// Follow implements bbbhttp.Client.
func (m *MockHTTPClient) Follow(address string, count, max int) (string, error) {
	m.FollowCalls = append(m.FollowCalls, FollowCall{Address: address, Count: count, Max: max})
	return m.FollowResponse, m.FollowError
}

// ValidateURL implements bbbhttp.URLValidator.
func (m *MockHTTPClient) ValidateURL(address string) error {
	m.ValidateCalls = append(m.ValidateCalls, address)
	return m.ValidateURLError
}

// Reset clears all captured calls.
func (m *MockHTTPClient) Reset() {
	m.DownloadCalls = m.DownloadCalls[:0]
	m.FollowCalls = m.FollowCalls[:0]
	m.ValidateCalls = m.ValidateCalls[:0]
}

// MockClient implements meeting.Client for testing, combining both
// gRPC MeetingServiceClient and bbbhttp.Client mocks.
type MockClient struct {
	*MockMeetingServiceClient
	*MockHTTPClient
}

// NewMockClient creates a new MockClient with initialized sub-mocks.
func NewMockClient() *MockClient {
	return &MockClient{
		MockMeetingServiceClient: NewMockMeetingServiceClient(),
		MockHTTPClient:           NewMockHTTPClient(),
	}
}

// Reset clears all captured state from both sub-mocks.
func (m *MockClient) Reset() {
	m.MockMeetingServiceClient.Reset()
	m.MockHTTPClient.Reset()
}

// Helper function to generate a valid checksum for a request
func GenerateChecksum(endpoint, queryString, salt string) string {
	data := endpoint + queryString + salt
	return random.Sha256Hex(data)
}
