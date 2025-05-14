package document

import (
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"slices"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/random"
)

type PresentationModule struct {
	Documents []Document `xml:"document"`
}

type Document struct {
	XMLName       xml.Name `xml:"document"`
	Name          string   `xml:"name,attr,omitempty"`
	Current       bool     `xml:"current,attr,omitempty"`
	Removable     bool     `xml:"removable,attr,omitempty"`
	Downloadable  bool     `xml:"downloadable,attr,omitempty"`
	URL           string   `xml:"url,attr,omitempty"`
	FileName      string   `xml:"filename,attr,omitempty"`
	PresFromParam bool     `xml:"isPreUploadedPresentationFromParameter,attr,omitempty"`
	Content       string   `xml:",chardata"`
	Default       bool
	MeetingID     string
	DecodedBytes  []byte
}

type DocumentsToProcess struct {
	Modules         bbbhttp.RequestModules
	IsFromInsertAPI bool
}

type ParsedDocuments struct {
	Documents     []Document
	HasCurrent    bool
	FromInsertAPI bool
}

type PresentationFile struct {
	PodID        string
	MeetingID    string
	PresID       string
	FileName     string
	FilePath     string
	Current      bool
	AuthzToken   string
	Downloadable bool
	Removable    bool
	Default      bool
}

type DocumentParser interface {
	ParseDocuments(modules bbbhttp.RequestModules, params bbbhttp.Params, fromInsertAPI bool) (*ParsedDocuments, error)
}

type DocumentProcessor interface {
	ProcessDocuments(docs *ParsedDocuments) []PresentationFile
	ProcessDocumentFromURL(doc *Document) (*PresentationFile, error)
	ProcessDocumentFromBytes(doc *Document) (*PresentationFile, error)
}

type PresentationHandler interface {
	DocumentParser
	DocumentProcessor
}

type DefaultDocumentParser struct{}

func ParseDocuments(modules bbbhttp.RequestModules, params bbbhttp.Params, fromInsertAPI bool) (*ParsedDocuments, error) {
	cfg := config.DefaultConfig()
	meetingID := validation.StripCtrlChars(params.Get(meeting.IDParam).Value)

	preUploadedPresOverrideDefault := true
	if !fromInsertAPI {
		if override := validation.StripCtrlChars(params.Get("preUploadedPresentationOverrideDefault").Value); override != "" {
			preUploadedPresOverrideDefault = core.GetBoolOrDefaultValue(override, preUploadedPresOverrideDefault)
		} else {
			preUploadedPresOverrideDefault = cfg.Override.DefaultPresentation
		}
	}

	documents := make([]Document, 0)
	presListHasCurrent := false
	hasPresURLInParam := false

	preUploadedPres := params.Get("preUploadedPresentation").Value
	preUploadedPresName := params.Get("preUploadedPresentationName").Value

	if preUploadedPres != "" {
		hasPresURLInParam = true
		var fileName string
		if preUploadedPresName == "" {
			if fileName = ExtractFileNameFromURL(preUploadedPresName); fileName == "" {
				fileName = "untitled"
			}
		} else {
			fileName = preUploadedPresName
		}
		documents = append(documents, Document{
			Removable:    true,
			Downloadable: false,
			URL:          preUploadedPres,
			FileName:     fileName,
			MeetingID:    meetingID,
		})
	}

	if pm, ok := modules.Get("presentation"); !ok {
		if fromInsertAPI {
			return nil, fmt.Errorf("insert document API called without a payload")
		}
		if hasPresURLInParam {
			if !preUploadedPresOverrideDefault {
				documents = append(documents, Document{Name: "default", Current: true, MeetingID: meetingID})
			}
		} else {
			documents = append(documents, Document{Name: "default", Current: true, MeetingID: meetingID})
		}
	} else {
		hasCurrent := hasPresURLInParam
		var presModule PresentationModule
		err := xml.Unmarshal([]byte(pm.Content), &presModule)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal presentation module: %w", err)
		}
		for _, doc := range presModule.Documents {
			doc.MeetingID = meetingID
			if doc.Current && !hasCurrent {
				documents = slices.Insert(documents, 0, doc)
			} else {
				documents = append(documents, doc)
			}
		}
		uploadDefault := !preUploadedPresOverrideDefault && !fromInsertAPI
		if uploadDefault {
			if !hasCurrent {
				documents = slices.Insert(documents, 0, Document{Name: "default", Current: true, MeetingID: meetingID})
			} else {
				documents = append(documents, Document{Name: "default", Current: false, MeetingID: meetingID})
			}
			hasCurrent = true
		}
		presListHasCurrent = hasCurrent
	}

	return &ParsedDocuments{
		Documents:     documents,
		HasCurrent:    presListHasCurrent,
		FromInsertAPI: fromInsertAPI,
	}, nil
}

