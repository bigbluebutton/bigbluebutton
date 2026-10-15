//go:build !docker

package core

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/go-connections/nat"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"google.golang.org/grpc"
)

// A ServiceContainer is a wrapper for a running service
// Docker container.
type ServiceContainer struct {
	testcontainers.Container
	URI string
}

// StdoutLogConsumer is a LogConsumer that consumes a
// Docker container's logs and prints them stdout.
type StdoutLogConsumer struct{}

// Accept prints the log to stdout.
func (lc *StdoutLogConsumer) Accept(l testcontainers.Log) {
	fmt.Printf("Containerl: %s\n", l.Content)
}

// ServiceDouble creates and starts a new test server that
// acts as a test double for a service using the provided
// http.Handler to handle incoming requests.
func ServiceDouble(t testing.TB, port string, handler http.Handler) *httptest.Server {
	t.Helper()

	s := httptest.NewUnstartedServer(handler)

	l, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatal(err)
	}

	s.Listener.Close()
	s.Listener = l

	s.Start()
	t.Cleanup(s.Close)
	return s
}

// GRPCServiceDouble creates and starts a gRPC server on the specified port.
// The registerFunc is called to register service implementations with the server.
// The server is automatically stopped when the test completes.
func GRPCServiceDouble(t testing.TB, port string, registerFunc func(*grpc.Server)) *grpc.Server {
	t.Helper()

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		t.Fatalf("failed to listen on port %s: %v", port, err)
	}

	grpcServer := grpc.NewServer()
	registerFunc(grpcServer)

	go func() {
		if err := grpcServer.Serve(lis); err != nil {
			t.Logf("gRPC server stopped: %v", err)
		}
	}()

	t.Cleanup(func() {
		grpcServer.GracefulStop()
	})

	return grpcServer
}

// NewServiceContainer starts a Docker container for the named service on the
// specified port and manages its lifecycle for testing. The container must
// have already been built locally and tagged as 'imdt/bigbluebutton-api-<service>:latest'.
func NewServiceContainer(ctx context.Context, t testing.TB, service, port string) *ServiceContainer {
	t.Helper()

	configFile := testcontainers.ContainerFile{
		HostFilePath:      fmt.Sprintf("configs/%s/config-integration.yaml", service),
		ContainerFilePath: fmt.Sprintf("/usr/local/bbb-api/configs/%s/config.yaml", service),
	}

	internalPort := fmt.Sprintf("%s/tcp", port)

	ctr, err := testcontainers.Run(
		ctx,
		fmt.Sprintf("imdt/bigbluebutton-api-%s:latest", service),
		testcontainers.WithLogConsumers(&StdoutLogConsumer{}),
		testcontainers.WithFiles(configFile),
		testcontainers.WithExposedPorts(internalPort),
		testcontainers.WithWaitStrategy(wait.ForListeningPort(nat.Port(internalPort))),
		testcontainers.WithHostConfigModifier(
			func(hc *container.HostConfig) {
				hc.ExtraHosts = append(hc.ExtraHosts, "host.docker.internal:host-gateway")
			}),
	)
	if err != nil {
		t.Fatal(err)
	}
	testcontainers.CleanupContainer(t, ctr)

	uri, err := HostEndpointFor(ctx, t, ctr, internalPort)
	if err != nil {
		t.Fatal(err)
	}

	return &ServiceContainer{Container: ctr, URI: uri}
}

// HostEndpointFor returns a http://HOST:PORT URI that can be
// used for communication with a container.
func HostEndpointFor(ctx context.Context, t testing.TB, ctr testcontainers.Container, internalPort string) (string, error) {
	host, err := ctr.Host(ctx)
	if err != nil {
		return "", err
	}

	mp, err := ctr.MappedPort(ctx, nat.Port(internalPort))
	if err != nil {
		return "", err
	}

	switch host {
	case "localhost", "0.0.0.0", "::1", "[::1]":
		host = "127.0.0.1"
	}

	return fmt.Sprintf("http://%s:%s", host, mp.Port()), nil
}
