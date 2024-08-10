package main

import (
	"context"
	"log"
	"mime"
	"net/http"
	"strings"

	bbbmime "github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/mime"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/util"
	"github.com/go-chi/chi/v5"
)

type ContextKey string

const ParamsKey ContextKey = "params"

type Params map[string][]string

func (p Params) Get(key string) string {
	vs := p[key]
	if len(vs) == 0 {
		return ""
	}
	return vs[0]
}

func (p Params) Set(key string, value string) {
	p[key] = []string{value}
}

func (p Params) Add(key, value string) {
	p[key] = append(p[key], value)
}

func (p Params) Del(key string) {
	delete(p, key)
}

func (p Params) Has(key string) bool {
	_, ok := p[key]
	return ok
}

func (app *Config) validateChecksum(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		endpoint := strings.TrimPrefix(r.URL.Path, "/")
		params := r.URL.Query()

		var payload model.Response
		payload.ReturnCode = model.ReturnCodeFailure
		payload.MessageKey = model.ChecksumErrorKey
		payload.Message = model.ChecksumErrorMsg

		salt := app.ServerConfig.Security.Salt
		if salt == "" {
			log.Println("Security is disabled in this service. Make sure this is intentional.")
			next.ServeHTTP(w, r)
		}

		checksum := params.Get("checksum")
		if checksum == "" {
			app.writeXML(w, http.StatusAccepted, payload)
			return
		}

		queryString := r.URL.RawQuery
		queryWithoutChecksum := util.RemoveQueryParam(queryString, "checksum")
		log.Printf("Query string after checksum removed [%s]\n", queryWithoutChecksum)

		data := endpoint + queryWithoutChecksum + salt
		var createdChecksum string

		switch checksumLength := len(checksum); checksumLength {
		case 40:
			_, ok := app.ChecksumAlgorithms["sha-1"]
			if ok {
				createdChecksum = random.Sha1Hex(data)
				log.Println("SHA-1", createdChecksum)
			}
		case 64:
			_, ok := app.ChecksumAlgorithms["sha-256"]
			if ok {
				createdChecksum = random.Sha256Hex(data)
				log.Println("SHA-256", createdChecksum)
			}
		case 96:
			_, ok := app.ChecksumAlgorithms["sha-384"]
			if ok {
				createdChecksum = random.Sha384Hex(data)
				log.Println("SHA-384", createdChecksum)
			}
		case 128:
			_, ok := app.ChecksumAlgorithms["sha-512"]
			if ok {
				createdChecksum = random.Sha512Hex(data)
				log.Println("SHA-512", createdChecksum)
			}
		default:
			log.Println("No algorithm could be found that matches the provided checksum length")
		}

		if createdChecksum == "" || createdChecksum != checksum {
			log.Printf("checksumError: Query string checksum failed. Our: [%s], Client: [%s]", createdChecksum, checksum)
			app.writeXML(w, http.StatusAccepted, payload)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (app *Config) validateContentType(supportedContentTypes []bbbmime.MimeType) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			contentType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
			if err == nil {
				for _, t := range supportedContentTypes {
					if t.Matches(contentType) {
						next.ServeHTTP(w, r)
					}
				}
			}
			log.Println("Unsupported content type:", contentType)
			app.writeXML(w, http.StatusAccepted, model.Response{
				ReturnCode: model.ReturnCodeFailure,
				MessageKey: model.ContentTypeErrorKey,
				Message:    model.ContentTypeErrorMsg,
			})
		})
	}
}

func (app *Config) collectParams(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		params := make(Params)
		queryParams := r.URL.Query()

		for k, v := range queryParams {
			if len(v) > 0 {
				params[k] = v
			}
		}

		contentType, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if contentType != "" {
			switch contentType {
			case string(bbbmime.ApplicationFormURLEncoded):
				err := r.ParseForm()
				if err != nil {
					log.Println(err)
					app.writeXML(w, http.StatusAccepted, model.Response{
						ReturnCode: model.ReturnCodeFailure,
						MessageKey: model.InvalidRequestBodyKey,
						Message:    model.InvalidRequestBodyMsg,
					})
					return
				}
				for k, v := range r.PostForm {
					if len(v) > 0 {
						params[k] = v
					}
				}
			case string(bbbmime.MultipartFormData):
				err := r.ParseMultipartForm(10 << 20)
				if err != nil {
					log.Println(err)
					app.writeXML(w, http.StatusAccepted, model.Response{
						ReturnCode: model.ReturnCodeFailure,
						MessageKey: model.InvalidRequestBodyKey,
						Message:    model.InvalidRequestBodyMsg,
					})
					return
				}
				for k, v := range r.MultipartForm.Value {
					if len(v) > 0 {
						params[k] = v
					}
				}
			}
		}

		ctx := context.WithValue(r.Context(), ParamsKey, params)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getRoutePattern(r *http.Request) string {
	routeCtx := chi.RouteContext(r.Context())
	if routeCtx == nil {
		return ""
	}
	return routeCtx.RoutePattern()
}
