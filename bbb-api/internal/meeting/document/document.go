package document

import (
	"context"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"log/slog"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	coredoc "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/presentation"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
)

// A PresentationModule is a BigBlueButton XML module
// that contains documents to be uploaded and processed
// into presentations.
type PresentationModule struct {
	Documents []Document `xml:"document"`
}

// A Document is a file that is to be uploaded and
// processed into a presentation.
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

// DocumentsToProcess are documents that are still
// embedded in an XML module and require extraction
// for further processing.
type DocumentsToProcess struct {
	Modules         bbbhttp.RequestModules
	IsFromInsertAPI bool
}

// ParsedDocuments are documents that have been
// extracted from an XML module and are ready to
// be processed into presentations.
type ParsedDocuments struct {
	Documents     []Document
	HasCurrent    bool
	FromInsertAPI bool
}

// Processor is the interface that groups the
// functionality for parsing and processing documents
// from XML modules into presentations.
type Processor interface {
	Parse(modules bbbhttp.RequestModules, params bbbhttp.Params, fromInsert bool) (*ParsedDocuments, error)
	Process(parsed *ParsedDocuments) ([]coredoc.Presentation, error)
	WriteAndValidate(src DocSource, doc *Document) (*coredoc.Presentation, error)
	Convert(presentations []coredoc.Presentation) int
	bbbhttp.Client
}

// A DefaultProcessor is the primary processor implementation
// that should be used for the extraction and transformation of
// XML module documents.
type DefaultProcessor struct {
	cfg config.Config
	bbbhttp.Client
	manager pipeline.Manager[*coredoc.Presentation, *coredoc.Presentation]
	flow    pipeline.Flow[*coredoc.Presentation, *coredoc.Presentation]
}

// DocSource is the interface that represents the
// source of the file content for an uploaded document.
type DocSource interface {
	Name() string
	ReadAll() ([]byte, error)
	FromParam() bool
}

// A URLDocSource is the source of document content
// that comes from a URL.
type URLDocSource struct {
	Doc  *Document
	Proc Processor
}

// Name returns the name of the associated file.
func (u URLDocSource) Name() string {
	return u.Doc.FileName
}

// ReadAll returns all of the content from the
// associated file.
func (u URLDocSource) ReadAll() ([]byte, error) {
	return u.Proc.Download(u.Doc.URL)
}

// FromParam indicates if the document is from
// a request query parameter.
func (u URLDocSource) FromParam() bool {
	return u.Doc.PresFromParam
}

// A BytesDocSource is the source of document
// content that comes from the body of a request.
type BytesDocSource struct {
	doc *Document
}

func (b BytesDocSource) Name() string {
	return b.doc.Name
}
func (b BytesDocSource) ReadAll() ([]byte, error) {
	return base64.StdEncoding.DecodeString(b.doc.Content)
}
func (b BytesDocSource) FromParam() bool { return false }

type DefaultDocSource struct {
	doc  Document
	proc Processor
}

func (d DefaultDocSource) Name() string {
	if d.doc.FileName != "" {
		return d.doc.FileName
	}
	return ExtractFileNameFromURL(d.doc.URL)
}

func (d DefaultDocSource) ReadAll() ([]byte, error) {
	return d.proc.Download(d.doc.URL)
}

func (d DefaultDocSource) FromParam() bool {
	return false
}

func NewDefaultProcessor(cfg config.Config, client bbbhttp.Client) *DefaultProcessor {
	return &DefaultProcessor{
		cfg:    cfg,
		Client: client,
		manager: pipeline.NewDefaultManager[*coredoc.Presentation, *coredoc.Presentation](pipeline.ManagerOpts{
			QueueCapacity: cfg.Presentation.Conversion.NumConcurrentUploads,
			NumWorkers:    cfg.Presentation.Conversion.NumConversionWorkers,
		}),
		flow: presentation.NewPresentationFlow(coredoc.NewDefaultClient()),
	}
}

