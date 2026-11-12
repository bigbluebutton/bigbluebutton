package client

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
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
		if _, _, err := s.Do(context.Background(), &Prepared{Method: "GET", URL: srv.URL + "/join?v=" + who}, who, false, 5*time.Second); err != nil {
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

// hostTransport reaches each host name in addrs at that address, so a test
// can use names a cookie jar tells apart, which 127.0.0.1 and localhost on
// two ports aren't: a jar ignores the port, and treats both as secure.
func hostTransport(t *testing.T, tlsSrv *httptest.Server, addrs map[string]string) http.RoundTripper {
	t.Helper()
	tr := tlsSrv.Client().Transport.(*http.Transport).Clone()
	tr.TLSClientConfig.ServerName = "example.com" // in httptest's certificate
	tr.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		host, _, _ := net.SplitHostPort(addr)
		to, ok := addrs[host]
		if !ok {
			return nil, fmt.Errorf("no address for %s", addr)
		}
		return (&net.Dialer{}).DialContext(ctx, network, to)
	}
	return tr
}

// A request with CookiesFrom goes as nginx's auth_request subrequest does:
// with the client's cookies for the public URL, keeping none it is sent.
func TestSubrequestCookies(t *testing.T) {
	public := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{Name: "JSESSIONID", Value: r.URL.Query().Get("v"), Path: "/", Secure: true, HttpOnly: true})
	}))
	defer public.Close()
	var got []string // the Cookie header each direct request carried
	direct := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got = append(got, strings.Join(r.Header.Values("Cookie"), "; "))
		http.SetCookie(w, &http.Cookie{Name: "JSESSIONID", Value: "minted", Path: "/"})
	}))
	defer direct.Close()
	s := NewSession(hostTransport(t, public, map[string]string{
		"public.test": public.Listener.Addr().String(),
		"direct.test": direct.Listener.Addr().String(),
	}))
	ctx := context.Background()
	var fwd []string // the cookie names Do says each request forwarded
	do := func(p *Prepared, who string) {
		t.Helper()
		_, names, err := s.Do(ctx, p, who, false, 5*time.Second)
		if err != nil {
			t.Fatal(err)
		}
		fwd = append(fwd, strings.Join(names, ","))
	}
	do(&Prepared{Method: "GET", URL: "https://public.test/join?v=ann"}, "ann")
	hook := func(h http.Header) *Prepared {
		return &Prepared{Method: "GET", URL: "http://direct.test/hook", Header: h, CookiesFrom: "https://public.test/hook"}
	}
	do(hook(nil), "ann")
	do(hook(nil), "ann") // the cookie minted by the first answer wasn't kept
	do(hook(nil), "eve")
	do(hook(http.Header{"Cookie": {"JSESSIONID=given"}}), "ann")
	do(hook(http.Header{"Cookie": {""}}), "ann")
	want := []string{"JSESSIONID=ann", "JSESSIONID=ann", "", "JSESSIONID=given", ""}
	if strings.Join(got, "|") != strings.Join(want, "|") {
		t.Errorf("the hook got cookies %q, want %q", got, want)
	}
	// Do names what it took from the jar: not a Cookie the request set.
	if want := []string{"", "JSESSIONID", "JSESSIONID", "", "", ""}; strings.Join(fwd, "|") != strings.Join(want, "|") {
		t.Errorf("Do said it forwarded %q, want %q", fwd, want)
	}
	pub, _ := url.Parse("https://public.test/")
	if c := s.Cookies("ann", pub); len(c) != 1 || c[0].Value != "ann" {
		t.Errorf("ann's public cookies are now %v", c)
	}
	dir, _ := url.Parse("http://direct.test/")
	if c := s.Cookies("ann", dir); len(c) != 0 {
		t.Errorf("the hook's answer left cookies in the jar: %v", c)
	}

	// Without CookiesFrom the jar works as before, for both hosts.
	got = nil
	do(&Prepared{Method: "GET", URL: "http://direct.test/hook"}, "bob")
	do(&Prepared{Method: "GET", URL: "http://direct.test/hook"}, "bob")
	if strings.Join(got, "|") != "|JSESSIONID=minted" {
		t.Errorf("a plain request got cookies %q", got)
	}
	if _, _, err := s.Do(ctx, &Prepared{Method: "GET", URL: "http://direct.test/hook", CookiesFrom: "/hook"}, "ann", false, time.Second); err == nil {
		t.Error("a relative CookiesFrom should be an error")
	}
}
