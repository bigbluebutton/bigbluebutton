package main

import (
	bbb_core "bbb-core-api/gen/bbb-core"
	"context"
	"log"
	"net/http"
	"time"
)

func (app *Config) isMeetingRunning(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query()

	meetingId := params.Get("meetingID")
	if meetingId == "" {
		log.Println("You must provide a meeting ID")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	resp, err := app.BbbCore.IsMeetingRunning(ctx, &bbb_core.MeetingRunningRequest{
		MeetingId: meetingId,
	})
	if err != nil {
		log.Println(err)
	}

	log.Printf("Is the meeting with ID %s running? %v", meetingId, resp.IsRunning)
}

func (app *Config) getMeetingInfo(w http.ResponseWriter, r *http.Request) {
	log.Println("Hit the getMeetingInfo endpoint!")
}

func (app *Config) getMeetings(w http.ResponseWriter, r *http.Request) {
	log.Println("Hit the getMeetings enpoint!")
}
