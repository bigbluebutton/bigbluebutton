package bbbhttp

import (
	"encoding/xml"
	"io"
	"net/http"
)

// WriteXML marshals the provided data to XML and uses it to write a reponse
// with the given status code and headers.
func WriteXML(w http.ResponseWriter, status int, data any, headers ...http.Header) error {
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

// Modules are a collection of XML modules.
type Modules struct {
	XMLName xml.Name `xml:"modules"`
	Modules []Module `xml:"module"`
}

// A Module is a collection of additional data that may
// be passed in to certain requests. Each module is
// identified by a name along with some content.
type Module struct {
	XMLName xml.Name `xml:"module"`
	Name    string   `xml:"name,attr"`
	Content string   `xml:",innerxml"`
}

// RequestModules is a collection for holding modules
// that are collected from the body of a request. The
// name of the module is used as a key to retrieve
// the associated module. Multiple modules may be associated
// with the same name.
type RequestModules map[string][]Module

// Get attempts to return the first Module associated with the
// given key. An empty module will be returned and found will be
// false if no modules are associated with the key.
func (r RequestModules) Get(key string) (module Module, found bool) {
	vals := r[key]
	if len(vals) == 0 {
		return Module{}, false
	}
	return vals[0], true
}

// GetAll returns all of the modules associated with the
// given key, or nil if no modules are associated with
// the key.
func (r RequestModules) GetAll(key string) []Module {
	vals := r[key]
	if len(vals) == 0 {
		return nil
	}
	return vals
}

// Set creates a new association between the given key
// module. This will overwrite any modules previously
// associated with the same key.
func (r RequestModules) Set(key string, value Module) {
	r[key] = []Module{value}
}

// Add adds the provided module to the collection of
// modules associated with the given key.
func (r RequestModules) Add(key string, value Module) {
	r[key] = append(r[key], value)
}

// Del removes all of the modules associated with
// the provided key from the collection of modules.
func (r RequestModules) Del(key string) {
	delete(r, key)
}

// Has returns whether the provided key has any
// modules associated with it.
func (r RequestModules) Has(key string) bool {
	_, ok := r[key]
	return ok
}

// ProcessRequestModules decodes the given body of data
// and extracts any XML modules into a [RequestModules]
// collection. An error will be returned if decoding fails.
func ProcessRequestModules(body io.ReadCloser) (RequestModules, error) {
	var modules Modules
	decoder := xml.NewDecoder(body)
	err := decoder.Decode(&modules)
	if err != nil {
		return nil, err
	}

	reqModules := make(RequestModules)
	for _, module := range modules.Modules {
		reqModules.Add(module.Name, module)
	}

	return reqModules, nil
}