func ProcessDocuments(docs *ParsedDocuments) []PresentationFile {
	cfg := config.DefaultConfig()

	presFiles := make([]PresentationFile, 0, len(docs.Documents))

	for i, doc := range docs.Documents {
		if doc.Name == "default" {
			if cfg.DefaultPresentation() != "" {
				if doc.Current {
					doc.Default = true
				}
				presFile, err := ProcessDocumentFromURL(&doc)
				if err != nil {
					slog.Error("failed to process document", "name", doc.Name, "meeting ID", doc.MeetingID, "error", err)
					continue
				}
				presFiles = append(presFiles, *presFile)
			} else {
				slog.Error("no default presentation specified in configuration")
			}
		} else {
			if i == 0 && docs.FromInsertAPI {
				if docs.HasCurrent {
					doc.Current = true
				}
			} else if i == 0 && !docs.FromInsertAPI {
				doc.Default = true
				doc.Current = true
			}

			if doc.URL != "" {
				presFile, err := ProcessDocumentFromURL(&doc)
				if err != nil {
					slog.Error("failed to process document", "URL", doc.URL, "meeting ID", doc.MeetingID, "error", err)
					continue
				}
				presFiles = append(presFiles, *presFile)
			} else if doc.Name != "" {
				decBytes, decErr := base64.StdEncoding.DecodeString(doc.Content)
				if decErr != nil {
					slog.Error("failed to decode document content", "name", doc.Name, "meeting ID", doc.MeetingID, "error", decErr)
					continue
				}

				doc.DecodedBytes = decBytes
				presFile, procErr := ProcessDocumentFromBytes(&doc)
				if procErr != nil {
					slog.Error("failed to process document", "name", doc.Name, "meeting ID", doc.MeetingID, "error", procErr)
					continue
				}
				presFiles = append(presFiles, *presFile)
			} else {
				slog.Error("presentation module found, but it did not contain a URL or name attribute")
			}
		}
	}

	return presFiles
}

func ProcessDocumentFromURL(doc *Document) (*PresentationFile, error) {
	cfg := config.DefaultConfig()

	var presOrigFileName string
	if doc.FileName == "" {
		decodedName, err := DecodeFileName(doc.URL)
		if err != nil {
			return nil, fmt.Errorf("failed to decode uploaded file name: %w", err)
		}
		presOrigFileName = decodedName
	} else {
		presOrigFileName = doc.FileName
	}

	presFileName, fileNameExt := SplitFileName(presOrigFileName)

	if presFileName == "" || (fileNameExt == "" && !doc.PresFromParam) {
		return nil, fmt.Errorf("presentation is null by default")
	}

	basePresDir := cfg.Presentation.Upload.Directory
	presID := random.PresentationID(presFileName)

	presPath, mkErr := MakePresentationDir(basePresDir, doc.MeetingID, presID)
	if mkErr != nil {
		return nil, fmt.Errorf("failed to obtain presentation directory path: %w", mkErr)
	}

	fileName := fmt.Sprintf("%s.%s", presID, fileNameExt)
	filePath := filepath.Join(presPath, fileName)

	content, dlErr := DownloadPresentation(doc.URL)
	if dlErr != nil {
		return nil, fmt.Errorf("failed to download presentation: %w", dlErr)
	}

	if writeErr := os.WriteFile(filePath, content, 0644); writeErr != nil {
		return nil, fmt.Errorf("failed to write presentation content to file: %w", writeErr)
	}

	pres, openErr := os.Open(filePath)
	if openErr != nil {
		return nil, fmt.Errorf("failed to open presentation file: %w", openErr)
	}
	defer pres.Close()

	b := make([]byte, 512)
	_, readErr := pres.Read(b)
	if readErr != nil {
		return nil, fmt.Errorf("failed to read contents of presentation file: %w", readErr)
	}

	contentType := http.DetectContentType(b)

	if doc.PresFromParam && fileNameExt == "" {
		fileExt, extErr := FileExtFromContentType(contentType)
		if extErr != nil {
			return nil, fmt.Errorf("failed to obtain file extension from content type: %w", extErr)
		}

		oldFilePath := filePath
		fileName = fmt.Sprintf("%s.%s", presID, fileExt)
		filePath = filepath.Join(presPath, fileName)
		fileNameExt = fileExt
		presFileName = fmt.Sprintf("%s.%s", presFileName, fileExt)
		renameErr := os.Rename(oldFilePath, filePath)
		if renameErr != nil {
			slog.Error("failed to rename presentation from URL parameter; consider sending it through /insertDocument", "destination", filePath, "error", renameErr)
		}
	}

	if vErr := ValidateContentType(contentType, fileNameExt); vErr != nil {
		parentDir := filepath.Dir(filePath)
		if rmErr := os.RemoveAll(parentDir); rmErr != nil {
			slog.Error("failed to remove directory", "directory", parentDir, "error", rmErr)
		}
		return nil, fmt.Errorf("uploaded document %s is not supported as a presentation: %w", doc.URL, vErr)
	}

	return &PresentationFile{
		PodID:        PodIDDefault,
		MeetingID:    doc.MeetingID,
		PresID:       presID,
		FileName:     presFileName,
		FilePath:     filePath,
		Current:      doc.Current,
		AuthzToken:   AuthzTokenDefault,
		Downloadable: doc.Downloadable,
		Removable:    doc.Removable,
		Default:      doc.Default,
	}, nil
}

