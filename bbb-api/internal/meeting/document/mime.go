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
)

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
