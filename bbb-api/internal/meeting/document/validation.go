package document

import (
	"errors"
	"fmt"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
)

var (
	supportedContentTypes = map[string]struct{}{
		bbbhttp.ContentTypeXLS: {}, bbbhttp.ContentTypeXLSX: {}, bbbhttp.ContentTypeDOC: {},
		bbbhttp.ContentTypeDOCX: {}, bbbhttp.ContentTypePPT: {}, bbbhttp.ContentTypePPTX: {},
		bbbhttp.ContentTypeODT: {}, bbbhttp.ContentTypeRTF: {}, bbbhttp.ContentTypeTXT: {},
		bbbhttp.ContentTypeODS: {}, bbbhttp.ContentTypeODP: {}, bbbhttp.ContentTypeODG: {},
		bbbhttp.ContentTypePDF: {}, bbbhttp.ContentTypeJPEG: {}, bbbhttp.ContentTypePNG: {},
		bbbhttp.ContentTypeSVG: {}, bbbhttp.ContentTypeTikaMSOffice: {},
		bbbhttp.ContentTypeTikaMSOfficeX: {}, bbbhttp.ContentTypeWEBP: {},
	}
)

func ValidateContentType(contentType, fileExt string) error {
	if contentType == "" {
		return errors.New("no content type provided")
	}
	if _, ok := supportedContentTypes[contentType]; !ok {
		return fmt.Errorf("content type %s is not supported", contentType)
	}
	if !FileExtMatchesContentType(fileExt, contentType) {
		return fmt.Errorf("file extension %s does not match content type %s", fileExt, contentType)
	}
	return nil
}
