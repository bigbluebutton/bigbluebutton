package document

import (
	"encoding/xml"
	"fmt"
	"net/url"
	"path/filepath"
	"slices"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
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

func ParseDocuments(modules bbbhttp.RequestModules, params bbbhttp.Params, fromInsertAPI bool) (*ParsedDocuments, error) {
	cfg := config.DefaultConfig()

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
			if fileName = extractFileNameFromURL(preUploadedPresName); fileName == "" {
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
		})
	}

	if pm, ok := modules.Get("presentation"); !ok {
		if fromInsertAPI {
			return nil, fmt.Errorf("insert document API called without a payload")
		}
		if hasPresURLInParam {
			if !preUploadedPresOverrideDefault {
				documents = append(documents, Document{Name: "default", Current: true})
			}
		} else {
			documents = append(documents, Document{Name: "default", Current: true})
		}
	} else {
		hasCurrent := hasPresURLInParam
		var presModule PresentationModule
		err := xml.Unmarshal([]byte(pm.Content), &presModule)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal presentation module: %w", err)
		}
		for _, doc := range presModule.Documents {
			if doc.Current && !hasCurrent {
				documents = slices.Insert(documents, 0, doc)
			} else {
				documents = append(documents, doc)
			}
		}
		uploadDefault := !preUploadedPresOverrideDefault && !fromInsertAPI
		if uploadDefault {
			if !hasCurrent {
				documents = slices.Insert(documents, 0, Document{Name: "default", Current: true})
			} else {
				documents = append(documents, Document{Name: "default", Current: false})
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

// func ProcessDocuments(docs *ParsedDocuments) error {
// 	cfg := config.DefaultConfig()

// 	for i, doc := range docs.Documents {
// 		isCurrent := false
// 		isRemovable := true
// 		isDownloadable := false
// 		isDefaultPres := false
// 		isPreUploadedPresFromParam := false

// 		if doc.Name == "default" {
// 			if cfg.DefaultPresentation() != "" {
// 				if doc.Current {
// 					isDefaultPres = true
// 				}
// 				// TODO: download document
// 			} else {
// 				return fmt.Errorf("no default presentation specified in configuration")
// 			}
// 		} else {
// 			if i == 0 && docs.FromInsertAPI {
// 				if docs.HasCurrent {
// 					isCurrent = true
// 				}
// 			} else if i == 0 && !docs.FromInsertAPI {
// 				isDefaultPres = true
// 				isCurrent = true
// 			}

// 			if doc.URL != "" {
// 				// TODO: download document
// 			} else if doc.Name != "" {
// 				decBytes, err := base64.StdEncoding.DecodeString(doc.Content)
// 				if err != nil {
// 					return fmt.Errorf("failed to decode document content: %w", err)
// 				}
// 				// TODO: process document content
// 			} else {
// 				return fmt.Errorf("presentation module found, but it did not contain a URL or name attribute")
// 			}
// 		}
// 	}

// 	return nil
// }

func extractFileNameFromURL(s string) string {
	if parsed, err := url.Parse(s); err == nil {
		return filepath.Base(parsed.Path)
	}
	return ""
}
