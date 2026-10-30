package main

import (
	"context"
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
// fetches a server sends it, and serves fixtures. Anyone who reaches its
// port can read what it recorded: run it for test servers only.
func cmdSink(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("sink", flag.ContinueOnError)
	fl.SetOutput(stderr)
	listen := fl.String("listen", "127.0.0.1:8444", "where to serve")
	cert := fl.String("cert", "", "the TLS certificate, for a name the server under test resolves to this host; without one, plain HTTP")
	key := fl.String("key", "", "the certificate's key")
	fixtures := fl.String("fixtures", "", `the fixtures directory, served under /fixtures/; "" serves none`)
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
	if (*cert == "") != (*key == "") {
		fmt.Fprintln(stderr, "bbb-conform sink: --cert and --key go together")
		return exitUsage
	}
	if *fixtures != "" {
		if st, err := os.Stat(*fixtures); err != nil || !st.IsDir() {
			fmt.Fprintf(stderr, "bbb-conform sink: fixtures directory %q not found\n", *fixtures)
			return exitUsage
		}
	}
	s, err := sink.New(sink.Config{Fixtures: *fixtures, MaxBytes: *maxMB << 20, MaxAge: *maxAge})
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
	srv := &http.Server{Handler: s, ReadHeaderTimeout: 10 * time.Second}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-ctx.Done()
		sctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		srv.Shutdown(sctx)
	}()
	scheme := "http"
	if *cert != "" {
		scheme = "https"
	}
	fmt.Fprintf(stderr, "bbb-conform sink: serving %s://%s; test servers only\n", scheme, ln.Addr())
	if *cert != "" {
		err = srv.ServeTLS(ln, *cert, *key)
	} else {
		err = srv.Serve(ln)
	}
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		fmt.Fprintf(stderr, "bbb-conform sink: %v\n", err)
		return exitFailed
	}
	return exitOK
}
