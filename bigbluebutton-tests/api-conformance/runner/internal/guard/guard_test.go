package guard

import (
	"net/http"
	"testing"
)

func TestAnswersTo(t *testing.T) {
	for host, want := range map[string]bool{
		"127.0.0.1:8099": true, "[::1]:8099": true, "localhost:8099": true, "LOCALHOST.": true,
		"tap:8099": true, "10.0.0.5": true, "bbb.example.com:8099": false, "tap.example.com": false,
	} {
		if got := AnswersTo(host, []string{"tap"}); got != want {
			t.Errorf("%s: %v", host, got)
		}
	}
}

func TestBearerOK(t *testing.T) {
	r, _ := http.NewRequest("GET", "http://x/", nil)
	if !BearerOK(r, "") || BearerOK(r, "tok") {
		t.Error("no header")
	}
	r.Header.Set("Authorization", "Bearer tok")
	if !BearerOK(r, "tok") || BearerOK(r, "other") {
		t.Error("bearer tok")
	}
	r.Header.Set("Authorization", "Basic tok")
	if BearerOK(r, "tok") {
		t.Error("another scheme")
	}
}
