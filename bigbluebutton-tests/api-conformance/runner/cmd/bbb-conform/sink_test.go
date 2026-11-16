package main

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/json"
	"encoding/pem"
	"io"
	"math/big"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/sink"
)

// writeCert writes a self-signed certificate for 127.0.0.1 and its key.
func writeCert(t *testing.T) (certFile, keyFile string) {
	t.Helper()
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	tmpl := &x509.Certificate{SerialNumber: big.NewInt(1), Subject: pkix.Name{CommonName: "sink"},
		IPAddresses: []net.IP{net.ParseIP("127.0.0.1")}, DNSNames: []string{"sink.test"}, NotBefore: time.Now().Add(-time.Hour), NotAfter: time.Now().Add(time.Hour)}
	der, err := x509.CreateCertificate(rand.Reader, tmpl, tmpl, &key.PublicKey, key)
	if err != nil {
		t.Fatal(err)
	}
	kb, err := x509.MarshalECPrivateKey(key)
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	certFile, keyFile = filepath.Join(dir, "server.crt"), filepath.Join(dir, "server.key")
	if err := os.WriteFile(certFile, pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: der}), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(keyFile, pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: kb}), 0o600); err != nil {
		t.Fatal(err)
	}
	return certFile, keyFile
}

func listen(t *testing.T) net.Listener {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ln.Close() })
	return ln
}

// A sink with --listen-http records what reaches either listener into one
// log, says where it serves plain HTTP, and shuts both down at the end,
// a long-poll in flight included.
func TestServeSinkBothListeners(t *testing.T) {
	certFile, keyFile := writeCert(t)
	ln, httpLn := listen(t), listen(t)
	s, err := sink.New(sink.Config{MaxBytes: 1 << 20, MaxAge: time.Hour, HTTPAddr: httpLn.Addr().String()})
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	done := make(chan int, 1)
	go func() { done <- serveSink(ctx, s, ln, httpLn, certFile, keyFile, io.Discard) }()

	tlsClient := &http.Client{Timeout: 5 * time.Second, Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}}}
	plainClient := &http.Client{Timeout: 30 * time.Second}
	get := func(c *http.Client, url string) []byte {
		t.Helper()
		resp, err := c.Get(url)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		b, _ := io.ReadAll(resp.Body)
		if resp.StatusCode != 200 {
			t.Fatalf("%s: %d %s", url, resp.StatusCode, b)
		}
		return b
	}
	httpsURL, httpURL := "https://"+ln.Addr().String(), "http://"+httpLn.Addr().String()
	get(tlsClient, httpsURL+"/k/over-tls")
	get(plainClient, httpURL+"/k/plain")
	var r sink.Received
	if err := json.Unmarshal(get(tlsClient, httpsURL+"/_received?key=k"), &r); err != nil || len(r.Requests) != 2 {
		t.Fatalf("received %+v %v, want both requests", r, err)
	}
	var info sink.Info
	if err := json.Unmarshal(get(plainClient, httpURL+"/_info"), &info); err != nil || info.HTTP != httpLn.Addr().String() {
		t.Errorf("info %+v %v", info, err)
	}

	// A long-poll on the plain listener ends with the shutdown.
	polled := make(chan error, 1)
	go func() {
		resp, err := plainClient.Get(httpURL + "/_received?key=none&wait=25s")
		if err == nil {
			resp.Body.Close()
		}
		polled <- err
	}()
	time.Sleep(200 * time.Millisecond)
	cancel()
	select {
	case code := <-done:
		if code != exitOK {
			t.Errorf("exit %d", code)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the sink didn't shut down")
	}
	select {
	case <-polled:
	case <-time.After(time.Second):
		t.Error("the long-poll outlived the sink")
	}
	if _, err := plainClient.Get(httpURL + "/_info"); err == nil {
		t.Error("the plain listener still answers")
	}
}

// When the TLS listener can't start, the sink stops the plain one too and
// fails.
func TestServeSinkTLSFailure(t *testing.T) {
	ln, httpLn := listen(t), listen(t)
	s, err := sink.New(sink.Config{MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()
	done := make(chan int, 1)
	go func() {
		done <- serveSink(context.Background(), s, ln, httpLn, "no/such.crt", "no/such.key", io.Discard)
	}()
	select {
	case code := <-done:
		if code != exitFailed {
			t.Errorf("exit %d, want %d", code, exitFailed)
		}
	case <-time.After(10 * time.Second):
		t.Fatal("the sink kept serving without its certificate")
	}
	if resp, err := (&http.Client{Timeout: time.Second}).Get("http://" + httpLn.Addr().String() + "/_info"); err == nil {
		resp.Body.Close()
		t.Error("the plain listener still answers")
	}
}

// /_received answers to the names the certificate covers as well as
// --hosts: the runner reads the sink by the server's name for it.
func TestSinkHosts(t *testing.T) {
	certFile, keyFile := writeCert(t)
	got, err := sinkHosts("a,b", certFile, keyFile)
	if err != nil || !reflect.DeepEqual(got, []string{"a", "b", "sink.test"}) {
		t.Errorf("%v %v", got, err)
	}
	if got, err := sinkHosts("a", "", ""); err != nil || !reflect.DeepEqual(got, []string{"a"}) {
		t.Errorf("without a certificate: %v %v", got, err)
	}
}
