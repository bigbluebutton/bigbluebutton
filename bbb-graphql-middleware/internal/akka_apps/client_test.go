package akka_apps

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func TestAkkaAppsGetSessionVariablesMeasuresEachRequest(t *testing.T) {
	answer := `{"response":"authorized","X-Hasura-Role":"bbb_client","X-Hasura-UserId":"u1"}`
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.Write([]byte(answer)) }))
	defer server.Close()
	saved := sessionVarsHookUrl
	t.Cleanup(func() { sessionVarsHookUrl = saved })
	sessionVarsHookUrl = server.URL

	requests := func(result string) float64 {
		return metricstest.Value(common.SessionVarsHookRequestCounter.WithLabelValues(result))
	}
	ok, unauthorized, failed := requests("ok"), requests("unauthorized"), requests("error")
	observed := metricstest.Value(common.SessionVarsHookRequestDuration)

	if vars, err, _ := AkkaAppsGetSessionVariablesFrom("BC1", "token", "uuid"); err != nil || vars["x-hasura-userid"] != "u1" {
		t.Fatalf("authorized request: %v %v", vars, err)
	}
	answer = `{"response":"unauthorized","message":"user ejected","message_id":"user_ejected"}`
	if _, err, id := AkkaAppsGetSessionVariablesFrom("BC1", "token", "uuid"); err == nil || id != "user_ejected" {
		t.Fatalf("unauthorized request: %v %q", err, id)
	}
	server.Close()
	if _, err, _ := AkkaAppsGetSessionVariablesFrom("BC1", "token", "uuid"); err == nil {
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
	if got := metricstest.Value(common.SessionVarsHookRequestDuration); got != observed+3 {
		t.Errorf("duration observations: %v -> %v, want +3", observed, got)
	}
}

// The duration of a request is observed in seconds, the unit of the histogram's name and buckets.
func TestAkkaAppsGetSessionVariablesObservesSeconds(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(100 * time.Millisecond)
		w.Write([]byte(`{"response":"authorized","X-Hasura-Role":"bbb_client","X-Hasura-UserId":"u1"}`))
	}))
	defer server.Close()
	saved := sessionVarsHookUrl
	t.Cleanup(func() { sessionVarsHookUrl = saved })
	sessionVarsHookUrl = server.URL
	before := metricstest.Sum(common.SessionVarsHookRequestDuration)

	AkkaAppsGetSessionVariablesFrom("BC1", "token", "uuid")

	if observed := metricstest.Sum(common.SessionVarsHookRequestDuration) - before; observed < 0.1 || observed > 10 {
		t.Errorf("observed %v for a request of 100 ms, want it in seconds", observed)
	}
}
