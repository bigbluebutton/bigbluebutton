package document

import (
	"bufio"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
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

type Presentation struct {
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

type Processor interface {
	Parse(modules bbbhttp.RequestModules, params bbbhttp.Params, fromInsert bool) (*ParsedDocuments, error)
	Process(parsed *ParsedDocuments) ([]Presentation, error)
	WriteAndValidate(src DocSource, doc *Document) (*Presentation, error)
	bbbhttp.Client
}

type DefaultProcessor struct {
	cfg config.Config
	bbbhttp.Client
}

type DocSource interface {
	Name() string
	ReadAll() ([]byte, error)
	FromParam() bool
}

type URLDocSource struct {
	Doc  *Document
	Proc Processor
}

func (u URLDocSource) Name() string {
	return u.Doc.FileName
}

func (u URLDocSource) ReadAll() ([]byte, error) {
	return u.Proc.Download(u.Doc.URL)
}

func (u URLDocSource) FromParam() bool {
	return u.Doc.PresFromParam
}

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

func NewDefaultProcessor(cfg config.Config, client bbbhttp.Client) Processor {
	return &DefaultProcessor{
		cfg:    cfg,
		Client: client,
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

func (p *DefaultProcessor) Process(parsed *ParsedDocuments) ([]Presentation, error) {
	var out []Presentation

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

func (p *DefaultProcessor) WriteAndValidate(src DocSource, doc *Document) (*Presentation, error) {
	name, ext := SplitFileName(src.Name())
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

	ct, err := ContentType(fp)
	if err != nil {
		return nil, err
	}

	if ext == "" && src.FromParam() {
		newExt, xerr := FileExtFromContentType(ct)
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

	if verr := ValidateContentType(ct, ext); verr != nil {
		os.RemoveAll(presDir)
		return nil, fmt.Errorf("unsupported content type %s: %w", ct, verr)
	}

	return &Presentation{
		PodID:     PodIDDefault,
		MeetingID: doc.MeetingID,
		PresID:    presID,
		FileName:  name,
		FilePath:  fp,
	}, nil
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
	if err := os.MkdirAll(presPath, 0755); err != nil {
		return "", fmt.Errorf("failed to create presentation directory: %w", err)
	}
	return presPath, nil
}
