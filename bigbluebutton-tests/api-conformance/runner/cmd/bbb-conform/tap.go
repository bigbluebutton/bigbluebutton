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
	"strings"
	"syscall"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/resp"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tap"
)

// cmdTap runs a tap next to a BigBlueButton server until interrupted.
// It reads the server's redis and files and serves them, unauthenticated,
// to whoever reaches its port: run it on test servers only.
func cmdTap(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("tap", flag.ContinueOnError)
	fl.SetOutput(stderr)
	listen := fl.String("listen", "127.0.0.1:8099", "where to serve; 0.0.0.0:8099 to reach it from another host on a private network")
	hosts := fl.String("hosts", "", "host names the runner reaches it by, e.g. tap in a compose network; IP addresses and localhost always work")
	redisURL := fl.String("redis", "redis://127.0.0.1:6379", "the server's redis")
	passwordEnv := fl.String("redis-password-env", "", "the environment variable that holds redis's password")
	dataDir := fl.String("data-dir", "/var/bigbluebutton", `the server's data directory, or "" to serve no files`)
	watch := fl.String("watch", "recording/status,learning-dashboard", "directories under the data directory to watch for files that come and go")
	channels := fl.String("channels", strings.Join(tap.DefaultChannels, ","), "the bus channels to follow")
	keys := fl.String("redis-keys", "meeting:*,recording:*,captions:*", "globs of the redis keys it may read")
	maxMB := fl.Int("max-mb", 128, "the most the log keeps, in MiB")
	maxAge := fl.Duration("max-age", 2*time.Hour, "how long the log keeps what it saw")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 {
		fmt.Fprintf(stderr, "bbb-conform tap: unexpected argument %q\n", fl.Arg(0))
		return exitUsage
	}
	ropts, err := resp.ParseURL(*redisURL)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform tap: %v\n", err)
		return exitUsage
	}
	if *passwordEnv != "" {
		ropts.Password = os.Getenv(*passwordEnv)
	}
	if *dataDir != "" {
		if st, err := os.Stat(*dataDir); err != nil || !st.IsDir() {
			fmt.Fprintf(stderr, "bbb-conform tap: data directory %q not found\n", *dataDir)
			return exitUsage
		}
	}
	ln, err := net.Listen("tcp", *listen)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform tap: %v\n", err)
		return exitUsage
	}
	s, err := tap.Start(tap.Config{Redis: ropts, Channels: splitList(*channels), DataDir: *dataDir, Watch: splitList(*watch),
		RedisKeys: splitList(*keys), Hosts: splitList(*hosts), MaxBytes: *maxMB << 20, MaxAge: *maxAge})
	if err != nil {
		ln.Close()
		fmt.Fprintf(stderr, "bbb-conform tap: %v\n", err)
		return exitUsage
	}
	defer s.Close()
	srv := &http.Server{Handler: s, ReadHeaderTimeout: 10 * time.Second}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-ctx.Done()
		sctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		srv.Shutdown(sctx)
	}()
	fmt.Fprintf(stderr, "bbb-conform tap: serving http://%s, following %s on %s; test servers only\n", ln.Addr(), *channels, ropts.Addr)
	if err := srv.Serve(ln); err != nil && !errors.Is(err, http.ErrServerClosed) {
		fmt.Fprintf(stderr, "bbb-conform tap: %v\n", err)
		return exitFailed
	}
	return exitOK
}
