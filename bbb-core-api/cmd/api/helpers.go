package main

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"encoding/xml"
	"hash"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/validation"
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

func (app *Config) isChecksumValid(r *http.Request, apiCall string) (bool, string, string) {
	params := r.URL.Query()

	if app.Security.Salt == "" {
		log.Println("Security is disabled in this service. Make sure this is intentional.")
		return true, "", ""
	}

	checksum := params.Get("checksum")
	if checksum == "" {
		return false, model.ChecksumErrorKey, model.ChecksumErrorMsg
	}

	queryString := r.URL.RawQuery
	queryWithoutChecksum := app.removeQueryParam(queryString, "checksum")
	log.Printf("Query string after checksum removed [%s]\n", queryWithoutChecksum)

	data := apiCall + queryWithoutChecksum + app.Security.Salt
	var createdChecksum string

	switch checksumLength := len(checksum); checksumLength {
	case 40:
		_, ok := app.ChecksumAlgorithms["sha-1"]
		if ok {
			createdChecksum = app.generateHashString(data, sha1.New())
			log.Println("SHA-1", createdChecksum)
		}
	case 64:
		_, ok := app.ChecksumAlgorithms["sha-256"]
		if ok {
			createdChecksum = app.generateHashString(data, sha256.New())
			log.Println("SHA-256", createdChecksum)
		}
	case 96:
		_, ok := app.ChecksumAlgorithms["sha-384"]
		if ok {
			createdChecksum = app.generateHashString(data, sha512.New384())
			log.Println("SHA-384", createdChecksum)
		}
	case 128:
		_, ok := app.ChecksumAlgorithms["sha-512"]
		if ok {
			createdChecksum = app.generateHashString(data, sha512.New())
			log.Println("SHA-512", createdChecksum)
		}
	default:
		log.Println("No algorithm could be found that matches the provided checksum length")
	}

	if createdChecksum == "" || createdChecksum != checksum {
		log.Printf("checksumError: Query string checksum failed. Our: [%s], Client: [%s]", createdChecksum, checksum)
		return false, model.ChecksumErrorKey, model.ChecksumErrorMsg
	}

	return true, "", ""
}

func (app *Config) generateHashString(data string, h hash.Hash) string {
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

func (app *Config) removeQueryParam(queryString, param string) string {
	entries := strings.Split(queryString, "&")
	var newEntries []string

	for _, entry := range entries {
		if kv := strings.SplitN(entry, "=", 2); kv[0] != param {
			newEntries = append(newEntries, entry)
		}
	}

	return strings.Join(newEntries, "&")
}

func (app *Config) processCreateQueryParams(params *url.Values) *common.MeetingSettings {
	var settings common.MeetingSettings

	settings.MeetingProps = app.processMeetingProps(params)

	return &settings
}

func (app *Config) processMeetingProps(params *url.Values) *common.MeetingProps {
	name := validation.StripCtrlChars(params.Get("name"))
	meetingExtId := validation.StripCtrlChars(params.Get("meetingID"))
	meetingIntId := app.generateHashString(meetingExtId, sha1.New())

	meetingCameraCap := getIntOrDefaultValue(params.Get("meetingCameraCap"), int(app.Meeting.Camera.Cap))
	maxPinnedCameras := getIntOrDefaultValue(params.Get("maxPinnedCamera"), int(app.Meeting.Camera.MaxPinned))

	isBreakout := getBoolOrDefaultValue(params.Get("isBreakout"), false)

	disabledFeaturesMap := make(map[string]struct{})
	for k, v := range app.DisabledFeatures {
		disabledFeaturesMap[k] = v
	}
	if featuresParam := params.Get("disabledFeatures"); featuresParam != "" {
		features := strings.Split(featuresParam, ",")
		for _, feature := range features {
			disabledFeaturesMap[feature] = struct{}{}
		}
	}
	disabledFeatures := make([]string, len(disabledFeaturesMap))
	i := 0
	for feature := range disabledFeaturesMap {
		disabledFeatures[i] = feature
		i++
	}

	notifyRecordingIsOn := getBoolOrDefaultValue(params.Get("notfiyRecordingIsOn"), app.Recording.NotifyRecordingIsOn)

	presUploadExtDesc := getStringOrDefaultValue(validation.StripCtrlChars(params.Get("presentationUploadExternalDescription")), app.Presentation.Upload.External.Description)
	presUploadExtUrl := getStringOrDefaultValue(validation.StripCtrlChars(params.Get("presentationUploadExternalUrl")), app.Presentation.Upload.External.Url)

	return &common.MeetingProps{
		Name:                name,
		MeetingExtId:        meetingExtId,
		MeetingIntId:        meetingIntId,
		MeetingCameraCap:    int32(meetingCameraCap),
		MaxPinnedCameras:    int32(maxPinnedCameras),
		IsBreakout:          isBreakout,
		DisabledFeatures:    disabledFeatures,
		NotifyRecordingIsOn: notifyRecordingIsOn,
		PresUploadExtDesc:   presUploadExtDesc,
		PresUploadExtUrl:    presUploadExtUrl,
	}
}

func getIntOrDefaultValue(param string, defaultValue int) int {
	if param != "" {
		conv, err := strconv.Atoi(param)
		if err != nil {
			return defaultValue
		} else {
			return conv
		}
	}
	return defaultValue
}

func getBoolOrDefaultValue(param string, defaultValue bool) bool {
	if param != "" {
		conv, err := strconv.ParseBool(param)
		if err != nil {
			return defaultValue
		} else {
			return conv
		}
	}
	return defaultValue
}

func getStringOrDefaultValue(param string, defaultValue string) string {
	if param != "" {
		return param
	}
	return defaultValue
}
