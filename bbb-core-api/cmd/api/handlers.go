package main

import (
	"log"
	"net/http"
)

func (app *Config) isMeetingRunning(w http.ResponseWriter, r *http.Request) {
	log.Println("Hit the isMeetingRunning endpoint!")
}

func (app *Config) getMeetingInfo(w http.ResponseWriter, r *http.Request) {
	log.Println("Hit the getMeetingInfo endpoint!")
}

func (app *Config) getMeetings(w http.ResponseWriter, r *http.Request) {
	log.Println("Hit the getMeetings enpoint!")
}
