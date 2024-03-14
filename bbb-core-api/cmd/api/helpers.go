package main

import (
	"encoding/xml"
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
)

func (app *Config) writeXML(w http.ResponseWriter, status int, data any, headers ...http.Header) error {
	xml, err := xml.Marshal(data)
	if err != nil {
		return err
	}

	if len(headers) > 0 {
		for key, value := range headers[0] {
			w.Header()[key] = value
		}
	}

	w.Header().Set("Content-Type", "application/xml")
	w.WriteHeader(status)

	_, err = w.Write(xml)
	if err != nil {
		return err
	}

	return nil
}

func (app *Config) grpcUserToRespUser(u *common.User) model.User {
	user := model.User{
		UserId:          u.UserId,
		FullName:        u.FullName,
		Role:            u.Role,
		IsPresenter:     u.IsPresenter,
		IsListeningOnly: u.IsListeningOnly,
		HasJoinedVoice:  u.HasJoinedVoice,
		HasVideo:        u.HasVideo,
		ClientType:      u.ClientType,
		CustomData:      u.CustomData,
	}

	return user
}
