// Package capture reads values out of an Observation for later steps.
package capture

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
)

// NotFound means the expression selected nothing. It says something about
// the server, so the step fails rather than errors.
type NotFound struct{ Expr, Why string }

func (e *NotFound) Error() string { return fmt.Sprintf("capture %s: %s", e.Expr, e.Why) }

// Value evaluates expr. XPath and JSONPath take the first match.
func Value(o *observe.Observation, expr string) (string, error) {
	first := func(vals []string, err error) (string, error) {
		if err != nil {
			return "", &NotFound{expr, err.Error()}
		}
		if len(vals) == 0 {
			return "", &NotFound{expr, "nothing matched"}
		}
		return vals[0], nil
	}
	switch {
	case strings.HasPrefix(expr, "/"):
		return first(o.SelectXPath(expr))
	case strings.HasPrefix(expr, "$"):
		return first(o.SelectJSONPath(expr))
	case strings.HasPrefix(expr, "header:"):
		name := strings.TrimPrefix(expr, "header:")
		vals := o.Header.Values(http.CanonicalHeaderKey(name))
		return first(vals, nil)
	case strings.HasPrefix(expr, "cookie:"):
		name := strings.TrimPrefix(expr, "cookie:")
		for _, c := range o.Cookies {
			if c.Name == name {
				return c.Value, nil
			}
		}
		return "", &NotFound{expr, "the response set no such cookie"}
	case expr == "status":
		return strconv.Itoa(o.Status), nil
	case strings.HasPrefix(expr, "location:"):
		if o.Location == nil {
			return "", &NotFound{expr, "the response has no Location header"}
		}
		switch part := strings.TrimPrefix(expr, "location:"); {
		case part == "host":
			return o.Location.Host, nil
		case part == "path":
			return o.Location.Path, nil
		case strings.HasPrefix(part, "query."):
			vals := o.Location.Query()[strings.TrimPrefix(part, "query.")]
			return first(vals, nil)
		}
	}
	return "", fmt.Errorf("unknown capture expression %q", expr)
}
