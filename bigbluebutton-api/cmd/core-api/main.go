package main

import (
	"fmt"
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/api"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core/config"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core/ismeetingrunning"
)

func main() {
	cfg := config.DefaultConfig()

	var address string

	if cfg.Server.Host != "" {
		address = cfg.Server.Host
	}
	if cfg.Server.Port != "" {
		address = fmt.Sprintf("%s:%s", address, cfg.Server.Port)
	} else {
		address = fmt.Sprintf("%s:%s", address, "8900")
	}

	coreAPI := api.NewAPI(address, func(server *bbbhttp.Server) {
		server.AddRoute(http.MethodGet, "/isMeetingRunning", ismeetingrunning.NewHandlerFunc(ismeetingrunning.NewIsMeetingRunningFlow()))
		server.AddRoute(http.MethodPost, "/isMeetingRunning", ismeetingrunning.NewHandlerFunc(ismeetingrunning.NewIsMeetingRunningFlow()))
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
