package bbbhttp

import (
	"context"
	"mime"
	"net/http"
)

// A ContextKey is an identifer used for the retrieval of context values
// from a request's context.
type ContextKey string

// ParamsKey is the [ContextKey] that is used to obtain the collection
// of request parameters.
const ParamsKey ContextKey = "params"

// A Param is a representation of a request parameter. It contains the
// value of the parameter along with metadata about the parameter such
// as what part of the request the parameter originated from.
type Param struct {
	// The parameter's value.
	Value string

	// Indicates whether or not the parameter originated
	// in the query string of the request.
	FromQuery bool

	// Indicates whether or not the parameter originated
	// in the body of the request.
	FromBody bool
}

// Params is a collection for holding parameters gathered
// from a request. A single parameter may have multiple values
// and all of the values are retained in the collection. In the
// case where a parameter has values originating from both the
// query string and the request body the first value for that
// parameter will always be the one from the query string.
type Params map[string][]*Param

// Get returns the first [Param] assosocated with the given
// parameter name.
func (p Params) Get(key string) *Param {
	vs := p[key]
	if len(vs) == 0 {
		return nil
	}
	return vs[0]
}

// Set creates a new collection of Params associated with
// the given parameter name. Note that this will replace
// any existing Params.
func (p Params) Set(key string, value *Param) {
	p[key] = []*Param{value}
}

// Add inserts a new [Param] into the collection associated
// with the given parameter name.
func (p Params) Add(key string, value *Param) {
	p[key] = append(p[key], value)
}

// Delete removes all of the Params associated with the
// given parameter name.
func (p Params) Del(key string) {
	delete(p, key)
}

// Has indicates whether or not there are any Params
// associated with the given parameter name.
func (p Params) Has(key string) bool {
	_, ok := p[key]
	return ok
}

// CollectParams gathers all of the request parameters from both
// the query string and request body into a single collection.
// This collection is then embdedded into the request's context
// mapped to [ParamsKey].
func CollectParams() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			params := make(Params)
			queryParams := r.URL.Query()

			for k, vs := range queryParams {
				for _, v := range vs {
					p := &Param{
						Value:     v,
						FromQuery: true,
					}
					params.Add(k, p)
				}
			}

			contentType, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
			if contentType != "" {
				switch contentType {
				case string(ApplicationFormURLEncoded):
					err := r.ParseForm()
					if err == nil {
						for k, vs := range r.PostForm {
							for _, v := range vs {
								p := &Param{
									Value:    v,
									FromBody: true,
								}
								params.Add(k, p)
							}
						}
					}
				case string(MultipartFormData):
					err := r.ParseMultipartForm(10 << 20)
					if err == nil {
						for k, vs := range r.MultipartForm.Value {
							for _, v := range vs {
								p := &Param{
									Value:    v,
									FromBody: true,
								}
								params.Add(k, p)
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
