package bbbhttp

import (
	"context"
	"mime"
	"net/http"
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

func CollectParams() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
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
				case string(ApplicationFormURLEncoded):
					err := r.ParseForm()
					if err == nil {
						for k, v := range r.PostForm {
							if len(v) > 0 {
								params[k] = v
							}
						}
					}
				case string(MultipartFormData):
					err := r.ParseMultipartForm(10 << 20)
					if err == nil {
						for k, v := range r.MultipartForm.Value {
							if len(v) > 0 {
								params[k] = v
							}
						}
					}
				}
			}

			ctx := context.WithValue(r.Context(), ParamsKey, params)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
