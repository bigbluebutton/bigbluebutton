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
	"strings"

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