func (p *DefaultProcessor) Parse(modules bbbhttp.RequestModules, params bbbhttp.Params, fromInsert bool) (*ParsedDocuments, error) {
	meetingID := validation.StripCtrlChars(params.Get(meeting.IDParam).Value)
	preDoc, hasParam := PreUploadedDocument(params, meetingID)
	overrideDefault := ResolveOverride(params, fromInsert, p.cfg)

	modDocs, hasModCurrent, err := LoadModuleDocs(modules, meetingID)
	if err != nil {
		if fromInsert {
			return nil, fmt.Errorf("insert document API called without payload")
		}
		out := append([]Document{}, *preDoc)
		if !overrideDefault || !hasParam {
			out = append(out, Document{
				Name:         "default",
				URL:          p.cfg.DefaultPresentation(),
				Current:      true,
				MeetingID:    meetingID,
				Downloadable: true,
				Removable:    false,
			})
			hasModCurrent = true
		}
		return &ParsedDocuments{Documents: out, HasCurrent: hasModCurrent, FromInsertAPI: fromInsert}, nil
	}

	combined := append([]Document{}, *preDoc)
	combined = append(combined, modDocs...)

	if !overrideDefault && !fromInsert {
		defaultDoc := Document{
			Name:         "default",
			URL:          p.cfg.DefaultPresentation(),
			Current:      false,
			MeetingID:    meetingID,
			Downloadable: true,
			Removable:    false,
		}

		if !hasParam && !hasModCurrent {
			defaultDoc.Current = true
			hasModCurrent = true
		}
		combined = append(combined, defaultDoc)
	}

	if !hasParam && !hasModCurrent && len(combined) > 0 {
		combined[0].Current = true
		hasModCurrent = true
	}

	return &ParsedDocuments{
		Documents:     combined,
		HasCurrent:    hasModCurrent,
		FromInsertAPI: fromInsert,
	}, nil
}

func (p *DefaultProcessor) Process(parsed *ParsedDocuments) ([]coredoc.Presentation, error) {
	var out []coredoc.Presentation

	for _, doc := range parsed.Documents {
		var src DocSource

		switch {
		case doc.Name == "default":
			if p.cfg.DefaultPresentation() == "" {
				slog.Error("no default presentation configured")
				continue
			}
			src = DefaultDocSource{doc: doc, proc: p}

		case doc.URL != "":
			src = URLDocSource{Doc: &doc, Proc: p}

		case doc.Content != "":
			src = BytesDocSource{doc: &doc}

		default:
			slog.Error("document missing URL or content", "meeting", doc.MeetingID, "doc", doc.Name)
			continue
		}

		pres, err := p.WriteAndValidate(src, &doc)
		if err != nil {
			slog.Error("failed to process document", "doc", doc.Name, "err", err)
			continue
		}

		pres.Current = doc.Current
		pres.Downloadable = doc.Downloadable
		pres.Removable = doc.Removable
		pres.Default = (doc.Name == "default") && doc.Current

		out = append(out, *pres)
	}

	return out, nil
}

func (p *DefaultProcessor) WriteAndValidate(src DocSource, doc *Document) (*coredoc.Presentation, error) {
	name, ext := coredoc.SplitFileName(src.Name())
	if name == "" {
		return nil, fmt.Errorf("invalid file name %q", src.Name())
	}

	presID := random.PresentationID(name)
	presDir, err := MakePresentationDir(p.cfg.Presentation.Upload.Directory, doc.MeetingID, presID)
	if err != nil {
		return nil, fmt.Errorf("create dir: %w", err)
	}

	data, err := src.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("read data: %w", err)
	}
	fileName := presID
	if ext != "" {
		fileName = fmt.Sprintf("%s.%s", presID, ext)
	}
	fp := filepath.Join(presDir, fileName)
	if err := os.WriteFile(fp, data, 0755); err != nil {
		return nil, fmt.Errorf("write file: %w", err)
	}

	ct, err := coredoc.ContentType(fp)
	if err != nil {
		return nil, err
	}

	if ext == "" && src.FromParam() {
		newExt, xerr := coredoc.FileExtFromContentType(ct)
		if xerr != nil {
			return nil, fmt.Errorf("determine extension: %w", xerr)
		}
		old := fp
		fileName = fmt.Sprintf("%s.%s", presID, newExt)
		fp = filepath.Join(presDir, fileName)
		if err := os.Rename(old, fp); err != nil {
			slog.Warn("could not rename file to add ext", "old", old, "new", fp, "err", err)
		}
		ext = newExt
	}

	if verr := coredoc.ValidateContentType(ct, ext); verr != nil {
		os.RemoveAll(presDir)
		return nil, fmt.Errorf("unsupported content type %s: %w", ct, verr)
	}

	return &coredoc.Presentation{
		ID:        presID,
		PodID:     coredoc.PodIDDefault,
		MeetingID: doc.MeetingID,
		FileName:  name,
		FilePath:  fp,
	}, nil
}

