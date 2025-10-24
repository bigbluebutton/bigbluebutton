// Package document contains functionality for processing
// uploaded documents into BigBlueButton presentations.
// Supported document types include images, PDFs, and
// Microsoft Office file types.
package document

import (
	"bufio"
	"io"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
)

type Client interface {
	meeting.MeetingServiceClient
	// TODO: implement presentation service
}

type DefaultClient struct {
	meeting.MeetingServiceClient
}

func NewDefaultClient() *DefaultClient {
	return &DefaultClient{}
}

// ContentType attempts to determine the MIME type
// of the file located at the provided file path.
// Returns an error if the file cannot be opened
// or the data in the file cannot be read. Otherwise,
// a valid MIME type will be returned. If the MIME
// type cannot be determined "application/octet-stream"
// will be returned by default.
func ContentType(fp string) (string, error) {
	f, err := os.Open(fp)
	if err != nil {
		return "", err
	}
	defer f.Close()
	r := bufio.NewReader(f)
	peek, err := r.Peek(512)
	if err != nil && err != io.EOF {
		return "", err
	}
	return http.DetectContentType(peek), nil
}

// SplitFileName breaks apart the given file
// path string into file name and file
// extension strings. For example, "a/b/c.pdf"
// returns "c" and ".pdf".
func SplitFileName(s string) (name, ext string) {
	base := path.Base(s)
	dotExt := path.Ext(base)
	if dotExt != "" {
		ext = dotExt[1:]
		name = strings.TrimSuffix(base, dotExt)
	} else {
		name = base
		ext = ""
	}
	return
}
