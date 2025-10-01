package document

import (
	"fmt"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
)

var (
	extToContentType = map[string][]string{
		FileExtDOC:  {bbbhttp.ContentTypeDOC, bbbhttp.ContentTypeDOCX, bbbhttp.ContentTypeTikaMSOffice, bbbhttp.ContentTypeTikaMSOfficeX},
		FileExtXLS:  {bbbhttp.ContentTypeXLS, bbbhttp.ContentTypeXLSX, bbbhttp.ContentTypeTikaMSOffice, bbbhttp.ContentTypeTikaMSOfficeX},
		FileExtPPT:  {bbbhttp.ContentTypePPT, bbbhttp.ContentTypePPTX, bbbhttp.ContentTypeTikaMSOffice, bbbhttp.ContentTypeTikaMSOfficeX},
		FileExtDOCX: {bbbhttp.ContentTypeDOC, bbbhttp.ContentTypeDOCX, bbbhttp.ContentTypeTikaMSOffice, bbbhttp.ContentTypeTikaMSOfficeX},
		FileExtPPTX: {bbbhttp.ContentTypePPT, bbbhttp.ContentTypePPTX, bbbhttp.ContentTypeTikaMSOffice, bbbhttp.ContentTypeTikaMSOfficeX},
		FileExtXLSX: {bbbhttp.ContentTypeXLS, bbbhttp.ContentTypeXLSX, bbbhttp.ContentTypeTikaMSOffice, bbbhttp.ContentTypeTikaMSOfficeX},
		FileExtODT:  {bbbhttp.ContentTypeODT},
		FileExtRTF:  {bbbhttp.ContentTypeRTF},
		FileExtTXT:  {bbbhttp.ContentTypeTXT},
		FileExtODS:  {bbbhttp.ContentTypeODS},
		FileExtODP:  {bbbhttp.ContentTypeODP},
		FileExtODG:  {bbbhttp.ContentTypeODG},
		FileExtPDF:  {bbbhttp.ContentTypePDF},
		FileExtJPG:  {bbbhttp.ContentTypeJPEG},
		FileExtJPEG: {bbbhttp.ContentTypeJPEG},
		FileExtPNG:  {bbbhttp.ContentTypePNG},
		FileExtSVG:  {bbbhttp.ContentTypeSVG},
		FileExtWEBP: {bbbhttp.ContentTypeWEBP},
	}

	msOfficeExt = []string{
		FileExtDOC, FileExtDOCX, FileExtODG, FileExtODP, FileExtODS, FileExtODT,
		FileExtPPT, FileExtPPTX, FileExtRTF, FileExtTXT, FileExtXLS, FileExtXLSX,
	}

	imgFileExt = []string{FileExtJPEG, FileExtJPG, FileExtPNG, FileExtSVG, FileExtWEBP}
)

// FileExtFromContentType attempts to find a file extension corresponding
// to the given MIME type.
func FileExtFromContentType(contentType string) (string, error) {
	for ext, types := range extToContentType {
		for _, t := range types {
			if t == contentType {
				return ext, nil
			}
		}
	}
	return "", fmt.Errorf("no file extension matches the given content type %s", contentType)
}

// FileExtMatchesContentType determines whether the provided file
// extension is suitable for the specified MIME type.
func FileExtMatchesContentType(fileExt string, contentType string) bool {
	contentTypes, ok := extToContentType[fileExt]
	if !ok {
		return false
	}

	for _, ct := range contentTypes {
		if ct == contentType {
			return true
		}
	}
	return false
}

// IsOfficeFile determines whether the given file
// extension is for a Microsoft office file type.
func IsOfficeFile(ext string) bool {
	for _, e := range msOfficeExt {
		if ext == e {
			return true
		}
	}
	return false
}

// IsImageFile determines whether the given file
// extension is for an image file.
func IsImageFile(ext string) bool {
	for _, e := range imgFileExt {
		if ext == e {
			return true
		}
	}
	return false
}
