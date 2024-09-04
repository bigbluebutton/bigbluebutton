package presentation

import (
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/mime"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/random"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/validation"
	"github.com/pdfcpu/pdfcpu/pkg/api"
)

const (
	DefaultPodID     = "DEFAULT_PRESENTATION_POD"
	DefaultAuthToken = "preupload-raw-authz-token"

	MaxPages       = 100
	MaxPDFPageSize = 2000000
)

type UploadedPresentation struct {
	ID                string
	PodID             string
	MeetingID         string
	TempID            string
	Name              string
	Path              string
	FileType          string
	BaseURL           string
	IsDownloadable    bool
	IsRemovable       bool
	Current           bool
	IsDefault         bool
	AuthToken         string
	FileNameConverted string
	NumPages          int
}

func (pres *UploadedPresentation) ProcessUploadedPresentation(generatePNGs bool, maxSVGTags, maxSVGImageTags int) error {
	path := pres.Path
	ext := filepath.Ext(path)
	if IsOfficeFile(ext) {
		path, err := ConvertOfficetoPDF(path)
		if err != nil {
			return err
		}
		pres.Path = path
	}

	if pres.IsDownloadable {
		pres.makePresentationDownloadable()
	}

	if mime.ExtPdf.Matches(ext) {
		pres.GenerateFileNameConverted(mime.ExtPdf.ToString())
		pres.countNumPages()
		pres.extractIntoPages(generatePNGs, maxSVGTags, maxSVGImageTags)
	} else if IsImageFile(pres.FileType) {
		pres.NumPages = 1
	}

	return nil
}

func (pres *UploadedPresentation) GenerateFileNameConverted(newExt string) {
	baseName := filepath.Base(pres.Path)
	nameWithoutExt := strings.TrimSuffix(baseName, pres.FileType)
	pres.FileNameConverted = fmt.Sprintf("%s.%s", nameWithoutExt, newExt)
}

func (pres *UploadedPresentation) countNumPages() error {
	numPages := 0
	if mime.ExtPdf.Matches(pres.FileType) {
		ctx, err := api.ReadContextFile(pres.Path)
		if err != nil {
			pres.NumPages = 0
			return err
		}
		numPages = ctx.PageCount
	}

	if IsImageFile(pres.FileType) {
		numPages = 1
	}

	if numPages > MaxPages {
		return errors.New("maximum number of pages exceeded")
	}

	pres.NumPages = numPages

	return nil
}

