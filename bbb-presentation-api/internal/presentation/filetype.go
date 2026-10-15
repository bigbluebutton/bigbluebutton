package presentation

import (
	"fmt"
	"log/slog"
	"path/filepath"
	"strings"

	"github.com/gabriel-vasile/mimetype"
)

// MimeType is a string representation of a MIME Type.
type MimeType string

// Matches determines if the MimeType is equivalent to the given string.
func (m MimeType) Matches(mimeType string) bool { return strings.EqualFold(string(m), mimeType) }

// FileExt is a string representation of a file extension including the leading dot.
type FileExt string

// Matches determines if the FileExt is equivalent to the given string.
func (fileExt FileExt) Matches(ext string) bool { return strings.EqualFold(string(fileExt), ext) }

var officeExt = map[FileExt]struct{}{
	ExtDoc: {}, ExtDocx: {}, ExtXls: {}, ExtXlsx: {},
	ExtPpt: {}, ExtPptx: {}, ExtOdt: {}, ExtRtf: {},
	ExtTxt: {}, ExtOds: {}, ExtOdp: {}, ExtOdg: {},
}

var imageExt = map[FileExt]struct{}{
	ExtJpeg: {}, ExtJpg: {}, ExtPng: {}, ExtSvg: {}, ExtWebp: {},
}

// IsMimeTypeValid checks that the MimeType inferred from the provided bytes matches the provided file
// extension. Returns an error if the MimeType does not match the file extension or if the MimeType
// is not part of the supportedMimeTypes.
func IsMimeTypeValid(bytes []byte, fileExt FileExt, supportedMimeTypes map[MimeType]struct{}) bool {
	mime := DetectMimeType(bytes)
	mimeType := MimeType(mime.String())

	if _, ok := supportedMimeTypes[mimeType]; !ok {
		slog.Error(fmt.Sprintf("Invalid MIME Type: %s", mimeType))
		return false
	}

	if !ExtMatchesMime(fileExt, mimeType) {
		slog.Error(fmt.Sprintf("Invalid MIME Type %s for file extension %s", mimeType, fileExt))
		return false
	}
	return true
}

// DetectMimeType determines the content type of the given data and returns the appropriate
// MimeType. Returns application/octet-stream if the type cannot be detected.
func DetectMimeType(bytes []byte) *mimetype.MIME {
	mimetype.SetLimit(1024 * 1024)
	return mimetype.Detect(bytes)
}

func LookupMIME(mimeType MimeType) (*mimetype.MIME, error) {
	mime := mimetype.Lookup(string(mimeType))
	if mime == nil {
		return nil, fmt.Errorf("no known MIME type matches %s", mimeType)
	}
	return mime, nil
}

// ExtMatchesMime checks if the provided file extension is appropriate for the given MimeType.
// Returns false if the FileExt or MimeType is not recognized, or the file extension does not support
// the MimeType.
func ExtMatchesMime(fileExt FileExt, mimeType MimeType) bool {
	mime, err := LookupMIME(mimeType)
	if err != nil {
		return false
	}
	ext := mime.Extension()
	return fileExt.Matches(ext)
}

// GetExtForMimeType attempts to find the appropriate FileExt for a given MimeType.
// Returns an empty file extension is the MimeType is not recognized.
func GetExtForMimeType(mimeType MimeType) FileExt {
	mime, err := LookupMIME(mimeType)
	if err != nil {
		return ToFileExt(".")
	}
	return ToFileExt(mime.Extension())
}

// ToFileExt takes a file extension and converts it to a FileExt.
func ToFileExt(ext string) FileExt {
	if []rune(ext)[0] != '.' {
		ext = "." + ext
	}
	return FileExt(strings.ToLower(ext))
}

// IsOfficeFile determines if the provided FileExt is an extension appropriate
// for an office document.
func IsOfficeFile(ext FileExt) bool {
	_, ok := officeExt[ext]
	return ok
}

// IsImageFile determines if the provided FileExt is an extension appropriate for an
// image file.
func IsImageFile(ext FileExt) bool {
	_, ok := imageExt[ext]
	return ok
}

// IsPDF determines if the provided FileExt is an extension appropriate for a PDF.
func IsPDF(ext FileExt) bool {
	return ext == ExtPdf
}

// PDFName takes an input file name or path and generates an output string with the
// file extension changed to '.pdf'.
//
// example.doc becomes example.pdf
//
// a/b/c.odt becomes a/b/c.pdf
func PDFName(in string) string {
	return strings.TrimSuffix(in, filepath.Ext(in)) + ".pdf"
}
