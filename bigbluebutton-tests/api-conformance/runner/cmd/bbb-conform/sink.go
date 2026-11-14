package main

import (
	"context"
	"crypto/tls"
	"errors"
	"flag"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/sink"
)

// cmdSink runs a sink until interrupted: it records the callbacks and
// fetches a server sends it, and serves fixtures. What it recorded goes to
// whoever reaches its port, by an IP address, localhost or a --hosts name,
// with its token (BBB_SINK_TOKEN), which it needs unless it listens on
// this host only: run it for test servers only.
func cmdSink(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("sink", flag.ContinueOnError)
	fl.SetOutput(stderr)
	listen := fl.String("listen", "127.0.0.1:8444", "where to serve")
	listenHTTP := fl.String("listen-http", "", "where to serve plain HTTP as well, with --cert: for cases that check a server won't call an http URL")
	cert := fl.String("cert", "", "the TLS certificate, for a name the server under test resolves to this host; without one, plain HTTP")
	key := fl.String("key", "", "the certificate's key")
	fixtures := fl.String("fixtures", "", `the fixtures directory, served under /fixtures/; "" serves none`)
	hosts := fl.String("hosts", "", "host names the runner reads it by; IP addresses, localhost and the names --cert covers always work")
	maxMB := fl.Int("max-mb", 64, "the most the log keeps, in MiB")
	maxAge := fl.Duration("max-age", 2*time.Hour, "how long the log keeps a request")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 {
		fmt.Fprintf(stderr, "bbb-conform sink: unexpected argument %q\n", fl.Arg(0))
		return exitUsage
	}
	if *maxMB < 1 || *maxAge <= 0 {
		fmt.Fprintln(stderr, "bbb-conform sink: --max-mb and --max-age must be positive")
		return exitUsage
	}
	token := os.Getenv("BBB_SINK_TOKEN")
	for _, addr := range []string{*listen, *listenHTTP} {
		if addr != "" && token == "" && !loopbackOnly(addr) {
			fmt.Fprintf(stderr, "bbb-conform sink: listening on %s, which other hosts reach, needs a token: set BBB_SINK_TOKEN here and for the runner\n", addr)
			return exitUsage
		}
	}
	if (*cert == "") != (*key == "") {
		fmt.Fprintln(stderr, "bbb-conform sink: --cert and --key go together")
		return exitUsage
	}
	if *listenHTTP != "" && *cert == "" {
		fmt.Fprintln(stderr, "bbb-conform sink: --listen-http needs --cert: without one, --listen serves plain HTTP")
		return exitUsage
	}
	if *fixtures != "" {
		if st, err := os.Stat(*fixtures); err != nil || !st.IsDir() {
			fmt.Fprintf(stderr, "bbb-conform sink: fixtures directory %q not found\n", *fixtures)
			return exitUsage
		}
	}
	// The listener that serves plain HTTP: --listen-http, or --listen
	// itself without a certificate.
	plain := *listenHTTP
	if *cert == "" {
		plain = *listen
	}
	names, err := sinkHosts(*hosts, *cert, *key)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform sink: %v\n", err)
		return exitUsage
	}
	s, err := sink.New(sink.Config{Fixtures: *fixtures, MaxBytes: *maxMB << 20, MaxAge: *maxAge, HTTPAddr: plain,
		Hosts: names, Token: token})
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform sink: %v\n", err)
		return exitUsage
	}
	defer s.Close()
	ln, err := net.Listen("tcp", *listen)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform sink: %v\n", err)
		return exitUsage
	}
	var httpLn net.Listener
	if *listenHTTP != "" {
		if httpLn, err = net.Listen("tcp", *listenHTTP); err != nil {
			ln.Close()
			fmt.Fprintf(stderr, "bbb-conform sink: %v\n", err)
			return exitUsage
		}
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	return serveSink(ctx, s, ln, httpLn, *cert, *key, stderr)
}

// serveSink serves s on ln, over TLS when given a certificate, and on
// httpLn, when there is one, over plain HTTP, until ctx ends or a listener
// fails. One server serves both, so they share the log, and shutting it
// down closes both. It returns once the server has shut down, so s
// outlives every request it was answering.
func serveSink(ctx context.Context, s *sink.Server, ln, httpLn net.Listener, cert, key string, stderr io.Writer) int {
	ctx, stop := context.WithCancel(ctx)
	defer stop()
	// Requests end with ctx, so a runner's long-poll or a _delay doesn't
	// hold up the shutdown.
	srv := &http.Server{Handler: s, ReadHeaderTimeout: 10 * time.Second, BaseContext: func(net.Listener) context.Context { return ctx }}
	shutDown := make(chan struct{})
	go func() {
		defer close(shutDown)
		<-ctx.Done()
		sctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		srv.Shutdown(sctx)
	}()
	scheme := "http"
	if cert != "" {
		scheme = "https"
	}
	fmt.Fprintf(stderr, "bbb-conform sink: serving %s://%s; test servers only\n", scheme, ln.Addr())
	errs := make(chan error, 2)
	go func() {
		if cert != "" {
			errs <- srv.ServeTLS(ln, cert, key)
		} else {
			errs <- srv.Serve(ln)
		}
	}()
	serving := 1
	if httpLn != nil {
		fmt.Fprintf(stderr, "bbb-conform sink: serving http://%s as well\n", httpLn.Addr())
		go func() { errs <- srv.Serve(httpLn) }()
		serving++
	}
	code := exitOK
	for range serving {
		// The first to fail stops the other.
		if err := <-errs; err != nil && !errors.Is(err, http.ErrServerClosed) {
			fmt.Fprintf(stderr, "bbb-conform sink: %v\n", err)
			code = exitFailed
			stop()
		}
	}
	stop()
	<-shutDown
	return code
}

// sinkHosts is the host names /_received answers to: --hosts, and the
// names the certificate covers, since the runner reads the sink by the
// server's name for it unless told another.
func sinkHosts(hosts, cert, key string) ([]string, error) {
	names := splitList(hosts)
	if cert == "" {
		return names, nil
	}
	pair, err := tls.LoadX509KeyPair(cert, key)
	if err != nil {
		return nil, err
	}
	return append(names, pair.Leaf.DNSNames...), nil
}
