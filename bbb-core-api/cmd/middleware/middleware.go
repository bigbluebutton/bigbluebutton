package middleware

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"log"
	"mime"
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/util"
	"github.com/go-chi/chi/v5"
)

func ValidateChecksum(sc *config.ServerConfig, algos map[string]struct{}, writeXML func(w http.ResponseWriter, status int, data any, headers ...http.Header) error) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			endpoint := getRoutePattern(r)
			params := r.URL.Query()

			var payload model.Response
			payload.ReturnCode = model.ReturnCodeFailure
			payload.MessageKey = model.ChecksumErrorKey
			payload.Message = model.ChecksumErrorMsg

			if sc.Security.Salt == "" {
				log.Println("Security is disabled in this service. Make sure this is intentional.")
				next.ServeHTTP(w, r)
			}

			checksum := params.Get("checksum")
			if checksum == "" {
				writeXML(w, http.StatusAccepted, payload)
				return
			}

			queryString := r.URL.RawQuery
			queryWithoutChecksum := util.RemoveQueryParam(queryString, "checksum")
			log.Printf("Query string after checksum removed [%s]\n", queryWithoutChecksum)

			data := endpoint + queryWithoutChecksum + sc.Security.Salt
			var createdChecksum string

			switch checksumLength := len(checksum); checksumLength {
			case 40:
				_, ok := algos["sha-1"]
				if ok {
					createdChecksum = util.GenerateHashString(data, sha1.New())
					log.Println("SHA-1", createdChecksum)
				}
			case 64:
				_, ok := algos["sha-256"]
				if ok {
					createdChecksum = util.GenerateHashString(data, sha256.New())
					log.Println("SHA-256", createdChecksum)
				}
			case 96:
				_, ok := algos["sha-384"]
				if ok {
					createdChecksum = util.GenerateHashString(data, sha512.New384())
					log.Println("SHA-384", createdChecksum)
				}
			case 128:
				_, ok := algos["sha-512"]
				if ok {
					createdChecksum = util.GenerateHashString(data, sha512.New())
					log.Println("SHA-512", createdChecksum)
				}
			default:
				log.Println("No algorithm could be found that matches the provided checksum length")
			}

			if createdChecksum == "" || createdChecksum != checksum {
				log.Printf("checksumError: Query string checksum failed. Our: [%s], Client: [%s]", createdChecksum, checksum)
				writeXML(w, http.StatusAccepted, payload)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func ValidateContentType(supportedContentTypes []string, writeXML func(w http.ResponseWriter, status int, data any, headers ...http.Header) error) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			contentType, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
			if r.Method == http.MethodPost {
				for _, t := range supportedContentTypes {
					if t == contentType {
						next.ServeHTTP(w, r)
					}
				}
				log.Println("")
				writeXML(w, http.StatusAccepted, model.Response{
					ReturnCode: model.ReturnCodeFailure,
					MessageKey: "",
					Message:    "",
				})
			}
			next.ServeHTTP(w, r)
		})
	}
}

func getRoutePattern(r *http.Request) string {
	routeCtx := chi.RouteContext(r.Context())
	if routeCtx == nil {
		return ""
	}
	return routeCtx.RoutePattern()
}
