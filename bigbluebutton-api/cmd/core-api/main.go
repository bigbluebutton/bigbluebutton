package main

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/api"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core/config"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core/ismeetingrunning"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	cfg := config.DefaultConfig()

	var address, target string

	if cfg.Server.Host != "" {
		address = cfg.Server.Host
	}
	if cfg.Server.Port != "" {
		address = fmt.Sprintf("%s:%s", address, cfg.Server.Port)
	} else {
		address = fmt.Sprintf("%s:%s", address, "9100")
	}

	if cfg.Server.Grpc.Host != "" {
		target = cfg.Server.Grpc.Host
	}
	if cfg.Server.Grpc.Port != "" {
		target = fmt.Sprintf("%s:%s", target, cfg.Server.Grpc.Port)
	} else {
		target = fmt.Sprintf("%s:%s", target, "9000")
	}

	slog.Info("Opening new gRPC channel at", "URI", target)
	conn, err := grpc.NewClient(target, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithDefaultServiceConfig(core.RetryPolicy))
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	client := core.NewClientWithConn(conn)

	coreAPI := api.NewAPI(address, func(server *bbbhttp.Server) {
		server.AddRoute(http.MethodGet, "/isMeetingRunning", ismeetingrunning.NewHandlerFunc(ismeetingrunning.NewIsMeetingRunningFlow(client)))
		server.AddRoute(http.MethodPost, "/isMeetingRunning", ismeetingrunning.NewHandlerFunc(ismeetingrunning.NewIsMeetingRunningFlow(client)))
		server.AddRoute(http.MethodGet, "/getMeetingInfo", nil)
		server.AddRoute(http.MethodPost, "/getMeetingInfo", nil)
		server.AddRoute(http.MethodGet, "/getMeetings", nil)
		server.AddRoute(http.MethodPost, "/getMeetings", nil)
		server.AddRoute(http.MethodGet, "/create", nil)
		server.AddRoute(http.MethodPost, "/create", nil)
		server.AddRoute(http.MethodPost, "/insertDocument", nil)
	})
	coreAPI.Start()
}
