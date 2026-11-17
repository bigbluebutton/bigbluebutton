package bbb_web

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func TestBBBWebCheckAuthorizationMeasuresEachRequest(t *testing.T) {
	answer := `{"response":"authorized","X-MeetingId":"m1","X-UserId":"u1"}`
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write([]byte(answer)) }))
	defer server.Close()
	saved := authHookUrl
	t.Cleanup(func() { authHookUrl = saved })
	authHookUrl = server.URL

	requests := func(result string) float64 {
		return metricstest.Value(common.AuthHookRequestCounter.WithLabelValues(result))
	}
	ok, unauthorized, failed := requests("ok"), requests("unauthorized"), requests("error")
	observed := metricstest.Value(common.AuthHookRequestDuration)

	if meetingId, userId, err := BBBWebCheckAuthorization("BC1", "token", "uuid", nil); err != nil || meetingId != "m1" || userId != "u1" {
		t.Fatalf("authorized request: %q %q %v", meetingId, userId, err)
	}
	answer = `{"response":"unauthorized"}`
	if _, _, err := BBBWebCheckAuthorization("BC1", "token", "uuid", nil); err == nil {
		t.Fatal("unauthorized request returned no error")
	}
	server.Close()
	if _, _, err := BBBWebCheckAuthorization("BC1", "token", "uuid", nil); err == nil {
		t.Fatal("request to a closed server returned no error")
	}

	if got := requests("ok"); got != ok+1 {
		t.Errorf("ok: %v -> %v, want +1", ok, got)
	}
	if got := requests("unauthorized"); got != unauthorized+1 {
		t.Errorf("unauthorized: %v -> %v, want +1", unauthorized, got)
	}
	if got := requests("error"); got != failed+1 {
		t.Errorf("error: %v -> %v, want +1", failed, got)
	}
	if got := metricstest.Value(common.AuthHookRequestDuration); got != observed+3 {
		t.Errorf("duration observations: %v -> %v, want +3", observed, got)
	}
}