func (p *DefaultProcessor) Convert(presentations []coredoc.Presentation) int {
	maxTimeout := p.cfg.Presentation.Conversion.Timeout
	timeout := p.cfg.Presentation.MaxPages * p.cfg.Presentation.Conversion.PageTimeout
	if timeout > maxTimeout {
		timeout = maxTimeout
	}

	var numEnqueued int
	for _, pres := range presentations {
		msg := pipeline.NewMessage(&pres)
		exec := &pipeline.Executor[*coredoc.Presentation, *coredoc.Presentation]{
			Description: fmt.Sprintf("%s/%s executor", pres.MeetingID, pres.ID),
			Input:       msg,
			Flow:        p.flow,
			Timeout:     time.Duration(timeout) * time.Second,
			MaxRetries:  0,
		}
		ctx, cancel := context.WithTimeout(msg.Context(), 1*time.Second)
		defer cancel()
		id, err := p.manager.Enqueue(ctx, exec)
		if err != nil {
			slog.Error("Failed to enqueue presentation for conversion", "presentation", pres.ID, "meeting", pres.MeetingID)
		} else {
			numEnqueued++
			slog.Info("Successfully enqueued presentation for conversion", "presentation", pres.ID, "meeting", pres.MeetingID, "executor ID", id)
		}
	}
	return numEnqueued
}

func PreUploadedDocument(params bbbhttp.Params, meetingID string) (*Document, bool) {
	u := validation.StripCtrlChars(params.Get("preUploadedPresentation").Value)
	if u == "" {
		return nil, false
	}

	name := validation.StripCtrlChars(params.Get("preUploadedPresentationName").Value)
	if name == "" {
		name = ExtractFileNameFromURL(u)
		if name == "" {
			name = "untitled"
		}
	}

	return &Document{
		URL:           u,
		FileName:      name,
		Removable:     true,
		Downloadable:  false,
		PresFromParam: true,
		MeetingID:     meetingID,
	}, true
}

func ResolveOverride(params bbbhttp.Params, fromInsert bool, cfg config.Config) bool {
	ov := true
	if !fromInsert {
		raw := validation.StripCtrlChars(params.Get("preUploadedPresentationOverrideDefault").Value)
		if raw != "" {
			ov = core.GetBoolOrDefaultValue(raw, ov)
		} else {
			ov = cfg.Override.DefaultPresentation
		}
	}
	return ov
}

func LoadModuleDocs(modules bbbhttp.RequestModules, meetingID string) (docs []Document, hasCurrent bool, err error) {
	pm, ok := modules.Get("presentation")
	if !ok {
		return nil, false, fmt.Errorf("no presentation module")
	}
	var mod PresentationModule
	if err := xml.Unmarshal([]byte(pm.Content), &mod); err != nil {
		return nil, false, fmt.Errorf("unmarshal presentation XML: %w", err)
	}

	for _, d := range mod.Documents {
		d.MeetingID = meetingID
		docs = append(docs, d)
		if d.Current {
			hasCurrent = true
		}
	}
	return docs, hasCurrent, nil
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

func MakePresentationDir(basePresDir, meetingID, presID string) (string, error) {
	presPath := filepath.Join(basePresDir, meetingID, meetingID, presID)
	if err := os.MkdirAll(presPath, 0755); err != nil {
		return "", fmt.Errorf("failed to create presentation directory: %w", err)
	}
	return presPath, nil
}
