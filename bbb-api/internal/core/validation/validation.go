package validation

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/random"
)

// ValidateChecksum ensures that the checksum provided in the query string
// of the request is correct. The checksum is generated using from the name
// of the called endpoint concatenated with the query string of the request
// minus the checksum and the provided salt. A hash is then generated using
// one of the provided hashing algorithms which is selected based on the length
// of the provided checksum. Returns an error if no checksum is provided or the
// provided checksum does not match the the generated hash.
func ValidateChecksum(req *http.Request, salt string, algos map[string]struct{}) error {
	endpoint := strings.TrimPrefix(req.URL.Path, "/")
	params := req.URL.Query()

	err := core.NewBBBError(responses.ChecksumErrorKey, responses.ChecksumErrorMsg)

	if salt == "" {
		slog.Warn("Security is disabled in this service. Make sure this is intentional.")
		return nil
	}

	checksum := params.Get(core.ChecksumParam)
	if checksum == "" {
		return err
	}

	queryString := req.URL.RawQuery
	queryWithoutChecksum := RemoveQueryParam(queryString, core.ChecksumParam)
	slog.Info("Query string after checksum removed", "query", queryWithoutChecksum)

	data := endpoint + queryWithoutChecksum + salt
	var createdChecksum string

	switch checksumLength := len(checksum); checksumLength {
	case 40:
		_, ok := algos[core.SHA1]
		if ok {
			createdChecksum = random.Sha1Hex(data)
			slog.Info("SHA-1", "hex", createdChecksum)
		}
	case 64:
		_, ok := algos[core.SHA256]
		if ok {
			createdChecksum = random.Sha256Hex(data)
			slog.Info("SHA-256", "hex", createdChecksum)
		}
	case 96:
		_, ok := algos[core.SHA384]
		if ok {
			createdChecksum = random.Sha384Hex(data)
			slog.Info("SHA-384", "hex", createdChecksum)
		}
	case 128:
		_, ok := algos[core.SHA512]
		if ok {
			createdChecksum = random.Sha512Hex(data)
			slog.Info("SHA-512", "hex", createdChecksum)
		}
	default:
		slog.Warn("No algorithm could be found that matches the provided checksum length")
	}

	if createdChecksum == "" || createdChecksum != checksum {
		slog.Error("checksumError: Query string checksum failed", "ours", createdChecksum, "client", checksum)
		return err
	}

	return nil
}

// StipCtrlChars returns a new string based on the
// provided string with any control characters removed.
func StripCtrlChars(input string) string {
	r, _ := regexp.Compile(`p{Cc}`)
	output := r.ReplaceAllString(input, "")
	return strings.TrimSpace(output)
}

// RemoveQueryParam returns a new URL query string with the
// specified parameter and associated value(s) removed.
func RemoveQueryParam(queryString, param string) string {
	entries := strings.Split(queryString, "&")
	var newEntries []string

	for _, entry := range entries {
		if kv := strings.SplitN(entry, "=", 2); kv[0] != param {
			newEntries = append(newEntries, entry)
		}
	}

	return strings.Join(newEntries, "&")
}

// ValidateInteger checks that the provided string is
// a valid integer.
func ValidateInteger(s string) error {
	if _, err := strconv.Atoi(s); err != nil {
		return fmt.Errorf("%s: %s", responses.InvalidInteger, s)
	}
	return nil
}

// ValidateStringLength checks that the provided string
// conforms to the desired minumum and maximum length
// restrictions.
func ValidateStringLength(s string, min int, max int) error {
	trimmed := strings.TrimSpace(s)

	var (
		belowMin = len(trimmed) < min
		overMax  = len(trimmed) > max
	)

	if belowMin || overMax {
		return fmt.Errorf("%s - min: %d, max: %d", responses.InvalidStringLength, min, max)
	}

	return nil
}

// ValidateBoolean checks that the provided string
// is a valid boolean value.
func ValidateBoolean(s string) error {
	if s == "" {
		return errors.New(responses.InvalidBoolean)
	}

	lower := strings.ToLower(s)
	switch lower {
	case "true":
	case "false":
	case "0":
	case "1":
		return nil
	default:
		return fmt.Errorf("%s: %s", responses.InvalidBoolean, s)
	}

	return nil
}
