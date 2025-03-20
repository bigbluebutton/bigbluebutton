package validation

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/random"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/util"
)

// ValidateChecksum ensures that the checksum provided by the caller of the
// API is correct.
func ValidateChecksum(req *http.Request, salt string, algos map[string]struct{}) error {
	endpoint := strings.TrimPrefix(req.URL.Path, "/")
	params := req.URL.Query()

	err := common.NewBBBError(common.ChecksumErrorKey, common.ChecksumErrorMsg)

	if salt == "" {
		slog.Warn("Security is disabled in this service. Make sure this is intentional.")
		return nil
	}

	checksum := params.Get("checksum")
	if checksum == "" {
		return err
	}

	queryString := req.URL.RawQuery
	queryWithoutChecksum := util.RemoveQueryParam(queryString, "checksum")
	slog.Info("Query string after checksum removed", "query", queryWithoutChecksum)

	data := endpoint + queryWithoutChecksum + salt
	var createdChecksum string

	switch checksumLength := len(checksum); checksumLength {
	case 40:
		_, ok := algos["sha-1"]
		if ok {
			createdChecksum = random.Sha1Hex(data)
			slog.Info("SHA-1", "hex", createdChecksum)
		}
	case 64:
		_, ok := algos["sha-256"]
		if ok {
			createdChecksum = random.Sha256Hex(data)
			slog.Info("SHA-256", "hex", createdChecksum)
		}
	case 96:
		_, ok := algos["sha-384"]
		if ok {
			createdChecksum = random.Sha384Hex(data)
			slog.Info("SHA-384", "hex", createdChecksum)
		}
	case 128:
		_, ok := algos["sha-512"]
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
