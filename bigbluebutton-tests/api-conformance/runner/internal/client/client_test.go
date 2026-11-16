package client

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

// Each named client keeps its own cookies, and a Secure cookie is only
// offered to an https URL.
func TestCookiesPerClient(t *testing.T) {
	srv := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{Name: "JSESSIONID", Value: r.URL.Query().Get("v"), Path: "/", Secure: true, HttpOnly: true})
	}))
	defer srv.Close()
	tr := srv.Client().Transport
	s := NewSession(tr)
	for _, who := range []string{"ann", "bob"} {
		if _, err := s.Do(context.Background(), &Prepared{Method: "GET", URL: srv.URL + "/join?v=" + who}, who, false, 5*time.Second); err != nil {
			t.Fatal(err)
		}
	}
	u, _ := url.Parse(srv.URL + "/graphql")
	for _, who := range []string{"ann", "bob"} {
		got := s.Cookies(who, u)
		if len(got) != 1 || got[0].Value != who {
			t.Errorf("%s: %v", who, got)
		}
	}
	ws := *u
	ws.Scheme = "wss"
	if got := s.Cookies("ann", &ws); len(got) != 0 {
		t.Errorf("the jar offers Secure cookies to %s: %v; ask it for the https URL", ws.String(), got)
	}
}

func TestTLSConfig(t *testing.T) {
	if _, err := TLSConfig(target.TLS{CAFile: "missing.pem"}); err == nil {
		t.Error("a missing CA file should fail")
	}
	cfg, err := TLSConfig(target.TLS{InsecureSkipVerify: true})
	if err != nil || !cfg.InsecureSkipVerify {
		t.Errorf("%+v, %v", cfg, err)
	}
}
