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
	// TODO implement presentation service
}

type DefaultClient struct {
	meeting.MeetingServiceClient
}

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
