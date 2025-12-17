package bbbhttp

import (
	"net/http"
	"testing"

	"github.com/go-chi/chi/v5"
)

func TestAddRoute(t *testing.T) {
	type route struct {
		method  string
		pattern string
	}

	tests := []struct {
		name           string
		routes         []route
		expectedRoutes []route
	}{
		{
			name: "Single GET route",
			routes: []route{
				{method: http.MethodGet, pattern: "/test"},
			},
			expectedRoutes: []route{
				{method: http.MethodGet, pattern: "/test"},
			},
		},
		{
			name: "Singe route no method",
			routes: []route{
				{method: "", pattern: "/test"},
			},
			expectedRoutes: []route{
				{method: http.MethodGet, pattern: "/test"},
			},
		},
		{
			name: "Multiple routes, each method type",
			routes: []route{
				{method: http.MethodGet, pattern: "/test1"},
				{method: http.MethodPost, pattern: "/test2"},
				{method: http.MethodPatch, pattern: "/test3"},
				{method: http.MethodPut, pattern: "/test4"},
				{method: http.MethodDelete, pattern: "/test5"},
				{method: http.MethodHead, pattern: "/test6"},
				{method: http.MethodConnect, pattern: "/test7"},
				{method: http.MethodOptions, pattern: "/test8"},
				{method: http.MethodTrace, pattern: "/test9"},
			},
			expectedRoutes: []route{
				{method: http.MethodGet, pattern: "/test1"},
				{method: http.MethodPost, pattern: "/test2"},
				{method: http.MethodPatch, pattern: "/test3"},
				{method: http.MethodPut, pattern: "/test4"},
				{method: http.MethodDelete, pattern: "/test5"},
				{method: http.MethodHead, pattern: "/test6"},
				{method: http.MethodConnect, pattern: "/test7"},
				{method: http.MethodOptions, pattern: "/test8"},
				{method: http.MethodTrace, pattern: "/test9"},
			},
		},
		{
			name: "Multiple routes, same pattern",
			routes: []route{
				{method: http.MethodGet, pattern: "/test"},
				{method: http.MethodPost, pattern: "/test"},
			},
			expectedRoutes: []route{
				{method: http.MethodPost, pattern: "/test"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewDefaultServer()

			for _, r := range tt.routes {
				s.AddRoute(r.method, r.pattern, func(w http.ResponseWriter, r *http.Request) {
					// Test function; no routes needed.
				})
			}

			for _, r := range tt.expectedRoutes {
				if !s.Match(chi.NewRouteContext(), r.method, r.pattern) {
					t.Errorf("Route not handled - method: %s, pattern: %s", r.method, r.pattern)
				}
			}
		})
	}
}
