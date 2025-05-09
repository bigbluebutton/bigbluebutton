package mime

import (
	"fmt"
	"log/slog"
	"net/http"
	"strings"
)

type MimeType string

func (m MimeType) Matches(mimeType string) bool { return strings.EqualFold(string(m), mimeType) }
func (m MimeType) ToString() string             { return string(m) }

type FileExt string

func (fileExt FileExt) Matches(ext string) bool { return strings.EqualFold(string(fileExt), ext) }
func (fileExt FileExt) ToString() string        { return string(fileExt) }

const (
	TextXML                   MimeType = "text/xml"
	ApplicationXML            MimeType = "application/xml"
	ApplicationFormURLEncoded MimeType = "application/x-www-form-urlencoded"
	MultipartFormData         MimeType = "multipart/form-data"
	Xls                       MimeType = "application/vnd.ms-excel"
	Xlsx                      MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	Doc                       MimeType = "application/msword"
	Docx                      MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	Ppt                       MimeType = "application/vnd.ms-powerpoint"
	Pptx                      MimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
	Tika_MSOffice             MimeType = "application/x-tika-msoffice"
	Tika_MSOffice_x           MimeType = "application/x-tika-ooxml"
	Odt                       MimeType = "application/vnd.oasis.opendocument.text"
	Rtf                       MimeType = "application/rtf"
	Txt                       MimeType = "text/plain"
	Ods                       MimeType = "application/vnd.oasis.opendocument.spreadsheet"
	Odp                       MimeType = "application/vnd.oasis.opendocument.presentation"
	Pdf                       MimeType = "application/pdf"
	Jpeg                      MimeType = "image/jpeg"
	Png                       MimeType = "image/png"
	Svg                       MimeType = "image/svg+xml"

	ExtDoc  FileExt = "doc"
	ExtXls  FileExt = "xls"
	ExtPpt  FileExt = "ppt"
	ExtDocx FileExt = "docx"
	ExtPptx FileExt = "pptx"
	ExtXlsx FileExt = "xlsx"
	ExtOdt  FileExt = "odt"
	ExtRtf  FileExt = "rtf"
	ExtTxt  FileExt = "txt"
	ExtOds  FileExt = "ods"
	ExtOdp  FileExt = "odp"
	ExtPdf  FileExt = "pdf"
	ExtJpg  FileExt = "jpg"
	ExtJpeg FileExt = "jpeg"
	ExtPng  FileExt = "png"
	ExtSvg  FileExt = "svg"
)

var extMimeTypes map[FileExt][]MimeType

func init() {
	extMimeTypes = map[FileExt][]MimeType{
		ExtDoc:  {Doc, Docx, Tika_MSOffice, Tika_MSOffice_x},
		ExtXls:  {Xls, Xlsx, Tika_MSOffice, Tika_MSOffice_x},
		ExtPpt:  {Ppt, Pptx, Tika_MSOffice, Tika_MSOffice_x},
		ExtDocx: {Doc, Docx, Tika_MSOffice, Tika_MSOffice_x},
		ExtPptx: {Ppt, Pptx, Tika_MSOffice, Tika_MSOffice_x},
		ExtXlsx: {Xls, Xlsx, Tika_MSOffice, Tika_MSOffice_x},
		ExtOdt:  {Odt},
		ExtRtf:  {Rtf},
		ExtTxt:  {Txt},
		ExtOds:  {Ods},
		ExtOdp:  {Odp},
		ExtPdf:  {Pdf},
		ExtJpg:  {Jpeg},
		ExtJpeg: {Jpeg},
		ExtPng:  {Png},
		ExtSvg:  {Svg},
	}
}

func IsMimeTypeValid(bytes []byte, fileExt string, supportedMimeTypes map[MimeType]struct{}) bool {
	mimeType := DetectMimeType(bytes)
	if _, ok := supportedMimeTypes[mimeType]; !ok {
		slog.Error(fmt.Sprintf("Invalid MIME Type: %s", mimeType))
		return false
	}

	if !ExtMatchesMime(fileExt, string(mimeType)) {
		slog.Error(fmt.Sprintf("Invalid MIME Type %s for file extension %s", mimeType, fileExt))
	}
	return true
}

func DetectMimeType(bytes []byte) MimeType {
	mimeType := http.DetectContentType(bytes)
	return MimeType(mimeType)
}

func ExtMatchesMime(fileExt string, mimeType string) bool {
	mimeTypes, ok := extMimeTypes[FileExt(fileExt)]
	if !ok {
		return false
	}

	for _, mt := range mimeTypes {
		if mt.Matches(mimeType) {
			return true
		}
	}
	return false
}

func GetExtForMimeType(mimeType MimeType) (*FileExt, error) {
	for ext, types := range extMimeTypes {
		for _, t := range types {
			if t == mimeType {
				return &ext, nil
			}
		}
	}
	return nil, fmt.Errorf("no file extension matches MIME Type %s", mimeType)
}

func ToFileExt(ext string) FileExt { return FileExt(strings.ToLower(ext)) }