func (pres *UploadedPresentation) makePresentationDownloadable() error {
	if !pres.IsDownloadable {
		return errors.New("presentation is not marked as downloadable")
	}

	parentDir := filepath.Dir(pres.Path)
	var fileExt string

	if pres.FileNameConverted != "" {
		fileExt = filepath.Ext(pres.FileNameConverted)
	} else {
		fileExt = filepath.Ext(pres.Path)
	}

	if parentDir == "." {
		return errors.New("parent directory does not exist")
	}

	err := filepath.Walk(parentDir, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && filepath.Ext(path) == ".downloadable" {
			err := os.Remove(path)
			if err != nil {
				slog.Error(fmt.Sprintf("Could not delete file %s: %v", path, err))
			} else {
				slog.Info(fmt.Sprintf("Deleted file: %s\n", path))
			}
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("could not delete previous error files: %w", err)
	}

	downloadMarker := fmt.Sprintf("%s.%s.downloadable", pres.ID, fileExt)
	_, err = os.Create(fmt.Sprintf("%s/%s", parentDir, downloadMarker))
	if err != nil {
		return errors.New("failed to create download file")
	}

	return nil
}

func (pres *UploadedPresentation) extractIntoPages(generatePNGS bool, maxSVGTags, maxSVGImageTags int) error {
	pages := make([]*Page, 0, pres.NumPages)

	extractedPages, err := pres.extractPages()
	if err != nil {
		return fmt.Errorf("failed to extract pages from %s: %w", pres.Path, err)
	}

	for i, p := range extractedPages {
		pages = append(pages, &Page{
			pres:              pres,
			num:               i,
			path:              p,
			svgImagesRequired: true,
			generatePNGs:      generatePNGS,
			maxSVGTags:        maxSVGTags,
			maxSVGImageTags:   maxSVGImageTags,
		})
	}
}

func (pres *UploadedPresentation) extractPages() ([]string, error) {
	outDir := filepath.Dir(pres.Path)

	pagePaths := make([]string, 0, pres.NumPages)
	for i := 1; i <= pres.NumPages; i++ {
		pagePath := filepath.Join(outDir, fmt.Sprintf("page-%d.pdf", i))
		err := api.ExtractPagesFile(pres.Path, pagePath, []string{strconv.Itoa(i)}, nil)
		if err != nil {
			slog.Error(fmt.Sprintf("Failed to extract page %d: %w", i, err))
		}
		size, err := FileSize(pagePath)
		if err != nil {
			slog.Error(fmt.Sprintf("could not determine size of %s: %v, skipping", pagePath, err))
			continue
		}
		if size > MaxPDFPageSize {
			err = CompressPDF(pagePath)
			if err != nil {
				slog.Error("could not compress %s: %v, skipping", pagePath, err)
				continue
			}
		}
		size, err = FileSize(pagePath)
		if err != nil {
			slog.Error("could not determine size of compressed PDF page %s, %v, skipping", pagePath, err)
			continue
		}
		if size > MaxPDFPageSize {
			slog.Error("compressed PDF page %s is still too large, skipping", pagePath)
			continue
		}
		pagePaths = append(pagePaths, pagePath)
	}

	return pagePaths, nil
}

var validMimeTypes map[mime.MimeType]struct{}
var supportedFileTypes map[mime.FileExt]struct{}
var officeFileExts map[mime.FileExt]struct{}
var imageFileExts map[mime.FileExt]struct{}

func init() {
	validMimeTypes = map[mime.MimeType]struct{}{
		mime.Xls: {}, mime.Xlsx: {}, mime.Doc: {}, mime.Docx: {},
		mime.Ppt: {}, mime.Pptx: {}, mime.Odt: {}, mime.Rtf: {},
		mime.Txt: {}, mime.Ods: {}, mime.Odp: {}, mime.Pdf: {},
		mime.Jpeg: {}, mime.Png: {}, mime.Svg: {},
		mime.Tika_MSOffice: {}, mime.Tika_MSOffice_x: {},
	}

	supportedFileTypes = map[mime.FileExt]struct{}{
		mime.ExtXls: {}, mime.ExtXlsx: {}, mime.ExtDoc: {}, mime.ExtPpt: {},
		mime.ExtPptx: {}, mime.ExtOdt: {}, mime.ExtRtf: {}, mime.ExtTxt: {},
		mime.ExtOds: {}, mime.ExtOdp: {}, mime.ExtPdf: {}, mime.ExtJpg: {},
		mime.ExtJpeg: {}, mime.ExtPng: {},
	}

	officeFileExts = map[mime.FileExt]struct{}{
		mime.ExtXls: {}, mime.ExtXlsx: {}, mime.ExtDoc: {}, mime.ExtDocx: {},
		mime.ExtPpt: {}, mime.ExtPptx: {}, mime.ExtOdt: {}, mime.ExtRtf: {},
		mime.ExtTxt: {}, mime.ExtOds: {}, mime.ExtOdp: {},
	}

	imageFileExts = map[mime.FileExt]struct{}{
		mime.ExtJpeg: {}, mime.ExtJpg: {}, mime.ExtPng: {},
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

func IsFileTypeSupported(ext string) bool {
	_, ok := supportedFileTypes[mime.ToFileExt(ext)]
	return ok
}

func IsOfficeFile(ext string) bool {
	_, ok := officeFileExts[mime.ToFileExt(ext)]
	return ok
}

func IsImageFile(ext string) bool {
	_, ok := imageFileExts[mime.ToFileExt(ext)]
	return ok
}

func ConvertOfficetoPDF(path string) (string, error) {
	dir := filepath.Dir(path)
	base := filepath.Base(path)
	ext := filepath.Ext(base)
	if !IsOfficeFile(ext) {
		return "", fmt.Errorf("failed to convert %s to PDF: not an office document", path)
	}

	nameWithoutExt := strings.TrimSuffix(base, ext)
	pdfPath := filepath.Join(dir, nameWithoutExt+mime.ExtPdf.ToString())

	cmd := exec.Command("libreoffice", "--headless", "--convert-to", "pdf", path, "--outdir", dir)
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("failed to convert %s to PDF: %v", path, err)
	}
	return pdfPath, nil
}

func NewPdfFromFile(path string) (*os.File, error) {
	dir := filepath.Dir(path)
	baseName := filepath.Base(path)
	ext := filepath.Ext(baseName)
	nameWithoutExt := strings.TrimSuffix(baseName, ext)

	newFileName := filepath.Join(dir, nameWithoutExt+mime.ExtPdf.ToString())
	newFile, err := os.Create(newFileName)
	if err != nil {
		return nil, fmt.Errorf("failed to create new file: %v", err)
	}
	return newFile, nil
}

func FileSize(path string) (int64, error) {
	fileInfo, err := os.Stat(path)
	if err != nil {
		return 0, fmt.Errorf("could not determine size of file %s: %w", path, err)
	}
	return fileInfo.Size(), nil
}

func CompressPDF(path string) error {
	err := api.OptimizeFile(path, path, api.LoadConfiguration())
	if err != nil {
		return fmt.Errorf("failed to compress %s: %w", path, err)
	}
	return nil
}