func ProcessDocumentFromBytes(doc *Document) (*PresentationFile, error) {
	presFileName, fileNameExt := SplitFileName(doc.Name)
	if presFileName == "" || fileNameExt == "" {
		return nil, fmt.Errorf("invalid file name %s", doc.Name)
	}

	cfg := config.DefaultConfig()

	basePresDir := cfg.Presentation.Upload.Directory
	presID := random.PresentationID(presFileName)

	presPath, mkErr := MakePresentationDir(basePresDir, doc.MeetingID, presID)
	if mkErr != nil {
		return nil, fmt.Errorf("failed to obtain presentation directory path: %w", mkErr)
	}

	fileName := fmt.Sprintf("%s.%s", presID, fileNameExt)
	filePath := filepath.Join(presPath, fileName)

	if writeErr := os.WriteFile(filePath, doc.DecodedBytes, 0644); writeErr != nil {
		slog.Error("error while writing to presentation data to file", "file", filePath, "error", writeErr)
	}

	pres, openErr := os.Open(filePath)
	if openErr != nil {
		return nil, fmt.Errorf("failed to open presentation file: %w", openErr)
	}
	defer pres.Close()

	b := make([]byte, 512)
	_, readErr := pres.Read(b)
	if readErr != nil {
		return nil, fmt.Errorf("failed to read contents of presentation file: %w", readErr)
	}

	contentType := http.DetectContentType(b)

	if vErr := ValidateContentType(contentType, fileNameExt); vErr != nil {
		parentDir := filepath.Dir(filePath)
		if rmErr := os.RemoveAll(parentDir); rmErr != nil {
			slog.Error("failed to remove directory", "directory", parentDir, "error", rmErr)
		}
		return nil, fmt.Errorf("uploaded document %s is not supported as a presentation: %w", doc.URL, vErr)
	}

	return &PresentationFile{
		PodID:        PodIDDefault,
		MeetingID:    doc.MeetingID,
		PresID:       presID,
		FileName:     presFileName,
		FilePath:     filePath,
		Current:      doc.Current,
		AuthzToken:   AuthzTokenDefault,
		Downloadable: doc.Downloadable,
		Removable:    doc.Removable,
		Default:      doc.Default,
	}, nil
}

func ExtractFileNameFromURL(s string) string {
	if parsed, err := url.Parse(s); err == nil {
		return filepath.Base(parsed.Path)
	}
	return ""
}

func DecodeFileName(address string) (string, error) {
	base := path.Base(address)
	decoded, err := url.QueryUnescape(base)
	if err != nil {
		return "", fmt.Errorf("failed to decode %q: %w", base, err)
	}
	return decoded, nil
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

func MakePresentationDir(basePresDir, meetingID, presID string) (string, error) {
	presPath := filepath.Join(basePresDir, meetingID, meetingID, presID)
	if err := os.MkdirAll(presPath, 0644); err != nil {
		return "", fmt.Errorf("failed to create presentation directory: %w", err)
	}
	return presPath, nil
}
