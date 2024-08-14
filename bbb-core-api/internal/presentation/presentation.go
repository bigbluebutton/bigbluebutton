package presentation

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/mime"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/validation"
)

const (
	DefaultPodID     = "DEFAULT_PRESENTATION_POD"
	DefaultAuthToken = "preupload-raw-authz-token"
)

type UploadedPresentation struct {
	ID             string
	PodID          string
	MeetingID      string
	TempID         string
	Name           string
	File           *os.File
	FileType       string
	BaseURL        string
	IsDownloadable bool
	IsRemovable    bool
	Current        bool
	IsDefault      bool
	AuthToken      string
}

var validMimeTypes map[mime.MimeType]struct{}

func init() {
	validMimeTypes = map[mime.MimeType]struct{}{
		mime.Xls: {}, mime.Xlsx: {}, mime.Doc: {}, mime.Docx: {},
		mime.Ppt: {}, mime.Pptx: {}, mime.Odt: {}, mime.Rtf: {},
		mime.Txt: {}, mime.Ods: {}, mime.Odp: {}, mime.Pdf: {},
		mime.Jpeg: {}, mime.Png: {}, mime.Svg: {},
		mime.Tika_MSOffice: {}, mime.Tika_MSOffice_x: {},
	}
}

func GeneratePresentationID(name string) string {
	now := time.Now().UnixMilli()
	uuid, err := random.NewUUID()
	if err != nil {
		uuid = random.AlphaNumString(32)
	}
	hex := random.Sha1Hex(name + uuid)
	return fmt.Sprintf("%s-%d", hex, now)
}

func CreatePresentationDirectory(meetingID string, presDir string, presID string) (string, error) {
	if validation.IsMeetingIDFormatValid(meetingID) && validation.IsPresentationIDFormatValid(presID) {
		meetingPath := presDir + string(os.PathSeparator) + meetingID + string(os.PathSeparator) + meetingID
		presPath := meetingPath + string(os.PathSeparator) + presID
		err := os.MkdirAll(presPath, os.ModePerm)
		if err != nil {
			return "", nil
		}
	}

	return "", errors.New("failed to create presentation directory: invalid meeting or presentation ID format")
}

func CreateNewFileName(presID string, fileExt string) string {
	if fileExt != "" {
		return presID + "." + fileExt
	}
	return presID
}

func IsMimeTypeValid(bytes []byte, fileExt string) bool {
	return mime.IsMimeTypeValid(bytes, fileExt, validMimeTypes)
}
